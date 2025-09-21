import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { logLoginActivity, logLogoutActivity } from "@/lib/activityLogger";
import { TOTP, Secret } from "otpauth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Log activities for auth events
      if (event === "SIGNED_IN" && session?.user) {
        setTimeout(() => {
          logLoginActivity(session.user.id);
          createUserSession(session.user.id);
        }, 0);
      }
      if (event === "SIGNED_OUT") {
        // Note: We can't log logout here as user is already signed out
        // We'll handle this in the signOut function
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserSession = async (userId: string) => {
    try {
      const userAgent = navigator.userAgent;
      const deviceInfo = getDeviceInfo(userAgent);

      // Mark all other sessions as not current
      await supabase
        .from("user_sessions")
        .update({ is_current: false })
        .eq("user_id", userId);

      // Create new session record
      const { error } = await supabase.from("user_sessions").insert({
        user_id: userId,
        device_info: deviceInfo,
        user_agent: userAgent,
        is_current: true,
        last_active: new Date().toISOString(),
      });

      if (error) {
        console.error("Error creating user session:", error);
      }
    } catch (error) {
      console.error("Error creating user session:", error);
    }
  };

  const getDeviceInfo = (userAgent: string): string => {
    // Simple device detection
    if (userAgent.includes("iPhone")) return "Safari on iPhone";
    if (userAgent.includes("iPad")) return "Safari on iPad";
    if (userAgent.includes("Android")) {
      if (userAgent.includes("Chrome")) return "Chrome on Android";
      return "Browser on Android";
    }
    if (userAgent.includes("Mac")) {
      if (userAgent.includes("Chrome")) return "Chrome on macOS";
      if (userAgent.includes("Firefox")) return "Firefox on macOS";
      if (userAgent.includes("Safari")) return "Safari on macOS";
      return "Browser on macOS";
    }
    if (userAgent.includes("Windows")) {
      if (userAgent.includes("Chrome")) return "Chrome on Windows";
      if (userAgent.includes("Firefox")) return "Firefox on Windows";
      if (userAgent.includes("Edge")) return "Edge on Windows";
      return "Browser on Windows";
    }
    if (userAgent.includes("Linux")) {
      if (userAgent.includes("Chrome")) return "Chrome on Linux";
      if (userAgent.includes("Firefox")) return "Firefox on Linux";
      return "Browser on Linux";
    }
    return "Unknown Device";
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Check if user has 2FA enabled
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: securitySettings } = await supabase
          .from("user_security_settings")
          .select("two_factor_enabled")
          .eq("user_id", user.id)
          .maybeSingle();

        if (securitySettings?.two_factor_enabled) {
          // Sign out temporarily to require 2FA verification
          await supabase.auth.signOut();
          setRequires2FA(true);
          setPendingEmail(email);
          return { requires2FA: true };
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const verify2FALogin = async (
    email: string,
    password: string,
    totpCode: string
  ) => {
    try {
      // First, sign in to get user access
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        return { error: signInError };
      }

      // Get user and security settings
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error("User not found") };
      }

      const { data: securitySettings } = await supabase
        .from("user_security_settings")
        .select("two_factor_secret")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!securitySettings?.two_factor_secret) {
        return { error: new Error("2FA not properly configured") };
      }

      // Verify TOTP code
      const totp = new TOTP({
        issuer: "Your App",
        label: user.email || "User",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(securitySettings.two_factor_secret),
      });

      const isValid = totp.validate({ token: totpCode, window: 1 }) !== null;

      if (!isValid) {
        // Sign out on invalid 2FA
        await supabase.auth.signOut();
        return { error: new Error("Invalid verification code") };
      }

      // 2FA successful, reset states
      setRequires2FA(false);
      setPendingEmail("");
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });
    return { error };
  };

  const signOut = async () => {
    // Log logout activity before signing out
    if (user) {
      await logLogoutActivity(user.id);
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    requires2FA,
    pendingEmail,
    signIn,
    verify2FALogin,
    signUp,
    signOut,
  };
}

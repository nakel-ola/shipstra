import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useActivityLogger } from './use-activity-logger';
import { useToast } from '@/hooks/use-toast';
import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';

interface SecuritySettings {
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  backup_codes: string[] | null;
}

interface UserSession {
  id: string;
  device_info: string;
  location: string | null;
  ip_address: string | null;
  last_active: string;
  is_current: boolean;
}

export const useSecurity = () => {
  const { user } = useAuth();
  const { logActivity } = useActivityLogger();
  const { toast } = useToast();
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    two_factor_secret: null,
    backup_codes: null,
  });
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadSecuritySettings();
      loadSessions();
    }
  }, [user]);

  const loadSecuritySettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: settings, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading security settings:', error);
        return;
      }

      if (settings) {
        setSecuritySettings({
          two_factor_enabled: settings.two_factor_enabled || false,
          two_factor_secret: settings.two_factor_secret,
          backup_codes: settings.backup_codes,
        });
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!user) return;

    try {
      const { data: userSessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });

      if (error) {
        console.error('Error loading sessions:', error);
        return;
      }

      setSessions(userSessions?.map(session => ({
        id: session.id,
        device_info: session.device_info,
        location: session.location,
        ip_address: session.ip_address ? String(session.ip_address) : null,
        last_active: session.last_active!,
        is_current: session.is_current!,
      })) || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const generateTOTPSecret = () => {
    const secret = new Secret({ size: 20 });
    const totp = new TOTP({
      issuer: 'Your App',
      label: user?.email || 'User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });

    setTotpSecret(secret.base32);
    return totp.toString();
  };

  const generateQRCode = async (otpauthUrl: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  };

  const setup2FA = async () => {
    if (!user) return null;

    const otpauthUrl = generateTOTPSecret();
    const codes = generateBackupCodes();
    setBackupCodes(codes);
    await generateQRCode(otpauthUrl);

    return { qrCodeUrl, totpSecret, backupCodes: codes };
  };

  const verify2FA = async (token: string) => {
    if (!user || !totpSecret) return false;

    try {
      const totp = new TOTP({
        issuer: 'Your App',
        label: user.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(totpSecret),
      });

      const isValid = totp.validate({ token: token, window: 1 }) !== null;
      
      if (isValid) {
        // Save to database
        const { error } = await supabase
          .from('user_security_settings')
          .update({
            two_factor_enabled: true,
            two_factor_secret: totpSecret,
            backup_codes: backupCodes,
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error saving 2FA settings:', error);
          return false;
        }

        setSecuritySettings(prev => ({
          ...prev,
          two_factor_enabled: true,
          two_factor_secret: totpSecret,
          backup_codes: backupCodes,
        }));

        await logActivity({
          actionType: 'settings_updated',
          description: 'enabled two-factor authentication',
          entityType: 'security_setting',
          metadata: { setting_type: '2fa_enabled' }
        });

        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled.",
        });

        return true;
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is invalid. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to verify 2FA code. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const disable2FA = async (token: string) => {
    if (!user || !securitySettings.two_factor_secret) return false;

    try {
      const totp = new TOTP({
        issuer: 'Your App',
        label: user.email || 'User',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(securitySettings.two_factor_secret),
      });

      const isValid = totp.validate({ token: token, window: 1 }) !== null;
      
      if (isValid) {
        const { error } = await supabase
          .from('user_security_settings')
          .update({
            two_factor_enabled: false,
            two_factor_secret: null,
            backup_codes: null,
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error disabling 2FA:', error);
          return false;
        }

        setSecuritySettings(prev => ({
          ...prev,
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null,
        }));

        await logActivity({
          actionType: 'settings_updated',
          description: 'disabled two-factor authentication',
          entityType: 'security_setting',
          metadata: { setting_type: '2fa_disabled' }
        });

        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled.",
        });

        return true;
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is invalid. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error revoking session:', error);
        toast({
          title: "Error",
          description: "Failed to revoke session. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      setSessions(prev => prev.filter(session => session.id !== sessionId));

      await logActivity({
        actionType: 'settings_updated',
        description: 'revoked device session',
        entityType: 'user_session',
        entityId: sessionId,
        metadata: { action: 'session_revoked' }
      });

      toast({
        title: "Session Revoked",
        description: "Device access has been successfully revoked.",
      });

      return true;
    } catch (error) {
      console.error('Error revoking session:', error);
      return false;
    }
  };

  const revokeAllSessions = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('is_current', false);

      if (error) {
        console.error('Error revoking all sessions:', error);
        toast({
          title: "Error",
          description: "Failed to revoke all sessions. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Keep only current session
      setSessions(prev => prev.filter(session => session.is_current));

      await logActivity({
        actionType: 'settings_updated',
        description: 'revoked all device sessions',
        entityType: 'user_session',
        metadata: { action: 'all_sessions_revoked' }
      });

      toast({
        title: "All Sessions Revoked",
        description: "All other device sessions have been revoked.",
      });

      return true;
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      return false;
    }
  };

  const downloadBackupCodes = () => {
    if (!securitySettings.backup_codes) return;

    const codesText = securitySettings.backup_codes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup Codes Downloaded",
      description: "Store these codes in a safe place.",
    });
  };

  return {
    securitySettings,
    sessions,
    loading,
    qrCodeUrl,
    totpSecret,
    backupCodes,
    setup2FA,
    verify2FA,
    disable2FA,
    revokeSession,
    revokeAllSessions,
    downloadBackupCodes,
    refetch: () => {
      loadSecuritySettings();
      loadSessions();
    },
  };
};

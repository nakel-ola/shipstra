"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { BrandPanel, FormSection } from "./features";

const SignUp = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/");
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Animated glow spots */}
      <motion.div
        className="absolute top-32 right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-32 left-32 w-80 h-80 bg-primary-glow/10 rounded-full blur-3xl"
        animate={{
          x: [0, 80, 0],
          y: [0, -60, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left panel - Brand */}
        <BrandPanel />

        {/* Right panel - Sign up form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <FormSection />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

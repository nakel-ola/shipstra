import { motion } from "framer-motion";
import { Check, Key, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const SuccessCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="backdrop-blur-md bg-glass border-glass-border shadow-glow overflow-hidden relative">
        {/* Success animation background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-success/5 via-primary/5 to-accent/5"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <CardContent className="p-8 text-center relative z-10">
          {/* Success icon with animation */}
          <motion.div
            className="mx-auto mb-6 w-16 h-16 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center shadow-glow"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>

          {/* Success message */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Account Created Successfully!
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Shipstra! Your account has been created and a
              verification email has been sent.
            </p>
          </motion.div>

          {/* Email verification notice */}
          <motion.div
            className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 justify-center text-sm text-primary">
              <Mail className="w-4 h-4" />
              <span>Check your email to verify your account</span>
            </div>
          </motion.div>

          {/* Next steps */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Next Steps
            </h3>

            <div className="space-y-3">
              <motion.div
                className="flex items-center gap-3 p-3 rounded-lg bg-glass/30 border border-glass-border"
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "hsl(var(--glass)/0.5)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">Add SSH Credentials</div>
                  <div className="text-xs text-muted-foreground">
                    Connect your VPS securely
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 p-3 rounded-lg bg-glass/30 border border-glass-border opacity-50"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.5 }}
              >
                <div className="w-8 h-8 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-muted" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm text-muted-foreground">
                    Deploy Your First App
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connect and deploy in minutes
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="mt-8 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              size="lg"
              className="w-full bg-gradient-primary hover:shadow-glow hover:scale-[1.02] transition-all duration-300 group"
              asChild
            >
              <Link href="/dashboard">
                Add SSH Credentials
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href="/auth/sign-in">I&apos;ll do this later</Link>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

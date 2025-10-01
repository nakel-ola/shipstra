import { motion } from "framer-motion";
import { AlertTriangle, Key, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const SSHCredentialAlert = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-warning/10 via-warning/5 to-transparent border border-warning/20 shadow-[0_0_30px_hsl(var(--warning)/0.15)]">
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-warning/5 via-warning/10 to-warning/5"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <CardContent className="relative z-10 p-6">
          <div className="flex items-start gap-4">
            {/* Warning icon */}
            <motion.div
              className="flex-shrink-0 w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <AlertTriangle className="w-5 h-5 text-warning" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  SSH Credential Required
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To deploy applications to your VPS, you need to configure your SSH credentials. 
                  This allows secure connection to your virtual private server.
                </p>
              </div>

              {/* Features list */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning text-xs rounded-md border border-warning/20">
                  <Key className="w-3 h-3" />
                  Secure Authentication
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning text-xs rounded-md border border-warning/20">
                  Global Configuration
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning text-xs rounded-md border border-warning/20">
                  One-time Setup
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              asChild
              className="bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70 text-warning-foreground shadow-[0_0_20px_hsl(var(--warning)/0.3)] hover:shadow-[0_0_30px_hsl(var(--warning)/0.4)] hover:scale-105 transition-all duration-300 group"
            >
              <Link href="/dashboard/settings/credentials">
                Add SSH Credential
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
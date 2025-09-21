import { motion } from "framer-motion";
import { Server, Zap, Shield, Rocket } from "lucide-react";

export const BrandPanel = () => {
  return (
    <div className="hidden lg:flex flex-1 relative overflow-hidden">
      {/* Abstract gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-primary-glow/20" />

      {/* Animated pattern overlay */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, hsl(var(--accent)) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, hsl(var(--primary)) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, hsl(var(--primary-glow)) 0%, transparent 50%)
          `,
        }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Logo/Brand */}
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-glow"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Server className="w-6 h-6 text-primary-foreground" />
          </motion.div>

          {/* Main tagline */}
          <div className="space-y-4">
            <motion.h1
              className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Deploy to
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Your VPS
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Start deploying to your own virtual private server in minutes.
              Full control, maximum performance, zero vendor lock-in.
            </motion.p>
          </div>

          {/* Feature highlights with icons */}
          <motion.div
            className="space-y-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground/90">
                Lightning fast deployments
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <span className="text-foreground/90">
                Enterprise-grade security
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-glow/20 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-primary-glow" />
              </div>
              <span className="text-foreground/90">
                Scalable infrastructure
              </span>
            </div>
          </motion.div>

          {/* Animated deployment illustration */}
          <motion.div
            className="relative mt-12 p-6 rounded-2xl bg-glass/30 border border-glass-border backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-xs font-mono text-muted-foreground mb-2">
              $ deploy app.js
            </div>
            <motion.div
              className="flex items-center gap-2"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                delay: 1,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <div className="h-2 bg-gradient-to-r from-primary to-accent rounded-full flex-1" />
              <motion.div
                className="text-xs text-primary font-medium"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.5,
                  delay: 2,
                  repeat: Infinity,
                  repeatDelay: 3.5,
                }}
              >
                ✓ Deployed
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

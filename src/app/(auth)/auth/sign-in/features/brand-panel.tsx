import { motion } from "framer-motion";

export const BrandPanel = () => {
  return (
    <div className="hidden lg:flex flex-1 relative overflow-hidden">
      {/* Abstract gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary-glow/20" />

      {/* Animated pattern overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, hsl(var(--primary)) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, hsl(var(--accent)) 0%, transparent 50%),
            radial-gradient(circle at 40% 90%, hsl(var(--primary-glow)) 0%, transparent 50%)
          `,
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
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
            className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-6 h-6 bg-primary-foreground rounded-lg" />
          </motion.div>

          {/* Tagline */}
          <div className="space-y-4">
            <motion.h1
              className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Deploy with
              </span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Confidence
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ship faster with our premium deployment platform. From prototype
              to production in seconds, not hours.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            className="flex gap-8 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div>
              <div className="text-2xl font-bold text-primary">10M+</div>
              <div className="text-sm text-muted-foreground">Deployments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">99.99%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-glow">
                &lt;100ms
              </div>
              <div className="text-sm text-muted-foreground">Response</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

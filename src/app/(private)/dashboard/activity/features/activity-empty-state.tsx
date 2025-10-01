import { motion } from "framer-motion";
import { Activity, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export const ActivityEmptyState = () => {
  return (
    <Card className="p-12 bg-glass/60 backdrop-blur-xl border-glass-border text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Animated illustration */}
        <div className="relative mx-auto w-24 h-24">
          <motion.div
            className="absolute inset-0 bg-gradient-primary rounded-full opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.1, 0.2]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-2 bg-gradient-primary rounded-full opacity-40 flex items-center justify-center"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Activity className="w-8 h-8 text-primary" />
          </motion.div>
          
          {/* Floating sparkles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${20 + i * 15}%`,
                left: `${80 + i * 10}%`,
              }}
              animate={{ 
                y: [-10, -20, -10],
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            >
              <Sparkles className="w-3 h-3 text-primary/60" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            No activity yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Activity from your team will appear here. Start by deploying a project, 
            adding credentials, or making changes to see your workspace come to life.
          </p>
        </div>

        {/* Action hints */}
        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          <span className="px-3 py-1 bg-glass/40 rounded-full border border-glass-border">
            Deploy projects
          </span>
          <span className="px-3 py-1 bg-glass/40 rounded-full border border-glass-border">
            Add credentials
          </span>
          <span className="px-3 py-1 bg-glass/40 rounded-full border border-glass-border">
            Configure domains
          </span>
        </div>
      </motion.div>
    </Card>
  );
};
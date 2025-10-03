"use client";

import { motion } from "framer-motion";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export const ProjectsEmptyState = () => {
  const router = useRouter();

  const handleCreateProject = () => {
    router.push('/create-project');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <Card className="max-w-md w-full backdrop-blur-md bg-glass/50 border-glass-border shadow-glass text-center">
        <CardContent className="p-8">
          {/* Abstract illustration */}
          <motion.div
            className="relative mx-auto mb-6 w-24 h-24"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary-glow/20 rounded-2xl blur-xl" />

            {/* Main icon container */}
            <motion.div
              className="relative w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-glass-border flex items-center justify-center"
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <FolderOpen className="w-12 h-12 text-primary" />

              {/* Floating particles */}
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
              <motion.div
                className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-primary-glow rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-display font-bold text-foreground">
              No projects yet
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Create your first project to start deploying applications to your
              VPS. Connect a GitHub repository or provide a manual URL.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={handleCreateProject}
              className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300 group"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
              Create Project
            </Button>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            className="flex justify-center gap-6 mt-8 pt-6 border-t border-glass-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-primary">5min</div>
              <div className="text-xs text-muted-foreground">Avg. Setup</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary-glow">Auto</div>
              <div className="text-xs text-muted-foreground">Scaling</div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

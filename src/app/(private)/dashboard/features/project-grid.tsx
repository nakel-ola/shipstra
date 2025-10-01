"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  GitBranch,
  Clock,
  MoreVertical,
  Play,
  Settings,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/hooks/use-projects";
import { useRouter } from "next/navigation";

interface ProjectGridProps {
  projects: Project[];
}

const statusConfig = {
  pending: {
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    label: "Pending",
  },
  building: {
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    label: "Building",
  },
  deployed: {
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    label: "Deployed",
  },
  failed: {
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    label: "Failed",
  },
  inactive: {
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    label: "Inactive",
  },
};

const ProjectCard = ({
  project,
  index,
}: {
  project: Project;
  index: number;
}) => {
  const status = statusConfig[project.status];
  const router = useRouter();

  const handleCardClick = () => {
    console.log("🔍 Navigating to project:", project.id);
    router.push(`/project/${project.id}`);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when dropdown is clicked
  };

  const handleVisitClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when visit button is clicked
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass hover:shadow-glow transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleDropdownClick}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-glass/95 backdrop-blur-sm border-glass-border"
              >
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Play className="h-4 w-4 mr-2" />
                  Deploy
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={`${status.color} border`}>{status.label}</Badge>
            {project.domain && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 p-1 text-xs hover:text-primary"
                onClick={handleVisitClick}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Visit
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {project.repository_url && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                <span className="truncate">
                  {project.repository_url.replace("https://github.com/", "")}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Updated {new Date(project.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ProjectGrid = ({ projects }: ProjectGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
};

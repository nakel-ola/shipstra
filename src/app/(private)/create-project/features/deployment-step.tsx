"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Terminal,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { DeploymentData, ProjectDetailsData, SourceCodeData } from "./use-create-project-wizard";

interface DeploymentStepProps {
  sourceCodeData: SourceCodeData;
  projectDetailsData: ProjectDetailsData;
  data: DeploymentData;
  onUpdate: (data: Partial<DeploymentData>) => void;
  onReset: () => void;
}

const mockBuildLogs = [
  "🔧 Setting up build environment...",
  "📦 Installing dependencies...",
  "npm install",
  "✅ Dependencies installed successfully",
  "🏗️  Building project...",
  "npm run build",
  "> next build",
  "info  - Checking validity of types...",
  "info  - Creating an optimized production build...",
  "info  - Compiled successfully",
  "info  - Collecting page data...",
  "info  - Generating static pages (3/3)",
  "info  - Finalizing page optimization...",
  "✅ Build completed successfully",
  "🚀 Deploying to production...",
  "📡 Uploading build artifacts...",
  "🌐 Configuring CDN...",
  "✅ Deployment successful!",
];

export function DeploymentStep({
  sourceCodeData,
  projectDetailsData,
  data,
  onUpdate,
  onReset,
}: DeploymentStepProps) {
  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const { toast } = useToast();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.status === "idle") {
      startDeployment();
    }
  }, []);

  useEffect(() => {
    if (data.status === "building" && currentLogIndex < mockBuildLogs.length) {
      const timer = setTimeout(() => {
        const newLog = mockBuildLogs[currentLogIndex];
        onUpdate({
          logs: [...data.logs, newLog],
        });
        setCurrentLogIndex(prev => prev + 1);
        setProgress(((currentLogIndex + 1) / mockBuildLogs.length) * 100);

        if (currentLogIndex === mockBuildLogs.length - 1) {
          // Deployment completed successfully
          setTimeout(() => {
            onUpdate({
              status: "success",
              deployedUrl: `https://${projectDetailsData.projectName}.shipstra.app`,
              endTime: new Date(),
            });
          }, 1000);
        }
      }, Math.random() * 1000 + 500); // Random delay between 500-1500ms

      return () => clearTimeout(timer);
    }
  }, [data.status, currentLogIndex, data.logs]);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data.logs]);

  const startDeployment = () => {
    onUpdate({
      status: "building",
      logs: [],
      startTime: new Date(),
    });
    setCurrentLogIndex(0);
    setProgress(0);
  };

  const retryDeployment = () => {
    onUpdate({
      status: "building",
      logs: [],
      error: undefined,
      startTime: new Date(),
      endTime: undefined,
    });
    setCurrentLogIndex(0);
    setProgress(0);
  };

  const copyLogsToClipboard = () => {
    navigator.clipboard.writeText(data.logs.join('\n'));
    toast({
      title: "Logs copied",
      description: "Build logs have been copied to your clipboard.",
    });
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case "building":
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (data.status) {
      case "building":
        return <Badge variant="default" className="bg-blue-500">Building</Badge>;
      case "success":
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  const getDuration = () => {
    if (!data.startTime) return null;
    const endTime = data.endTime || new Date();
    const duration = Math.round((endTime.getTime() - data.startTime.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Deployment</h2>
        <p className="text-muted-foreground">
          Your project is being deployed to production
        </p>
      </div>

      {/* Deployment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getStatusIcon()}
              Deployment Summary
            </span>
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            Deploying {projectDetailsData.projectName} from {sourceCodeData.type === "github" ? sourceCodeData.githubRepo?.full_name : "public repository"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Project</p>
              <p className="font-medium">{projectDetailsData.projectName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Branch</p>
              <p className="font-medium">{projectDetailsData.branch}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Build Command</p>
              <p className="font-medium">{projectDetailsData.buildCommand}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">{getDuration() || "—"}</p>
            </div>
          </div>

          {data.status === "building" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Build Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {data.status === "success" && data.deployedUrl && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  🎉 Deployment successful! Your project is live at{" "}
                  <a
                    href={data.deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {data.deployedUrl}
                  </a>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(data.deployedUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Site
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {data.status === "failed" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {data.error || "Deployment failed. Please check the build logs for more details."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Build Logs */}
      <Collapsible open={isLogsOpen} onOpenChange={setIsLogsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Build Logs
                  {data.logs.length > 0 && (
                    <Badge variant="secondary">{data.logs.length} lines</Badge>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {data.logs.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLogsToClipboard();
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                  {isLogsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Real-time build and deployment logs
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 max-h-96 overflow-y-auto">
                {data.logs.length === 0 ? (
                  <div className="text-gray-500">Waiting for logs...</div>
                ) : (
                  <AnimatePresence>
                    {data.logs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-1"
                      >
                        <span className="text-gray-500 mr-2">
                          [{new Date().toLocaleTimeString()}]
                        </span>
                        {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <div ref={logsEndRef} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onReset}>
          Create Another Project
        </Button>
        <div className="flex gap-2">
          {data.status === "failed" && (
            <Button onClick={retryDeployment}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Deployment
            </Button>
          )}
          {data.status === "success" && data.deployedUrl && (
            <Button
              onClick={() => window.open(data.deployedUrl, "_blank")}
              className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Site
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
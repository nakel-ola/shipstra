import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/hooks/use-projects";
import { Deployment } from "@/hooks/use-project-detail";

interface ProjectLogsTabProps {
  project: Project;
  deployments?: Deployment[];
  deploymentsLoading?: boolean;
  onCreateDeployment?: () => Promise<Deployment | null>;
  onUpdateProject?: (updates: Partial<Project>) => Promise<boolean>;
}

export const ProjectLogsTab = ({ deployments = [] }: ProjectLogsTabProps) => {
  const [selectedDeployment, setSelectedDeployment] = useState("dep_abc123");
  const [isStreaming, setIsStreaming] = useState(false);
  const [logs, setLogs] = useState([
    {
      timestamp: "2024-01-20T14:30:15.123Z",
      level: "info",
      message: "Starting deployment process...",
    },
    {
      timestamp: "2024-01-20T14:30:16.456Z",
      level: "info",
      message: "Cloning repository from GitHub...",
    },
    {
      timestamp: "2024-01-20T14:30:18.789Z",
      level: "info",
      message: "Installing dependencies...",
    },
    {
      timestamp: "2024-01-20T14:30:45.234Z",
      level: "info",
      message: "Running npm install...",
    },
    {
      timestamp: "2024-01-20T14:31:12.567Z",
      level: "info",
      message: "Building application...",
    },
    {
      timestamp: "2024-01-20T14:31:45.890Z",
      level: "info",
      message: "Optimizing assets...",
    },
    {
      timestamp: "2024-01-20T14:32:01.123Z",
      level: "success",
      message: "Build completed successfully",
    },
    {
      timestamp: "2024-01-20T14:32:02.456Z",
      level: "info",
      message: "Deploying to production...",
    },
    {
      timestamp: "2024-01-20T14:32:15.789Z",
      level: "success",
      message: "Deployment completed successfully",
    },
    {
      timestamp: "2024-01-20T14:32:16.012Z",
      level: "info",
      message: "Application is now live",
    },
  ]);

  // Use real deployments or fallback to mock
  const displayDeployments =
    deployments.length > 0
      ? deployments.map((dep) => ({
          id: dep.id,
          name: dep.commit_hash || "Latest deployment",
          date: new Date(dep.created_at).toISOString().split("T")[0],
        }))
      : [
          {
            id: "dep_abc123",
            name: "feat: add new dashboard",
            date: "2024-01-20",
          },
          {
            id: "dep_xyz789",
            name: "fix: resolve auth issues",
            date: "2024-01-19",
          },
          {
            id: "dep_def456",
            name: "refactor: optimize queries",
            date: "2024-01-18",
          },
        ];

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  // Simulate live log streaming
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newLog = {
        timestamp: new Date().toISOString(),
        level:
          Math.random() > 0.8
            ? "error"
            : Math.random() > 0.6
            ? "warning"
            : "info",
        message: [
          "Processing request...",
          "Database query executed",
          "Cache updated",
          "Response sent to client",
          "New user session created",
          "API call completed",
        ][Math.floor(Math.random() * 6)],
      };

      setLogs((prev) => [...prev, newLog].slice(-100)); // Keep last 100 logs
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
            ERROR
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
            WARN
          </Badge>
        );
      case "success":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
            SUCCESS
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
            INFO
          </Badge>
        );
    }
  };

  const exportLogs = () => {
    const logText = logs
      .map(
        (log) => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
      )
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${selectedDeployment}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Log Viewer Controls */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Live Logs
              </CardTitle>
              <CardDescription>
                Real-time application and deployment logs
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedDeployment}
                onValueChange={setSelectedDeployment}
              >
                <SelectTrigger className="w-[200px] glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {displayDeployments.map((deployment) => (
                    <SelectItem key={deployment.id} value={deployment.id}>
                      {deployment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleStreaming}
                className={`glass-card ${
                  isStreaming ? "bg-green-500/10 border-green-500/30" : ""
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isStreaming ? "animate-spin" : ""
                  }`}
                />
                {isStreaming ? "Stop" : "Stream"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportLogs}
                className="glass-card"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Log Terminal */}
          <div className="relative">
            <ScrollArea className="h-[500px] w-full rounded-lg border border-white/10 bg-black/50 p-4 font-mono text-sm">
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 text-xs leading-relaxed hover:bg-white/5 px-2 py-1 rounded"
                  >
                    <span className="text-muted-foreground shrink-0 w-[140px]">
                      {new Date(log.timestamp).toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                      .
                      {new Date(log.timestamp)
                        .getMilliseconds()
                        .toString()
                        .padStart(3, "0")}
                    </span>
                    <div className="shrink-0">{getLevelBadge(log.level)}</div>
                    <span
                      className={`
                      ${log.level === "error" ? "text-red-400" : ""}
                      ${log.level === "warning" ? "text-orange-400" : ""}
                      ${log.level === "success" ? "text-green-400" : ""}
                      ${log.level === "info" ? "text-gray-300" : ""}
                    `}
                    >
                      {log.message}
                    </span>
                  </motion.div>
                ))}
                {isStreaming && (
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex items-center gap-2 text-green-400"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs">Live streaming...</span>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-2 bg-black/80 px-2 py-1 rounded text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400">LIVE</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">
                {logs.filter((log) => log.level === "info").length}
              </div>
              <p className="text-xs text-muted-foreground">Info Messages</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-400">
                {logs.filter((log) => log.level === "warning").length}
              </div>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-400">
                {logs.filter((log) => log.level === "error").length}
              </div>
              <p className="text-xs text-muted-foreground">Errors</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-400">
                {logs.filter((log) => log.level === "success").length}
              </div>
              <p className="text-xs text-muted-foreground">Success</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

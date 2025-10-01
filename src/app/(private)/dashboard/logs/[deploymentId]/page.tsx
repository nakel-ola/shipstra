import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Copy,
  Download,
  Search,
  ArrowLeft,
  RefreshCw,
  Terminal,
  GitBranch,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  source?: string;
}

interface Deployment {
  id: string;
  commit: string;
  branch: string;
  status: "pending" | "building" | "success" | "failed";
  timestamp: string;
  author: string;
}

// Mock data
const mockDeployments: Deployment[] = [
  {
    id: "1",
    commit: "a7b3c4d",
    branch: "main",
    status: "success",
    timestamp: "2024-01-20T10:30:00Z",
    author: "john.doe",
  },
  {
    id: "2",
    commit: "f8e9d2c",
    branch: "feature/auth",
    status: "building",
    timestamp: "2024-01-20T11:15:00Z",
    author: "jane.smith",
  },
  {
    id: "3",
    commit: "1a2b3c4",
    branch: "main",
    status: "failed",
    timestamp: "2024-01-20T09:45:00Z",
    author: "mike.wilson",
  },
];

type Props = {
  params: { deploymentId: string };
};

export default function DeploymentLogs({ params: { deploymentId } }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedDeployment, setSelectedDeployment] =
    useState<Deployment | null>(
      deploymentId
        ? mockDeployments.find((d) => d.id === deploymentId) ||
            mockDeployments[0]
        : mockDeployments[0]
    );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [hasNewLogs, setHasNewLogs] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (!isPaused && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Mock SSE connection
  useEffect(() => {
    if (!selectedDeployment) return;

    const connectSSE = () => {
      setIsReconnecting(true);

      // Simulate SSE connection
      const mockLogs: LogEntry[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Starting deployment process...",
          source: "deploy",
        },
        {
          id: "2",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Cloning repository from origin/main",
          source: "git",
        },
        {
          id: "3",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Installing dependencies with npm...",
          source: "npm",
        },
        {
          id: "4",
          timestamp: new Date().toISOString(),
          level: "success",
          message: "Dependencies installed successfully",
          source: "npm",
        },
        {
          id: "5",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Running build script...",
          source: "build",
        },
        {
          id: "6",
          timestamp: new Date().toISOString(),
          level: "warn",
          message: "Warning: Large bundle size detected",
          source: "webpack",
        },
        {
          id: "7",
          timestamp: new Date().toISOString(),
          level: "success",
          message: "Build completed successfully",
          source: "build",
        },
        {
          id: "8",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Deploying to production server...",
          source: "deploy",
        },
      ];

      setLogs(mockLogs);
      setIsReconnecting(false);

      // Simulate streaming new logs
      if (selectedDeployment.status === "building") {
        const interval = setInterval(() => {
          if (!isPaused) {
            const newLog: LogEntry = {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              level: Math.random() > 0.7 ? "warn" : "info",
              message: `Processing ${Math.floor(
                Math.random() * 100
              )}% complete...`,
              source: "deploy",
            };
            setLogs((prev) => [...prev, newLog]);
            setHasNewLogs(true);
            setTimeout(() => setHasNewLogs(false), 500);
          }
        }, 2000);

        return () => clearInterval(interval);
      }
    };

    connectSSE();
  }, [selectedDeployment, isPaused]);

  useEffect(() => {
    scrollToBottom();
  }, [logs, isPaused]);

  const handleDeploymentChange = (deploymentId: string) => {
    const deployment = mockDeployments.find((d) => d.id === deploymentId);
    if (deployment) {
      setSelectedDeployment(deployment);
      setLogs([]);
      router.replace(`/deployment/${deploymentId}/logs`);
    }
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Resumed streaming" : "Paused streaming",
      description: isPaused
        ? "Log streaming has been resumed"
        : "Log streaming has been paused",
    });
  };

  const handleCopyLogs = async () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${new Date(
            log.timestamp
          ).toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(logText);
      toast({
        title: "Logs copied",
        description: "All visible logs have been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy logs to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadLogs = () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${new Date(
            log.timestamp
          ).toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`
      )
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deployment-${selectedDeployment?.id}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Logs downloaded",
      description: "Deployment logs have been downloaded successfully",
    });
  };

  const filteredLogs = logs.filter(
    (log) =>
      searchQuery === "" ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "building":
        return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "failed":
        return "destructive";
      case "building":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "success":
        return "text-green-400";
      default:
        return "text-green-300";
    }
  };

  if (!selectedDeployment) {
    return <div>Deployment not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-mesh p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 hover:bg-muted/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2"
          >
            Deployment Logs
          </motion.h1>
        </div>

        {/* Deployment Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                    <Terminal className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold">
                        Deployment #{selectedDeployment.id}
                      </h2>
                      <Badge
                        variant={getStatusVariant(selectedDeployment.status)}
                        className="flex items-center gap-1"
                      >
                        {getStatusIcon(selectedDeployment.status)}
                        {selectedDeployment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        <span className="font-mono">
                          {selectedDeployment.branch}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">
                          {selectedDeployment.commit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(
                            selectedDeployment.timestamp
                          ).toLocaleString()}
                        </span>
                      </div>
                      <span>by {selectedDeployment.author}</span>
                    </div>
                  </div>
                </div>
                <Select
                  value={selectedDeployment.id}
                  onValueChange={handleDeploymentChange}
                >
                  <SelectTrigger className="w-48 bg-background/50 border-glass-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-glass-border">
                    {mockDeployments.map((deployment) => (
                      <SelectItem key={deployment.id} value={deployment.id}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(deployment.status)}
                          <span>
                            #{deployment.id} - {deployment.commit}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePause}
                    className={`border-glass-border ${
                      isPaused
                        ? "bg-success/10 border-success/30 text-success hover:bg-success/20"
                        : "bg-warning/10 border-warning/30 text-warning hover:bg-warning/20"
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLogs}
                    className="border-glass-border hover:bg-muted/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadLogs}
                    className="border-glass-border hover:bg-muted/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>

                  <AnimatePresence>
                    {isReconnecting && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-sm text-warning"
                      >
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Reconnecting...
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-background/50 border-glass-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Log Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 shadow-2xl">
            <CardContent className="p-0">
              <div
                ref={logContainerRef}
                className="h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
              >
                <div className="p-4 font-mono text-sm space-y-1">
                  <AnimatePresence>
                    {filteredLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale:
                            hasNewLogs && index === filteredLogs.length - 1
                              ? [1, 1.02, 1]
                              : 1,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          scale: { duration: 0.5 },
                        }}
                        className={`flex items-start gap-3 py-1 px-2 rounded ${
                          hasNewLogs && index === filteredLogs.length - 1
                            ? "bg-green-500/10 border-l-2 border-green-400"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="text-slate-400 text-xs min-w-[80px] pt-0.5">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span
                          className={`text-xs font-semibold min-w-[60px] pt-0.5 ${getLogColor(
                            log.level
                          )}`}
                        >
                          [{log.level.toUpperCase()}]
                        </span>
                        {log.source && (
                          <span className="text-blue-400 text-xs min-w-[60px] pt-0.5">
                            {log.source}:
                          </span>
                        )}
                        <span
                          className={`flex-1 ${getLogColor(
                            log.level
                          )} leading-relaxed`}
                        >
                          {log.message}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div ref={logsEndRef} className="h-1" />

                  {/* Animated caret */}
                  {isStreaming && !isPaused && (
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-2 text-green-400"
                    >
                      <span className="w-2 h-4 bg-green-400 rounded-sm" />
                      <span className="text-xs">Streaming logs...</span>
                    </motion.div>
                  )}

                  {isPaused && (
                    <div className="flex items-center gap-2 text-warning">
                      <Pause className="h-3 w-3" />
                      <span className="text-xs">Log streaming paused</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

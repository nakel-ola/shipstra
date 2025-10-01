import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Key,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/hooks/use-projects";
import { Deployment } from "@/hooks/use-project-detail";

interface ProjectSecurityTabProps {
  project: Project;
  deployments?: Deployment[];
  deploymentsLoading?: boolean;
  onCreateDeployment?: () => Promise<Deployment | null>;
  onUpdateProject?: (updates: Partial<Project>) => Promise<boolean>;
}

export const ProjectSecurityTab = ({}: ProjectSecurityTabProps) => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState([
    {
      id: "key_1",
      name: "Production API Key",
      key: "pk_live_abcd1234efgh5678...",
      created: "2024-01-15T10:30:00Z",
      lastUsed: "2024-01-20T14:22:00Z",
    },
    {
      id: "key_2",
      name: "Staging API Key",
      key: "pk_test_wxyz9876stuv5432...",
      created: "2024-01-10T09:15:00Z",
      lastUsed: "2024-01-19T11:45:00Z",
    },
  ]);

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  const generateNewKey = async () => {
    if (!newKeyName.trim()) return;

    setIsGenerating(true);

    // Simulate API key generation
    setTimeout(() => {
      const newKey = {
        id: `key_${Date.now()}`,
        name: newKeyName,
        key: `pk_live_${Math.random().toString(36).substr(2, 32)}`,
        created: new Date().toISOString(),
        lastUsed: null,
      } as any;

      setApiKeys([...apiKeys, newKey]);
      setNewKeyName("");
      setIsGenerating(false);

      toast({
        title: "API Key Generated",
        description: "Your new API key has been generated successfully.",
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const deleteKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId));
    toast({
      title: "API Key Deleted",
      description: "The API key has been permanently deleted.",
    });
  };

  const maskKey = (key: string) => {
    return key.slice(0, 12) + "..." + key.slice(-4);
  };

  // Mock audit log data
  const auditLogs = [
    {
      id: "audit_1",
      action: "API Key Generated",
      user: "john.doe@example.com",
      timestamp: "2024-01-20T14:30:00Z",
      details: "Generated new API key 'Production API Key'",
    },
    {
      id: "audit_2",
      action: "Deployment Created",
      user: "jane.smith@example.com",
      timestamp: "2024-01-20T12:15:00Z",
      details: "Deployed commit a1b2c3d to production",
    },
    {
      id: "audit_3",
      action: "Environment Variable Updated",
      user: "john.doe@example.com",
      timestamp: "2024-01-19T16:45:00Z",
      details: "Updated DATABASE_URL environment variable",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* API Keys */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for your project
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Key
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle>Generate New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key for your project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="glass-card"
                    />
                  </div>
                  <Button
                    onClick={generateNewKey}
                    disabled={isGenerating || !newKeyName.trim()}
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    {isGenerating ? "Generating..." : "Generate API Key"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((apiKey, index) => (
              <motion.div
                key={apiKey.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{apiKey.name}</h4>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {showKeys[apiKey.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(apiKey.created).toLocaleDateString()}
                    {apiKey.lastUsed && (
                      <>
                        {" "}
                        • Last used:{" "}
                        {new Date(apiKey.lastUsed).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteKey(apiKey.id)}
                  className="glass-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <CardDescription>Security events and project changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-white/5 border-white/10">
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-white/5 border-white/10 transition-colors"
                  >
                    <TableCell>
                      <Badge variant="outline" className="glass-card">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

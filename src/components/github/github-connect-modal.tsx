"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGitHubRepos } from "@/hooks/use-github-repos";
import { useToast } from "@/hooks/use-toast";

interface GitHubConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}

export const GitHubConnectModal = ({
  open,
  onOpenChange,
  onSuccess,
}: GitHubConnectModalProps) => {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { saveGitHubToken } = useGitHubRepos();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!token.trim()) {
      setError("Please enter a GitHub access token");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await saveGitHubToken(token);
      await onSuccess?.();

      toast({
        title: "GitHub Connected",
        description: "Your GitHub account has been successfully connected.",
      });

      setToken("");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to connect GitHub account");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    setToken("");
    setError(null);
    setShowToken(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Connect GitHub Account
          </DialogTitle>
          <DialogDescription>
            Connect your GitHub account to access your repositories for
            deployment.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Instructions */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How to get your GitHub token:
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>
                  Go to GitHub Settings → Developer settings → Personal access
                  tokens
                </li>
                <li>Click &quot;Generate new token (classic)&quot;</li>
                <li>
                  Select scopes:{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    repo
                  </code>{" "}
                  (for private repos) and{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    public_repo
                  </code>
                </li>
                <li>Copy the generated token</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  window.open("https://github.com/settings/tokens", "_blank")
                }
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open GitHub Settings
              </Button>
            </div>

            {/* Token Input */}
            <div className="space-y-2">
              <Label htmlFor="github-token">GitHub Personal Access Token</Label>
              <div className="relative">
                <Input
                  id="github-token"
                  type={showToken ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pr-10"
                  disabled={isConnecting}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowToken(!showToken)}
                  disabled={isConnecting}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Security Note */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your token is securely encrypted and stored on our servers. We
                never store tokens in your browser.
              </AlertDescription>
            </Alert>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!token.trim() || isConnecting}
              className="bg-gradient-primary hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

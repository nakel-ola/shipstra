"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Trash2,
  RefreshCw,
  User,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGitHubRepos } from "@/hooks/use-github-repos";
import { useToast } from "@/hooks/use-toast";
import { GitHubConnectModal } from "./github-connect-modal";

export const GitHubSettings = () => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const {
    isConnected,
    gitHubUser,
    isLoading,
    removeGitHubToken,
    refetchRepos,
    refreshAll,
  } = useGitHubRepos();

  const { toast } = useToast();

  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    try {
      await removeGitHubToken();
      await refreshAll();

      toast({
        title: "GitHub Disconnected",
        description: "Your GitHub account has been disconnected successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to disconnect",
        description: error.message || "Failed to disconnect GitHub account.",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetchRepos();
      toast({
        title: "Repositories Refreshed",
        description: "Your GitHub repositories have been refreshed.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to refresh",
        description: error.message || "Failed to refresh repositories.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>
            Connect your GitHub account to access your repositories for
            deployment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isConnected && gitHubUser ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Connected Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    {gitHubUser.avatar_url ? (
                      <img
                        src={gitHubUser.avatar_url}
                        alt={gitHubUser.name || gitHubUser.login}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {gitHubUser.name || gitHubUser.login}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{gitHubUser.login}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://github.com/${gitHubUser.login}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </div>

              <Separator />

              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    GitHub Username
                  </Label>
                  <p className="text-sm">{gitHubUser.login}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account ID
                  </Label>
                  <p className="text-sm">{gitHubUser.id}</p>
                </div>
                {gitHubUser.email && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email
                    </Label>
                    <p className="text-sm">{gitHubUser.email}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Repositories
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </Button>
              </div>

              {/* Security Note */}
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Your GitHub access token is securely encrypted and stored on
                  our servers. You can revoke access at any time from your
                  GitHub settings.
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Not Connected State */}
              <div className="text-center py-8">
                <Github className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Connect Your GitHub Account
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Connect your GitHub account to access your repositories and
                  deploy them directly from our platform.
                </p>
                <Button
                  onClick={() => setShowConnectModal(true)}
                  className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub Account
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Access Your Repos</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse and deploy from both public and private repositories.
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Automatic Deployments</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up continuous deployment from your GitHub repositories.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <GitHubConnectModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        onSuccess={async () => {
          await refreshAll();
        }}
      />
    </>
  );
};

// Helper component for labels
const Label = ({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }) => (
  <label className={className} {...props}>
    {children}
  </label>
);

"use client";

import { useState } from "react";
import { Github, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubConnectModal } from "./github-connect-modal";

interface GitHubConnectPromptProps {
  title?: string;
  description?: string;
  showSettingsLink?: boolean;
  onSuccess?: () => void;
}

export const GitHubConnectPrompt = ({
  title = "Connect GitHub Account",
  description = "Connect your GitHub account to access your repositories for deployment.",
  showSettingsLink = true,
  onSuccess,
}: GitHubConnectPromptProps) => {
  const [showConnectModal, setShowConnectModal] = useState(false);

  return (
    <>
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setShowConnectModal(true)}
              className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
            >
              <Github className="w-4 h-4 mr-2" />
              Connect GitHub
            </Button>
            {showSettingsLink && (
              <Button
                variant="outline"
                onClick={() => window.open('/dashboard/settings?tab=integrations', '_self')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Go to Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <GitHubConnectModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        onSuccess={onSuccess}
      />
    </>
  );
};
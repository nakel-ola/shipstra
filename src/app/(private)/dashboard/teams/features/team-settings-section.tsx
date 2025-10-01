import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Save, AlertTriangle, Building2, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTeams } from "@/hooks/use-teams";
import { useAuth } from "@/hooks/useAuth";

export const TeamSettingsSection = () => {
  const { user } = useAuth();
  const { currentTeam, updateTeamName, deleteTeam } = useTeams();
  const [teamName, setTeamName] = useState(currentTeam?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = currentTeam?.owner_id === user?.id;
  const hasChanges =
    teamName !== currentTeam?.name && teamName.trim().length > 0;

  const handleUpdateTeamName = async () => {
    if (!hasChanges || !teamName.trim()) return;

    setIsUpdating(true);
    const success = await updateTeamName(teamName.trim());
    if (success) {
      // Name will be updated via refetch
    }
    setIsUpdating(false);
  };

  const handleDeleteTeam = async () => {
    const success = await deleteTeam();
    if (success) {
      setShowDeleteDialog(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasChanges) {
      handleUpdateTeamName();
    }
  };

  if (!currentTeam) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <Card className="max-w-md w-full bg-glass/50 border-glass-border text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No team found</h3>
            <p className="text-muted-foreground">
              You need to be part of a team to access settings.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      {/* Team Information */}
      <Card className="bg-glass/50 border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Team Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <div className="flex gap-2">
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter team name"
                disabled={!isOwner}
                className="bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all duration-300"
              />
              <Button
                onClick={handleUpdateTeamName}
                disabled={!hasChanges || isUpdating || !isOwner}
                className="bg-gradient-primary hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300 shrink-0"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
            {!isOwner && (
              <p className="text-sm text-muted-foreground">
                Only team owners can modify the team name.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-glass-border">
            <div>
              <Label className="text-sm text-muted-foreground">Team ID</Label>
              <p className="font-mono text-sm bg-muted/50 p-2 rounded border">
                {currentTeam.slug}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Created</Label>
              <p className="text-sm">
                {new Date(currentTeam.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Permissions */}
      <Card className="bg-glass/50 border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-glass-border">
              <div>
                <h4 className="font-medium">Your Role</h4>
                <p className="text-sm text-muted-foreground">
                  Your current permissions in this team
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">
                  {isOwner ? "Owner" : "Member"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isOwner ? "Full access" : "Limited access"}
                </p>
              </div>
            </div>

            {isOwner && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>As the team owner, you can:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Invite and remove team members</li>
                  <li>Change member roles and permissions</li>
                  <li>Modify team settings and information</li>
                  <li>Delete the team</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="bg-gradient-to-br from-destructive/5 to-red-500/5 border-destructive/20 shadow-[0_0_20px_hsl(var(--destructive)/0.1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <div>
                <h4 className="font-medium text-destructive">Delete Team</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this team and all associated data. This
                  action cannot be undone.
                </p>
              </div>

              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 text-destructive-foreground border-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.3)] hover:shadow-[0_0_30px_hsl(var(--destructive)/0.4)] transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Team
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-glass/95 backdrop-blur-md border-glass-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Team
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        Are you sure you want to delete the team{" "}
                        <span className="font-semibold">
                          &quot;{currentTeam.name}&quot;
                        </span>
                        ?
                      </p>
                      <p className="text-destructive font-medium">
                        This will permanently delete:
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                        <li>All team members and their access</li>
                        <li>All projects associated with this team</li>
                        <li>All team settings and configurations</li>
                        <li>All deployment history and logs</li>
                      </ul>
                      <p className="font-semibold text-destructive">
                        This action cannot be undone!
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-glass-border hover:bg-glass/50">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTeam}
                      className="bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 text-destructive-foreground shadow-[0_0_20px_hsl(var(--destructive)/0.3)] hover:shadow-[0_0_30px_hsl(var(--destructive)/0.4)] transition-all duration-300"
                    >
                      Delete Team
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

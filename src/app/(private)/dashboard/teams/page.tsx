import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ChevronRight, Plus, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MembersSection,
  InvitesSection,
  TeamSettingsSection,
  InviteMemberModal,
} from "./features";
import { useAuth } from "@/hooks/useAuth";
import { useTeams } from "@/hooks/use-teams";

export default function Teams() {
  const { user } = useAuth();
  const { currentTeam, loading } = useTeams();
  const [activeTab, setActiveTab] = useState("members");
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              Please sign in to manage teams.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading team data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberCount = currentTeam?.members?.length || 0;
  const pendingInvites =
    currentTeam?.invites?.filter((invite) => invite.status === "pending")
      ?.length || 0;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-glass-border bg-glass/30 backdrop-blur-sm">
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Team</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      Team
                    </h1>
                    <p className="text-muted-foreground">
                      Manage members and roles for this workspace
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>

              {/* Team Stats */}
              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm text-muted-foreground">
                    {memberCount} {memberCount === 1 ? "Member" : "Members"}
                  </span>
                </div>
                {pendingInvites > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      {pendingInvites} Pending{" "}
                      {pendingInvites === 1 ? "Invite" : "Invites"}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Tab Navigation */}
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-glass/50 border border-glass-border">
                <TabsTrigger
                  value="members"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Members
                  {memberCount > 0 && (
                    <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                      {memberCount}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="invites"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Invites
                  {pendingInvites > 0 && (
                    <span className="bg-amber-500/80 text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                      {pendingInvites}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow flex items-center gap-2"
                >
                  <Settings2 className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <div className="space-y-6">
                <TabsContent value="members" className="m-0">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <MembersSection />
                  </motion.div>
                </TabsContent>

                <TabsContent value="invites" className="m-0">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <InvitesSection
                      onInviteClick={() => setShowInviteModal(true)}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="settings" className="m-0">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <TeamSettingsSection />
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
      />
    </>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Crown, Mail, MoreVertical, UserX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteTeamModal } from "./invite-team-modal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  joinedAt: string;
  status: "active" | "pending";
  userId: string;
  organizationId: string;
}

export function OrganizationTab() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);
  const [_, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load user's organization (assuming user is in one org for now)
      const { data: membershipData, error: membershipError } = await supabase
        .from("team_members")
        .select(
          `
          *,
          organizations (*)
        `
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (membershipError) {
        console.error("Error loading organization:", membershipError);
        return;
      }

      if (membershipData?.organizations) {
        setCurrentOrganization(membershipData.organizations);
        await loadTeamMembers(membershipData.organizations.id);
      }
    } catch (error) {
      console.error("Error loading organization data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async (organizationId: string) => {
    try {
      // First get team members
      const { data: membersData, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("organization_id", organizationId);

      if (error) {
        console.error("Error loading team members:", error);
        return;
      }

      if (!membersData) return;

      // Then get profile data for each member
      const members: TeamMember[] = [];
      for (const member of membersData) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, avatar_url")
          .eq("user_id", member.user_id)
          .maybeSingle();

        members.push({
          id: member.id,
          userId: member.user_id,
          organizationId: member.organization_id,
          name: profile
            ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
              "Unknown User"
            : "Unknown User",
          email: profile?.email || "",
          role: member.role as "owner" | "admin" | "member",
          avatar: profile?.avatar_url || "",
          joinedAt: member.joined_at || member.created_at || "",
          status: member.status as "active" | "pending",
        });
      }

      setTeamMembers(members);
    } catch (error) {
      console.error("Error loading team members:", error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-gradient-primary text-primary-foreground";
      case "admin":
        return "bg-accent text-accent-foreground";
      case "member":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) {
        console.error("Error removing team member:", error);
        toast({
          title: "Error",
          description: "Failed to remove team member. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the organization.`,
      });
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = (memberEmail: string) => {
    toast({
      title: "Invitation resent",
      description: `Invitation has been resent to ${memberEmail}.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Organization Info */}
      <Card className="bg-glass border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="bg-gradient-text bg-clip-text text-transparent flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>
            Manage your organization and team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-background/20 border border-white/10">
              <div className="text-2xl font-bold text-primary">
                {teamMembers.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/20 border border-white/10">
              <div className="text-2xl font-bold text-green-400">
                {teamMembers.filter((m) => m.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background/20 border border-white/10">
              <div className="text-2xl font-bold text-yellow-400">
                {teamMembers.filter((m) => m.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="bg-glass border-white/10 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="bg-gradient-text bg-clip-text text-transparent">
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your team and their permissions
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-gradient-primary hover:shadow-glow hover:scale-[1.02] transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-white/10 rounded-lg bg-background/20 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-muted-foreground">
                    Member
                  </TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Joined
                  </TableHead>
                  <TableHead className="text-muted-foreground w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id} className="border-white/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">
                            {member.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getRoleColor(member.role)} capitalize`}
                      >
                        {member.role === "owner" && (
                          <Crown className="h-3 w-3 mr-1" />
                        )}
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(
                          member.status
                        )} capitalize`}
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-glass border-white/10 backdrop-blur-xl"
                          >
                            {member.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => handleResendInvite(member.email)}
                                className="hover:bg-white/10"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Invite
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemoveMember(member.id, member.name)
                              }
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InviteTeamModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId={currentOrganization?.id}
        onMemberAdded={() => loadOrganizationData()}
      />
    </motion.div>
  );
}

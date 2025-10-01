import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Crown,
  Shield,
  MoreVertical,
  UserMinus,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTeams, TeamMember } from "@/hooks/use-teams";
import { useAuth } from "@/hooks/useAuth";

const roleConfig = {
  owner: {
    label: "Owner",
    icon: Crown,
    className:
      "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 border-indigo-500/20 shadow-[0_0_20px_hsl(217_91%_60%_/_0.3)]",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    className:
      "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-500/20 shadow-[0_0_20px_hsl(186_83%_50%_/_0.3)]",
  },
  member: {
    label: "Member",
    icon: UserCheck,
    className:
      "bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-gray-600 border-gray-500/20",
  },
};

interface MemberRowProps {
  member: TeamMember;
  isCurrentUser: boolean;
  isOwner: boolean;
  onRoleChange: (memberId: string, newRole: "admin" | "member") => void;
  onRemove: (member: TeamMember) => void;
}

const MemberRow = ({
  member,
  isCurrentUser,
  isOwner,
  onRoleChange,
  onRemove,
}: MemberRowProps) => {
  const role = roleConfig[member.role];
  const RoleIcon = role.icon;

  const displayName =
    member.first_name && member.last_name
      ? `${member.first_name} ${member.last_name}`
      : member.email?.split("@")[0] || "Unknown User";

  const initials =
    member.first_name && member.last_name
      ? `${member.first_name[0]}${member.last_name[0]}`
      : member.email?.slice(0, 2).toUpperCase() || "U";

  const canManage = isOwner && !isCurrentUser && member.role !== "owner";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-glass-border hover:bg-glass/30 transition-all duration-300 group"
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground flex items-center gap-2">
              {displayName}
              {isCurrentUser && (
                <span className="text-xs text-muted-foreground">(You)</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{member.email}</div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge
          className={`${role.className} border flex items-center gap-1 w-fit`}
        >
          <RoleIcon className="h-3 w-3" />
          {role.label}
        </Badge>
      </TableCell>

      <TableCell className="text-muted-foreground">
        {new Date(member.joined_at).toLocaleDateString()}
      </TableCell>

      <TableCell>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-glass/95 backdrop-blur-sm border-glass-border"
            >
              {member.role === "member" && (
                <DropdownMenuItem
                  onClick={() => onRoleChange(member.id, "admin")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Promote to Admin
                </DropdownMenuItem>
              )}
              {member.role === "admin" && (
                <DropdownMenuItem
                  onClick={() => onRoleChange(member.id, "member")}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Change to Member
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRemove(member)}
                className="text-destructive focus:text-destructive"
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remove Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </motion.tr>
  );
};

export const MembersSection = () => {
  const { user } = useAuth();
  const { currentTeam, updateMemberRole, removeMember } = useTeams();
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null);

  const members = currentTeam?.members || [];
  const isOwner = currentTeam?.owner_id === user?.id;

  const handleRoleChange = async (
    memberId: string,
    newRole: "admin" | "member"
  ) => {
    await updateMemberRole(memberId, newRole);
  };

  const handleRemoveMember = (member: TeamMember) => {
    setRemovingMember(member);
  };

  const confirmRemoveMember = async () => {
    if (removingMember) {
      const success = await removeMember(removingMember.id);
      if (success) {
        setRemovingMember(null);
      }
    }
  };

  if (members.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <Card className="max-w-md w-full bg-glass/50 border-glass-border text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No members yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your team by inviting members to collaborate on
              projects.
            </p>
            <div className="w-full h-1 bg-gradient-primary/20 rounded-full" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-glass/50 border-glass-border shadow-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
            <Badge variant="secondary" className="ml-auto">
              {members.length}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isCurrentUser={member.user_id === user?.id}
                  isOwner={isOwner}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveMember}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!removingMember}
        onOpenChange={() => setRemovingMember(null)}
      >
        <AlertDialogContent className="bg-glass/95 backdrop-blur-md border-glass-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <UserMinus className="h-5 w-5" />
              Remove Team Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">
                {removingMember?.first_name} {removingMember?.last_name} (
                {removingMember?.email})
              </span>{" "}
              from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-glass-border hover:bg-glass/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              className="bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 text-destructive-foreground shadow-[0_0_20px_hsl(var(--destructive)/0.3)] hover:shadow-[0_0_30px_hsl(var(--destructive)/0.4)] transition-all duration-300"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

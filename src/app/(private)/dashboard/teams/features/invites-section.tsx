import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Shield,
  UserCheck,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeams } from "@/hooks/use-teams";

interface InvitesSectionProps {
  onInviteClick: () => void;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  },
};

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: UserCheck,
};

export const InvitesSection = ({ onInviteClick }: InvitesSectionProps) => {
  const { currentTeam, resendInvite, cancelInvite } = useTeams();

  const invites = currentTeam?.invites || [];
  const pendingInvites = invites.filter(
    (invite) => invite.status === "pending"
  );

  if (invites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <Card className="max-w-md w-full bg-glass/50 border-glass-border text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No invitations sent</h3>
            <p className="text-muted-foreground mb-6">
              Send invitations to new team members to start collaborating.
            </p>
            <Button
              onClick={onInviteClick}
              className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Send First Invitation
            </Button>
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {pendingInvites.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {invites.filter((i) => i.status === "accepted").length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold text-blue-600">
                  {invites.length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invites Table */}
      <Card className="bg-glass/50 border-glass-border shadow-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Team Invitations
            </CardTitle>

            <Button
              onClick={onInviteClick}
              className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {invites.map((invite, index) => {
                const status = statusConfig[invite.status];
                const StatusIcon = status.icon;
                const RoleIcon = roleIcons[invite.role];

                return (
                  <motion.tr
                    key={invite.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-glass-border hover:bg-glass/30 transition-all duration-300 group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{invite.email}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 w-fit"
                      >
                        <RoleIcon className="h-3 w-3" />
                        {invite.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={`${status.className} border flex items-center gap-1 w-fit`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(invite.invited_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {invite.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                resendInvite(invite.id, invite.email)
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Resend
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                cancelInvite(invite.id, invite.email)
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

import { motion } from "framer-motion";
import {
  Rocket,
  RotateCcw,
  Key,
  Globe,
  FolderOpen,
  Settings,
  Database,
  GitCommit,
  Clock,
  ExternalLink,
  LogIn,
  LogOut,
  UserPlus,
  Mail,
  Users,
  UserMinus,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "@/hooks/use-activity";

interface ActivityTimelineProps {
  activities: Activity[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case "login":
      return LogIn;
    case "logout":
      return LogOut;
    case "signup":
      return UserPlus;
    case "project_created":
    case "project_updated":
    case "project_deleted":
      return FolderOpen;
    case "deployment_started":
    case "deployment_completed":
      return Rocket;
    case "deployment_failed":
      return RotateCcw;
    case "invite_sent":
    case "invite_accepted":
    case "invite_cancelled":
      return Mail;
    case "team_member_added":
      return Users;
    case "team_member_removed":
      return UserMinus;
    case "team_member_role_changed":
      return Shield;
    case "ssh_credential_added":
    case "ssh_credential_updated":
    case "ssh_credential_deleted":
      return Key;
    case "domain_added":
    case "domain_verified":
    case "domain_removed":
      return Globe;
    case "settings_updated":
    case "profile_updated":
      return Settings;
    // Legacy support for old action types
    case "deploy":
      return Rocket;
    case "rollback":
      return RotateCcw;
    case "api_key_generated":
    case "credential_added":
    case "credential_updated":
      return Key;
    case "domain_verify":
      return Globe;
    case "project":
      return FolderOpen;
    case "settings_changed":
      return Settings;
    default:
      return Database;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case "login":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "logout":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "signup":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "project_created":
    case "project_updated":
    case "project_deleted":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "deployment_started":
    case "deployment_completed":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "deployment_failed":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "invite_sent":
    case "invite_accepted":
    case "invite_cancelled":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "team_member_added":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "team_member_removed":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "team_member_role_changed":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "ssh_credential_added":
    case "ssh_credential_updated":
    case "ssh_credential_deleted":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "domain_added":
    case "domain_verified":
    case "domain_removed":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "settings_updated":
    case "profile_updated":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    // Legacy support for old action types
    case "deploy":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "rollback":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "api_key_generated":
    case "credential_added":
    case "credential_updated":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "domain_verify":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "project":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "settings_changed":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-primary/20 text-primary border-primary/30";
  }
};

const formatActionType = (actionType: string) => {
  return actionType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const ActivityTimeline = ({
  activities,
  hasMore,
  loading,
  onLoadMore,
}: ActivityTimelineProps) => {
  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent"></div>

        <div className="space-y-6">
          {activities.map((activity, index) => {
            const Icon = getActionIcon(activity.action_type);
            const iconColor = getActionColor(activity.action_type);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                className="relative"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-6 w-4 h-4 rounded-full border-2 ${iconColor} shadow-glow`}
                >
                  <div className="absolute inset-1 rounded-full bg-current opacity-60"></div>
                </div>

                {/* Activity card */}
                <Card className="ml-16 p-6 bg-glass/60 backdrop-blur-xl border-glass-border hover:bg-glass/80 transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* User avatar */}
                      <Avatar className="w-10 h-10 border-2 border-glass-border">
                        <AvatarImage
                          src={activity.user_profile?.avatar_url ?? ""}
                          alt={`${activity.user_profile?.first_name} ${activity.user_profile?.last_name}`}
                        />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-medium">
                          {activity.user_profile?.first_name?.[0]}
                          {activity.user_profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-1 rounded-lg ${iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-glass/40 text-foreground"
                          >
                            {formatActionType(activity.action_type)}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDistanceToNow(
                              new Date(activity.created_at),
                              { addSuffix: true }
                            )}
                          </div>
                        </div>

                        {/* User and description */}
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {activity.user_profile?.first_name}{" "}
                              {activity.user_profile?.last_name}
                            </span>{" "}
                            {activity.action_description}
                          </p>

                          {/* Metadata */}
                          {activity.metadata &&
                            Object.keys(activity.metadata).length > 0 && (
                              <div className="space-y-2">
                                {activity.metadata.project_name && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <FolderOpen className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      Project:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {activity.metadata.project_name}
                                    </span>
                                    {activity.metadata.project_id && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-1 text-xs text-primary hover:text-primary-foreground"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                )}

                                {activity.metadata.commit_hash && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <GitCommit className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      Commit:
                                    </span>
                                    <code className="px-2 py-1 bg-glass/40 rounded text-xs font-mono">
                                      {activity.metadata.commit_hash.substring(
                                        0,
                                        8
                                      )}
                                    </code>
                                  </div>
                                )}

                                {activity.metadata.domain && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Globe className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      Domain:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {activity.metadata.domain}
                                    </span>
                                  </div>
                                )}

                                {activity.metadata.credential_name && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Key className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      Credential:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {activity.metadata.credential_name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="bg-glass/40 border-glass-border hover:bg-glass/60"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

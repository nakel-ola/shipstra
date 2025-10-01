import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ActivityType = 
  | 'login' | 'logout' | 'signup'
  | 'project_created' | 'project_updated' | 'project_deleted'
  | 'deployment_started' | 'deployment_completed' | 'deployment_failed'
  | 'invite_sent' | 'invite_accepted' | 'invite_cancelled'
  | 'team_member_added' | 'team_member_removed' | 'team_member_role_changed'
  | 'ssh_credential_added' | 'ssh_credential_updated' | 'ssh_credential_deleted'
  | 'domain_added' | 'domain_verified' | 'domain_removed'
  | 'settings_updated' | 'profile_updated';

interface LogActivityParams {
  actionType: ActivityType;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = async ({
    actionType,
    description,
    entityType,
    entityId,
    metadata = {}
  }: LogActivityParams) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          action_type: actionType,
          action_description: description,
          entity_type: entityType,
          entity_id: entityId,
          metadata,
          ip_address: null, // We could fetch this from a service if needed
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return { logActivity };
};

// Static function for use outside of React components
export const logActivity = async (params: LogActivityParams & { userId: string }) => {
  try {
    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: params.userId,
        action_type: params.actionType,
        action_description: params.description,
        entity_type: params.entityType,
        entity_id: params.entityId,
        metadata: params.metadata || {},
        ip_address: null,
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
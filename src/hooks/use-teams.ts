import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from './use-activity-logger';

export interface TeamMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'suspended';
  joined_at: string;
  invited_at: string;
  invited_by: string;
  // Profile info from join
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  invited_at: string;
  expires_at: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
  invites?: TeamInvite[];
}

export interface InviteMemberInput {
  email: string;
  role: 'admin' | 'member';
}

export const useTeams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeamData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's team (for now, just get the first one they're a member of)
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (!teamMember) {
        setCurrentTeam(null);
        return;
      }

      const team = teamMember.organization;
      if (!team) return;

      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('organization_id', team.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;

      // Get profile data for each member
      const memberIds = members?.map(m => m.user_id) || [];
      let profilesData: any[] = [];
      
      if (memberIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, email, first_name, last_name, avatar_url')
          .in('user_id', memberIds);

        if (!profilesError) {
          profilesData = profiles || [];
        }
      }

      // Get invites for this organization
      const { data: invites, error: invitesError } = await supabase
        .from('team_invites')
        .select('*')
        .eq('organization_id', team.id)
        .order('invited_at', { ascending: false });

      if (invitesError) {
        console.error('Error fetching invites:', invitesError);
      }

      setCurrentTeam({
        id: team.id,
        name: team.name,
        slug: team.slug,
        owner_id: team.owner_id,
        created_at: team.created_at!,
        updated_at: team.updated_at!,
        members: members?.map(member => {
          const profile = profilesData.find(p => p.user_id === member.user_id);
          return {
            id: member.id,
            user_id: member.user_id,
            role: member.role as 'owner' | 'admin' | 'member',
            status: member.status as 'active' | 'invited' | 'suspended',
            joined_at: member.joined_at!,
            invited_at: member.invited_at!,
            invited_by: member.invited_by!,
            email: profile?.email,
            first_name: profile?.first_name,
            last_name: profile?.last_name,
            avatar_url: profile?.avatar_url,
          };
        }) || [],
        invites: (invites || []).map(invite => ({
          id: invite.id,
          email: invite.email,
          role: invite.role as 'admin' | 'member',
          status: invite.status as 'pending' | 'accepted' | 'expired' | 'cancelled',
          invited_by: invite.invited_by,
          invited_at: invite.invited_at,
          expires_at: invite.expires_at,
        })),
      });
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    if (!user || !currentTeam) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId)
        .eq('organization_id', currentTeam.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member role updated successfully.",
      });

      // Log the activity
      await logActivity({
        actionType: 'team_member_role_changed',
        description: `Changed team member role to ${newRole}`,
        entityType: 'team_member',
        entityId: memberId,
        metadata: {
          member_id: memberId,
          new_role: newRole,
          organization_id: currentTeam.id,
          organization_name: currentTeam.name,
        },
      });

      await fetchTeamData();
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeMember = async (memberId: string) => {
    if (!user || !currentTeam) return false;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', currentTeam.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully.",
      });

      // Log the activity
      await logActivity({
        actionType: 'team_member_removed',
        description: `Removed team member from organization`,
        entityType: 'team_member',  
        entityId: memberId,
        metadata: {
          member_id: memberId,
          organization_id: currentTeam.id,
          organization_name: currentTeam.name,
        },
      });

      await fetchTeamData();
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive",
      });
      return false;
    }
  };

  const inviteMember = async (input: InviteMemberInput) => {
    if (!user || !currentTeam) return false;

    try {
      const { error } = await supabase
        .from('team_invites')
        .insert({
          organization_id: currentTeam.id,
          email: input.email,
          role: input.role,
          invited_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${input.email} as ${input.role}.`,
      });

      // Log the activity
      await logActivity({
        actionType: 'invite_sent',
        description: `Sent team invitation to ${input.email} as ${input.role}`,
        entityType: 'team_invite',
        entityId: currentTeam.id,
        metadata: {
          invitee_email: input.email,
          role: input.role,
          organization_id: currentTeam.id,
          organization_name: currentTeam.name,
        },
      });

      // Refresh team data to show new invite
      await fetchTeamData();
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateTeamName = async (newName: string) => {
    if (!user || !currentTeam) return false;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: newName })
        .eq('id', currentTeam.id)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team name updated successfully.",
      });

      await fetchTeamData();
      return true;
    } catch (error) {
      console.error('Error updating team name:', error);
      toast({
        title: "Error",
        description: "Failed to update team name.",
        variant: "destructive",
      });
      return false;
    }
  };

  const resendInvite = async (inviteId: string, inviteEmail: string) => {
    if (!user || !currentTeam) return false;

    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ 
          invited_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .eq('id', inviteId)
        .eq('organization_id', currentTeam.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Log activity
      await logActivity({
        actionType: 'invite_sent',
        description: `resent team invitation to ${inviteEmail}`,
        entityType: 'team_invite',
        entityId: inviteId,
        metadata: { 
          email: inviteEmail,
          organization_name: currentTeam.name 
        }
      });

      toast({
        title: "Success",
        description: `Invitation resent to ${inviteEmail}`,
      });

      await fetchTeamData();
      return true;
    } catch (error) {
      console.error('Error resending invite:', error);
      toast({
        title: "Error",
        description: "Failed to resend invitation.",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelInvite = async (inviteId: string, inviteEmail: string) => {
    if (!user || !currentTeam) return false;

    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'cancelled' })
        .eq('id', inviteId)
        .eq('organization_id', currentTeam.id);

      if (error) throw error;

      // Log activity
      await logActivity({
        actionType: 'invite_cancelled',
        description: `cancelled team invitation for ${inviteEmail}`,
        entityType: 'team_invite',
        entityId: inviteId,
        metadata: { 
          email: inviteEmail,
          organization_name: currentTeam.name 
        }
      });

      toast({
        title: "Success",
        description: `Invitation cancelled for ${inviteEmail}`,
      });

      await fetchTeamData();
      return true;
    } catch (error) {
      console.error('Error cancelling invite:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTeam = async () => {
    if (!user || !currentTeam) return false;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', currentTeam.id)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });

      setCurrentTeam(null);
      return true;
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeamData();
    }
  }, [user]);

  return {
    currentTeam,
    loading,
    updateMemberRole,
    removeMember,
    inviteMember,
    resendInvite,
    cancelInvite,
    updateTeamName,
    deleteTeam,
    refetch: fetchTeamData,
  };
};
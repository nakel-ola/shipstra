import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SSHCredential {
  id: string;
  type: 'global' | 'project';
  projectName?: string;
  host: string;
  port: number;
  username: string;
  authMethod: 'password' | 'privateKey';
  createdAt: string;
}

export interface SSHCredentialInput {
  type: 'global' | 'project';
  projectName?: string;
  host: string;
  port: number;
  username: string;
  authMethod: 'password' | 'privateKey';
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

export const useSSHCredentials = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<SSHCredential[]>([]);
  const [globalCredential, setGlobalCredential] = useState<SSHCredential | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredentials = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ssh_credentials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectCredentials = data
        ?.filter(cred => cred.type === 'project')
        .map(cred => ({
          id: cred.id,
          type: cred.type as 'project',
          projectName: cred.project_name!,
          host: cred.host,
          port: cred.port,
          username: cred.username,
          authMethod: cred.auth_method as 'password' | 'privateKey',
          createdAt: cred.created_at,
        })) || [];

      const globalCred = data?.find(cred => cred.type === 'global');
      const global = globalCred ? {
        id: globalCred.id,
        type: globalCred.type as 'global',
        host: globalCred.host,
        port: globalCred.port,
        username: globalCred.username,
        authMethod: globalCred.auth_method as 'password' | 'privateKey',
        createdAt: globalCred.created_at,
      } : null;

      setCredentials(projectCredentials);
      setGlobalCredential(global);
    } catch (error) {
      console.error('Error fetching SSH credentials:', error);
      toast({
        title: "Error",
        description: "Failed to load SSH credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCredential = async (input: SSHCredentialInput) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('ssh_credentials')
        .insert({
          user_id: user.id,
          type: input.type,
          project_name: input.projectName,
          host: input.host,
          port: input.port,
          username: input.username,
          auth_method: input.authMethod,
          // Note: In production, these should be properly encrypted
          password_encrypted: input.password,
          private_key_encrypted: input.privateKey,
          passphrase_encrypted: input.passphrase,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "SSH credential added successfully.",
      });

      await fetchCredentials();
      return true;
    } catch (error) {
      console.error('Error creating SSH credential:', error);
      toast({
        title: "Error",
        description: "Failed to add SSH credential.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCredential = async (id: string, input: SSHCredentialInput) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('ssh_credentials')
        .update({
          type: input.type,
          project_name: input.projectName,
          host: input.host,
          port: input.port,
          username: input.username,
          auth_method: input.authMethod,
          // Note: In production, these should be properly encrypted
          password_encrypted: input.password,
          private_key_encrypted: input.privateKey,
          passphrase_encrypted: input.passphrase,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "SSH credential updated successfully.",
      });

      await fetchCredentials();
      return true;
    } catch (error) {
      console.error('Error updating SSH credential:', error);
      toast({
        title: "Error",
        description: "Failed to update SSH credential.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCredential = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('ssh_credentials')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "SSH credential deleted successfully.",
      });

      await fetchCredentials();
      return true;
    } catch (error) {
      console.error('Error deleting SSH credential:', error);
      toast({
        title: "Error",
        description: "Failed to delete SSH credential.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  return {
    credentials,
    globalCredential,
    loading,
    createCredential,
    updateCredential,
    deleteCredential,
    refetch: fetchCredentials,
  };
};
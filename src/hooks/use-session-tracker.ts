import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useSessionTracker = () => {
  const { user, session } = useAuth();

  useEffect(() => {
    if (!user || !session) return;

    // Update last_active timestamp every 5 minutes
    const updateActivity = async () => {
      try {
        await supabase
          .from('user_sessions')
          .update({ 
            last_active: new Date().toISOString() 
          })
          .eq('user_id', user.id)
          .eq('is_current', true);
      } catch (error) {
        console.error('Error updating session activity:', error);
      }
    };

    // Update immediately
    updateActivity();

    // Set up interval to update every 5 minutes
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, session]);

  useEffect(() => {
    if (!user) return;

    // Listen for beforeunload to mark session as inactive
    const handleBeforeUnload = async () => {
      try {
        // Use sendBeacon for better reliability on page unload
        const data = JSON.stringify({
          user_id: user.id,
          action: 'session_inactive'
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/session-inactive', data);
        } else {
          // Fallback for older browsers
          await supabase
            .from('user_sessions')
            .update({ 
              last_active: new Date().toISOString(),
              is_current: false 
            })
            .eq('user_id', user.id)
            .eq('is_current', true);
        }
      } catch (error) {
        console.error('Error marking session inactive:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);
};
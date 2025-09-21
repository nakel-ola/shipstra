import { supabase } from "@/integrations/supabase/client";

// Helper function to log login activity
export const logLoginActivity = async (userId: string) => {
  try {
    await supabase
      .from('activities')
      .insert({
        user_id: userId,
        action_type: 'login',
        action_description: 'Signed in to the dashboard',
        entity_type: null,
        entity_id: null,
        metadata: {
          login_method: 'email',
          timestamp: new Date().toISOString(),
        },
        user_agent: navigator.userAgent,
      });
  } catch (error) {
    console.error('Error logging login activity:', error);
  }
};

// Helper function to log logout activity
export const logLogoutActivity = async (userId: string) => {
  try {
    await supabase
      .from('activities')
      .insert({
        user_id: userId,
        action_type: 'logout',
        action_description: 'Signed out of the dashboard',
        entity_type: null,
        entity_id: null,
        metadata: {
          logout_method: 'manual',
          timestamp: new Date().toISOString(),
        },
        user_agent: navigator.userAgent,
      });
  } catch (error) {
    console.error('Error logging logout activity:', error);
  }
};

// Helper function to log signup activity  
export const logSignupActivity = async (userId: string, email: string) => {
  try {
    await supabase
      .from('activities')
      .insert({
        user_id: userId,
        action_type: 'signup',
        action_description: 'Created new account',
        entity_type: null,
        entity_id: null,
        metadata: {
          email,
          signup_method: 'email',
          timestamp: new Date().toISOString(),
        },
        user_agent: navigator.userAgent,
      });
  } catch (error) {
    console.error('Error logging signup activity:', error);
  }
};
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";



export const useUser = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user: storeUser },
        error: supaError,
      } = await supabase.auth.getUser();

      if (storeUser) {
        const { data: securitySettings } = await supabase
          .from("user_security_settings")
          .select("*")
          .eq("user_id", storeUser.id)
          .maybeSingle();

        return { ...storeUser, securitySettings };
      }

      if (supaError) {
        throw Error(supaError.message || "Something went wrong");
      }
    },
  });

  return {
    user,
    error,
    isLoading,
  };
};

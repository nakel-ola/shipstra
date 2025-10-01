import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

interface Activity {
  id: string;
  user_id: string;
  action_type: string;
  action_description: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export type { Activity };

export const useActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    user: "all",
    actionType: "all",
    search: "",
  });

  const ITEMS_PER_PAGE = 20;

  const fetchActivities = async (pageNum = 0, reset = true) => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from("activities")
        .select(`
          *,
          profiles!activities_user_id_fkey(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order("created_at", { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      // Apply filters
      if (filters.actionType !== "all") {
        query = query.eq("action_type", filters.actionType);
      }

      if (filters.search) {
        query = query.ilike("action_description", `%${filters.search}%`);
      }

      const { data: activitiesData, error } = await query;

      if (error) {
        console.error("Error fetching activities:", error);
        toast.error("Failed to fetch activities");
        return;
      }

      // Transform data to match the expected format
      const transformedActivities: Activity[] = (activitiesData || []).map(activity => ({
        id: activity.id,
        user_id: activity.user_id,
        action_type: activity.action_type,
        action_description: activity.action_description,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        metadata: (activity.metadata as Record<string, any>) || {},
        created_at: activity.created_at,
        user_profile: (activity as any).profiles ? {
          first_name: (activity as any).profiles.first_name,
          last_name: (activity as any).profiles.last_name,
          avatar_url: (activity as any).profiles.avatar_url,
        } : {
          first_name: null,
          last_name: null,
          avatar_url: null,
        },
      }));

      if (reset) {
        setActivities(transformedActivities);
      } else {
        setActivities(prev => [...prev, ...transformedActivities]);
      }

      setHasMore(transformedActivities.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchActivities(page + 1, false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivities(0, true);
    }
  }, [user, filters]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for new activities
    const channel = supabase
      .channel("activities-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchActivities(0, true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    activities,
    loading,
    hasMore,
    loadMore,
    filters,
    setFilters,
    refetch: () => fetchActivities(0, true),
  };
};
import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ActivityFiltersProps {
  filters: {
    user: string;
    actionType: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

const ACTION_TYPES = [
  { value: "deploy", label: "Deploy" },
  { value: "rollback", label: "Rollback" },
  { value: "domain_verify", label: "Domain Verify" },
  { value: "api_key_generated", label: "API Key Generated" },
  { value: "project_created", label: "Project Created" },
  { value: "project_updated", label: "Project Updated" },
  { value: "credential_added", label: "Credential Added" },
  { value: "credential_updated", label: "Credential Updated" },
  { value: "settings_changed", label: "Settings Changed" },
];

export const ActivityFilters = ({ filters, onFiltersChange }: ActivityFiltersProps) => {
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .not('first_name', 'is', null)
        .not('last_name', 'is', null);

      if (error) throw error;

      const userList = data.map(profile => ({
        id: profile.user_id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || ''
      }));

      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      user: "all",
      actionType: "all",
      search: ""
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="p-6 bg-glass/60 backdrop-blur-xl border-glass-border">
      <div className="space-y-4">
        {/* Top row with search and filter toggle */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search projects, commits, domains..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 bg-glass/40 border-glass-border focus:border-primary/50"
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-glass/40 border-glass-border hover:bg-glass/60"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-glass-border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">User</label>
              <Select value={filters.user} onValueChange={(value) => updateFilter('user', value)}>
                <SelectTrigger className="bg-glass/40 border-glass-border">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Action Type</label>
              <Select value={filters.actionType} onValueChange={(value) => updateFilter('actionType', value)}>
                <SelectTrigger className="bg-glass/40 border-glass-border">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {ACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
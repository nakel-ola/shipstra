import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/use-notifications";

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
      });
    }
  };

  const getUserInitials = (email: string) => {
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user.email?.split("@")[0] || "User";
  };

  return (
    <motion.header
      className="h-16 border-b border-glass-border backdrop-blur-xl bg-glass/60 flex items-center justify-between px-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="p-2 hover:bg-glass/50 rounded-lg transition-colors" />
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, deployments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-80 bg-glass/50 border-glass-border focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all duration-300"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-glass/50 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
          >
            {unreadCount}
          </Badge>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 hover:bg-glass/50 transition-colors px-3 py-2 h-auto"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-foreground">
                  {getUserDisplayName()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={getUserDisplayName()}
                />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                  {getUserInitials(user.email || "")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            align="end"
            className="w-56 backdrop-blur-xl bg-glass/95 border-glass-border"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-glass-border" />
            
            <DropdownMenuItem className="cursor-pointer hover:bg-glass/50">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            
            <DropdownMenuItem className="cursor-pointer hover:bg-glass/50">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-glass-border" />
            
            <DropdownMenuItem
              className="cursor-pointer hover:bg-destructive/10 text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};
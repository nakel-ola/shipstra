import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  Key,
  Users,
  Activity,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar as BaseSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navigationItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Deployments",
    url: "/dashboard/deployments",
    icon: Zap,
  },
  {
    title: "Team",
    url: "/dashboard/teams",
    icon: Users,
  },
  {
    title: "Activity",
    url: "/dashboard/activity",
    icon: Activity,
  },
];

const settingsItems = [
  {
    title: "SSH Credentials",
    url: "/dashboard/settings/credentials",
    icon: Key,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export const Sidebar = () => {
  const { state } = useSidebar();
  const currentPath = usePathname();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const baseClasses =
      "w-full justify-start transition-all duration-200 group relative overflow-hidden";
    if (isActive(path)) {
      return `${baseClasses} bg-gradient-to-r from-primary/10 to-transparent text-primary border-r-2 border-primary shadow-glow`;
    }
    return `${baseClasses} hover:bg-glass/50 hover:text-foreground text-muted-foreground`;
  };

  const NavItem = ({ item, path }: { item: any; path: string }) => {
    const content = (
      <SidebarMenuButton asChild className="p-0">
        <Link
          href={item.url}
          // end={item.url === "/dashboard"}
          className={getNavClassName(path)}
        >
          <motion.div
            className={`flex items-center gap-3 px-3 py-2 w-full ${
              collapsed ? "justify-center" : ""
            }`}
            whileHover={{ x: collapsed ? 0 : 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="font-medium">{item.title}</span>}
          </motion.div>
        </Link>
      </SidebarMenuButton>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <BaseSidebar
        className="border-r border-glass-border backdrop-blur-xl bg-glass/60"
        collapsible="icon"
      >
        <SidebarContent className="p-4">
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-2 py-4 mb-4 ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <motion.div
              className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Zap className="w-4 h-4 text-primary-foreground" />
            </motion.div>
            {!collapsed && (
              <motion.span
                className="text-lg font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                DeployVPS
              </motion.span>
            )}
          </div>

          {/* Navigation */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
                Navigation
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavItem item={item} path={item.url} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Settings */}
          <SidebarGroup className="mt-6">
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
                Settings
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavItem item={item} path={item.url} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Theme Toggle */}
          <div className="mt-auto pt-4 border-t border-glass-border">
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "justify-between px-3"
              } py-2`}
            >
              {!collapsed && (
                <span className="text-xs font-medium text-muted-foreground">
                  Theme
                </span>
              )}
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ThemeToggle />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    Toggle theme
                  </TooltipContent>
                </Tooltip>
              ) : (
                <ThemeToggle />
              )}
            </div>
          </div>
        </SidebarContent>
      </BaseSidebar>
    </TooltipProvider>
  );
};

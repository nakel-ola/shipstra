import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./features";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Animated background elements */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col relative z-10">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  );
};

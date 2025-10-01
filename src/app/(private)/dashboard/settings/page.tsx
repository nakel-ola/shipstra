"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2, Shield, ChevronRight } from "lucide-react";
import { ProfileTab, OrganizationTab, SecurityTab } from "./features";

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your personal information and preferences",
    },
    {
      id: "organization",
      label: "Organization",
      icon: Building2,
      description: "Manage your organization and team settings",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Configure security settings and authentication",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-glass-border bg-glass/30 backdrop-blur-sm">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">Settings</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Account Settings
                </h1>
                <p className="text-muted-foreground">
                  Manage your profile, organization, and security preferences
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tab Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <motion.div
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                          : "bg-glass/40 hover:bg-glass/60 border-glass-border hover:border-primary/20 hover:shadow-glass"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isActive ? "bg-primary/20" : "bg-muted/50"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${
                                isActive ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {tab.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {tab.description}
                            </p>
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              <TabsContent value="profile" className="m-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ProfileTab />
                </motion.div>
              </TabsContent>

              <TabsContent value="organization" className="m-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <OrganizationTab />
                </motion.div>
              </TabsContent>

              <TabsContent value="security" className="m-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <SecurityTab />
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

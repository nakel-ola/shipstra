"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Key,
  Server,
  Edit2,
  Trash2,
  Shield,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddCredentialModal, ConfirmDeleteModal } from "./features";
import {
  useSSHCredentials,
  SSHCredential,
  SSHCredentialInput,
} from "@/hooks/use-SSH-credentials";
import { useAuth } from "@/hooks/useAuth";

export default function SSHCredentials() {
  const { user } = useAuth();
  const {
    credentials,
    globalCredential,
    loading,
    createCredential,
    updateCredential,
    deleteCredential,
  } = useSSHCredentials();

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<"global" | "project">("global");
  const [editingCredential, setEditingCredential] =
    useState<SSHCredential | null>(null);
  const [deletingCredential, setDeletingCredential] =
    useState<SSHCredential | null>(null);

  const handleAddCredential = (type: "global" | "project") => {
    setModalType(type);
    setEditingCredential(null);
    setShowAddModal(true);
  };

  const handleEditCredential = (credential: SSHCredential) => {
    setEditingCredential(credential);
    setModalType(credential.type);
    setShowAddModal(true);
  };

  const handleDeleteCredential = (credential: SSHCredential) => {
    setDeletingCredential(credential);
  };

  const confirmDelete = async () => {
    if (deletingCredential) {
      const success = await deleteCredential(deletingCredential.id);
      if (success) {
        setDeletingCredential(null);
      }
    }
  };

  const handleSaveCredential = async (data: SSHCredentialInput) => {
    let success = false;

    if (editingCredential) {
      success = await updateCredential(editingCredential.id, data);
    } else {
      success = await createCredential(data);
    }

    if (success) {
      setShowAddModal(false);
      setEditingCredential(null);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              Please sign in to manage SSH credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading SSH credentials...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
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
                <span>Settings</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">SSH Credentials</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Key className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    SSH Credentials
                  </h1>
                  <p className="text-muted-foreground">
                    Global credentials are required before creating projects.
                    You may also add project-specific overrides.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Global Credential Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Global Credential
                </h2>
                <p className="text-muted-foreground">
                  Default SSH credentials used for all projects unless
                  overridden.
                </p>
              </div>

              {globalCredential ? (
                <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass hover:shadow-glow transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Global SSH Credential
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCredential(globalCredential)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                          Replace
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteCredential(globalCredential)
                          }
                          className="hover:bg-destructive/10 hover:text-destructive"
                          disabled
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Host
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {globalCredential.host}:{globalCredential.port}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Username
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-sm">
                            {globalCredential.username}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          {globalCredential.authMethod === "privateKey"
                            ? "Private Key"
                            : "Password"}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Key className="h-3 w-3" />
                          <span className="text-xs font-mono">••••••••</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Added{" "}
                        {new Date(
                          globalCredential.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass hover:shadow-glow transition-all duration-300 border-2 border-dashed border-primary/30">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-primary/10 flex items-center justify-center mb-4">
                      <AlertTriangle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Global Credential
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Add a global SSH credential to enable project deployments.
                      This credential will be used by default for all projects.
                    </p>
                    <Button
                      onClick={() => handleAddCredential("global")}
                      size="lg"
                      className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Global Credential
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.section>

            {/* Project Credentials Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Project Credentials
                  </h2>
                  <p className="text-muted-foreground">
                    Project-specific SSH credentials that override the global
                    credential.
                  </p>
                </div>
                <Button
                  onClick={() => handleAddCredential("project")}
                  className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project Credential
                </Button>
              </div>

              {credentials.length > 0 ? (
                <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-glass-border hover:bg-muted/5">
                        <TableHead>Project</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Auth Method</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {credentials.map((credential, index) => (
                        <motion.tr
                          key={credential.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="border-glass-border hover:bg-muted/5 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {credential.projectName}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {credential.host}:{credential.port}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {credential.username}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="bg-accent/10 text-accent border-accent/20"
                            >
                              {credential.authMethod === "privateKey"
                                ? "Private Key"
                                : "Password"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(
                              credential.createdAt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCredential(credential)}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCredential(credential)
                                }
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass border-2 border-dashed border-accent/30">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-accent/10 flex items-center justify-center mb-4">
                      <Server className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Project Credentials
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Project-specific credentials allow you to use different
                      SSH access for individual projects.
                    </p>
                    <Button
                      onClick={() => handleAddCredential("project")}
                      variant="outline"
                      className="border-accent/30 hover:bg-accent/10 hover:text-accent hover:border-accent/50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project Credential
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.section>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCredentialModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        type={modalType}
        credential={editingCredential!}
        onSave={handleSaveCredential}
      />

      <ConfirmDeleteModal
        open={!!deletingCredential}
        onOpenChange={() => setDeletingCredential(null)}
        credential={deletingCredential}
        onConfirm={confirmDelete}
      />
    </>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Trash2,
  Shield,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddDomainModal, ConfirmDeleteModal } from "./features";
import { useToast } from "@/hooks/use-toast";

interface Domain {
  id: string;
  hostname: string;
  status: "pending" | "verified" | "failed" | "expired";
  httpsEnabled: boolean;
  createdAt: string;
  verifiedAt?: string;
  isPrimary: boolean;
}

// Mock data
const mockDomains: Domain[] = [
  {
    id: "1",
    hostname: "myawesomeapp.com",
    status: "verified",
    httpsEnabled: true,
    createdAt: "2024-01-15",
    verifiedAt: "2024-01-15",
    isPrimary: true,
  },
  {
    id: "2",
    hostname: "staging.myawesomeapp.com",
    status: "pending",
    httpsEnabled: false,
    createdAt: "2024-01-20",
    isPrimary: false,
  },
  {
    id: "3",
    hostname: "beta.myawesomeapp.com",
    status: "failed",
    httpsEnabled: false,
    createdAt: "2024-01-18",
    isPrimary: false,
  },
];

export default function DomainsTLS() {
  const [domains, setDomains] = useState(mockDomains);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null);
  const { toast } = useToast();

  const handleToggleHttps = (domainId: string) => {
    setDomains((prev) =>
      prev.map((domain) =>
        domain.id === domainId
          ? { ...domain, httpsEnabled: !domain.httpsEnabled }
          : domain
      )
    );

    const domain = domains.find((d) => d.id === domainId);
    toast({
      title: `HTTPS ${domain?.httpsEnabled ? "disabled" : "enabled"}`,
      description: `HTTPS has been ${
        domain?.httpsEnabled ? "disabled" : "enabled"
      } for ${domain?.hostname}`,
    });
  };

  const handleAddDomain = (hostname: string) => {
    const newDomain: Domain = {
      id: Date.now().toString(),
      hostname,
      status: "pending",
      httpsEnabled: false,
      createdAt: new Date().toISOString().split("T")[0],
      isPrimary: false,
    };

    setDomains((prev) => [...prev, newDomain]);
    setShowAddModal(false);

    toast({
      title: "Domain added",
      description: `${hostname} has been added and is being verified`,
    });

    // Simulate verification process
    setTimeout(() => {
      setDomains((prev) =>
        prev.map((domain) =>
          domain.id === newDomain.id
            ? {
                ...domain,
                status: Math.random() > 0.3 ? "verified" : ("failed" as const),
              }
            : domain
        )
      );
    }, 3000);
  };

  const handleDeleteDomain = (domain: Domain) => {
    setDeletingDomain(domain);
  };

  const confirmDelete = () => {
    if (deletingDomain) {
      setDomains((prev) => prev.filter((d) => d.id !== deletingDomain.id));
      toast({
        title: "Domain removed",
        description: `${deletingDomain.hostname} has been removed successfully`,
      });
      setDeletingDomain(null);
    }
  };

  const handleCopyDNSInfo = () => {
    const dnsInfo = `A Record: @ -> 185.158.133.1\nA Record: www -> 185.158.133.1`;
    navigator.clipboard.writeText(dnsInfo);
    toast({
      title: "DNS info copied",
      description: "DNS configuration has been copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
        return "secondary";
      case "expired":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case "verified":
        return "shadow-[0_0_20px_hsl(var(--success)/0.3)]";
      case "failed":
        return "shadow-[0_0_20px_hsl(var(--destructive)/0.3)]";
      case "pending":
        return "shadow-[0_0_20px_hsl(var(--warning)/0.3)] animate-pulse";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2"
          >
            Domains & TLS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Attach custom domains and enable HTTPS for your applications
          </motion.p>
        </div>

        {/* DNS Configuration Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" />
                DNS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 rounded-lg p-4 border border-muted/30">
                <p className="text-sm text-muted-foreground mb-3">
                  To connect your domain, add these DNS records at your
                  registrar:
                </p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center justify-between bg-background/50 rounded px-3 py-2">
                    <span>A Record: @ → 185.158.133.1</span>
                  </div>
                  <div className="flex items-center justify-between bg-background/50 rounded px-3 py-2">
                    <span>A Record: www → 185.158.133.1</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDNSInfo}
                  className="mt-3 border-glass-border hover:bg-muted/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy DNS Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Domains Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-glass/60 backdrop-blur-sm border-glass-border shadow-glass">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Custom Domains
                </CardTitle>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {domains.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-glass-border hover:bg-muted/5">
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>HTTPS</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains.map((domain, index) => (
                      <motion.tr
                        key={domain.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="border-glass-border hover:bg-muted/5 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {domain.hostname}
                                </span>
                                {domain.isPrimary && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-primary/10 text-primary"
                                  >
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              {domain.status === "verified" && (
                                <a
                                  href={`https://${domain.hostname}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Visit site
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <motion.div
                            animate={{
                              scale:
                                domain.status === "pending" ? [1, 1.05, 1] : 1,
                            }}
                            transition={{
                              duration: 1.5,
                              repeat:
                                domain.status === "pending" ? Infinity : 0,
                            }}
                          >
                            <Badge
                              variant={getStatusVariant(domain.status)}
                              className={`flex items-center gap-1 ${getStatusGlow(
                                domain.status
                              )}`}
                            >
                              {getStatusIcon(domain.status)}
                              {domain.status}
                            </Badge>
                          </motion.div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Switch
                                checked={domain.httpsEnabled}
                                onCheckedChange={() =>
                                  handleToggleHttps(domain.id)
                                }
                                disabled={domain.status !== "verified"}
                                className={`${
                                  domain.httpsEnabled &&
                                  domain.status === "verified"
                                    ? "shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                                    : ""
                                } transition-all duration-300`}
                              />
                            </motion.div>
                            {domain.httpsEnabled &&
                              domain.status === "verified" && (
                                <Shield className="h-4 w-4 text-success" />
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(domain.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {domain.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Simulate retry verification
                                  toast({
                                    title: "Verifying domain",
                                    description:
                                      "Domain verification has been retried",
                                  });
                                }}
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                Retry
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDomain(domain)}
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
              ) : (
                <div className="py-16 px-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      No domains configured
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Add your first custom domain to make your application
                      accessible from your own URL
                    </p>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      size="lg"
                      className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Your First Domain
                    </Button>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      <AddDomainModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddDomain={handleAddDomain}
      />

      <ConfirmDeleteModal
        open={!!deletingDomain}
        onOpenChange={() => setDeletingDomain(null)}
        domain={deletingDomain}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

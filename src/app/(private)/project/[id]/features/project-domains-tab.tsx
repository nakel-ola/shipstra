import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Plus, ExternalLink, Shield, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/hooks/use-projects";
import { Deployment } from "@/hooks/use-project-detail";

interface ProjectDomainsTabProps {
  project: Project;
  deployments?: Deployment[];
  deploymentsLoading?: boolean;
  onCreateDeployment?: () => Promise<Deployment | null>;
  onUpdateProject?: (updates: Partial<Project>) => Promise<boolean>;
}

export const ProjectDomainsTab = ({  }: ProjectDomainsTabProps) => {
  const { toast } = useToast();
  const [domains, setDomains] = useState([
    {
      id: "domain_1",
      domain: "myapp.com",
      status: "active",
      httpsEnabled: true,
      isPrimary: true,
      added: "2024-01-15T10:30:00Z",
    },
    {
      id: "domain_2",
      domain: "www.myapp.com",
      status: "active",
      httpsEnabled: true,
      isPrimary: false,
      added: "2024-01-15T10:35:00Z",
    },
    {
      id: "domain_3",
      domain: "staging.myapp.com",
      status: "pending",
      httpsEnabled: false,
      isPrimary: false,
      added: "2024-01-20T14:22:00Z",
    },
  ]);

  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addDomain = async () => {
    if (!newDomain.trim()) return;

    setIsAdding(true);

    // Simulate domain addition
    setTimeout(() => {
      const domain = {
        id: `domain_${Date.now()}`,
        domain: newDomain,
        status: "pending",
        httpsEnabled: false,
        isPrimary: false,
        added: new Date().toISOString(),
      };

      setDomains([...domains, domain]);
      setNewDomain("");
      setIsAdding(false);

      toast({
        title: "Domain Added",
        description: `${newDomain} has been added and is now being verified.`,
      });
    }, 2000);
  };

  const toggleHttps = (domainId: string) => {
    setDomains(
      domains.map((domain) =>
        domain.id === domainId
          ? { ...domain, httpsEnabled: !domain.httpsEnabled }
          : domain
      )
    );

    toast({
      title: "HTTPS Settings Updated",
      description: "HTTPS configuration has been updated for this domain.",
    });
  };

  const deleteDomain = (domainId: string) => {
    setDomains(domains.filter((domain) => domain.id !== domainId));
    toast({
      title: "Domain Removed",
      description: "The domain has been removed from your project.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shadow-glow-green">
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
            Pending
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 shadow-glow-red">
            Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Domains Table */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Domains
              </CardTitle>
              <CardDescription>
                Manage custom domains for your project
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle>Add Custom Domain</DialogTitle>
                  <DialogDescription>
                    Add a custom domain to your project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain Name</Label>
                    <Input
                      id="domain"
                      placeholder="example.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      className="glass-card"
                    />
                    <p className="text-xs text-muted-foreground">
                      You&apos;ll need to update your DNS settings after adding the
                      domain
                    </p>
                  </div>
                  <Button
                    onClick={addDomain}
                    disabled={isAdding || !newDomain.trim()}
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    {isAdding ? "Adding Domain..." : "Add Domain"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-white/5 border-white/10">
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>HTTPS</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain, index) => (
                  <motion.tr
                    key={domain.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-white/5 border-white/10 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.domain}</span>
                        {domain.isPrimary && (
                          <Badge variant="outline" className="text-xs">
                            Primary
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(`https://${domain.domain}`, "_blank")
                          }
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(domain.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={domain.httpsEnabled}
                          onCheckedChange={() => toggleHttps(domain.id)}
                          disabled={domain.status !== "active"}
                          className="data-[state=checked]:bg-gradient-primary"
                        />
                        {domain.httpsEnabled && (
                          <Shield className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(domain.added).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDomain(domain.id)}
                        disabled={domain.isPrimary}
                        className="glass-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DNS Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>DNS Configuration</CardTitle>
          <CardDescription>
            Configure your DNS settings to point to our servers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Label className="text-base">A Record</Label>
              <div className="p-3 bg-muted/50 rounded-lg border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-mono">76.76.19.123</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText("76.76.19.123");
                      toast({ title: "Copied to clipboard" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base">CNAME Record</Label>
              <div className="p-3 bg-muted/50 rounded-lg border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-mono">cname.vercel-dns.com</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText("cname.vercel-dns.com");
                      toast({ title: "Copied to clipboard" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Add these DNS records at your domain registrar to point your domain
            to our servers. Changes may take up to 24 hours to propagate.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

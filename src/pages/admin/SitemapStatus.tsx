import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, ExternalLink, RefreshCw } from "lucide-react";

const SitemapStatus = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalPages: 0,
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const { count: total } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      const { count: active } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const totalPages = Math.ceil((active || 0) / 50000);

      setStats({
        totalCompanies: total || 0,
        activeCompanies: active || 0,
        totalPages,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast({
        title: "Error",
        description: "Failed to load sitemap statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const sitemapLinks = [
    { label: 'Main Sitemap Index', url: '/sitemap.xml' },
    { label: 'Static Pages', url: '/sitemap-static.xml' },
  ];

  // Add company sitemap links
  for (let i = 1; i <= stats.totalPages; i++) {
    sitemapLinks.push({
      label: `Companies ${(i - 1) * 50000 + 1} - ${Math.min(i * 50000, stats.activeCompanies)}`,
      url: `/sitemap-companies-${i}.xml`,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sitemap Status</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your generated sitemaps
          </p>
        </div>
        <Button onClick={loadStats} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCompanies.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sitemap Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPages + 2}</div>
            <p className="text-xs text-muted-foreground mt-1">
              1 index + 1 static + {stats.totalPages} company pages
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sitemap Files
          </CardTitle>
          <CardDescription>
            View all generated sitemap files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sitemapLinks.map((link) => (
              <div
                key={link.url}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{link.label}</span>
                  {link.url === '/sitemap.xml' && (
                    <Badge variant="secondary">Main Index</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SitemapStatus;
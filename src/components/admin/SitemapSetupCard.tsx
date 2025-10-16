import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const SitemapSetupCard = () => {
  const [companiesCount, setCompaniesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompaniesCount();
  }, []);

  const loadCompaniesCount = async () => {
    try {
      const { count } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      setCompaniesCount(count || 0);
    } catch (error) {
      console.error('Failed to load companies count:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Database Setup",
      description: "Companies table created",
      completed: true,
      path: null,
    },
    {
      title: "Sync Companies",
      description: `${companiesCount?.toLocaleString() || 0} companies in database`,
      completed: (companiesCount || 0) > 0,
      path: "/admin/sync",
      action: "Sync Now",
    },
    {
      title: "View Sitemaps",
      description: "Monitor sitemap generation",
      completed: (companiesCount || 0) > 0,
      path: "/admin/sitemaps",
      action: "View Status",
    },
    {
      title: "Submit to Google",
      description: "Submit sitemap to Google Search Console",
      completed: false,
      path: null,
      external: "https://search.google.com/search-console",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          SEO Sitemap Setup
        </CardTitle>
        <CardDescription>
          Set up dynamic sitemaps for 100,000+ Danish companies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!loading && companiesCount === 0 && (
          <Alert>
            <AlertDescription>
              <strong>Next Step:</strong> Sync company data from Danish Business Authority to populate your sitemaps.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step.completed && (
                  <Badge variant="secondary">Complete</Badge>
                )}
                {step.action && step.path && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={step.path} className="gap-2">
                      {step.action}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
                {step.external && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={step.external}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      Open
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm">How it works:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Fetches all active Danish companies via API</li>
            <li>Generates sitemap index with 50,000 URLs per file</li>
            <li>Automatically updates when companies change</li>
            <li>SEO-optimized with priority, changefreq, and lastmod</li>
            <li>Accessible at <code className="text-xs">/sitemap.xml</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
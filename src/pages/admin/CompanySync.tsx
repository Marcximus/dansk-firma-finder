import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

const CompanySync = () => {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    synced: 0,
    batchSize: 1000,
  });

  const syncCompanies = async () => {
    setSyncing(true);
    setProgress(0);
    setStats({ total: 0, synced: 0, batchSize: 1000 });

    try {
      let offset = 0;
      let hasMore = true;
      let totalSynced = 0;

      while (hasMore) {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          throw new Error('Not authenticated');
        }

        const response = await supabase.functions.invoke('sync-companies', {
          body: { batchSize: 1000, offset },
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        });

        if (response.error) throw response.error;

        const result = response.data;
        totalSynced += result.synced;
        hasMore = result.hasMore;
        offset = result.nextOffset;

        setStats({
          total: result.total,
          synced: totalSynced,
          batchSize: 1000,
        });

        setProgress((totalSynced / result.total) * 100);

        // Add small delay to avoid overwhelming the API
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${totalSynced} companies`,
      });

    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync companies",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Database Sync</h1>
        <p className="text-muted-foreground mt-2">
          Sync company data from Danish Business Authority for sitemap generation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sync Companies
          </CardTitle>
          <CardDescription>
            Fetch and cache company data from the Danish Business Authority API to populate the sitemap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncing ? (
            <>
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Syncing companies... {stats.synced.toLocaleString()} of {stats.total.toLocaleString()}
                </AlertDescription>
              </Alert>
              <Progress value={progress} className="w-full" />
            </>
          ) : stats.synced > 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Last sync: {stats.synced.toLocaleString()} companies synced
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Click the button below to start syncing company data. This may take several minutes.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={syncCompanies} 
              disabled={syncing}
              className="gap-2"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Start Sync
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t space-y-2">
            <h4 className="font-semibold">How it works:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Fetches active companies from Danish Business Authority API</li>
              <li>Processes companies in batches of 1,000</li>
              <li>Stores CVR, name, status, and last modified date</li>
              <li>Updates existing companies (upsert operation)</li>
              <li>Powers the dynamic sitemap at /sitemap-companies-*.xml</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySync;
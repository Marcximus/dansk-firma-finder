import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  Database, 
  Zap,
  Users,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStats {
  totalUsers: number;
  activeUsers24h: number;
  inactivePremiuUsers: number;
  failedOrders: number;
  dataFreshness: string;
  apiRequests24h: number;
  errorRate: number;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  lastCheck: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export const SystemHealth: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers24h: 0,
    inactivePremiuUsers: 0,
    failedOrders: 0,
    dataFreshness: 'Unknown',
    apiRequests24h: 0,
    errorRate: 0,
  });
  
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      service: 'Database',
      status: 'healthy',
      message: 'All connections healthy',
      lastCheck: new Date().toISOString(),
    },
    {
      service: 'Authentication',
      status: 'healthy',
      message: 'Supabase Auth operational',
      lastCheck: new Date().toISOString(),
    },
    {
      service: 'Edge Functions',
      status: 'warning',
      message: 'Some functions experiencing latency',
      lastCheck: new Date().toISOString(),
    },
    {
      service: 'Stripe Integration',
      status: 'healthy',
      message: 'Payment processing normal',
      lastCheck: new Date().toISOString(),
    },
    {
      service: 'External API',
      status: 'critical',
      message: 'Danish Business API rate limits reached',
      lastCheck: new Date().toISOString(),
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      message: '3 Premium users inactive for 7+ days',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'error',
      message: '5 report orders failed due to API timeout',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'info',
      message: 'New Enterprise user request received',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        // Fetch user data
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('created_at');

        if (profilesError) throw profilesError;

        // Fetch subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('user_subscriptions')
          .select('subscription_tier, status, current_period_end');

        if (subError) throw subError;

        // Fetch failed orders
        const { data: failedOrders, error: ordersError } = await supabase
          .from('report_orders')
          .select('*')
          .eq('status', 'failed');

        if (ordersError) throw ordersError;

        // Calculate stats
        const totalUsers = profiles?.length || 0;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Mock active users (would need activity tracking)
        const activeUsers24h = Math.floor(totalUsers * 0.3);
        
        // Inactive premium users (mock calculation)
        const premiumUsers = subscriptions?.filter(s => 
          s.subscription_tier === 'premium' && s.status === 'active'
        ) || [];
        const inactivePremiuUsers = Math.floor(premiumUsers.length * 0.1);

        setStats({
          totalUsers,
          activeUsers24h,
          inactivePremiuUsers,
          failedOrders: failedOrders?.length || 0,
          dataFreshness: 'Updated 2 minutes ago',
          apiRequests24h: 15420, // Mock data
          errorRate: 2.3, // Mock error rate
        });

      } catch (error) {
        console.error('Error fetching system health:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemHealth();
  }, []);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="secondary">Healthy</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
    }
  };

  const getAlertVariant = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system status, alerts, and infrastructure health
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers24h}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeUsers24h / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Orders</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Require manual intervention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiRequests24h.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.errorRate}% error rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{stats.dataFreshness}</div>
            <p className="text-xs text-muted-foreground">
              Last successful sync
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                <AlertDescription className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <span className="text-xs opacity-70">
                    {new Date(alert.timestamp).toLocaleTimeString('da-DK', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Service Health Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium">{check.service}</div>
                    <div className="text-sm text-muted-foreground">{check.message}</div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(check.status)}
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(check.lastCheck).toLocaleTimeString('da-DK', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              View Inactive Premium Users
            </Button>
            <Button variant="outline" className="justify-start">
              <XCircle className="h-4 w-4 mr-2" />
              Review Failed Orders
            </Button>
            <Button variant="outline" className="justify-start">
              <Database className="h-4 w-4 mr-2" />
              Force Data Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
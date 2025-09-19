import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  Database, 
  Zap,
  Users,
  RefreshCw,
  TrendingUp,
  DollarSign,
  FileText,
  Building2,
  AlertCircle,
  Eye
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
  enterpriseRequests: number;
  highActivityAlerts: number;
}

interface FailedOrder {
  id: string;
  company_name: string;
  amount_cents: number;
  created_at: string;
  failure_reason: string;
}

interface InactiveUser {
  id: string;
  full_name: string;
  email: string;
  subscription_tier: string;
  last_login: string;
  days_inactive: number;
}

interface EnterpriseRequest {
  id: string;
  company_name: string;
  contact_email: string;
  requested_features: string;
  submitted_at: string;
  status: 'pending' | 'contacted' | 'converted';
}

interface HighActivityAlert {
  id: string;
  company_name: string;
  company_cvr: string;
  update_count: number;
  alert_type: string;
  detected_at: string;
}

interface ErrorLog {
  id: string;
  service: string;
  error_type: string;
  message: string;
  occurred_at: string;
  severity: 'low' | 'medium' | 'high';
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  lastCheck: string;
  uptime: number;
  responseTime: number;
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
    enterpriseRequests: 0,
    highActivityAlerts: 0,
  });

  const [failedOrders, setFailedOrders] = useState<FailedOrder[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([]);
  const [enterpriseRequests, setEnterpriseRequests] = useState<EnterpriseRequest[]>([]);
  const [highActivityAlerts, setHighActivityAlerts] = useState<HighActivityAlert[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'failed-orders' | 'inactive-users' | 'enterprise' | 'alerts' | 'errors'>('overview');
  
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      service: 'Database',
      status: 'healthy',
      message: 'All connections healthy',
      lastCheck: new Date().toISOString(),
      uptime: 99.9,
      responseTime: 45,
    },
    {
      service: 'Authentication',
      status: 'healthy',
      message: 'Supabase Auth operational',
      lastCheck: new Date().toISOString(),
      uptime: 99.8,
      responseTime: 120,
    },
    {
      service: 'Edge Functions',
      status: 'warning',
      message: 'Some functions experiencing latency',
      lastCheck: new Date().toISOString(),
      uptime: 98.5,
      responseTime: 850,
    },
    {
      service: 'Stripe Integration',
      status: 'healthy',
      message: 'Payment processing normal',
      lastCheck: new Date().toISOString(),
      uptime: 99.7,
      responseTime: 200,
    },
    {
      service: 'External API',
      status: 'critical',
      message: 'Danish Business API rate limits reached',
      lastCheck: new Date().toISOString(),
      uptime: 85.2,
      responseTime: 2500,
    },
    {
      service: 'Data Sync',
      status: 'healthy',
      message: 'Last sync completed successfully',
      lastCheck: new Date().toISOString(),
      uptime: 99.1,
      responseTime: 1200,
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
    {
      id: '4',
      type: 'warning',
      message: 'Danske Bank A/S showing 15+ updates in last 24h',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'error',
      message: 'Data sync failed for CVR API - last successful sync 3 hours ago',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        // Fetch user data
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) throw profilesError;

        // Fetch subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*');

        if (subError) throw subError;

        // Fetch failed orders
        const { data: failedOrdersData, error: ordersError } = await supabase
          .from('report_orders')
          .select('*')
          .eq('status', 'failed')
          .order('created_at', { ascending: false })
          .limit(10);

        if (ordersError) throw ordersError;

        // Calculate stats
        const totalUsers = profiles?.length || 0;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Mock active users (would need activity tracking)
        const activeUsers24h = Math.floor(totalUsers * 0.3);
        
        // Inactive premium users calculation
        const premiumUsers = subscriptions?.filter(s => 
          (s.subscription_tier === 'premium' || s.subscription_tier === 'enterprise') && 
          s.status === 'active'
        ) || [];
        const inactivePremiuUsers = Math.floor(premiumUsers.length * 0.15);

        // Mock data for other metrics
        const enterpriseRequests = 3;
        const highActivityAlerts = 8;

        // Set failed orders
        const processedFailedOrders: FailedOrder[] = failedOrdersData?.map(order => ({
          id: order.id,
          company_name: order.company_name,
          amount_cents: order.amount_cents,
          created_at: order.created_at,
          failure_reason: 'API timeout - CVR service unavailable'
        })) || [];

        // Mock inactive users
        const mockInactiveUsers: InactiveUser[] = [
          {
            id: '1',
            full_name: 'Lars Hansen',
            email: 'lars@company.dk',
            subscription_tier: 'premium',
            last_login: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            days_inactive: 10
          },
          {
            id: '2',
            full_name: 'Maria Petersen',
            email: 'maria@business.dk',
            subscription_tier: 'enterprise',
            last_login: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            days_inactive: 15
          }
        ];

        // Mock enterprise requests
        const mockEnterpriseRequests: EnterpriseRequest[] = [
          {
            id: '1',
            company_name: 'TechCorp A/S',
            contact_email: 'cto@techcorp.dk',
            requested_features: 'Custom API integration, Bulk export',
            submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
          },
          {
            id: '2',
            company_name: 'DataSolutions ApS',
            contact_email: 'admin@datasolutions.dk',
            requested_features: 'White-label solution, Advanced analytics',
            submitted_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            status: 'contacted'
          }
        ];

        // Mock high activity alerts
        const mockHighActivityAlerts: HighActivityAlert[] = [
          {
            id: '1',
            company_name: 'Danske Bank A/S',
            company_cvr: '61126228',
            update_count: 15,
            alert_type: 'Management changes',
            detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            company_name: 'Novo Nordisk A/S',
            company_cvr: '24256790',
            update_count: 12,
            alert_type: 'Financial filings',
            detected_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ];

        // Mock error logs
        const mockErrorLogs: ErrorLog[] = [
          {
            id: '1',
            service: 'CVR API',
            error_type: 'Timeout',
            message: 'Request timeout after 30 seconds',
            occurred_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            severity: 'high'
          },
          {
            id: '2',
            service: 'Stripe Webhook',
            error_type: 'Validation Error',
            message: 'Invalid signature in webhook payload',
            occurred_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            severity: 'medium'
          }
        ];

        setStats({
          totalUsers,
          activeUsers24h,
          inactivePremiuUsers,
          failedOrders: failedOrdersData?.length || 0,
          dataFreshness: 'Updated 2 minutes ago',
          apiRequests24h: 15420,
          errorRate: 2.3,
          enterpriseRequests,
          highActivityAlerts,
        });

        setFailedOrders(processedFailedOrders);
        setInactiveUsers(mockInactiveUsers);
        setEnterpriseRequests(mockEnterpriseRequests);
        setHighActivityAlerts(mockHighActivityAlerts);
        setErrorLogs(mockErrorLogs);

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

  const getSeverityBadge = (severity: ErrorLog['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'failed-orders':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Failed Report Orders ({failedOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Failed At</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.company_name}</TableCell>
                      <TableCell>{(order.amount_cents / 100).toFixed(2)} DKK</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('da-DK', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-red-600">{order.failure_reason}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Retry
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case 'inactive-users':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-yellow-500" />
                Inactive Premium/Enterprise Users ({inactiveUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Days Inactive</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.subscription_tier === 'enterprise' ? 'default' : 'secondary'}>
                          {user.subscription_tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.last_login).toLocaleDateString('da-DK')}
                      </TableCell>
                      <TableCell className="text-red-600">{user.days_inactive} days</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Send Reminder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case 'enterprise':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Enterprise User Requests ({enterpriseRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Requested Features</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enterpriseRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.company_name}</TableCell>
                      <TableCell>{request.contact_email}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.requested_features}</TableCell>
                      <TableCell>
                        {new Date(request.submitted_at).toLocaleDateString('da-DK')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'pending' ? 'outline' :
                          request.status === 'contacted' ? 'secondary' : 'default'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case 'alerts':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                High Activity Alerts ({highActivityAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>CVR</TableHead>
                    <TableHead>Update Count</TableHead>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Detected At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highActivityAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.company_name}</TableCell>
                      <TableCell>{alert.company_cvr}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          {alert.update_count} updates
                        </Badge>
                      </TableCell>
                      <TableCell>{alert.alert_type}</TableCell>
                      <TableCell>
                        {new Date(alert.detected_at).toLocaleDateString('da-DK', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case 'errors':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Error Logs & System Issues ({errorLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Error Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Occurred At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.service}</TableCell>
                      <TableCell>{log.error_type}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      <TableCell>
                        {new Date(log.occurred_at).toLocaleDateString('da-DK', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      default:
        return null;
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
          <h1 className="text-3xl font-bold tracking-tight">System Health & Alerts</h1>
          <p className="text-muted-foreground">
            Monitor system status, alerts, failed orders, and infrastructure health
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'failed-orders', label: 'Failed Orders', icon: XCircle, count: stats.failedOrders },
          { key: 'inactive-users', label: 'Inactive Users', icon: Users, count: stats.inactivePremiuUsers },
          { key: 'enterprise', label: 'Enterprise Requests', icon: Building2, count: stats.enterpriseRequests },
          { key: 'alerts', label: 'Activity Alerts', icon: TrendingUp, count: stats.highActivityAlerts },
          { key: 'errors', label: 'Error Logs', icon: AlertCircle, count: errorLogs.length }
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === key
                ? 'bg-background border-t border-l border-r border-border text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {count !== undefined && count > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failedOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Require manual intervention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Premium Users</CardTitle>
                <Users className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.inactivePremiuUsers}</div>
                <p className="text-xs text-muted-foreground">
                  7+ days inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enterprise Requests</CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.enterpriseRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Pending upsell opportunities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Activity Alerts</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.highActivityAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Companies with spikes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* API Usage & Cost Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  API Usage & Performance (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Requests</span>
                    <span className="text-2xl font-bold">{stats.apiRequests24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-lg font-semibold text-red-600">{stats.errorRate}%</span>
                  </div>
                  <Progress value={100 - stats.errorRate} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">CVR API:</span>
                      <span className="ml-2 font-medium">8,540 req</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stripe API:</span>
                      <span className="ml-2 font-medium">2,180 req</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Freshness Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Sync</span>
                    <span className="text-green-600 font-medium">{stats.dataFreshness}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CVR Registry</span>
                      <span className="text-green-600">✓ Synced</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Financial Reports</span>
                      <span className="text-green-600">✓ Synced</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Management Changes</span>
                      <span className="text-yellow-600">⚠ 15 min delay</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Force Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Tab Content */}
      {renderTabContent()}

      {activeTab === 'overview' && (
        <>
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
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
        </>
      )}

      {activeTab === 'overview' && (
        <>
          {/* Service Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Service Health & Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthChecks.map((check, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <div className="font-medium">{check.service}</div>
                          <div className="text-sm text-muted-foreground">{check.message}</div>
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className={`ml-2 font-medium ${check.uptime > 99 ? 'text-green-600' : check.uptime > 95 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {check.uptime}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response:</span>
                        <span className={`ml-2 font-medium ${check.responseTime < 500 ? 'text-green-600' : check.responseTime < 1000 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {check.responseTime}ms
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Progress 
                        value={check.uptime} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last check: {new Date(check.lastCheck).toLocaleTimeString('da-DK', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => setActiveTab('inactive-users')}
              >
                <Users className="h-4 w-4 mr-2" />
                View Inactive Users ({stats.inactivePremiuUsers})
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setActiveTab('failed-orders')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Review Failed Orders ({stats.failedOrders})
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setActiveTab('enterprise')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Enterprise Requests ({stats.enterpriseRequests})
              </Button>
              <Button variant="outline" className="justify-start">
                <Database className="h-4 w-4 mr-2" />
                Force Data Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
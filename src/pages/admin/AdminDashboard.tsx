import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, Building2, DollarSign, FileText, TrendingUp, AlertTriangle, 
  Activity, Clock, Target, Zap, ArrowUpRight, ArrowDownRight,
  Bell, Calendar, CreditCard, Globe, Percent, UserCheck, CheckCircle
} from 'lucide-react';
import { AdminMetricsCards } from '@/components/admin/AdminMetricsCards';
import { UserGrowthChart } from '@/components/admin/charts/UserGrowthChart';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { TopCompaniesChart } from '@/components/admin/charts/TopCompaniesChart';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  conversionRate: number;
  avgOrderValue: number;
  customerLifetime: number;
  churnRate: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'order_placed' | 'lead_converted' | 'subscription_created';
  description: string;
  timestamp: string;
  value?: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    customerLifetime: 0,
    churnRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user statistics
        const { data: profiles } = await supabase.from('profiles').select('*');
        const { data: subscriptions } = await supabase.from('user_subscriptions').select('*');
        const { data: orders } = await supabase.from('report_orders').select('*');
        const { data: leads } = await supabase.from('leads').select('*');
        const { data: activityLogs } = await supabase
          .from('user_activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        const totalUsers = profiles?.length || 0;
        const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
        const activeUsers = activeSubscriptions.length;
        
        // Calculate revenue
        const completedOrders = orders?.filter(o => o.status === 'completed') || [];
        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.amount_cents / 100), 0);
        const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        // Mock calculations for advanced metrics
        const monthlyGrowth = 12.5; // Mock growth rate
        const conversionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
        const customerLifetime = 24; // Mock LTV in months
        const churnRate = 3.2; // Mock churn rate

        setStats({
          totalUsers,
          activeUsers,
          totalRevenue,
          monthlyGrowth,
          conversionRate,
          avgOrderValue,
          customerLifetime,
          churnRate,
        });

        // Generate recent activity
        const activity: RecentActivity[] = [];
        
        // Add recent signups
        const recentProfiles = profiles?.slice(-5) || [];
        recentProfiles.forEach(profile => {
          activity.push({
            id: profile.id,
            type: 'user_signup',
            description: `New user ${profile.full_name || profile.email} signed up`,
            timestamp: profile.created_at,
          });
        });

        // Add recent orders
        const recentOrders = completedOrders.slice(-3);
        recentOrders.forEach(order => {
          activity.push({
            id: order.id,
            type: 'order_placed',
            description: `Order placed for ${order.company_name}`,
            timestamp: order.created_at,
            value: order.amount_cents / 100,
          });
        });

        // Add recent leads
        const convertedLeads = leads?.filter(l => l.status === 'converted').slice(-2) || [];
        convertedLeads.forEach(lead => {
          activity.push({
            id: lead.id,
            type: 'lead_converted',
            description: `Lead converted: ${lead.company || lead.name}`,
            timestamp: lead.conversion_date || lead.updated_at,
            value: lead.lead_value_dkk ? lead.lead_value_dkk / 100 : undefined,
          });
        });

        // Sort by timestamp
        activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activity.slice(0, 8));

        // Generate alerts
        const dashboardAlerts: Alert[] = [];
        
        if (churnRate > 5) {
          dashboardAlerts.push({
            id: 'churn-high',
            type: 'warning',
            title: 'High Churn Rate',
            description: `Churn rate is ${churnRate}%, consider retention strategies`,
            priority: 'high',
          });
        }

        if (conversionRate < 10) {
          dashboardAlerts.push({
            id: 'conversion-low',
            type: 'info',
            title: 'Conversion Opportunity',
            description: `Conversion rate is ${conversionRate.toFixed(1)}%, potential for improvement`,
            priority: 'medium',
          });
        }

        if (monthlyGrowth > 10) {
          dashboardAlerts.push({
            id: 'growth-good',
            type: 'success',
            title: 'Strong Growth',
            description: `Monthly growth at ${monthlyGrowth}% - excellent performance!`,
            priority: 'low',
          });
        }

        setAlerts(dashboardAlerts);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'order_placed': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'lead_converted': return <Target className="h-4 w-4 text-purple-600" />;
      case 'subscription_created': return <CheckCircle className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Overview</h1>
          <p className="text-muted-foreground">
            Real-time insights into your business performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            <Activity className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts ({alerts.length})
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 2).map((alert) => (
            <Alert key={alert.id} className={
              alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              alert.type === 'success' ? 'border-green-200 bg-green-50' :
              'border-blue-200 bg-blue-50'
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{stats.monthlyGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <div className="text-xs text-muted-foreground">
              {stats.totalUsers} total users
            </div>
            <Progress 
              value={(stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              Users to paid customers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue)}</div>
            <div className="flex items-center text-xs text-red-600">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -{stats.churnRate}% churn rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Business Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <AdminMetricsCards />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Growth (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserGrowthChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Top 10 Most Followed Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopCompaniesChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity Feed */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </span>
                          {activity.value && (
                            <Badge variant="secondary" className="text-xs">
                              {formatCurrency(activity.value)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's Signups</span>
                  <Badge variant="outline">+3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Orders Today</span>
                  <Badge variant="outline">+7</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Sessions</span>
                  <Badge variant="outline">24</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">System Load</span>
                  <Badge variant="outline" className="text-green-600">Low</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Lifetime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.customerLifetime} months</div>
                <Progress value={75} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Above industry average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <Progress value={99.9} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Uptime this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 hrs</div>
                <Progress value={85} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Average response time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, TrendingUp, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface ReportStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface ReportOrder {
  id: string;
  company_name: string;
  company_cvr: string;
  report_type: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface ReportTypeData {
  name: string;
  value: number;
  revenue: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const ReportsOrders: React.FC = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<ReportOrder[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        // Fetch all report orders
        const { data: reportOrders, error } = await supabase
          .from('report_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate stats
        const totalOrders = reportOrders?.length || 0;
        const completedOrders = reportOrders?.filter(order => order.status === 'completed').length || 0;
        const pendingOrders = reportOrders?.filter(order => order.status === 'pending').length || 0;
        const failedOrders = reportOrders?.filter(order => order.status === 'failed').length || 0;
        
        const totalRevenue = reportOrders
          ?.filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + (order.amount_cents / 100), 0) || 0;
        
        const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

        setStats({
          totalOrders,
          completedOrders,
          pendingOrders,
          failedOrders,
          totalRevenue,
          averageOrderValue,
        });

        // Set recent orders (last 10)
        setRecentOrders(reportOrders?.slice(0, 10) || []);

        // Calculate report type distribution
        const typeMap = new Map<string, { count: number; revenue: number }>();
        reportOrders?.forEach(order => {
          const type = order.report_type;
          const existing = typeMap.get(type) || { count: 0, revenue: 0 };
          typeMap.set(type, {
            count: existing.count + 1,
            revenue: existing.revenue + (order.status === 'completed' ? order.amount_cents / 100 : 0),
          });
        });

        const reportTypesData = Array.from(typeMap.entries()).map(([name, data]) => ({
          name,
          value: data.count,
          revenue: data.revenue,
        }));

        setReportTypes(reportTypesData);

      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Orders</h1>
        <p className="text-muted-foreground">
          Monitor report orders, revenue, and order fulfillment
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex gap-1 mt-2 text-xs text-muted-foreground">
              <span>{stats.completedOrders} completed</span>
              <span>•</span>
              <span>{stats.pendingOrders} pending</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per completed order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.failedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Report Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reportTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {reportTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{order.company_name}</h4>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      CVR: {order.company_cvr} • {order.report_type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('da-DK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(order.amount_cents / 100)}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Type Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Report Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportTypes.map((type, index) => (
              <div key={type.name} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{type.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(type.revenue)}</div>
                  <div className="text-sm text-muted-foreground">{type.value} orders</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
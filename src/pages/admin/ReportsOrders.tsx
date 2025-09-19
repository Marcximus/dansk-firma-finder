import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, TrendingUp, AlertCircle, Eye, Calendar, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, ComposedChart, PieChart, Pie, Cell } from 'recharts';

interface ReportStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersLast7Days: number;
  ordersLast30Days: number;
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

interface OrderTrendData {
  date: string;
  orders: number;
  revenue: number;
  avgValue: number;
}

interface HourlyData {
  hour: string;
  orders: number;
}

interface GeographicData {
  region: string;
  orders: number;
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
    ordersLast7Days: 0,
    ordersLast30Days: 0,
  });
  const [recentOrders, setRecentOrders] = useState<ReportOrder[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportTypeData[]>([]);
  const [orderTrends, setOrderTrends] = useState<OrderTrendData[]>([]);
  const [hourlyOrders, setHourlyOrders] = useState<HourlyData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
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

        // Calculate time-based metrics
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const ordersLast7Days = reportOrders?.filter(order => 
          new Date(order.created_at) >= sevenDaysAgo
        ).length || 0;
        
        const ordersLast30Days = reportOrders?.filter(order => 
          new Date(order.created_at) >= thirtyDaysAgo
        ).length || 0;

        setStats({
          totalOrders,
          completedOrders,
          pendingOrders,
          failedOrders,
          totalRevenue,
          averageOrderValue,
          ordersLast7Days,
          ordersLast30Days,
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

        // Generate order trends for the last 30 days
        const trendData: OrderTrendData[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('da-DK', { month: 'short', day: 'numeric' });
          
          const dayOrders = reportOrders?.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.toDateString() === date.toDateString();
          }) || [];
          
          const dayRevenue = dayOrders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + (order.amount_cents / 100), 0);
          
          trendData.push({
            date: dateStr,
            orders: dayOrders.length,
            revenue: dayRevenue,
            avgValue: dayOrders.length > 0 ? dayRevenue / dayOrders.length : 0,
          });
        }
        setOrderTrends(trendData);

        // Generate hourly order distribution (mock data)
        const hourlyData: HourlyData[] = [];
        for (let hour = 0; hour < 24; hour++) {
          hourlyData.push({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            orders: Math.floor(Math.random() * 20) + 1,
          });
        }
        setHourlyOrders(hourlyData);

        // Generate geographic data (mock)
        const geoData: GeographicData[] = [
          { region: 'Copenhagen', orders: Math.floor(totalOrders * 0.35), revenue: totalRevenue * 0.35 },
          { region: 'Aarhus', orders: Math.floor(totalOrders * 0.25), revenue: totalRevenue * 0.25 },
          { region: 'Odense', orders: Math.floor(totalOrders * 0.15), revenue: totalRevenue * 0.15 },
          { region: 'Aalborg', orders: Math.floor(totalOrders * 0.12), revenue: totalRevenue * 0.12 },
          { region: 'Other', orders: Math.floor(totalOrders * 0.13), revenue: totalRevenue * 0.13 },
        ];
        setGeographicData(geoData);

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
          Comprehensive analytics on report orders, revenue trends, and customer behavior
        </p>
      </div>

      {/* Enhanced Stats Overview */}
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
              From {stats.completedOrders} completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders (30d)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersLast30Days}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ordersLast7Days} in last 7 days
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
              {((stats.failedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Order Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={orderTrends}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'orders' ? `${value} orders` : formatCurrency(Number(value)),
                  name === 'orders' ? 'Orders' : name === 'revenue' ? 'Revenue' : 'Avg Value'
                ]}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="url(#revenueGradient)"
                name="revenue"
              />
              <Bar yAxisId="left" dataKey="orders" fill="hsl(var(--secondary))" name="orders" />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgValue" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="avgValue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Report Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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

        {/* Hourly Order Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hourly Order Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  interval={3}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Orders by Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {geographicData.map((region, index) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{region.region}</span>
                    <span>{region.orders} orders</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.max((region.orders / stats.totalOrders) * 100, 5)}%`
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(region.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
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

      {/* Report Type Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Report Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={reportTypes} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : `${value} orders`,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
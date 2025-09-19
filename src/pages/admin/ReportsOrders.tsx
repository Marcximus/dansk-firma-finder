import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, DollarSign, TrendingUp, AlertCircle, Eye, Calendar, Clock, MapPin, Download, Search, Filter, RefreshCw, Users, CreditCard, BarChart3, PieChart, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, ComposedChart, PieChart as RechartsPieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';

interface ReportStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersLast7Days: number;
  ordersLast30Days: number;
  totalCustomers: number;
  returningCustomers: number;
  conversionRate: number;
  fulfillmentTime: number;
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
  updated_at: string;
  user_id: string;
  user_email?: string;
  payment_method?: string;
  processing_time?: number;
  file_size?: number;
  download_count?: number;
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

interface CustomerInsight {
  user_id: string;
  email: string;
  total_orders: number;
  total_spent: number;
  last_order: string;
  favorite_report_type: string;
}

interface PaymentMethodData {
  method: string;
  orders: number;
  revenue: number;
  percentage: number;
  color: string;
}

interface ProcessingTimeData {
  report_type: string;
  avg_time: number;
  orders: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

// Generate comprehensive example data since database is empty
const generateExampleData = () => {
  const reportTypes = ['Basic Report', 'Premium Report', 'Financial Analysis', 'Risk Assessment', 'Market Analysis'];
  const statuses = ['completed', 'pending', 'failed', 'processing', 'refunded'];
  const paymentMethods = ['Credit Card', 'Bank Transfer', 'Mobile Pay', 'PayPal'];
  const companies = [
    'Danish Tech ApS', 'Nordic Solutions A/S', 'Copenhagen Ventures', 'Aarhus Innovation', 'Odense Manufacturing',
    'Aalborg Logistics', 'Frederiksberg Consulting', 'Esbjerg Marine', 'Roskilde Properties', 'Herning Textiles',
    'Kolding Electronics', 'Vejle Transport', 'Silkeborg Energy', 'Horsens Agriculture', 'Randers Construction'
  ];
  const emails = companies.map(company => `contact@${company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '')}.dk`);

  const orders: ReportOrder[] = [];
  const customers: CustomerInsight[] = [];
  
  // Generate 150 example orders over the last 3 months
  for (let i = 0; i < 150; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
    
    const companyIndex = Math.floor(Math.random() * companies.length);
    const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Price based on report type
    let basePrice = 299; // Basic price in DKK
    if (reportType.includes('Premium')) basePrice = 599;
    if (reportType.includes('Financial')) basePrice = 899;
    if (reportType.includes('Risk')) basePrice = 1299;
    if (reportType.includes('Market')) basePrice = 1599;
    
    const order: ReportOrder = {
      id: `order_${i + 1}`,
      company_name: companies[companyIndex],
      company_cvr: (10000000 + Math.floor(Math.random() * 90000000)).toString(),
      report_type: reportType,
      amount_cents: basePrice * 100,
      currency: 'DKK',
      status: status,
      created_at: date.toISOString(),
      updated_at: new Date(date.getTime() + Math.random() * 3600000).toISOString(),
      user_id: `user_${companyIndex + 1}`,
      user_email: emails[companyIndex],
      payment_method: paymentMethod,
      processing_time: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      file_size: Math.floor(Math.random() * 5000) + 500, // 500KB-5.5MB
      download_count: Math.floor(Math.random() * 10),
    };
    
    orders.push(order);
  }

  // Generate customer insights
  const customerMap = new Map<string, CustomerInsight>();
  orders.forEach(order => {
    const existing = customerMap.get(order.user_id);
    if (existing) {
      existing.total_orders++;
      existing.total_spent += order.amount_cents / 100;
      if (new Date(order.created_at) > new Date(existing.last_order)) {
        existing.last_order = order.created_at;
      }
    } else {
      customerMap.set(order.user_id, {
        user_id: order.user_id,
        email: order.user_email || 'unknown@example.com',
        total_orders: 1,
        total_spent: order.amount_cents / 100,
        last_order: order.created_at,
        favorite_report_type: order.report_type,
      });
    }
  });

  return { orders, customers: Array.from(customerMap.values()) };
};

export const ReportsOrders: React.FC = () => {
  const [stats, setStats] = useState<ReportStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    failedOrders: 0,
    refundedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersLast7Days: 0,
    ordersLast30Days: 0,
    totalCustomers: 0,
    returningCustomers: 0,
    conversionRate: 0,
    fulfillmentTime: 0,
  });
  const [allOrders, setAllOrders] = useState<ReportOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ReportOrder[]>([]);
  const [customers, setCustomers] = useState<CustomerInsight[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportTypeData[]>([]);
  const [orderTrends, setOrderTrends] = useState<OrderTrendData[]>([]);
  const [hourlyOrders, setHourlyOrders] = useState<HourlyData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [processingTimes, setProcessingTimes] = useState<ProcessingTimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<ReportOrder | null>(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        // Fetch all report orders from database
        const { data: reportOrders, error } = await supabase
          .from('report_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        let orders: ReportOrder[] = [];
        let customerData: CustomerInsight[] = [];

        // Use example data if database is empty
        if (!reportOrders || reportOrders.length === 0) {
          const exampleData = generateExampleData();
          orders = exampleData.orders;
          customerData = exampleData.customers;
        } else {
          // Transform database data to match our interface
          orders = reportOrders.map(order => ({
            ...order,
            user_email: `user${order.user_id}@example.com`, // Mock email
            payment_method: ['Credit Card', 'Bank Transfer', 'Mobile Pay'][Math.floor(Math.random() * 3)],
            processing_time: Math.floor(Math.random() * 300) + 30,
            file_size: Math.floor(Math.random() * 5000) + 500,
            download_count: Math.floor(Math.random() * 10),
          }));
        }

        setAllOrders(orders);
        setFilteredOrders(orders);
        setCustomers(customerData);

        // Calculate comprehensive stats
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const failedOrders = orders.filter(order => order.status === 'failed').length;
        const refundedOrders = orders.filter(order => order.status === 'refunded').length;
        
        const totalRevenue = orders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + (order.amount_cents / 100), 0);
        
        const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

        // Calculate time-based metrics
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const ordersLast7Days = orders.filter(order => 
          new Date(order.created_at) >= sevenDaysAgo
        ).length;
        
        const ordersLast30Days = orders.filter(order => 
          new Date(order.created_at) >= thirtyDaysAgo
        ).length;

        const totalCustomers = customerData.length;
        const returningCustomers = customerData.filter(customer => customer.total_orders > 1).length;
        const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
        const avgProcessingTime = orders
          .filter(order => order.processing_time)
          .reduce((sum, order) => sum + (order.processing_time || 0), 0) / 
          orders.filter(order => order.processing_time).length || 0;

        setStats({
          totalOrders,
          completedOrders,
          pendingOrders,
          failedOrders,
          refundedOrders,
          totalRevenue,
          averageOrderValue,
          ordersLast7Days,
          ordersLast30Days,
          totalCustomers,
          returningCustomers,
          conversionRate,
          fulfillmentTime: avgProcessingTime,
        });

        // Calculate report type distribution
        const typeMap = new Map<string, { count: number; revenue: number }>();
        orders.forEach(order => {
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
          
          const dayOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.toDateString() === date.toDateString();
          });
          
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

        // Generate hourly order distribution
        const hourlyData: HourlyData[] = [];
        for (let hour = 0; hour < 24; hour++) {
          const hourOrders = orders.filter(order => {
            const orderHour = new Date(order.created_at).getHours();
            return orderHour === hour;
          });
          
          hourlyData.push({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            orders: hourOrders.length,
          });
        }
        setHourlyOrders(hourlyData);

        // Generate geographic data (mock for Danish regions)
        const regions = ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'];
        const geoData: GeographicData[] = regions.map((region, index) => {
          const regionOrders = Math.floor(totalOrders * (0.4 - index * 0.08));
          const regionRevenue = regionOrders * averageOrderValue * (0.9 + Math.random() * 0.2);
          return {
            region,
            orders: regionOrders,
            revenue: regionRevenue,
          };
        });
        setGeographicData(geoData);

        // Payment method distribution
        const paymentMethodMap = new Map<string, number>();
        orders.forEach(order => {
          const method = order.payment_method || 'Unknown';
          paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + 1);
        });

        const paymentData: PaymentMethodData[] = Array.from(paymentMethodMap.entries()).map(([method, count], index) => ({
          method,
          orders: count,
          revenue: count * averageOrderValue,
          percentage: (count / totalOrders) * 100,
          color: COLORS[index % COLORS.length],
        }));
        setPaymentMethods(paymentData);

        // Processing time analysis
        const processingData: ProcessingTimeData[] = reportTypesData.map(type => ({
          report_type: type.name,
          avg_time: Math.floor(Math.random() * 200) + 60, // 60-260 seconds
          orders: type.value,
        }));
        setProcessingTimes(processingData);

      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // Filter orders based on search and filter criteria
  useEffect(() => {
    let filtered = allOrders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.company_cvr.includes(searchTerm) ||
        order.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user_email && order.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (reportTypeFilter !== 'all') {
      filtered = filtered.filter(order => order.report_type === reportTypeFilter);
    }

    setFilteredOrders(filtered);
  }, [allOrders, searchTerm, statusFilter, reportTypeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'outline',
      failed: 'destructive',
      processing: 'secondary',
      refunded: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Company', 'CVR', 'Report Type', 'Amount', 'Status', 'Date', 'Customer Email'];
    const csvData = filteredOrders.map(order => [
      order.id,
      order.company_name,
      order.company_cvr,
      order.report_type,
      formatCurrency(order.amount_cents / 100),
      order.status,
      new Date(order.created_at).toLocaleDateString('da-DK'),
      order.user_email || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Orders</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics on report orders, revenue trends, and customer insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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
              <span className="text-green-600">{stats.completedOrders} completed</span>
              <span>•</span>
              <span className="text-orange-600">{stats.pendingOrders} pending</span>
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
              {stats.conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.returningCustomers} returning ({((stats.returningCustomers / stats.totalCustomers) * 100).toFixed(1)}%)
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
              {stats.fulfillmentTime.toFixed(0)}s avg processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersLast7Days}</div>
            <p className="text-xs text-muted-foreground">orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersLast30Days}</div>
            <p className="text-xs text-muted-foreground">orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.failedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.failedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.refundedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.refundedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}% refund rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                      <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
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
                    stroke={COLORS[0]}
                    fill="url(#revenueGradient)"
                    name="revenue"
                  />
                  <Bar yAxisId="left" dataKey="orders" fill={COLORS[1]} name="orders" />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="avgValue" 
                    stroke={COLORS[2]} 
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
                  <RechartsPieChart>
                    <Pie
                      data={reportTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {reportTypes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="orders"
                      label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orders`, 'Orders']} />
                  </RechartsPieChart>
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
                  {geographicData.map((region) => (
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
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[250px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Report Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.slice(0, 20).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.user_email}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.company_name}</div>
                            <div className="text-sm text-muted-foreground">CVR: {order.company_cvr}</div>
                          </div>
                        </TableCell>
                        <TableCell>{order.report_type}</TableCell>
                        <TableCell>{formatCurrency(order.amount_cents / 100)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('da-DK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Order ID</label>
                                      <p className="text-sm">{selectedOrder.id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status</label>
                                      <p className="text-sm">{getStatusBadge(selectedOrder.status)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Company</label>
                                      <p className="text-sm">{selectedOrder.company_name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">CVR</label>
                                      <p className="text-sm">{selectedOrder.company_cvr}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Report Type</label>
                                      <p className="text-sm">{selectedOrder.report_type}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Amount</label>
                                      <p className="text-sm">{formatCurrency(selectedOrder.amount_cents / 100)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Payment Method</label>
                                      <p className="text-sm">{selectedOrder.payment_method}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Processing Time</label>
                                      <p className="text-sm">{selectedOrder.processing_time}s</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">File Size</label>
                                      <p className="text-sm">{(selectedOrder.file_size! / 1024).toFixed(1)} MB</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Downloads</label>
                                      <p className="text-sm">{selectedOrder.download_count} times</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Customer Email</label>
                                    <p className="text-sm">{selectedOrder.user_email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Created</label>
                                    <p className="text-sm">
                                      {new Date(selectedOrder.created_at).toLocaleString('da-DK')}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {Math.min(filteredOrders.length, 20)} of {filteredOrders.length} orders
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.slice(0, 10).map((customer) => (
                  <div key={customer.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{customer.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.total_orders} orders • Last order: {new Date(customer.last_order).toLocaleDateString('da-DK')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Favorite: {customer.favorite_report_type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(customer.total_spent)}</div>
                      <div className="text-sm text-muted-foreground">Total spent</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <Bar dataKey="orders" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Processing Times */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Times by Report Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processingTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="report_type" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}s`, 'Avg Processing Time']} />
                    <Bar dataKey="avg_time" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Report Type */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Report Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={reportTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? `${value} orders` : formatCurrency(Number(value)),
                      name === 'value' ? 'Orders' : 'Revenue'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="value" fill={COLORS[0]} name="value" />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={COLORS[1]} 
                    strokeWidth={3}
                    name="revenue"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[
                    { name: 'Completion', value: stats.conversionRate, fill: COLORS[0] }
                  ]}>
                    <RadialBar dataKey="value" cornerRadius={10} fill={COLORS[0]} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">
                      {stats.conversionRate.toFixed(1)}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[
                    { name: 'Retention', value: (stats.returningCustomers / stats.totalCustomers) * 100, fill: COLORS[1] }
                  ]}>
                    <RadialBar dataKey="value" cornerRadius={10} fill={COLORS[1]} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">
                      {((stats.returningCustomers / stats.totalCustomers) * 100).toFixed(1)}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[
                    { name: 'Success', value: ((stats.totalOrders - stats.failedOrders) / stats.totalOrders) * 100, fill: COLORS[2] }
                  ]}>
                    <RadialBar dataKey="value" cornerRadius={10} fill={COLORS[2]} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">
                      {(((stats.totalOrders - stats.failedOrders) / stats.totalOrders) * 100).toFixed(1)}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
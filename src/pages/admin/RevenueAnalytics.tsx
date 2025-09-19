import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Users, CreditCard, Target, Globe, Calendar, PiggyBank, ArrowUpDown, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, ComposedChart, PieChart, Pie, Cell, RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList } from 'recharts';

interface RevenueStats {
  totalMRR: number;
  reportRevenue: number;
  leadRevenue: number;
  averageARPU: number;
  totalLTV: number;
  standardUsers: number;
  premiumUsers: number;
  enterpriseUsers: number;
  churnRate: number;
  cac: number;
  paybackPeriod: number;
  revenueGrowthRate: number;
}

interface RevenueData {
  month: string;
  mrr: number;
  reports: number;
  leads: number;
  conversions: number;
  newUsers: number;
  churnedUsers: number;
  totalRevenue: number;
  expenses: number;
  netRevenue: number;
  cac: number;
  ltv: number;
}

interface GeographicData {
  country: string;
  revenue: number;
  users: number;
  averageRevenue: number;
}

interface PaymentMethodData {
  method: string;
  revenue: number;
  transactions: number;
  color: string;
}

interface CohortData {
  cohort: string;
  month0: number;
  month1: number;
  month3: number;
  month6: number;
  month12: number;
}

interface RevenueSegmentData {
  segment: string;
  revenue: number;
  users: number;
  growth: number;
  color: string;
}

interface UserTierData {
  tier: string;
  users: number;
  revenue: number;
  color: string;
}

interface ConversionFunnelData {
  stage: string;
  users: number;
  conversion: number;
}

export const RevenueAnalytics: React.FC = () => {
  const [stats, setStats] = useState<RevenueStats>({
    totalMRR: 0,
    reportRevenue: 0,
    leadRevenue: 0,
    averageARPU: 0,
    totalLTV: 0,
    standardUsers: 0,
    premiumUsers: 0,
    enterpriseUsers: 0,
    churnRate: 0,
    cac: 0,
    paybackPeriod: 0,
    revenueGrowthRate: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [userTierData, setUserTierData] = useState<UserTierData[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelData[]>([]);
  const [userTypeData, setUserTypeData] = useState<{type: string, users: number, revenue: number, color: string}[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodData[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [revenueSegments, setRevenueSegments] = useState<RevenueSegmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12months');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  useEffect(() => {
    const fetchRevenueAnalytics = async () => {
      try {
        // Fetch subscription data
        const { data: subscriptions, error: subError } = await supabase
          .from('user_subscriptions')
          .select('subscription_tier, status, created_at');

        if (subError) throw subError;

        // Fetch report orders
        const { data: reportOrders, error: reportError } = await supabase
          .from('report_orders')
          .select('amount_cents, currency, created_at, status');

        if (reportError) throw reportError;

        // Fetch leads data
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('lead_value_dkk, status, created_at, service_type');

        if (leadsError) throw leadsError;

        // Calculate user counts by tier
        const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
        const standardUsers = activeSubscriptions.filter(s => s.subscription_tier === 'standard').length;
        const premiumUsers = activeSubscriptions.filter(s => s.subscription_tier === 'premium').length;
        const enterpriseUsers = activeSubscriptions.filter(s => s.subscription_tier === 'enterprise').length;

        // Calculate MRR (assuming monthly pricing)
        const monthlyRevenue = {
          standard: standardUsers * 99, // 99 DKK/month
          premium: premiumUsers * 299,  // 299 DKK/month
          enterprise: enterpriseUsers * 599, // 599 DKK/month
        };
        const totalMRR = monthlyRevenue.standard + monthlyRevenue.premium + monthlyRevenue.enterprise;

        // Calculate report revenue
        const reportRevenue = reportOrders
          ?.filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + (order.amount_cents / 100), 0) || 0;

        // Calculate lead revenue (from converted leads)
        const leadRevenue = leads
          ?.filter(lead => lead.status === 'converted' && lead.lead_value_dkk)
          .reduce((sum, lead) => sum + (lead.lead_value_dkk / 100), 0) || 0;

        // Calculate ARPU
        const totalUsers = standardUsers + premiumUsers + enterpriseUsers;
        const averageARPU = totalUsers > 0 ? totalMRR / totalUsers : 0;

        // Calculate advanced metrics
        const totalLTV = averageARPU * 24; // Assuming 24 month average lifetime
        const churnRate = totalUsers > 0 ? 3.5 : 0; // Mock 3.5% monthly churn
        const cac = 450; // Mock Customer Acquisition Cost in DKK
        const paybackPeriod = cac / averageARPU; // Months to payback CAC
        const revenueGrowthRate = 15.2; // Mock monthly growth rate

        setStats({
          totalMRR,
          reportRevenue,
          leadRevenue,
          averageARPU,
          totalLTV,
          standardUsers,
          premiumUsers,
          enterpriseUsers,
          churnRate,
          cac,
          paybackPeriod,
          revenueGrowthRate,
        });

        // Generate comprehensive historical data for charts
        const mockRevenueData: RevenueData[] = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const growthFactor = 0.6 + (i * 0.04); // Simulate gradual growth
          const baseMRR = Math.floor(totalMRR * growthFactor);
          const baseReports = Math.floor(reportRevenue * (0.4 + (Math.random() * 0.8)));
          const baseLeads = Math.floor(leadRevenue * (0.3 + (Math.random() * 0.9)));
          const monthlyExpenses = Math.floor(baseMRR * 0.3); // 30% expense ratio
          
          mockRevenueData.push({
            month: monthName,
            mrr: baseMRR,
            reports: baseReports,
            leads: baseLeads,
            conversions: Math.floor(Math.random() * 25) + 8,
            newUsers: Math.floor(Math.random() * 60) + 15,
            churnedUsers: Math.floor(Math.random() * 12) + 3,
            totalRevenue: baseMRR + baseReports + baseLeads,
            expenses: monthlyExpenses,
            netRevenue: baseMRR + baseReports + baseLeads - monthlyExpenses,
            cac: 400 + Math.floor(Math.random() * 200),
            ltv: Math.floor(averageARPU * (20 + Math.random() * 10)),
          });
        }
        setRevenueData(mockRevenueData);

        // User tier distribution for pie chart
        const tierData: UserTierData[] = [
          { tier: 'Standard', users: standardUsers, revenue: monthlyRevenue.standard, color: COLORS[0] },
          { tier: 'Premium', users: premiumUsers, revenue: monthlyRevenue.premium, color: COLORS[1] },
          { tier: 'Enterprise', users: enterpriseUsers, revenue: monthlyRevenue.enterprise, color: COLORS[2] },
        ];
        setUserTierData(tierData);

        // Conversion funnel data
        const totalVisitors = 1000; // Mock data
        const funnelData: ConversionFunnelData[] = [
          { stage: 'Visitors', users: totalVisitors, conversion: 100 },
          { stage: 'Signups', users: Math.floor(totalVisitors * 0.18), conversion: 18 },
          { stage: 'Trial Users', users: Math.floor(totalVisitors * 0.14), conversion: 14 },
          { stage: 'Paid Users', users: totalUsers || 50, conversion: ((totalUsers || 50) / totalVisitors) * 100 },
        ];
        setConversionFunnel(funnelData);

        // User type data (Company vs Normal users)
        const companyUsers = Math.floor(totalUsers * 0.35); // 35% company users
        const normalUsers = totalUsers - companyUsers;
        const companyRevenue = totalMRR * 0.68; // Company users generate more revenue per user
        const normalRevenue = totalMRR - companyRevenue;
        
        const userTypeAnalysis = [
          { type: 'Company Users', users: companyUsers, revenue: companyRevenue, color: COLORS[0] },
          { type: 'Normal Users', users: normalUsers, revenue: normalRevenue, color: COLORS[1] },
        ];
        setUserTypeData(userTypeAnalysis);

        // Payment method data (mock)
        const paymentData: PaymentMethodData[] = [
          { method: 'Credit Card', revenue: (totalMRR + reportRevenue) * 0.65, transactions: 450, color: COLORS[0] },
          { method: 'Bank Transfer', revenue: (totalMRR + reportRevenue) * 0.25, transactions: 180, color: COLORS[1] },
          { method: 'Mobile Pay', revenue: (totalMRR + reportRevenue) * 0.10, transactions: 95, color: COLORS[2] },
        ];
        setPaymentMethodData(paymentData);

        // Cohort retention data (mock)
        const cohortAnalysis: CohortData[] = [
          { cohort: 'Jan 2024', month0: 100, month1: 82, month3: 65, month6: 52, month12: 45 },
          { cohort: 'Feb 2024', month0: 100, month1: 85, month3: 68, month6: 55, month12: 0 },
          { cohort: 'Mar 2024', month0: 100, month1: 88, month3: 72, month6: 58, month12: 0 },
          { cohort: 'Apr 2024', month0: 100, month1: 90, month3: 75, month6: 0, month12: 0 },
          { cohort: 'May 2024', month0: 100, month1: 87, month3: 73, month6: 0, month12: 0 },
        ];
        setCohortData(cohortAnalysis);

        // Revenue segment data
        const segmentData: RevenueSegmentData[] = [
          { segment: 'Subscriptions', revenue: totalMRR, users: totalUsers, growth: 12.5, color: COLORS[0] },
          { segment: 'Reports', revenue: reportRevenue, users: reportOrders?.length || 0, growth: 8.3, color: COLORS[1] },
          { segment: 'Leads', revenue: leadRevenue, users: leads?.filter(l => l.status === 'converted').length || 0, growth: 22.1, color: COLORS[2] },
        ];
        setRevenueSegments(segmentData);

      } catch (error) {
        console.error('Error fetching revenue analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueAnalytics();
  }, []);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive revenue analysis, growth metrics, and business intelligence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="24months">Last 24 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalMRR)}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.revenueGrowthRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalMRR + stats.reportRevenue + stats.leadRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              MRR + Reports + Leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalLTV)}</div>
            <p className="text-xs text-muted-foreground">
              Average Lifetime Value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAC Payback</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paybackPeriod.toFixed(1)} mo</div>
            <p className="text-xs text-muted-foreground">
              CAC: {formatCurrency(stats.cac)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Churn Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate}%</div>
            <p className="text-xs text-green-600">
              -0.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Revenue</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.leadRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Legal & Accounting services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU (Monthly)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageARPU)}</div>
            <p className="text-xs text-muted-foreground">
              Average Revenue Per User
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV/CAC Ratio</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalLTV / stats.cac).toFixed(1)}x</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLTV / stats.cac > 3 ? 'Healthy' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="expenses">P&L</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Segments Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueSegments}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      label={({ segment, revenue }) => `${segment}: ${formatCurrency(revenue)}`}
                    >
                      {revenueSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {revenueSegments.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                        <span>{segment.segment}</span>
                      </div>
                      <span className="text-green-600">+{segment.growth}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Combined Revenue Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue Breakdown by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey="mrr" 
                      fill={`${COLORS[0]}40`}
                      stroke={COLORS[0]} 
                      strokeWidth={2}
                      name="MRR"
                      stackId="1"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="reports" 
                      fill={`${COLORS[1]}40`}
                      stroke={COLORS[1]} 
                      strokeWidth={2}
                      name="Reports"
                      stackId="1"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="leads" 
                      fill={`${COLORS[2]}40`}
                      stroke={COLORS[2]} 
                      strokeWidth={2}
                      name="Leads"
                      stackId="1"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Total Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue vs Net Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={revenueData}>
                  <defs>
                    <linearGradient id="totalRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="netRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stroke={COLORS[0]} 
                    fill="url(#totalRevenue)"
                    strokeWidth={3}
                    name="Total Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netRevenue" 
                    stroke={COLORS[1]} 
                    fill="url(#netRevenue)"
                    strokeWidth={3}
                    name="Net Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke={COLORS[3]} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Expenses"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Tier Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by User Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userTierData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      label={({ tier, revenue }) => `${tier}: ${formatCurrency(revenue)}`}
                    >
                      {userTierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {userTierData.map((tier) => (
                    <div key={tier.tier} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                        <span>{tier.tier}</span>
                      </div>
                      <span>{tier.users} users</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill={COLORS[0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {paymentMethodData.map((method) => (
                    <div key={method.method} className="flex items-center justify-between text-sm">
                      <span>{method.method}</span>
                      <span>{method.transactions} transactions</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by User Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by User Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      label={({ type, revenue }) => `${type}: ${formatCurrency(revenue)}`}
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {userTypeData.map((type) => (
                    <div key={type.type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                        <span>{type.type}</span>
                      </div>
                      <div className="text-right">
                        <div>{type.users} users</div>
                        <div className="text-muted-foreground">{formatCurrency(type.revenue / type.users)}/user</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Retention Cohort Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Retention rates by signup cohort over time (percentage)
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cohort</th>
                      <th className="text-center p-2">Month 0</th>
                      <th className="text-center p-2">Month 1</th>
                      <th className="text-center p-2">Month 3</th>
                      <th className="text-center p-2">Month 6</th>
                      <th className="text-center p-2">Month 12</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort) => (
                      <tr key={cohort.cohort} className="border-b">
                        <td className="p-2 font-medium">{cohort.cohort}</td>
                        <td className="text-center p-2">
                          <Badge variant="default">{cohort.month0}%</Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={cohort.month1 >= 80 ? 'default' : 'secondary'}>{cohort.month1}%</Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={cohort.month3 >= 60 ? 'default' : 'secondary'}>{cohort.month3}%</Badge>
                        </td>
                        <td className="text-center p-2">
                          {cohort.month6 > 0 ? (
                            <Badge variant={cohort.month6 >= 50 ? 'default' : 'secondary'}>{cohort.month6}%</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-center p-2">
                          {cohort.month12 > 0 ? (
                            <Badge variant={cohort.month12 >= 40 ? 'default' : 'secondary'}>{cohort.month12}%</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CAC vs LTV Trend */}
            <Card>
              <CardHeader>
                <CardTitle>CAC vs LTV Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line 
                      type="monotone" 
                      dataKey="cac" 
                      stroke={COLORS[3]} 
                      strokeWidth={3}
                      name="CAC"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ltv" 
                      stroke={COLORS[0]} 
                      strokeWidth={3}
                      name="LTV"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={conversionFunnel} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={80} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'users' ? `${value} users` : `${value}%`,
                        name === 'users' ? 'Users' : 'Conversion Rate'
                      ]}
                    />
                    <Bar dataKey="users" fill={COLORS[0]} name="users" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {conversionFunnel.map((stage) => (
                    <div key={stage.stage} className="flex justify-between text-sm">
                      <span>{stage.stage}</span>
                      <span className="font-medium">{stage.conversion.toFixed(1)}% conversion</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth & Churn */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth vs Churn</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newUsers" fill={COLORS[0]} name="New Users" />
                    <Bar dataKey="churnedUsers" fill={COLORS[3]} name="Churned Users" />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke={COLORS[1]} 
                      strokeWidth={3}
                      name="Net Growth"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* P&L Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey="totalRevenue" 
                      fill={`${COLORS[0]}40`}
                      stroke={COLORS[0]} 
                      strokeWidth={2}
                      name="Total Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      fill={`${COLORS[3]}40`}
                      stroke={COLORS[3]} 
                      strokeWidth={2}
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netRevenue" 
                      stroke={COLORS[1]} 
                      strokeWidth={3}
                      name="Net Profit"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};
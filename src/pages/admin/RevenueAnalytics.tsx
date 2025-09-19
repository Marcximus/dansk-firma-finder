import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, ComposedChart, PieChart, Pie, Cell } from 'recharts';

interface RevenueStats {
  totalMRR: number;
  reportRevenue: number;
  averageARPU: number;
  totalLTV: number;
  standardUsers: number;
  premiumUsers: number;
  enterpriseUsers: number;
}

interface RevenueData {
  month: string;
  mrr: number;
  reports: number;
  conversions: number;
  newUsers: number;
  churnedUsers: number;
  totalRevenue: number;
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
    averageARPU: 0,
    totalLTV: 0,
    standardUsers: 0,
    premiumUsers: 0,
    enterpriseUsers: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [userTierData, setUserTierData] = useState<UserTierData[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted-foreground))'];

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

        // Calculate ARPU
        const totalUsers = standardUsers + premiumUsers + enterpriseUsers;
        const averageARPU = totalUsers > 0 ? totalMRR / totalUsers : 0;

        // Estimate LTV (simple calculation: ARPU * 12 months)
        const totalLTV = averageARPU * 12;

        setStats({
          totalMRR,
          reportRevenue,
          averageARPU,
          totalLTV,
          standardUsers,
          premiumUsers,
          enterpriseUsers,
        });

        // Generate comprehensive historical data for charts
        const mockRevenueData: RevenueData[] = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          const growthFactor = 0.7 + (i * 0.03); // Simulate gradual growth
          
          mockRevenueData.push({
            month: monthName,
            mrr: Math.floor(totalMRR * growthFactor),
            reports: Math.floor(reportRevenue * (0.5 + (Math.random() * 1))),
            conversions: Math.floor(Math.random() * 20) + 5,
            newUsers: Math.floor(Math.random() * 50) + 10,
            churnedUsers: Math.floor(Math.random() * 10) + 2,
            totalRevenue: Math.floor((totalMRR * growthFactor) + (reportRevenue * (0.5 + Math.random()))),
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
          { stage: 'Signups', users: Math.floor(totalVisitors * 0.15), conversion: 15 },
          { stage: 'Trial Users', users: Math.floor(totalVisitors * 0.12), conversion: 12 },
          { stage: 'Paid Users', users: totalUsers, conversion: (totalUsers / totalVisitors) * 100 },
        ];
        setConversionFunnel(funnelData);

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
        <p className="text-muted-foreground">
          Monitor subscription revenue, user upgrades, and financial performance
        </p>
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
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.reportRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              One-time report purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ARPU</CardTitle>
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
            <CardTitle className="text-sm font-medium">Est. LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalLTV)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated Lifetime Value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution Pie Chart */}
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
              {userTierData.map((tier, index) => (
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

        {/* Combined Revenue Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>MRR vs Report Revenue (Last 12 Months)</CardTitle>
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
                  fill="hsl(var(--primary) / 0.3)"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="MRR"
                />
                <Bar dataKey="reports" fill="hsl(var(--secondary))" name="Report Revenue" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Total Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="totalRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area 
                type="monotone" 
                dataKey="totalRevenue" 
                stroke="hsl(var(--primary))" 
                fill="url(#totalRevenue)"
                strokeWidth={3}
                name="Total Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
                <Bar dataKey="newUsers" fill="hsl(var(--primary))" name="New Users" />
                <Bar dataKey="churnedUsers" fill="hsl(var(--destructive))" name="Churned Users" />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  name="Net Growth"
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
                <Bar dataKey="users" fill="hsl(var(--primary))" name="users" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="flex justify-between text-sm">
                  <span>{stage.stage}</span>
                  <span className="font-medium">{stage.conversion.toFixed(1)}% conversion</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Conversions Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Conversions & Upgrades</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="conversions" fill="hsl(var(--primary))" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
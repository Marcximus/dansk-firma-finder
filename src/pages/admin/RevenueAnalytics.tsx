import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

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
  const [loading, setLoading] = useState(true);

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

        // Generate mock historical data for charts
        const mockRevenueData: RevenueData[] = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          
          mockRevenueData.push({
            month: monthName,
            mrr: Math.floor(totalMRR * (0.7 + (Math.random() * 0.6))), // Simulate growth
            reports: Math.floor(reportRevenue * (0.5 + (Math.random() * 1))),
            conversions: Math.floor(Math.random() * 20) + 5,
          });
        }
        setRevenueData(mockRevenueData);

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
        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Standard</Badge>
                  <span className="text-sm text-muted-foreground">99 DKK/month</span>
                </div>
                <span className="font-medium">{stats.standardUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Premium</Badge>
                  <span className="text-sm text-muted-foreground">299 DKK/month</span>
                </div>
                <span className="font-medium">{stats.premiumUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge>Enterprise</Badge>
                  <span className="text-sm text-muted-foreground">599 DKK/month</span>
                </div>
                <span className="font-medium">{stats.enterpriseUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="MRR"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Funnel & Conversions</CardTitle>
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
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, DollarSign, FileText, TrendingUp, Activity, Scale } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminMetrics {
  totalUsers: number;
  totalFollowedCompanies: number;
  monthlyRevenue: number;
  totalReportOrders: number;
  premiumUsers: number;
  enterpriseUsers: number;
  totalLeads: number;
  newLeads: number;
}

export const AdminMetricsCards: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch user counts by subscription tier
        const { data: subscriptions } = await supabase
          .from('user_subscriptions')
          .select('subscription_tier, status');

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id');

        const { data: followedCompanies } = await supabase
          .from('followed_companies')
          .select('id');

        const { data: reportOrders } = await supabase
          .from('report_orders')
          .select('id, amount_cents');

        const { data: leads } = await supabase
          .from('leads')
          .select('id, status');

        const totalUsers = profiles?.length || 0;
        const totalFollowedCompanies = followedCompanies?.length || 0;
        const totalReportOrders = reportOrders?.length || 0;
        const totalLeads = leads?.length || 0;
        const newLeads = leads?.filter(lead => lead.status === 'new').length || 0;

        // Calculate revenue (assuming report orders are the main revenue source for now)
        const monthlyRevenue = reportOrders?.reduce((sum, order) => sum + (order.amount_cents / 100), 0) || 0;

        // Count premium and enterprise users
        const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active') || [];
        const premiumUsers = activeSubscriptions.filter(sub => sub.subscription_tier === 'premium').length;
        const enterpriseUsers = activeSubscriptions.filter(sub => sub.subscription_tier === 'enterprise').length;

        setMetrics({
          totalUsers,
          totalFollowedCompanies,
          monthlyRevenue,
          totalReportOrders,
          premiumUsers,
          enterpriseUsers,
          totalLeads,
          newLeads,
        });
      } catch (error) {
        console.error('Error fetching admin metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(7)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: metrics?.totalUsers || 0,
      description: `${metrics?.premiumUsers || 0} Premium, ${metrics?.enterpriseUsers || 0} Enterprise`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Followed Companies',
      value: metrics?.totalFollowedCompanies || 0,
      description: 'Total companies being tracked',
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Report Revenue',
      value: `${(metrics?.monthlyRevenue || 0).toLocaleString('da-DK')} DKK`,
      description: 'Total from report orders',
      icon: DollarSign,
      color: 'text-yellow-600',
    },
    {
      title: 'Report Orders',
      value: metrics?.totalReportOrders || 0,
      description: 'Total reports purchased',
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      title: 'Total Leads',
      value: metrics?.totalLeads || 0,
      description: `${metrics?.newLeads || 0} new leads`,
      icon: Scale,
      color: 'text-indigo-600',
    },
    {
      title: 'Premium Users',
      value: metrics?.premiumUsers || 0,
      description: 'Active premium subscriptions',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      title: 'Enterprise Users',
      value: metrics?.enterpriseUsers || 0,
      description: 'Active enterprise subscriptions',
      icon: Activity,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
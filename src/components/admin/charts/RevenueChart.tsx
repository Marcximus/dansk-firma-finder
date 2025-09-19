import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueData {
  date: string;
  revenue: number;
  reports: number;
}

export const RevenueChart: React.FC = () => {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const { data: reportOrders } = await supabase
          .from('report_orders')
          .select('created_at, amount_cents')
          .order('created_at', { ascending: true });

        if (!reportOrders) return;

        // Group by date
        const revenueMap = new Map<string, { revenue: number; reports: number }>();

        // Generate last 30 days
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });

        // Initialize map with zeros
        last30Days.forEach(date => {
          revenueMap.set(date, { revenue: 0, reports: 0 });
        });

        // Aggregate revenue by date
        reportOrders.forEach(order => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          if (revenueMap.has(date)) {
            const current = revenueMap.get(date)!;
            current.revenue += order.amount_cents / 100; // Convert cents to DKK
            current.reports += 1;
          }
        });

        const chartData = Array.from(revenueMap.entries()).map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('da-DK', { month: 'short', day: 'numeric' }),
          revenue: data.revenue,
          reports: data.reports,
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return <Skeleton className="w-full h-64" />;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'revenue' ? `${value.toLocaleString('da-DK')} DKK` : value,
              name === 'revenue' ? 'Revenue' : 'Reports'
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            name="revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
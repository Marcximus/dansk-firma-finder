import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface GrowthData {
  date: string;
  users: number;
  newUsers: number;
}

export const UserGrowthChart: React.FC = () => {
  const [data, setData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('created_at')
          .order('created_at', { ascending: true });

        if (!profiles) return;

        // Group by date and calculate cumulative and daily new users
        const growthMap = new Map<string, { users: number; newUsers: number }>();
        let totalUsers = 0;

        // Generate last 30 days
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });

        // Initialize map with zeros
        last30Days.forEach(date => {
          growthMap.set(date, { users: 0, newUsers: 0 });
        });

        // Count users by date
        profiles.forEach(profile => {
          const date = new Date(profile.created_at).toISOString().split('T')[0];
          if (growthMap.has(date)) {
            const current = growthMap.get(date)!;
            current.newUsers += 1;
          }
        });

        // Calculate cumulative users
        const sortedDates = Array.from(growthMap.keys()).sort();
        sortedDates.forEach(date => {
          const current = growthMap.get(date)!;
          totalUsers += current.newUsers;
          current.users = totalUsers;
        });

        const chartData = sortedDates.map(date => ({
          date: new Date(date).toLocaleDateString('da-DK', { month: 'short', day: 'numeric' }),
          users: growthMap.get(date)!.users,
          newUsers: growthMap.get(date)!.newUsers,
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching growth data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  if (loading) {
    return <Skeleton className="w-full h-64" />;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="users" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Total Users"
          />
          <Line 
            type="monotone" 
            dataKey="newUsers" 
            stroke="hsl(var(--secondary))" 
            strokeWidth={2}
            name="New Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
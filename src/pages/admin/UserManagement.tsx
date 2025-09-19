import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Crown, Building, User, Mail, Calendar, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription_tier?: string;
  status?: string;
  followed_companies_count: number;
  report_orders_count: number;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all users with their profiles and subscription data
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          full_name,
          created_at
        `);

      if (!profiles) return;

      // Fetch subscription data
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('user_id, subscription_tier, status');

      // Fetch followed companies count per user
      const { data: followedCompanies } = await supabase
        .from('followed_companies')
        .select('user_id');

      // Fetch report orders count per user
      const { data: reportOrders } = await supabase
        .from('report_orders')
        .select('user_id');

      // Combine data
      const usersData = profiles.map(profile => {
        const subscription = subscriptions?.find(sub => sub.user_id === profile.user_id);
        const followedCount = followedCompanies?.filter(fc => fc.user_id === profile.user_id).length || 0;
        const reportOrdersCount = reportOrders?.filter(ro => ro.user_id === profile.user_id).length || 0;

        return {
          id: profile.user_id,
          email: profile.email || 'N/A',
          full_name: profile.full_name || 'N/A',
          created_at: profile.created_at,
          subscription_tier: subscription?.subscription_tier,
          status: subscription?.status,
          followed_companies_count: followedCount,
          report_orders_count: reportOrdersCount,
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionBadge = (tier?: string, status?: string) => {
    if (!tier || status !== 'active') {
      return <Badge variant="outline">Free</Badge>;
    }

    switch (tier) {
      case 'standard':
        return <Badge variant="default">Standard</Badge>;
      case 'premium':
        return <Badge variant="secondary">Premium</Badge>;
      case 'enterprise':
        return <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User promoted to admin successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to promote user',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.subscription_tier === 'premium' && u.status === 'active').length;
  const enterpriseUsers = users.filter(u => u.subscription_tier === 'enterprise' && u.status === 'active').length;
  const activeUsers = users.filter(u => u.followed_companies_count > 0 || u.report_orders_count > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={fetchUsers} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise Users</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Followed Companies</TableHead>
                <TableHead>Report Orders</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSubscriptionBadge(user.subscription_tier, user.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {user.followed_companies_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.report_orders_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(user.created_at).toLocaleDateString('da-DK')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => promoteToAdmin(user.id)}
                    >
                      Make Admin
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
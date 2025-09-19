import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Crown, 
  Search,
  Calendar,
  Building2,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface UserOverviewStats {
  totalUsers: number;
  standardUsers: number;
  premiumUsers: number;
  enterpriseUsers: number;
  freeUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  activeUsers30d: number;
  churnRate: number;
  newSignups7d: number;
}

interface UserData {
  id: string;
  email: string;
  full_name: string;
  signup_date: string;
  last_login: string;
  current_plan: string;
  status: string;
  companies_followed: number;
  reports_ordered: number;
  total_spent: number;
  engagement_score: number;
}

interface GrowthTrendData {
  date: string;
  signups: number;
  cumulative: number;
  churned: number;
}

interface PlanDistributionData {
  plan: string;
  users: number;
  revenue: number;
  color: string;
}

interface TopEngagementUser {
  id: string;
  name: string;
  email: string;
  companies_followed: number;
  reports_ordered: number;
  engagement_score: number;
  plan: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const UserManagement: React.FC = () => {
  const [stats, setStats] = useState<UserOverviewStats>({
    totalUsers: 0,
    standardUsers: 0,
    premiumUsers: 0,
    enterpriseUsers: 0,
    freeUsers: 0,
    activeUsers24h: 0,
    activeUsers7d: 0,
    activeUsers30d: 0,
    churnRate: 0,
    newSignups7d: 0,
  });
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [growthTrend, setGrowthTrend] = useState<GrowthTrendData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistributionData[]>([]);
  const [topEngagementUsers, setTopEngagementUsers] = useState<TopEngagementUser[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof UserData>('signup_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch subscription data
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*');

      if (subError) throw subError;

      // Fetch followed companies data
      const { data: followedCompanies, error: followError } = await supabase
        .from('followed_companies')
        .select('user_id, company_name, created_at');

      if (followError) throw followError;

      // Fetch report orders data
      const { data: reportOrders, error: ordersError } = await supabase
        .from('report_orders')
        .select('user_id, amount_cents, status, created_at');

      if (ordersError) throw ordersError;

      // Process user data
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Create user subscription map
      const userSubscriptions = new Map();
      subscriptions?.forEach(sub => {
        userSubscriptions.set(sub.user_id, sub);
      });

      // Create user companies map
      const userCompaniesCount = new Map();
      followedCompanies?.forEach(fc => {
        const count = userCompaniesCount.get(fc.user_id) || 0;
        userCompaniesCount.set(fc.user_id, count + 1);
      });

      // Create user orders map
      const userOrdersData = new Map();
      reportOrders?.forEach(order => {
        const existing = userOrdersData.get(order.user_id) || { count: 0, total: 0 };
        userOrdersData.set(order.user_id, {
          count: existing.count + 1,
          total: existing.total + (order.status === 'completed' ? order.amount_cents / 100 : 0),
        });
      });

      // Process users
      const processedUsers: UserData[] = profiles?.map(profile => {
        const subscription = userSubscriptions.get(profile.user_id);
        const companiesCount = userCompaniesCount.get(profile.user_id) || 0;
        const orderData = userOrdersData.get(profile.user_id) || { count: 0, total: 0 };
        
        // Calculate engagement score
        const engagementScore = (companiesCount * 2) + (orderData.count * 5) + (orderData.total * 0.1);
        
        return {
          id: profile.user_id,
          email: profile.email || 'No email',
          full_name: profile.full_name || 'Unknown User',
          signup_date: profile.created_at,
          last_login: profile.updated_at, // Mock - would be actual last login
          current_plan: subscription?.subscription_tier || 'free',
          status: subscription?.status || 'free',
          companies_followed: companiesCount,
          reports_ordered: orderData.count,
          total_spent: orderData.total,
          engagement_score: Math.round(engagementScore),
        };
      }) || [];

      setUsers(processedUsers);
      setFilteredUsers(processedUsers);

      // Calculate stats
      const totalUsers = processedUsers.length;
      const standardUsers = processedUsers.filter(u => u.current_plan === 'standard').length;
      const premiumUsers = processedUsers.filter(u => u.current_plan === 'premium').length;
      const enterpriseUsers = processedUsers.filter(u => u.current_plan === 'enterprise').length;
      const freeUsers = processedUsers.filter(u => u.current_plan === 'free').length;
      
      // Mock active users (would need activity tracking)
      const activeUsers24h = Math.floor(totalUsers * 0.15);
      const activeUsers7d = Math.floor(totalUsers * 0.4);
      const activeUsers30d = Math.floor(totalUsers * 0.7);
      
      // Mock churn rate
      const churnRate = 2.3;
      
      // Calculate new signups in last 7 days
      const newSignups7d = processedUsers.filter(u => 
        new Date(u.signup_date) >= sevenDaysAgo
      ).length;

      setStats({
        totalUsers,
        standardUsers,
        premiumUsers,
        enterpriseUsers,
        freeUsers,
        activeUsers24h,
        activeUsers7d,
        activeUsers30d,
        churnRate,
        newSignups7d,
      });

      // Generate growth trend data
      const trendData: GrowthTrendData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('da-DK', { month: 'short', day: 'numeric' });
        
        const signupsThisDay = processedUsers.filter(u => {
          const signupDate = new Date(u.signup_date);
          return signupDate.toDateString() === date.toDateString();
        }).length;
        
        const cumulativeUsers = processedUsers.filter(u => 
          new Date(u.signup_date) <= date
        ).length;
        
        trendData.push({
          date: dateStr,
          signups: signupsThisDay,
          cumulative: cumulativeUsers,
          churned: Math.floor(Math.random() * 3), // Mock churn data
        });
      }
      setGrowthTrend(trendData);

      // Plan distribution data
      const planData: PlanDistributionData[] = [
        { plan: 'Free', users: freeUsers, revenue: 0, color: COLORS[0] },
        { plan: 'Standard', users: standardUsers, revenue: standardUsers * 99, color: COLORS[1] },
        { plan: 'Premium', users: premiumUsers, revenue: premiumUsers * 299, color: COLORS[2] },
        { plan: 'Enterprise', users: enterpriseUsers, revenue: enterpriseUsers * 599, color: COLORS[3] },
      ];
      setPlanDistribution(planData);

      // Top engagement users
      const topEngagement: TopEngagementUser[] = processedUsers
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .slice(0, 10)
        .map(u => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          companies_followed: u.companies_followed,
          reports_ordered: u.reports_ordered,
          engagement_score: u.engagement_score,
          plan: u.current_plan,
        }));
      setTopEngagementUsers(topEngagement);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.current_plan === planFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, planFilter, sortField, sortDirection]);

  const handleSort = (field: keyof UserData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'free':
        return <Badge variant="outline">Free</Badge>;
      case 'standard':
        return <Badge variant="secondary">Standard</Badge>;
      case 'premium':
        return <Badge variant="default">Premium</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-600 hover:bg-purple-700">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Insights & Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user analytics, engagement metrics, and management tools
          </p>
        </div>
        <Button onClick={fetchUserData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* User Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newSignups7d} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (7d)</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers7d}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers24h} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              Monthly churn rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers - stats.freeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.totalUsers - stats.freeUsers) / stats.totalUsers * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Trend */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={growthTrend}>
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--primary))"
                fill="url(#cumulativeGradient)"
                name="Total Users"
              />
              <Bar yAxisId="right" dataKey="signups" fill="hsl(var(--secondary))" name="New Signups" />
              <Bar yAxisId="right" dataKey="churned" fill="hsl(var(--destructive))" name="Churned" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="users"
                  label={({ plan, users }) => `${plan}: ${users}`}
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {planDistribution.map((plan, index) => (
                <div key={plan.plan} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                    <span>{plan.plan}</span>
                  </div>
                  <span className="font-medium">{plan.users} users</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Users Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Active Users Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Last 24 Hours</div>
                  <div className="text-sm text-muted-foreground">Daily active users</div>
                </div>
                <div className="text-xl font-bold">{stats.activeUsers24h}</div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Last 7 Days</div>
                  <div className="text-sm text-muted-foreground">Weekly active users</div>
                </div>
                <div className="text-xl font-bold">{stats.activeUsers7d}</div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Last 30 Days</div>
                  <div className="text-sm text-muted-foreground">Monthly active users</div>
                </div>
                <div className="text-xl font-bold">{stats.activeUsers30d}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Engagement Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Users by Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEngagementUsers.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{getPlanBadge(user.plan)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{user.engagement_score}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.companies_followed}C, {user.reports_ordered}R
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Full User List</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('signup_date')}
                  >
                    <div className="flex items-center gap-1">
                      Signup Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('companies_followed')}
                  >
                    <div className="flex items-center gap-1">
                      Companies
                      <Building2 className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('reports_ordered')}
                  >
                    <div className="flex items-center gap-1">
                      Reports
                      <FileText className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('total_spent')}
                  >
                    Total Spent
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('last_login')}
                  >
                    Last Login
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">{user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(user.signup_date).toLocaleDateString('da-DK')}
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(user.current_plan)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.companies_followed}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.reports_ordered}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(user.total_spent)}</TableCell>
                    <TableCell>
                      {new Date(user.last_login).toLocaleDateString('da-DK')}
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
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
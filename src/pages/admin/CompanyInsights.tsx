import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, Users, Activity, Calendar, Clock, FileText, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, ComposedChart, PieChart, Pie, Cell } from 'recharts';

interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  newCompanies24h: number;
  newCompanies7d: number;
  newCompanies30d: number;
  companiesUpdated24h: number;
  companiesUpdated7d: number;
}

interface TopCompany {
  company_name: string;
  company_cvr: string;
  followers: number;
  recent_updates: number;
  growth_7d?: number;
  report_orders?: number;
}

interface CompanyTrendData {
  date: string;
  new_companies: number;
  total_companies: number;
  followers: number;
}

interface UpdateTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface FollowGrowthData {
  company_name: string;
  company_cvr: string;
  data: Array<{ date: string; followers: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export const CompanyInsights: React.FC = () => {
  const [stats, setStats] = useState<CompanyStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    newCompanies24h: 0,
    newCompanies7d: 0,
    newCompanies30d: 0,
    companiesUpdated24h: 0,
    companiesUpdated7d: 0,
  });
  
  const [topFollowedCompanies, setTopFollowedCompanies] = useState<TopCompany[]>([]);
  const [mostUpdatedCompanies, setMostUpdatedCompanies] = useState<TopCompany[]>([]);
  const [fastestGrowingCompanies, setFastestGrowingCompanies] = useState<TopCompany[]>([]);
  const [companiesWithRecentUpdates, setCompaniesWithRecentUpdates] = useState<TopCompany[]>([]);
  const [topReportOrderCompanies, setTopReportOrderCompanies] = useState<TopCompany[]>([]);
  
  const [companyTrends, setCompanyTrends] = useState<CompanyTrendData[]>([]);
  const [updateTypes, setUpdateTypes] = useState<UpdateTypeData[]>([]);
  const [followGrowthData, setFollowGrowthData] = useState<FollowGrowthData[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyInsights = async () => {
      try {
        // Fetch followed companies data
        const { data: followedCompanies, error: followError } = await supabase
          .from('followed_companies')
          .select('company_name, company_cvr, created_at, updated_at');

        if (followError) throw followError;

        // Fetch report orders for company analysis
        const { data: reportOrders, error: ordersError } = await supabase
          .from('report_orders')
          .select('company_name, company_cvr, amount_cents, status, created_at');

        if (ordersError) throw ordersError;

        // Calculate basic stats
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Create unique companies map with additional data
        const uniqueCompanies = new Map();
        followedCompanies?.forEach(company => {
          const key = company.company_cvr;
          if (!uniqueCompanies.has(key)) {
            uniqueCompanies.set(key, {
              name: company.company_name,
              cvr: company.company_cvr,
              firstFollowed: new Date(company.created_at),
              lastUpdated: new Date(company.updated_at),
              followers: 0,
            });
          }
          // Count followers
          const existing = uniqueCompanies.get(key);
          existing.followers += 1;
          uniqueCompanies.set(key, existing);
        });

        const totalCompanies = uniqueCompanies.size;
        const activeCompanies = Math.floor(totalCompanies * 0.85); // Mock calculation
        const inactiveCompanies = totalCompanies - activeCompanies;

        const newCompanies24h = Array.from(uniqueCompanies.values()).filter(
          c => c.firstFollowed >= oneDayAgo
        ).length;
        const newCompanies7d = Array.from(uniqueCompanies.values()).filter(
          c => c.firstFollowed >= sevenDaysAgo
        ).length;
        const newCompanies30d = Array.from(uniqueCompanies.values()).filter(
          c => c.firstFollowed >= thirtyDaysAgo
        ).length;

        // Mock update tracking (in real app, you'd have an updates table)
        const companiesUpdated24h = Math.floor(totalCompanies * 0.05);
        const companiesUpdated7d = Math.floor(totalCompanies * 0.25);

        setStats({
          totalCompanies,
          activeCompanies,
          inactiveCompanies,
          newCompanies24h,
          newCompanies7d,
          newCompanies30d,
          companiesUpdated24h,
          companiesUpdated7d,
        });

        // Top followed companies
        const topFollowed = Array.from(uniqueCompanies.entries())
          .map(([cvr, data]) => ({
            company_name: data.name,
            company_cvr: cvr,
            followers: data.followers,
            recent_updates: Math.floor(Math.random() * 10),
            growth_7d: Math.floor(Math.random() * 50),
          }))
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 10);

        setTopFollowedCompanies(topFollowed);

        // Most updated companies (mock data - sorted by recent updates)
        const mostUpdated = [...topFollowed]
          .sort((a, b) => b.recent_updates - a.recent_updates)
          .slice(0, 5);

        setMostUpdatedCompanies(mostUpdated);

        // Fastest growing companies (sorted by 7-day growth)
        const fastestGrowing = [...topFollowed]
          .sort((a, b) => (b.growth_7d || 0) - (a.growth_7d || 0))
          .slice(0, 5);

        setFastestGrowingCompanies(fastestGrowing);

        // Companies with recent updates (24h)
        const recentUpdates = [...topFollowed]
          .filter(() => Math.random() > 0.7) // Mock filter for companies with recent updates
          .slice(0, 5);

        setCompaniesWithRecentUpdates(recentUpdates);

        // Calculate report orders by company
        const ordersByCompany = new Map<string, number>();
        reportOrders?.forEach(order => {
          const key = order.company_cvr;
          const current = ordersByCompany.get(key) || 0;
          ordersByCompany.set(key, current + 1);
        });

        const topReportCompanies = Array.from(ordersByCompany.entries())
          .map(([cvr, orders]) => {
            const companyData = uniqueCompanies.get(cvr);
            return {
              company_name: companyData?.name || 'Unknown',
              company_cvr: cvr,
              followers: companyData?.followers || 0,
              recent_updates: Math.floor(Math.random() * 10),
              report_orders: orders,
            };
          })
          .sort((a, b) => (b.report_orders || 0) - (a.report_orders || 0))
          .slice(0, 10);

        setTopReportOrderCompanies(topReportCompanies);

        // Generate trend data for the last 30 days
        const trendData: CompanyTrendData[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('da-DK', { month: 'short', day: 'numeric' });
          
          // Mock trend data (in real app, track daily metrics)
          const baseCompanies = Math.floor(totalCompanies * (0.6 + (29 - i) * 0.013));
          const newToday = Math.floor(Math.random() * 5);
          const followersToday = Math.floor(Math.random() * 100) + 50;
          
          trendData.push({
            date: dateStr,
            new_companies: newToday,
            total_companies: baseCompanies + newToday,
            followers: followersToday,
          });
        }
        setCompanyTrends(trendData);

        // Update types breakdown (mock data)
        const updateTypesData: UpdateTypeData[] = [
          { type: 'Board Changes', count: 45, percentage: 35 },
          { type: 'Financial Reports', count: 38, percentage: 30 },
          { type: 'Legal Filings', count: 25, percentage: 20 },
          { type: 'Address Changes', count: 12, percentage: 9 },
          { type: 'Ownership Changes', count: 8, percentage: 6 },
        ];
        setUpdateTypes(updateTypesData);

        // Follow growth data for top companies (mock)
        const growthData: FollowGrowthData[] = topFollowed.slice(0, 3).map(company => ({
          company_name: company.company_name,
          company_cvr: company.company_cvr,
          data: Array.from({ length: 14 }, (_, i) => ({
            date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('da-DK', { month: 'short', day: 'numeric' }),
            followers: Math.floor(company.followers * (0.7 + i * 0.02)) + Math.floor(Math.random() * 10),
          })),
        }));
        setFollowGrowthData(growthData);

      } catch (error) {
        console.error('Error fetching company insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInsights();
  }, []);

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Insights</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics on company data, engagement, and growth trends
        </p>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{stats.activeCompanies} Active</Badge>
              <Badge variant="outline">{stats.inactiveCompanies} Inactive</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Companies (24h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCompanies24h}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newCompanies7d} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Updated (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.companiesUpdated24h}</div>
            <p className="text-xs text-muted-foreground">
              {stats.companiesUpdated7d} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New (30d)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCompanies30d}</div>
            <p className="text-xs text-muted-foreground">
              Monthly growth trend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company Growth Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Company Growth Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={companyTrends}>
              <defs>
                <linearGradient id="companiesGradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="total_companies"
                stroke="hsl(var(--primary))"
                fill="url(#companiesGradient)"
                name="Total Companies"
              />
              <Bar yAxisId="right" dataKey="new_companies" fill="hsl(var(--secondary))" name="New Companies" />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="followers" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                name="New Followers"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Company Updates Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={updateTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                >
                  {updateTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {updateTypes.map((update, index) => (
                <div key={update.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span>{update.type}</span>
                  </div>
                  <span className="font-medium">{update.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Follow Growth Chart for Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Follow Growth (Top 3 Companies)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={followGrowthData[0]?.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                {followGrowthData.map((company, index) => (
                  <Line
                    key={company.company_cvr}
                    type="monotone"
                    dataKey="followers"
                    data={company.data}
                    stroke={COLORS[index]}
                    strokeWidth={2}
                    name={company.company_name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Followed Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top 10 Most Followed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFollowedCompanies.map((company, index) => (
                <div key={company.company_cvr} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{company.company_name}</div>
                      <div className="text-sm text-muted-foreground">CVR: {company.company_cvr}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{company.followers}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Updated Companies (7d) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Most Updated (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostUpdatedCompanies.map((company, index) => (
                <div key={company.company_cvr} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{company.company_name}</div>
                      <div className="text-sm text-muted-foreground">CVR: {company.company_cvr}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{company.recent_updates} updates</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fastest Growing Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fastest Growing (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fastestGrowingCompanies.map((company, index) => (
                <div key={company.company_cvr} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{company.company_name}</div>
                      <div className="text-sm text-muted-foreground">CVR: {company.company_cvr}</div>
                    </div>
                  </div>
                  <Badge variant="outline">+{company.growth_7d}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Companies with Recent Updates (24h) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Updates (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-2xl font-bold">{stats.companiesUpdated24h}</div>
              <p className="text-sm text-muted-foreground">Companies with updates in last 24 hours</p>
            </div>
            <div className="space-y-3">
              {companiesWithRecentUpdates.map((company, index) => (
                <div key={company.company_cvr} className="flex items-center justify-between py-2 border-l-4 border-primary pl-3">
                  <div>
                    <div className="font-medium">{company.company_name}</div>
                    <div className="text-sm text-muted-foreground">CVR: {company.company_cvr}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Changes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Report Order Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Top Report Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topReportOrderCompanies.map((company, index) => (
                <div key={company.company_cvr} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{company.company_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {company.followers} followers • CVR: {company.company_cvr}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{company.report_orders} orders</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
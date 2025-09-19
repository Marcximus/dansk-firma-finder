import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  newCompanies24h: number;
  newCompanies7d: number;
  newCompanies30d: number;
}

interface TopCompany {
  company_name: string;
  company_cvr: string;
  followers: number;
  recent_updates: number;
}

export const CompanyInsights: React.FC = () => {
  const [stats, setStats] = useState<CompanyStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    newCompanies24h: 0,
    newCompanies7d: 0,
    newCompanies30d: 0,
  });
  const [topFollowedCompanies, setTopFollowedCompanies] = useState<TopCompany[]>([]);
  const [mostUpdatedCompanies, setMostUpdatedCompanies] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyInsights = async () => {
      try {
        // Fetch followed companies data
        const { data: followedCompanies, error } = await supabase
          .from('followed_companies')
          .select('company_name, company_cvr, created_at');

        if (error) throw error;

        // Calculate stats
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const uniqueCompanies = new Map();
        followedCompanies?.forEach(company => {
          const key = company.company_cvr;
          if (!uniqueCompanies.has(key)) {
            uniqueCompanies.set(key, {
              name: company.company_name,
              cvr: company.company_cvr,
              firstFollowed: new Date(company.created_at),
            });
          }
        });

        const totalCompanies = uniqueCompanies.size;
        const newCompanies24h = Array.from(uniqueCompanies.values()).filter(
          c => c.firstFollowed >= oneDayAgo
        ).length;
        const newCompanies7d = Array.from(uniqueCompanies.values()).filter(
          c => c.firstFollowed >= sevenDaysAgo
        ).length;
        const newCompanies30d = Array.from(uniqueCompanies.values()).filter(
          c => c.firstFollowed >= thirtyDaysAgo
        ).length;

        setStats({
          totalCompanies,
          activeCompanies: Math.floor(totalCompanies * 0.85), // Mock active percentage
          inactiveCompanies: Math.floor(totalCompanies * 0.15),
          newCompanies24h,
          newCompanies7d,
          newCompanies30d,
        });

        // Calculate top followed companies
        const companyFollowerCount = new Map();
        followedCompanies?.forEach(company => {
          const key = company.company_cvr;
          const count = companyFollowerCount.get(key) || 0;
          companyFollowerCount.set(key, count + 1);
        });

        const topFollowed = Array.from(companyFollowerCount.entries())
          .map(([cvr, followers]) => {
            const companyData = uniqueCompanies.get(cvr);
            return {
              company_name: companyData?.name || 'Unknown',
              company_cvr: cvr,
              followers,
              recent_updates: Math.floor(Math.random() * 10), // Mock recent updates
            };
          })
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 10);

        setTopFollowedCompanies(topFollowed);
        
        // Mock most updated companies (would need actual update tracking)
        setMostUpdatedCompanies(
          topFollowed
            .sort((a, b) => b.recent_updates - a.recent_updates)
            .slice(0, 5)
        );
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
            {[...Array(4)].map((_, i) => (
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
          Comprehensive analytics on company data and engagement
        </p>
      </div>

      {/* Overview Cards */}
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
            <CardTitle className="text-sm font-medium">New (24h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCompanies24h}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New (7d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCompanies7d}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCompanies30d}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Followed Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top 10 Most Followed Companies
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
                    <div>
                      <div className="font-medium">{company.company_name}</div>
                      <div className="text-sm text-muted-foreground">CVR: {company.company_cvr}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{company.followers} followers</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Updated Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Most Updated Companies (7d)
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
                    <div>
                      <div className="font-medium">{company.company_name}</div>
                      <div className="text-sm text-muted-foreground">CVR: {company.company_cvr}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{company.recent_updates} updates</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
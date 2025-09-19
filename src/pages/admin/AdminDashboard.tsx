import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, DollarSign, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { AdminMetricsCards } from '@/components/admin/AdminMetricsCards';
import { UserGrowthChart } from '@/components/admin/charts/UserGrowthChart';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { TopCompaniesChart } from '@/components/admin/charts/TopCompaniesChart';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome to the admin panel
        </div>
      </div>

      {/* Overview Cards */}
      <AdminMetricsCards />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top 10 Most Followed Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopCompaniesChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanyData {
  name: string;
  followers: number;
  cvr: string;
}

export const TopCompaniesChart: React.FC = () => {
  const [data, setData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCompanies = async () => {
      try {
        // Get company follow counts
        const { data: followedCompanies } = await supabase
          .from('followed_companies')
          .select('company_name, company_cvr');

        if (!followedCompanies) return;

        // Count followers per company
        const companyMap = new Map<string, { name: string; cvr: string; followers: number }>();
        
        followedCompanies.forEach(company => {
          const key = company.company_cvr;
          if (companyMap.has(key)) {
            companyMap.get(key)!.followers += 1;
          } else {
            companyMap.set(key, {
              name: company.company_name,
              cvr: company.company_cvr,
              followers: 1,
            });
          }
        });

        // Sort by followers and take top 10
        const sortedCompanies = Array.from(companyMap.values())
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 10)
          .map(company => ({
            name: company.name.length > 25 ? company.name.substring(0, 25) + '...' : company.name,
            followers: company.followers,
            cvr: company.cvr,
          }));

        setData(sortedCompanies);
      } catch (error) {
        console.error('Error fetching top companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCompanies();
  }, []);

  if (loading) {
    return <Skeleton className="w-full h-64" />;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            type="category"
            dataKey="name"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={150}
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Followers']}
            labelFormatter={(label: string, payload) => {
              const data = payload?.[0]?.payload;
              return data ? `${data.name} (CVR: ${data.cvr})` : label;
            }}
          />
          <Bar 
            dataKey="followers" 
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
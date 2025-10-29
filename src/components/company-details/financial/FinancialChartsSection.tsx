import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users } from 'lucide-react';
import { FinancialYearData } from '@/services/utils/mockFinancialData';

interface FinancialChartsSectionProps {
  historicalData: FinancialYearData[];
}

const FinancialChartsSection: React.FC<FinancialChartsSectionProps> = ({ historicalData }) => {
  // Format data for charts - reverse to show most recent on the left
  const chartData = historicalData.map(data => ({
    year: data.year.toString(),
    nettoomsaetning: Math.round(data.nettoomsaetning / 1000000), // Convert to millions
    bruttofortjeneste: Math.round(data.bruttofortjeneste / 1000000),
    aaretsResultat: Math.round(data.aaretsResultat / 1000000),
    egenkapital: Math.round(data.egenkapital / 1000000),
    antalAnsatte: data.antalAnsatte
  })).reverse();

  const formatCurrency = (value: number) => `${value} mio. DKK`;
  const formatEmployees = (value: number) => `${value} ansatte`;
  
  // Custom tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">År {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value} {entry.name === 'Antal ansatte' ? 'ansatte' : 'mio. DKK'}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5" />
        <h4 className="font-semibold text-lg">Finansiel udvikling</h4>
      </div>

      {/* Revenue and Profit Trend */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-primary" />
            Omsætning og resultat (mio. DKK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNettoomsaetning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorBruttofortjeneste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => 
                  value === 'nettoomsaetning' ? 'Nettoomsætning' : 
                  value === 'bruttofortjeneste' ? 'Bruttofortjeneste' : 'Årets resultat'
                }
              />
              <Area 
                type="monotone" 
                dataKey="nettoomsaetning" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#colorNettoomsaetning)"
              />
              <Area 
                type="monotone" 
                dataKey="bruttofortjeneste" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                fill="url(#colorBruttofortjeneste)"
              />
              <Line 
                type="monotone" 
                dataKey="aaretsResultat" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 5, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 7, stroke: "hsl(var(--chart-3))", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Employee Development */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-chart-4" />
            Medarbejderudvikling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={1}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatEmployees}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="antalAnsatte" 
                fill="url(#colorEmployees)"
                radius={[6, 6, 0, 0]}
                name="Antal ansatte"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Health Overview */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-chart-5" />
            Egenkapital udvikling (mio. DKK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEgenkapital" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="egenkapital"
                stroke="hsl(var(--chart-5))"
                strokeWidth={0}
                fill="url(#colorEgenkapital)"
              />
              <Line 
                type="monotone" 
                dataKey="egenkapital" 
                stroke="hsl(var(--chart-5))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-5))", strokeWidth: 2, r: 5, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 7, stroke: "hsl(var(--chart-5))", strokeWidth: 2 }}
                name="Egenkapital"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialChartsSection;
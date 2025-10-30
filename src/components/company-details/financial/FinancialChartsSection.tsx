import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';
import { TrendingUp, DollarSign, TrendingDown } from 'lucide-react';
import { FinancialYearData } from '@/services/utils/mockFinancialData';

interface FinancialChartsSectionProps {
  historicalData: FinancialYearData[];
}

const FinancialChartsSection: React.FC<FinancialChartsSectionProps> = ({ historicalData }) => {
  // Format data for charts - oldest to newest (left to right)
  const chartData = historicalData.map(data => ({
    year: data.year.toString(),
    nettoomsaetning: Math.round(data.nettoomsaetning / 1000000), // Convert to millions
    bruttofortjeneste: Math.round(data.bruttofortjeneste / 1000000),
    aaretsResultat: Math.round(data.aaretsResultat / 1000000),
    egenkapital: Math.round(data.egenkapital / 1000000)
  })).slice().reverse();

  // Determine if data is predominantly positive or negative
  const hasNegativeResult = chartData.some(d => d.aaretsResultat < 0);
  const hasPositiveResult = chartData.some(d => d.aaretsResultat > 0);
  const allNegativeResult = hasNegativeResult && !hasPositiveResult;

  const hasNegativeEquity = chartData.some(d => d.egenkapital < 0);
  const hasPositiveEquity = chartData.some(d => d.egenkapital > 0);
  const allNegativeEquity = hasNegativeEquity && !hasPositiveEquity;

  const formatCurrency = (value: number) => `${value} mio. DKK`;

  // Check if all nettoomsaetning values are 0
  const allRevenueZero = chartData.every(d => d.nettoomsaetning === 0);
  const revenueKey = allRevenueZero ? 'bruttofortjeneste' : 'nettoomsaetning';
  const revenueLabel = allRevenueZero ? 'Bruttofortjeneste' : 'Nettoomsætning';

  // Chart config for dual-line chart
  const revenueAndResultConfig = {
    [revenueKey]: {
      label: revenueLabel,
      color: "hsl(142, 76%, 36%)",
    },
    aaretsResultat: {
      label: "Årets resultat",
      color: allNegativeResult ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)",
    },
  } satisfies ChartConfig;

  // Chart config for equity chart
  const equityConfig = {
    egenkapital: {
      label: "Egenkapital",
      color: allNegativeEquity ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5" />
        <h4 className="font-semibold text-lg">Finansiel udvikling</h4>
      </div>

      {/* Revenue & Result Combined Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {revenueLabel} & Årets resultat (mio. DKK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueAndResultConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorResultPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorResultNegative" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.3}
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 13 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                className="text-sm"
                tickFormatter={formatCurrency}
                width={80}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name
                    ]}
                    labelFormatter={(label) => `År ${label}`}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area 
                type="monotone" 
                dataKey={revenueKey}
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2.5}
                fill="url(#colorRevenueGradient)"
                dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Area 
                type="monotone" 
                dataKey="aaretsResultat" 
                stroke={allNegativeResult ? "hsl(0, 70%, 55%)" : "hsl(217, 91%, 60%)"}
                strokeWidth={2.5}
                fill={allNegativeResult ? "url(#colorResultNegative)" : "url(#colorResultPositive)"}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const value = payload.aaretsResultat;
                  const color = value < 0 ? "hsl(0, 70%, 55%)" : "hsl(217, 91%, 60%)";
                  return <circle cx={cx} cy={cy} r={4} fill={color} strokeWidth={2} stroke={color} />;
                }}
                activeDot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const value = payload.aaretsResultat;
                  const color = value < 0 ? "hsl(0, 70%, 55%)" : "hsl(217, 91%, 60%)";
                  return <circle cx={cx} cy={cy} r={6} fill={color} stroke={color} />;
                }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Financial Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Egenkapital udvikling (mio. DKK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={equityConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorEquityPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorEquityNegative" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.3}
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 13 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                className="text-sm"
                tickFormatter={formatCurrency}
                domain={[(dataMin: number) => Math.floor(dataMin * 0.9), (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                width={80}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value: number) => [formatCurrency(value), 'Egenkapital']}
                    labelFormatter={(label) => `År ${label}`}
                  />
                }
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area 
                type="monotone" 
                dataKey="egenkapital" 
                stroke={allNegativeEquity ? "hsl(0, 70%, 55%)" : "hsl(217, 91%, 60%)"} 
                strokeWidth={2.5}
                fill={allNegativeEquity ? "url(#colorEquityNegative)" : "url(#colorEquityPositive)"}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const value = payload.egenkapital;
                  const color = value < 0 ? "hsl(0, 70%, 55%)" : "hsl(217, 91%, 60%)";
                  return <circle cx={cx} cy={cy} r={4} fill={color} strokeWidth={2} stroke={color} />;
                }}
                activeDot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const value = payload.egenkapital;
                  const color = value < 0 ? "hsl(0, 70%, 55%)" : "hsl(217, 91%, 60%)";
                  return <circle cx={cx} cy={cy} r={6} fill={color} stroke={color} />;
                }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialChartsSection;
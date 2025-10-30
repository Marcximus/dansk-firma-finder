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

  // Chart config for dual-line chart
  const revenueAndResultConfig = {
    nettoomsaetning: {
      label: "Nettoomsætning",
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
            Nettoomsætning & Årets resultat (mio. DKK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueAndResultConfig} className="h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
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
              <Line 
                type="monotone" 
                dataKey="nettoomsaetning" 
                stroke="var(--color-nettoomsaetning)"
                strokeWidth={3}
                dot={{ fill: "var(--color-nettoomsaetning)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="aaretsResultat" 
                stroke="var(--color-aaretsResultat)"
                strokeWidth={3}
                dot={{ fill: "var(--color-aaretsResultat)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
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
                <linearGradient id="colorEquityGradient" x1="0" y1="0" x2="0" y2="1">
                  {allNegativeEquity ? (
                    // All negative: Red at top (negative values), fading down towards zero
                    <>
                      <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                    </>
                  ) : hasNegativeEquity && hasPositiveEquity ? (
                    // Mixed: Blue top (positive), red bottom (negative)
                    <>
                      <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6}/>
                      <stop offset="50%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1}/>
                      <stop offset="50%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                      <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.6}/>
                    </>
                  ) : (
                    // All positive: Blue at top, fading down
                    <>
                      <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1}/>
                    </>
                  )}
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
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
                stroke={allNegativeEquity ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)"} 
                strokeWidth={2.5}
                fill="url(#colorEquityGradient)"
                dot={{ fill: allNegativeEquity ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialChartsSection;
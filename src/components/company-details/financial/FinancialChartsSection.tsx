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
  const chartData = historicalData.map(data => {
    const aaretsResultat = Math.round(data.aaretsResultat / 1000000);
    const egenkapital = Math.round(data.egenkapital / 1000000);
    
    return {
      year: data.year.toString(),
      nettoomsaetning: Math.round(data.nettoomsaetning / 1000000), // Convert to millions
      bruttofortjeneste: Math.round(data.bruttofortjeneste / 1000000),
      aaretsResultat,
      egenkapital,
      // Split positive and negative values for area rendering
      aaretsResultatPositive: aaretsResultat >= 0 ? aaretsResultat : 0,
      aaretsResultatNegative: aaretsResultat < 0 ? aaretsResultat : 0,
      egenkapitalPositive: egenkapital >= 0 ? egenkapital : 0,
      egenkapitalNegative: egenkapital < 0 ? egenkapital : 0,
    };
  }).slice().reverse();

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
              
              {/* Revenue line - no area fill */}
              <Line 
                type="monotone" 
                dataKey={revenueKey}
                stroke={`var(--color-${revenueKey})`}
                strokeWidth={3}
                dot={{ fill: `var(--color-${revenueKey})`, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
              
              {/* Negative area for Årets resultat - red fill below zero (NO STROKE) */}
              <Area
                type="monotone"
                dataKey="aaretsResultatNegative"
                stroke="none"
                strokeWidth={0}
                fill="hsl(0, 84%, 60%)"
                fillOpacity={0.15}
                connectNulls={false}
              />
              
              {/* Positive area for Årets resultat - blue fill above zero (NO STROKE) */}
              <Area
                type="monotone"
                dataKey="aaretsResultatPositive"
                stroke="none"
                strokeWidth={0}
                fill="hsl(217, 91%, 60%)"
                fillOpacity={0.2}
                connectNulls={false}
              />
              
              {/* Continuous line for Årets resultat on top */}
              <Line 
                type="monotone" 
                dataKey="aaretsResultat"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={3}
                dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
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
              
              {/* Negative area for Egenkapital - red fill below zero (NO STROKE) */}
              <Area
                type="monotone"
                dataKey="egenkapitalNegative"
                stroke="none"
                strokeWidth={0}
                fill="hsl(0, 84%, 60%)"
                fillOpacity={0.15}
                connectNulls={false}
              />
              
              {/* Positive area for Egenkapital - blue fill above zero (NO STROKE) */}
              <Area
                type="monotone"
                dataKey="egenkapitalPositive"
                stroke="none"
                strokeWidth={0}
                fill="hsl(217, 91%, 60%)"
                fillOpacity={0.2}
                connectNulls={false}
              />
              
              {/* Continuous line for Egenkapital on top */}
              <Line 
                type="monotone" 
                dataKey="egenkapital"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2.5}
                dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2, r: 5 }}
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
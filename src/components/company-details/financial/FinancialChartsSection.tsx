import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, ComposedChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer as OldChartContainer, ChartTooltip as OldChartTooltip, ChartTooltipContent as OldChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig as OldChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/line-charts-1';
import { TrendingUp, DollarSign } from 'lucide-react';
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
  const revenueKeyArea = `${revenueKey}Area`;

  // Chart config for dual-line chart
  const revenueAndResultConfig = {
    [revenueKey]: {
      label: revenueLabel,
      color: "hsl(var(--chart-1))",
    },
    aaretsResultat: {
      label: "Årets resultat",
      color: allNegativeResult ? "hsl(var(--destructive))" : "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  // Add area data for gradient
  const chartDataWithArea = chartData.map(d => ({
    ...d,
    [revenueKeyArea]: d[revenueKey]
  }));

  // Custom chart label component
  const ChartLabel = ({ label, color }: { label: string; color: string }) => {
    return (
      <div className="flex items-center gap-1.5">
        <div className="size-3.5 border-4 rounded-full bg-background" style={{ borderColor: color }}></div>
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
    );
  };

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const filteredPayload = payload.filter((entry) => entry.dataKey !== revenueKeyArea);

      return (
        <div className="rounded-lg border bg-popover p-3 shadow-sm shadow-black/5 min-w-[180px]">
          <div className="text-xs font-medium text-muted-foreground tracking-wide mb-2.5">{label && `År ${label}`}</div>
          <div className="space-y-2">
            {filteredPayload.map((entry, index) => {
              const config = revenueAndResultConfig[entry.dataKey as keyof typeof revenueAndResultConfig];
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <ChartLabel label={config?.label + ':'} color={entry.color} />
                  <span className="font-semibold text-popover-foreground">{formatCurrency(entry.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Chart config for equity chart
  const equityConfig = {
    egenkapital: {
      label: "Egenkapital",
      color: allNegativeEquity ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)",
    },
  } satisfies OldChartConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5" />
        <h4 className="font-semibold text-lg">Finansiel udvikling</h4>
      </div>

      {/* Revenue & Result Combined Chart */}
      <Card>
        <CardHeader className="border-0 min-h-auto pt-6 pb-6">
          <CardTitle className="text-base font-semibold">{revenueLabel} & Årets resultat</CardTitle>
          <div className="flex items-center gap-4 text-sm ms-auto">
            <ChartLabel label={revenueLabel} color={revenueAndResultConfig[revenueKey].color} />
            <ChartLabel label="Årets resultat" color={revenueAndResultConfig.aaretsResultat.color} />
          </div>
        </CardHeader>
        <CardContent className="px-2.5">
          <ChartContainer
            config={revenueAndResultConfig}
            className="h-[350px] w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
          >
            <ComposedChart
              data={chartDataWithArea}
              margin={{
                top: 5,
                right: 15,
                left: 5,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={revenueAndResultConfig[revenueKey].color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={revenueAndResultConfig[revenueKey].color} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--input)"
                strokeOpacity={1}
                horizontal={true}
                vertical={false}
              />

              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, className: 'text-muted-foreground' }}
                dy={5}
                tickMargin={12}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, className: 'text-muted-foreground' }}
                tickFormatter={formatCurrency}
                tickMargin={12}
              />

              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />

              <ChartTooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: 'var(--input)',
                  strokeWidth: 1,
                  strokeDasharray: 'none',
                }}
              />

              {/* Revenue area with gradient */}
              <Area
                type="linear"
                dataKey={revenueKeyArea}
                stroke="transparent"
                fill="url(#revenueGradient)"
                strokeWidth={0}
                dot={false}
              />

              {/* Revenue line */}
              <Line
                type="linear"
                dataKey={revenueKey}
                stroke={revenueAndResultConfig[revenueKey].color}
                strokeWidth={2}
                dot={{
                  fill: 'var(--background)',
                  strokeWidth: 2,
                  r: 6,
                  stroke: revenueAndResultConfig[revenueKey].color,
                }}
              />

              {/* Result line (dashed) */}
              <Line
                type="linear"
                dataKey="aaretsResultat"
                stroke={revenueAndResultConfig.aaretsResultat.color}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{
                  fill: 'var(--background)',
                  strokeWidth: 2,
                  r: 6,
                  stroke: revenueAndResultConfig.aaretsResultat.color,
                  strokeDasharray: '0',
                }}
              />
            </ComposedChart>
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
          <OldChartContainer config={equityConfig} className="h-[300px] w-full">
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
              <OldChartTooltip 
                content={
                  <OldChartTooltipContent 
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
          </OldChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialChartsSection;
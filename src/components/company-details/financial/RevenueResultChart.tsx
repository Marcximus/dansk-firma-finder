import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart';
import { DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { FinancialYearData } from '@/services/utils/mockFinancialData';

interface RevenueResultChartProps {
  historicalData: FinancialYearData[];
}

const RevenueResultChart: React.FC<RevenueResultChartProps> = ({ historicalData }) => {
  // Format data for charts - oldest to newest (left to right)
  const chartData = historicalData.map(data => ({
    year: data.year.toString(),
    nettoomsaetning: Math.round(data.nettoomsaetning / 1000000),
    bruttofortjeneste: Math.round(data.bruttofortjeneste / 1000000),
    aaretsResultat: Math.round(data.aaretsResultat / 1000000),
  })).slice().reverse();

  // Determine if data is predominantly positive or negative
  const hasNegativeResult = chartData.some(d => d.aaretsResultat < 0);
  const hasPositiveResult = chartData.some(d => d.aaretsResultat > 0);
  const allNegativeResult = hasNegativeResult && !hasPositiveResult;

  const formatCurrency = (value: number) => `${value} mio. DKK`;

  // Check if all nettoomsaetning values are 0
  const allRevenueZero = chartData.every(d => d.nettoomsaetning === 0);
  const revenueKey = allRevenueZero ? 'bruttofortjeneste' : 'nettoomsaetning';
  const revenueLabel = allRevenueZero ? 'Bruttofortjeneste' : 'Nettoomsætning';

  // Chart config for dual-line chart
  const revenueAndResultConfig = {
    [revenueKey]: {
      label: revenueLabel,
      color: "hsl(217, 91%, 60%)",
    },
    aaretsResultat: {
      label: "Årets resultat",
      color: allNegativeResult ? "hsl(0, 84%, 60%)" : "hsl(142, 76%, 36%)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {revenueLabel} & Årets resultat (mio. DKK)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueAndResultConfig} className="h-[300px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
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
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                
                const data = payload[0].payload;
                const currentIndex = chartData.findIndex(d => d.year === data.year);
                const previousData = currentIndex > 0 ? chartData[currentIndex - 1] : null;
                
                const revenueValue = data[revenueKey];
                const resultValue = data.aaretsResultat;
                
                let revenueChange = null;
                let resultChange = null;
                
                if (previousData) {
                  const prevRevenue = previousData[revenueKey];
                  const prevResult = previousData.aaretsResultat;
                  
                  if (prevRevenue !== 0) {
                    const change = ((revenueValue - prevRevenue) / Math.abs(prevRevenue)) * 100;
                    revenueChange = {
                      value: Math.abs(change),
                      isPositive: change > 0,
                      absolute: revenueValue - prevRevenue
                    };
                  }
                  
                  if (prevResult !== 0) {
                    const change = ((resultValue - prevResult) / Math.abs(prevResult)) * 100;
                    resultChange = {
                      value: Math.abs(change),
                      isPositive: change > 0,
                      absolute: resultValue - prevResult
                    };
                  }
                }
                
                return (
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                    <div className="space-y-3">
                      <div className="font-semibold text-sm border-b pb-2">
                        År {data.year}
                      </div>
                      
                      {/* Revenue */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-6">
                          <span className="text-xs text-muted-foreground">{revenueLabel}:</span>
                          <span className="font-semibold text-sm">{formatCurrency(revenueValue)}</span>
                        </div>
                        {revenueChange && (
                          <div className="flex items-center gap-2 text-xs">
                            {revenueChange.isPositive ? (
                              <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                            )}
                            <span className={revenueChange.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {revenueChange.isPositive ? '+' : '-'}{revenueChange.value.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground">
                              ({revenueChange.isPositive ? '+' : ''}{formatCurrency(revenueChange.absolute)})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Result */}
                      <div className="space-y-1 pt-2 border-t">
                        <div className="flex justify-between items-center gap-6">
                          <span className="text-xs text-muted-foreground">Årets resultat:</span>
                          <span className={`font-semibold text-sm ${resultValue < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formatCurrency(resultValue)}
                          </span>
                        </div>
                        {resultChange && (
                          <div className="flex items-center gap-2 text-xs">
                            {resultChange.isPositive ? (
                              <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                            )}
                            <span className={resultChange.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {resultChange.isPositive ? '+' : '-'}{resultChange.value.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground">
                              ({resultChange.isPositive ? '+' : ''}{formatCurrency(resultChange.absolute)})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Profit Margin */}
                      {revenueValue > 0 && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center gap-6">
                            <span className="text-xs text-muted-foreground">Overskudsgrad:</span>
                            <span className="font-semibold text-sm">
                              {((resultValue / revenueValue) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Line 
              type="monotone" 
              dataKey={revenueKey}
              stroke={`var(--color-${revenueKey})`}
              strokeWidth={3}
              dot={{ fill: `var(--color-${revenueKey})`, strokeWidth: 2, r: 5 }}
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
  );
};

export default RevenueResultChart;

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartConfig } from '@/components/ui/chart';
import { DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { FinancialYearData } from '@/services/utils/mockFinancialData';

interface EquityChartProps {
  historicalData: FinancialYearData[];
}

const EquityChart: React.FC<EquityChartProps> = ({ historicalData }) => {
  const chartData = historicalData.map(data => ({
    year: data.year.toString(),
    egenkapital: Math.round(data.egenkapital / 1000000)
  })).slice().reverse();

  const hasNegativeEquity = chartData.some(d => d.egenkapital < 0);
  const hasPositiveEquity = chartData.some(d => d.egenkapital > 0);
  const allNegativeEquity = hasNegativeEquity && !hasPositiveEquity;

  const formatCurrency = (value: number) => `${value} mio. DKK`;

  const equityConfig = {
    egenkapital: {
      label: "Egenkapital",
      color: allNegativeEquity ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)",
    },
  } satisfies ChartConfig;

  return (
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
                  <>
                    <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                  </>
                ) : hasNegativeEquity && hasPositiveEquity ? (
                  <>
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6}/>
                    <stop offset="50%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1}/>
                    <stop offset="50%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                    <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.6}/>
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1}/>
                  </>
                )}
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
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                
                const data = payload[0].payload;
                const currentIndex = chartData.findIndex(d => d.year === data.year);
                const previousData = currentIndex > 0 ? chartData[currentIndex - 1] : null;
                
                const equityValue = data.egenkapital;
                
                let equityChange = null;
                
                if (previousData) {
                  const prevEquity = previousData.egenkapital;
                  
                  if (prevEquity !== 0) {
                    const change = ((equityValue - prevEquity) / Math.abs(prevEquity)) * 100;
                    equityChange = {
                      value: Math.abs(change),
                      isPositive: change > 0,
                      absolute: equityValue - prevEquity
                    };
                  }
                }
                
                return (
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                    <div className="space-y-3">
                      <div className="font-semibold text-sm border-b pb-2">
                        År {data.year}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-6">
                          <span className="text-xs text-muted-foreground">Egenkapital:</span>
                          <span className={`font-semibold text-sm ${equityValue < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formatCurrency(equityValue)}
                          </span>
                        </div>
                        {equityChange && (
                          <div className="flex items-center gap-2 text-xs">
                            {equityChange.isPositive ? (
                              <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                            )}
                            <span className={equityChange.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {equityChange.isPositive ? '+' : '-'}{equityChange.value.toFixed(1)}%
                            </span>
                            <span className="text-muted-foreground">
                              ({equityChange.isPositive ? '+' : ''}{formatCurrency(equityChange.absolute)})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Status:</span>
                          {equityValue > 0 ? (
                            <span className="font-medium text-green-600 dark:text-green-400">Positiv egenkapital</span>
                          ) : equityValue === 0 ? (
                            <span className="font-medium text-amber-600 dark:text-amber-400">Neutral</span>
                          ) : (
                            <span className="font-medium text-red-600 dark:text-red-400">Negativ egenkapital</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
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
  );
};

export default EquityChart;

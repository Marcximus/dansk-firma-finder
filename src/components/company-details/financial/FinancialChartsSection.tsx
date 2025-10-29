import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5" />
        <h4 className="font-semibold text-lg">Finansiel udvikling</h4>
      </div>

      {/* Årets Resultat Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Årets Resultat (mio. DKK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorResultGradient" x1="0" y1="0" x2="0" y2="1">
                  {allNegativeResult ? (
                    // All negative: Red at top (negative values), fading down towards zero
                    <>
                      <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                    </>
                  ) : hasNegativeResult && hasPositiveResult ? (
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
                domain={[(dataMin: number) => Math.floor(dataMin * 1.1), (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                width={80}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Årets resultat']}
                labelFormatter={(label) => `År ${label}`}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area 
                type="monotone" 
                dataKey="aaretsResultat" 
                stroke={allNegativeResult ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)"} 
                strokeWidth={2.5}
                fill="url(#colorResultGradient)"
                dot={{ fill: allNegativeResult ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={300}>
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
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Egenkapital']}
                labelFormatter={(label) => `År ${label}`}
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
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialChartsSection;
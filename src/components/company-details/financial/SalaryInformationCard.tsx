import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, TrendingUp, TrendingDown, Users, Award, Calculator, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalaryInformationCardProps {
  historicalData: any[];
  quarterlyEmployment: any[];
}

interface SalaryMetrics {
  avgEmployeeSalaryLow: number;
  avgEmployeeSalaryHigh: number;
  avgPartTimeSalaryLow: number;
  avgPartTimeSalaryHigh: number;
  estimatedCEOSalaryLow: number;
  estimatedCEOSalaryHigh: number;
  revenuePerEmployee: number;
  salaryCostPercentage: number;
  ceoRatioLow: number;
  ceoRatioHigh: number;
  partTimeCount: number;
  hasRevenue: boolean;
}

const SalaryInformationCard: React.FC<SalaryInformationCardProps> = ({ historicalData, quarterlyEmployment }) => {
  // Get the most recent period with personnel cost data
  const latestData = historicalData.find(d => d.personaleomkostninger && d.personaleomkostninger > 0);
  
  if (!latestData || !latestData.personaleomkostninger) {
    return null;
  }

  // Get the most recent quarterly employment data
  const latestQuarterly = quarterlyEmployment?.[0]; // Already sorted newest first
  const antalAnsatte = latestQuarterly?.antalAnsatte || 0;
  const antalAarsvaerk = latestQuarterly?.antalAarsvaerk || 0;
  
  const personaleomkostninger = latestData.personaleomkostninger;
  const nettoomsaetning = latestData.nettoomsaetning || 0;

  // Calculate salary metrics
  const metrics = useMemo((): SalaryMetrics => {
    const partTimeCount = Math.max(0, antalAnsatte - antalAarsvaerk);
    
    // Average employee salary range (70-80% of personnel costs)
    const avgEmployeeSalaryLow = antalAnsatte > 0 
      ? (personaleomkostninger * 0.70) / antalAnsatte / 12
      : 0;
    const avgEmployeeSalaryHigh = antalAnsatte > 0 
      ? (personaleomkostninger * 0.80) / antalAnsatte / 12
      : 0;

    // Part-time employee average range (5-10% of personnel costs)
    const avgPartTimeSalaryLow = partTimeCount > 0
      ? (personaleomkostninger * 0.05) / partTimeCount / 12
      : 0;
    const avgPartTimeSalaryHigh = partTimeCount > 0
      ? (personaleomkostninger * 0.10) / partTimeCount / 12
      : 0;

    // CEO salary estimates (15-30% of personnel costs)
    const estimatedCEOSalaryLow = (personaleomkostninger * 0.15) / 12;
    const estimatedCEOSalaryHigh = (personaleomkostninger * 0.30) / 12;

    // Productivity metrics (use mid-range 75% for calculations)
    const avgEmployeeSalaryMid = antalAnsatte > 0 
      ? (personaleomkostninger * 0.75) / antalAnsatte / 12
      : 0;
    
    const revenuePerEmployee = antalAnsatte > 0 && nettoomsaetning > 0
      ? nettoomsaetning / antalAnsatte
      : 0;

    const salaryCostPercentage = nettoomsaetning > 0
      ? (personaleomkostninger / nettoomsaetning) * 100
      : 0;

    // CEO ratio (using mid-range employee salary)
    const ceoRatioLow = avgEmployeeSalaryMid > 0 ? estimatedCEOSalaryLow / avgEmployeeSalaryMid : 0;
    const ceoRatioHigh = avgEmployeeSalaryMid > 0 ? estimatedCEOSalaryHigh / avgEmployeeSalaryMid : 0;

    return {
      avgEmployeeSalaryLow,
      avgEmployeeSalaryHigh,
      avgPartTimeSalaryLow,
      avgPartTimeSalaryHigh,
      estimatedCEOSalaryLow,
      estimatedCEOSalaryHigh,
      revenuePerEmployee,
      salaryCostPercentage,
      ceoRatioLow,
      ceoRatioHigh,
      partTimeCount,
      hasRevenue: nettoomsaetning > 0
    };
  }, [personaleomkostninger, antalAnsatte, antalAarsvaerk, nettoomsaetning]);

  // Process historical data for trend chart
  const trendData = useMemo(() => {
    // Create year → employment map from quarterly data
    const employmentByYear = new Map<number, { antalAnsatte: number; antalAarsvaerk: number }[]>();
    quarterlyEmployment.forEach(q => {
      const year = q.aar;
      if (!employmentByYear.has(year)) {
        employmentByYear.set(year, []);
      }
      employmentByYear.get(year)!.push({
        antalAnsatte: q.antalAnsatte || 0,
        antalAarsvaerk: q.antalAarsvaerk || 0
      });
    });

    // Calculate yearly averages
    const yearlyAvgEmployment = new Map<number, { antalAnsatte: number; antalAarsvaerk: number }>();
    employmentByYear.forEach((quarters, year) => {
      const avgAnsatte = quarters.reduce((sum, q) => sum + q.antalAnsatte, 0) / quarters.length;
      const avgAarsvaerk = quarters.reduce((sum, q) => sum + q.antalAarsvaerk, 0) / quarters.length;
      yearlyAvgEmployment.set(year, {
        antalAnsatte: Math.round(avgAnsatte),
        antalAarsvaerk: avgAarsvaerk
      });
    });

    return historicalData
      .filter(d => d.personaleomkostninger > 0)
      .slice(0, 5) // Last 5 years
      .map(d => {
        const employment = yearlyAvgEmployment.get(d.year) || { antalAnsatte: 0, antalAarsvaerk: 0 };
        if (employment.antalAnsatte === 0) return null;
        
        const avgSalary = ((d.personaleomkostninger * 0.75) / employment.antalAnsatte / 12);
        const ceoSalaryMid = ((d.personaleomkostninger * 0.225) / 12);
        const ratio = avgSalary > 0 ? ceoSalaryMid / avgSalary : 0;
        
        return {
          periode: d.periode,
          avgSalary: Math.round(avgSalary),
          ceoRatio: parseFloat(ratio.toFixed(1))
        };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null)
      .reverse(); // Oldest to newest
  }, [historicalData, quarterlyEmployment]);

  // Calculate year-over-year change
  const yoyChange = useMemo(() => {
    if (trendData.length < 2) return null;
    
    const current = trendData[trendData.length - 1].avgSalary;
    const previous = trendData[trendData.length - 2].avgSalary;
    const change = ((current - previous) / previous) * 100;
    
    return {
      value: Math.abs(change),
      isPositive: change > 0
    };
  }, [trendData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Lønforhold og Produktivitet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Personnel Costs */}
          <div className="pb-4 border-b">
            <div className="text-sm text-muted-foreground mb-1">
              Samlede personaleomkostninger ({latestData.periode})
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(personaleomkostninger)}
            </div>
            {yoyChange && (
              <div className="flex items-center gap-1 mt-1 text-xs">
                {yoyChange.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={yoyChange.isPositive ? 'text-green-500' : 'text-red-500'}>
                  {formatPercent(yoyChange.value)} vs. sidste år
                </span>
              </div>
            )}
          </div>

          {/* Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Average Employee Salary */}
            {antalAnsatte > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-help">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      Gennemsnitlig medarbejderløn
                    </div>
                    <div className="text-xl font-bold">
                      {formatCurrency(metrics.avgEmployeeSalaryLow)} - {formatCurrency(metrics.avgEmployeeSalaryHigh)}
                      <span className="text-sm font-normal text-muted-foreground">/md</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(metrics.avgEmployeeSalaryLow * 12)} - {formatCurrency(metrics.avgEmployeeSalaryHigh * 12)} årligt
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {antalAnsatte} medarbejder{antalAnsatte !== 1 ? 'e' : ''}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    Estimeret ud fra 70-80% af personaleomkostninger fordelt på alle medarbejdere.
                    Inkluderer løn, pension og sociale bidrag.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Part-time Salary */}
            {metrics.partTimeCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-help">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      Gennemsnitlig deltidsmedarbejderløn
                    </div>
                    <div className="text-xl font-bold">
                      {formatCurrency(metrics.avgPartTimeSalaryLow)} - {formatCurrency(metrics.avgPartTimeSalaryHigh)}
                      <span className="text-sm font-normal text-muted-foreground">/md</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(metrics.avgPartTimeSalaryLow * 12)} - {formatCurrency(metrics.avgPartTimeSalaryHigh * 12)} årligt
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ~{metrics.partTimeCount.toFixed(0)} deltidsansatte
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">
                    Estimeret ud fra 5-10% af personaleomkostninger fordelt på deltidsansatte.
                    Antal deltidsansatte = Total ansatte - Årsværk.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* CEO Salary Estimate */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-help">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Award className="h-4 w-4" />
                    Estimeret CEO-løn
                  </div>
                  <div className="text-xl font-bold">
                    {formatCurrency(metrics.estimatedCEOSalaryLow)} - {formatCurrency(metrics.estimatedCEOSalaryHigh)}
                    <span className="text-sm font-normal text-muted-foreground">/md</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(metrics.estimatedCEOSalaryLow * 12)} - {formatCurrency(metrics.estimatedCEOSalaryHigh * 12)} årligt
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Baseret på branchegennemsnit
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">
                  Typisk ledelsesvederlag udgør 15-30% af samlede personaleomkostninger
                  i danske virksomheder. Dette er et estimat baseret på branchemønstre.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Productivity Metrics */}
          {metrics.hasRevenue && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calculator className="h-4 w-4" />
                Produktivitetsmetrikker
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Revenue per Employee */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1 p-3 rounded-lg border bg-muted/30 cursor-help">
                      <div className="text-xs text-muted-foreground">
                        Omsætning pr. medarbejder
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(metrics.revenuePerEmployee)}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Nettoomsætning ÷ Antal medarbejdere</p>
                  </TooltipContent>
                </Tooltip>

                {/* Salary Cost Percentage */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1 p-3 rounded-lg border bg-muted/30 cursor-help">
                      <div className="text-xs text-muted-foreground">
                        Lønomkostninger af omsætning
                      </div>
                      <div className="text-lg font-semibold">
                        {formatPercent(metrics.salaryCostPercentage)}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">(Personaleomkostninger ÷ Nettoomsætning) × 100</p>
                  </TooltipContent>
                </Tooltip>

                {/* CEO Ratio */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1 p-3 rounded-lg border bg-muted/30 cursor-help">
                      <div className="text-xs text-muted-foreground">
                        CEO-løn ratio
                      </div>
                      <div className="text-lg font-semibold">
                        {metrics.ceoRatioLow.toFixed(1)}x - {metrics.ceoRatioHigh.toFixed(1)}x
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">CEO-løn ÷ Gennemsnitlig medarbejderløn</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Historical Trend Chart */}
          {trendData.length >= 2 && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-3">
                Lønudvikling over tid
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="periode" 
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `${value}x`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Gennemsnitlig løn') {
                        return [formatCurrency(value), name];
                      }
                      return [`${value}x`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line 
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgSalary" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Gennemsnitlig løn"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone"
                    dataKey="ceoRatio" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="CEO ratio"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Disclaimer */}
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-xs text-foreground/80 space-y-2">
              <p className="font-semibold">Vigtig information om beregninger:</p>
              <div className="space-y-1">
                <p><strong>Personaleomkostninger inkluderer:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Løn og honorarer</li>
                  <li>Pensionsbidrag (typisk 10-15%)</li>
                  <li>Sociale omkostninger (AER, barsel, sygdom)</li>
                  <li>Andre personaleydelser</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p><strong>Estimerede lønniveauer:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>Medarbejderløn: 70-80% af personaleomkostninger</li>
                  <li>Deltidsløn: 5-10% af personaleomkostninger (hvis deltidsansatte)</li>
                  <li>CEO-løn: 15-30% af personaleomkostninger (branchegennemsnit)</li>
                  <li>Faktiske individuelle lønninger kan variere betydeligt</li>
                </ul>
              </div>
              <p className="italic">Disse tal er estimater og bør behandles som vejledende.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default SalaryInformationCard;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FinancialSpreadsheetProps {
  historicalData: any[];
}

const FinancialSpreadsheet: React.FC<FinancialSpreadsheetProps> = ({ historicalData }) => {
  console.log('[FinancialSpreadsheet] Received data:', historicalData.map(d => ({ 
    year: d.year, 
    periode: d.periode,
    hasData: !!d.nettoomsaetning || !!d.egenkapital
  })));
  
  // Data is already sorted by edge function and financialUtils - just take first 5
  const periods = historicalData.slice(0, 5);
  
  // Extract display years for the quality indicator
  const displayYears = periods.map(p => p.year).filter(y => y);
  
  console.log('[FinancialSpreadsheet] Displaying 5 most recent periods:', {
    count: periods.length,
    years: displayYears,
    periods: periods.map(d => d.periode)
  });
  
  // Format number in thousands with Danish locale
  const formatThousands = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    const thousands = Math.round(value / 1000);
    return thousands.toLocaleString('da-DK');
  };
  
  // Format percentage with 1 decimal
  const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(1);
  };

  if (periods.length === 0) {
    return null;
  }

  // Helper to get clean year label from periode
  const getYearLabel = (periode: string): string => {
    // Handle full date range: "2023-01-01 - 2023-12-31"
    const rangeMatch = periode.match(/(\d{4})-\d{2}-\d{2}\s*-\s*(\d{4})-\d{2}-\d{2}/);
    if (rangeMatch && rangeMatch[2]) {
      return `${rangeMatch[2]}`;
    }
    
    // Handle simple format: "2024-12"
    const yearMatch = periode.match(/(\d{4})/);
    if (yearMatch) {
      return yearMatch[1];
    }
    
    return periode;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Regnskabsdata</CardTitle>
        {displayYears.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Viser regnskabsdata for {displayYears.length === 1 ? 'seneste år' : `de seneste ${displayYears.length} år`}: {displayYears.join(', ')}
            {displayYears.length < 5 && ` • Kun ${displayYears.length} års data tilgængelig`}
          </p>
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <div className="border-t">
          {/* Income Statement */}
          <div className="border-b">
            <div className="bg-muted/30 px-4 py-2">
              <h3 className="font-semibold text-sm">Resultat i 1000 DKK</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="sticky left-0 bg-background min-w-[160px] h-8 text-xs font-medium">Post</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right h-8 text-xs font-medium px-3">
                      {getYearLabel(period.periode)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Nettoomsætning</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.nettoomsaetning)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Bruttofortjeneste</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.bruttofortjeneste)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Driftsresultat (EBIT)</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.driftsresultat)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Resultat før skat</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.resultatFoerSkat)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Årets Resultat</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.aaretsResultat)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Balance Sheet */}
          <div className="border-b">
            <div className="bg-muted/30 px-4 py-2">
              <h3 className="font-semibold text-sm">Balance i 1000 DKK</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="sticky left-0 bg-background min-w-[160px] h-8 text-xs font-medium">Post</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right h-8 text-xs font-medium px-3">
                      {getYearLabel(period.periode)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Anlægsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.anlaegsaktiverValue)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Omsætningsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.omsaetningsaktiver)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Egenkapital</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.egenkapital)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Hensatte forpligtelser</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.hensatteForpligtelser)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Gældsforpligtelser</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.gaeldsforpligtelser)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Årets balance</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatThousands(period.statusBalance)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Key Ratios */}
          <div>
            <div className="bg-muted/30 px-4 py-2">
              <h3 className="font-semibold text-sm">Nøgletal i %</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="sticky left-0 bg-background min-w-[160px] h-8 text-xs font-medium">Nøgletal</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right h-8 text-xs font-medium px-3">
                      {getYearLabel(period.periode)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Soliditetsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatPercent(period.soliditetsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Likviditetsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatPercent(period.likviditetsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Afkastningsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatPercent(period.afkastningsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5">Overskudsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 px-3">{formatPercent(period.overskudsgrad)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSpreadsheet;

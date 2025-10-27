import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FinancialSpreadsheetProps {
  historicalData: any[];
}

const FinancialSpreadsheet: React.FC<FinancialSpreadsheetProps> = ({ historicalData }) => {
  // Get up to 5 most recent years
  const periods = historicalData.slice(0, 5);
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regnskabsdata</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="space-y-6">
          {/* Income Statement */}
          <div>
            <h3 className="font-semibold mb-2">Resultat i 1000 DKK</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background min-w-[180px]">Post</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right">{period.periode}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Nettoomsætning</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.nettoomsaetning)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Bruttofortjeneste</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.bruttofortjeneste)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Driftsresultat (EBIT)</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.driftsresultat)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Resultat før skat</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.resultatFoerSkat)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Årets Resultat</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.aaretsResultat)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Balance Sheet */}
          <div>
            <h3 className="font-semibold mb-2">Balance i 1000 DKK</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background min-w-[180px]">Post</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right">{period.periode}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Anlægsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.anlaegsaktiverValue)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Omsætningsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.omsaetningsaktiver)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Egenkapital</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.egenkapital)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Hensatte forpligtelser</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.hensatteForpligtelser)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Gældsforpligtelser</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.gaeldsforpligtelser)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Årets balance</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatThousands(period.statusBalance)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Key Ratios */}
          <div>
            <h3 className="font-semibold mb-2">Nøgletal i %</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background min-w-[180px]">Nøgletal</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right">{period.periode}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Soliditetsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatPercent(period.soliditetsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Likviditetsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatPercent(period.likviditetsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Afkastningsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatPercent(period.afkastningsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-background font-medium">Overskudsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right">{formatPercent(period.overskudsgrad)}</TableCell>
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

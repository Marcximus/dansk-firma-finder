import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface EquityStatementCardProps {
  historicalData: any[];
}

const EquityStatementCard: React.FC<EquityStatementCardProps> = ({ historicalData }) => {
  // Function to format currency in DKK thousands
  const formatThousands = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return Math.round(value / 1000).toLocaleString('da-DK');
  };

  // Calculate equity movements between periods
  const calculateEquityStatement = (currentPeriod: any, previousPeriod: any) => {
    const current = {
      virksomhedskapital: currentPeriod.virksomhedskapital || 0,
      overkurs: currentPeriod.overkursVedEmission || 0,
      overfoertResultat: currentPeriod.overfoertResultat || 0,
      total: currentPeriod.egenkapital || 0,
    };

    const previous = previousPeriod ? {
      virksomhedskapital: previousPeriod.virksomhedskapital || 0,
      overkurs: previousPeriod.overkursVedEmission || 0,
      overfoertResultat: previousPeriod.overfoertResultat || 0,
      total: previousPeriod.egenkapital || 0,
    } : null;

    // Calculate changes
    const changes = previous ? {
      virksomhedskapital: current.virksomhedskapital - previous.virksomhedskapital,
      overkurs: current.overkurs - previous.overkurs,
      overfoertResultat: current.overfoertResultat - previous.overfoertResultat,
      aaretsResultat: currentPeriod.aaretsResultat || 0,
    } : null;

    // Calculate derived movements
    let overkursTransfer = 0;
    let capitalIncrease = { virksomhedskapital: 0, overkurs: 0, total: 0 };

    if (changes) {
      // If overkurs decreased AND retained earnings increased by same amount -> transfer
      if (changes.overkurs < 0 && changes.overfoertResultat > Math.abs(changes.aaretsResultat)) {
        const potentialTransfer = Math.abs(changes.overkurs);
        const retainedIncrease = changes.overfoertResultat - changes.aaretsResultat;
        overkursTransfer = Math.min(potentialTransfer, retainedIncrease);
      }

      // Calculate capital increase (increase in share capital + overkurs that's not from transfer)
      if (changes.virksomhedskapital > 0 || changes.overkurs > 0) {
        capitalIncrease = {
          virksomhedskapital: Math.max(0, changes.virksomhedskapital),
          overkurs: Math.max(0, changes.overkurs),
          total: Math.max(0, changes.virksomhedskapital) + Math.max(0, changes.overkurs),
        };
      }
    }

    return {
      opening: previous,
      closing: current,
      changes,
      movements: {
        capitalIncrease,
        aaretsResultat: currentPeriod.aaretsResultat || 0,
        overkursTransfer,
      }
    };
  };

  // Only show last 2-3 years of equity statements
  const periodsToShow = historicalData.slice(0, Math.min(3, historicalData.length));

  // Check if we have the necessary data
  const hasEquityData = periodsToShow.some(period => 
    (period.virksomhedskapital || 0) !== 0 || 
    (period.overkursVedEmission || 0) !== 0 || 
    (period.overfoertResultat || 0) !== 0
  );

  if (!hasEquityData) {
    return null; // Don't render if no equity breakdown available
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Egenkapitalopgørelse
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Udvikling i egenkapitalens bestanddele
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {periodsToShow.map((period, index) => {
            const previousPeriod = index < historicalData.length - 1 ? historicalData[index + 1] : null;
            const statement = calculateEquityStatement(period, previousPeriod);
            
            if (!statement.opening) return null; // Skip first period if no previous data

            return (
              <div key={period.year} className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Periode: {period.periode || period.year}
                </h3>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="font-semibold">Specifikation</TableHead>
                        <TableHead className="text-right font-semibold whitespace-nowrap">Virksomheds-<br/>kapital</TableHead>
                        <TableHead className="text-right font-semibold whitespace-nowrap">Overkurs ved<br/>emission</TableHead>
                        <TableHead className="text-right font-semibold whitespace-nowrap">Overført<br/>resultat</TableHead>
                        <TableHead className="text-right font-semibold">I alt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {/* Opening Balance */}
                      <TableRow className="bg-muted/30">
                        <TableCell className="font-medium">
                          Egenkapital primo {previousPeriod.year}
                        </TableCell>
                        <TableCell className="text-right">{formatThousands(statement.opening.virksomhedskapital)}</TableCell>
                        <TableCell className="text-right">{formatThousands(statement.opening.overkurs)}</TableCell>
                        <TableCell className="text-right">{formatThousands(statement.opening.overfoertResultat)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatThousands(statement.opening.total)}</TableCell>
                      </TableRow>

                      {/* Capital Increase */}
                      {statement.movements.capitalIncrease.total > 0 && (
                        <TableRow>
                          <TableCell className="pl-4 text-muted-foreground">
                            Kontant kapitalforhøjelse
                          </TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400">
                            {formatThousands(statement.movements.capitalIncrease.virksomhedskapital)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400">
                            {formatThousands(statement.movements.capitalIncrease.overkurs)}
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right text-green-600 dark:text-green-400 font-medium">
                            {formatThousands(statement.movements.capitalIncrease.total)}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Year's Result */}
                      <TableRow>
                        <TableCell className="pl-4 text-muted-foreground">
                          Årets resultat
                        </TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className="text-right">-</TableCell>
                        <TableCell className={`text-right ${
                          statement.movements.aaretsResultat >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatThousands(statement.movements.aaretsResultat)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          statement.movements.aaretsResultat >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatThousands(statement.movements.aaretsResultat)}
                        </TableCell>
                      </TableRow>

                      {/* Transfer from Share Premium */}
                      {statement.movements.overkursTransfer > 0 && (
                        <TableRow>
                          <TableCell className="pl-4 text-muted-foreground">
                            Overført fra overkurs ved emission
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right text-amber-600 dark:text-amber-400">
                            -{formatThousands(statement.movements.overkursTransfer)}
                          </TableCell>
                          <TableCell className="text-right text-amber-600 dark:text-amber-400">
                            {formatThousands(statement.movements.overkursTransfer)}
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                        </TableRow>
                      )}

                      {/* Closing Balance */}
                      <TableRow className="bg-muted/50 font-semibold border-t-2">
                        <TableCell className="font-bold">
                          Egenkapital ultimo {period.year}
                        </TableCell>
                        <TableCell className="text-right">{formatThousands(statement.closing.virksomhedskapital)}</TableCell>
                        <TableCell className="text-right">{formatThousands(statement.closing.overkurs)}</TableCell>
                        <TableCell className="text-right">{formatThousands(statement.closing.overfoertResultat)}</TableCell>
                        <TableCell className="text-right font-bold">{formatThousands(statement.closing.total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Summary indicators */}
                <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                  {statement.movements.capitalIncrease.total > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span>Kapitalforhøjelse: {formatThousands(statement.movements.capitalIncrease.total)} tdkr.</span>
                    </div>
                  )}
                  {statement.movements.aaretsResultat < 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span>Underskud: {formatThousands(Math.abs(statement.movements.aaretsResultat))} tdkr.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg">
          <strong>Note:</strong> Alle beløb er i tusind DKK (tdkr.). Egenkapitalopgørelsen viser udviklingen i 
          virksomhedens egenkapital opdelt på virksomhedskapital (aktie-/anpartskapital), overkurs ved emission 
          (beløb ud over nominel værdi ved kapitaltilførsel) og overført resultat (akkumuleret over-/underskud).
        </div>
      </CardContent>
    </Card>
  );
};

export default EquityStatementCard;

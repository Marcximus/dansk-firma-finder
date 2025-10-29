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
                  <TableHead className="sticky left-0 bg-background w-[200px] h-8 text-xs font-medium">Post</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right h-8 text-xs font-medium w-[120px]">
                      {period.year || getYearLabel(period.periode)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Level 1: Primary Total */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-bold text-sm py-2 w-[200px] bg-muted/20">Nettoomsætning</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-semibold text-sm py-2 w-[120px]">{formatThousands(period.nettoomsaetning)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Bruttofortjeneste</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.bruttofortjeneste)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Bruttotab</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{period.bruttotab ? formatThousands(period.bruttotab) : '-'}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Personaleomkostninger</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.personaleomkostninger)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-6 text-muted-foreground">Afskrivninger</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.afskrivninger)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Resultat af primær drift</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.resultatAfPrimaerDrift || period.driftsresultat)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-6 text-muted-foreground">Finansielle indtægter</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.finansielleIndtaegter)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-6 text-muted-foreground">Finansielle omkostninger</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.finansielleOmkostninger)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Driftsresultat (EBIT)</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.driftsresultat)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Resultat før skat</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.resultatFoerSkat)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-6 text-muted-foreground">Skat af årets resultat</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.skatAfAaretsResultat)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 1: Primary Total */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-bold text-sm py-2 w-[200px] bg-muted/20 border-t-2">Årets Resultat</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-semibold text-sm py-2 w-[120px] border-t-2">{formatThousands(period.aaretsResultat)}</TableCell>
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
                  <TableHead className="sticky left-0 bg-background w-[200px] h-8 text-xs font-medium">Post</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right h-8 text-xs font-medium w-[120px]">
                      {getYearLabel(period.periode)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Anlægsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.anlaegsaktiverValue)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Immaterielle anlægsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.immaterielleAnlaeggsaktiver)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Materielle anlægsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.materielleAnlaeggsaktiver)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Andre anlæg, driftsmateriel og inventar</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.andreAnlaegDriftsmaterielOgInventar)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Finansielle anlægsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.finansielleAnlaeggsaktiver)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Deposita</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.deposita)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Omsætningsaktiver</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.omsaetningsaktiver)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Varebeholdninger</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.varebeholdninger)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Tilgodehavender</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.tilgodehavender)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Tilgodehavender fra salg</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.tilgodehavenderFraSalg)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Andre tilgodehavender</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.andreTilgodehavender)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Krav på indbetaling af virksomhedskapital</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.kravPaaIndbetalingAfVirksomhedskapital)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Periodeafgrænsningsposter</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.periodeafgraensningsporterAktiver)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Likvide midler</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.likviderMidler)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Egenkapital</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.egenkapital)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Virksomhedskapital</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.virksomhedskapital)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Overført resultat</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.overfoertResultat)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Hensatte forpligtelser</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.hensatteForpligtelser)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t">Gældsforpligtelser</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.gaeldsforpligtelser)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Langfristet gæld</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.langfristetGaeld)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Leverandører af varer</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.leverandoererAfVarer)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Gæld til associerede virksomheder</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.gaeldTilAssocieretVirksomhed)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4">Anden gæld</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.andenGaeld)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Skyldige moms og afgifter</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.skyldigeMomsOgAfgifter)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Feriepengeforpligtelser</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.feriepengeforpligtelse)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground">Periodeafgrænsningsposter</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.periodeafgraensningsporterPassiver)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 1: Primary Total */}
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-bold text-sm py-2 w-[200px] bg-muted/20 border-t-2">Årets balance</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-semibold text-sm py-2 w-[120px] border-t-2">{formatThousands(period.statusBalance)}</TableCell>
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
                  <TableHead className="sticky left-0 bg-background w-[200px] h-8 text-xs font-medium">Nøgletal</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={idx} className="text-right h-8 text-xs font-medium w-[120px]">
                      {getYearLabel(period.periode)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px]">Soliditetsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatPercent(period.soliditetsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px]">Likviditetsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatPercent(period.likviditetsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px]">Afkastningsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatPercent(period.afkastningsgrad)}</TableCell>
                  ))}
                </TableRow>
                <TableRow className="hover:bg-muted/30">
                  <TableCell className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px]">Overskudsgrad</TableCell>
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatPercent(period.overskudsgrad)}</TableCell>
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

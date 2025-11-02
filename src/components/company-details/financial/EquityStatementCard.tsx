import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EquityStatementCardProps {
  historicalData: any[];
}

const EQUITY_EXPLANATIONS: Record<string, string> = {
  'virksomhedskapital': 'Den indskudte startkapital fra ejerne ved virksomhedens oprettelse.',
  'overkurs_ved_emission': 'Overkurs betalt ved udstedelse af nye aktier/anparter - forskel mellem kurs og pålydende værdi.',
  'overfoert_resultat': 'Opsparet overskud eller akkumuleret underskud fra tidligere år.',
  'kontant_kapitalforhoejelse': 'Ny kapital indskudt af ejerne i løbet af året (virksomhedskapital + overkurs).',
  'aarets_resultat': 'Virksomhedens overskud eller underskud for året, som tilføjes egenkapitalen.',
  'overfoert_fra_overkurs': 'Flytning af overkurs til frie reserver (overført resultat).',
  'egenkapital_opening': 'Egenkapitalens størrelse ved årets begyndelse.',
  'egenkapital_closing': 'Egenkapitalens størrelse ved årets afslutning.',
};

const EquityRowWithTooltip: React.FC<{
  label: string;
  tooltipKey: string;
  className: string;
}> = ({ label, tooltipKey, className }) => {
  const explanation = EQUITY_EXPLANATIONS[tooltipKey];
  
  if (!explanation) {
    return <TableCell className={className}>{label}</TableCell>;
  }
  
  return (
    <TableCell className={className}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{label}</span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <p className="text-sm">{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
};

const EquityStatementCard: React.FC<EquityStatementCardProps> = ({ historicalData }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Take most recent periods (already sorted by year desc)
  const periods = historicalData.slice(0, 7);
  
  if (periods.length < 2) {
    return null; // Need at least 2 years to calculate movements
  }
  
  // Format number in thousands with Danish locale
  const formatThousands = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) return '-';
    const thousands = Math.round(value / 1000);
    return thousands.toLocaleString('da-DK');
  };
  
  // Helper to determine if value should be red
  const getValueColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    if (value < 0) return 'text-destructive';
    return '';
  };
  
  // Helper to get clean year label
  const getYearLabel = (periode: string): string => {
    const rangeMatch = periode.match(/(\d{4})-\d{2}-\d{2}\s*-\s*(\d{4})-\d{2}-\d{2}/);
    if (rangeMatch && rangeMatch[2]) {
      return `${rangeMatch[2]}`;
    }
    const yearMatch = periode.match(/(\d{4})/);
    if (yearMatch) {
      return yearMatch[1];
    }
    return periode;
  };
  
  // Calculate equity statement for each period
  const calculateEquityMovements = (currentPeriod: any, previousPeriod: any | null) => {
    const opening = {
      virksomhedskapital: previousPeriod?.virksomhedskapital || 0,
      overkursVedEmission: previousPeriod?.overkursVedEmission || 0,
      overfoertResultat: previousPeriod?.overfoertResultat || 0,
      total: previousPeriod?.egenkapital || 0,
    };
    
    const closing = {
      virksomhedskapital: currentPeriod.virksomhedskapital || 0,
      overkursVedEmission: currentPeriod.overkursVedEmission || 0,
      overfoertResultat: currentPeriod.overfoertResultat || 0,
      total: currentPeriod.egenkapital || 0,
    };
    
    // Calculate movements
    const kapitalforhoejelseVirksomhed = closing.virksomhedskapital - opening.virksomhedskapital;
    const kapitalforhoejelseOverkurs = closing.overkursVedEmission - opening.overkursVedEmission;
    const kontantKapitalforhoejelse = kapitalforhoejelseVirksomhed + kapitalforhoejelseOverkurs;
    
    const aaretsResultat = currentPeriod.aaretsResultat || 0;
    
    // Calculate transfer from overkurs (when overkurs decreases but overført increases)
    const potentialTransfer = opening.overkursVedEmission - closing.overkursVedEmission - Math.abs(kapitalforhoejelseOverkurs);
    const overfoertFraOverkurs = potentialTransfer > 0 ? potentialTransfer : 0;
    
    return {
      opening,
      closing,
      movements: {
        kontantKapitalforhoejelse,
        kapitalforhoejelseVirksomhed,
        kapitalforhoejelseOverkurs,
        aaretsResultat,
        overfoertFraOverkurs,
      }
    };
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">Egenkapitalopgørelse</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Udvikling i virksomhedens egenkapital
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 ml-4"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Skjul detaljer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Vis detaljer</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <div className="border-t">
            <div className="bg-muted/30 px-4 py-2">
              <h3 className="font-semibold text-sm">Beløb i 1000 DKK</h3>
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
                {/* OPENING BALANCE */}
                <TableRow className="bg-muted/20">
                  <TableCell className="sticky left-0 bg-muted/20 font-bold text-xs py-2 w-[200px]" colSpan={periods.length + 1}>
                    PRIMO EGENKAPITAL
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <>
                    <TableRow className="hover:bg-muted/30">
                      <EquityRowWithTooltip
                        label="  Virksomhedskapital"
                        tooltipKey="virksomhedskapital"
                        className="sticky left-0 bg-background text-xs py-1.5 w-[200px] pl-4"
                      />
                      {periods.map((period, idx) => {
                        const prev = periods[idx + 1] || null;
                        const equity = calculateEquityMovements(period, prev);
                        return (
                          <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(equity.opening.virksomhedskapital)}`}>
                            {formatThousands(equity.opening.virksomhedskapital)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    
                    <TableRow className="hover:bg-muted/30">
                      <EquityRowWithTooltip
                        label="  Overkurs ved emission"
                        tooltipKey="overkurs_ved_emission"
                        className="sticky left-0 bg-background text-xs py-1.5 w-[200px] pl-4"
                      />
                      {periods.map((period, idx) => {
                        const prev = periods[idx + 1] || null;
                        const equity = calculateEquityMovements(period, prev);
                        return (
                          <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(equity.opening.overkursVedEmission)}`}>
                            {formatThousands(equity.opening.overkursVedEmission)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    
                    <TableRow className="hover:bg-muted/30">
                      <EquityRowWithTooltip
                        label="  Overført resultat"
                        tooltipKey="overfoert_resultat"
                        className="sticky left-0 bg-background text-xs py-1.5 w-[200px] pl-4"
                      />
                      {periods.map((period, idx) => {
                        const prev = periods[idx + 1] || null;
                        const equity = calculateEquityMovements(period, prev);
                        return (
                          <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(equity.opening.overfoertResultat)}`}>
                            {formatThousands(equity.opening.overfoertResultat)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </>
                )}
                
                <TableRow className="hover:bg-muted/30 border-t">
                  <EquityRowWithTooltip
                    label="I alt"
                    tooltipKey="egenkapital_opening"
                    className="sticky left-0 bg-background font-semibold text-xs py-2 w-[200px]"
                  />
                  {periods.map((period, idx) => {
                    const prev = periods[idx + 1] || null;
                    const equity = calculateEquityMovements(period, prev);
                    return (
                      <TableCell key={idx} className={`text-right font-semibold text-xs py-2 w-[120px] border-t ${getValueColor(equity.opening.total)}`}>
                        {formatThousands(equity.opening.total)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                
                {/* MOVEMENTS */}
                <TableRow className="bg-muted/20 border-t-2">
                  <TableCell className="sticky left-0 bg-muted/20 font-bold text-xs py-2 w-[200px]" colSpan={periods.length + 1}>
                    BEVÆGELSER I ÅRET
                  </TableCell>
                </TableRow>
                
                <TableRow className="hover:bg-muted/30">
                  <EquityRowWithTooltip
                    label="Kontant kapitalforhøjelse"
                    tooltipKey="kontant_kapitalforhoejelse"
                    className="sticky left-0 bg-background text-xs py-1.5 w-[200px]"
                  />
                  {periods.map((period, idx) => {
                    const prev = periods[idx + 1] || null;
                    const equity = calculateEquityMovements(period, prev);
                    const value = equity.movements.kontantKapitalforhoejelse;
                    if (value === 0) return <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">-</TableCell>;
                    return (
                      <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(value)}`}>
                        {formatThousands(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                
                {isExpanded && (
                  <>
                    <TableRow className="hover:bg-muted/30">
                      <EquityRowWithTooltip
                        label="  heraf Virksomhedskapital"
                        tooltipKey="virksomhedskapital"
                        className="sticky left-0 bg-background text-xs py-1.5 w-[200px] pl-8 text-muted-foreground"
                      />
                      {periods.map((period, idx) => {
                        const prev = periods[idx + 1] || null;
                        const equity = calculateEquityMovements(period, prev);
                        const value = equity.movements.kapitalforhoejelseVirksomhed;
                        if (value === 0) return <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px] text-muted-foreground">-</TableCell>;
                        return (
                          <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] text-muted-foreground ${getValueColor(value)}`}>
                            {formatThousands(value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    
                    <TableRow className="hover:bg-muted/30">
                      <EquityRowWithTooltip
                        label="  heraf Overkurs ved emission"
                        tooltipKey="overkurs_ved_emission"
                        className="sticky left-0 bg-background text-xs py-1.5 w-[200px] pl-8 text-muted-foreground"
                      />
                      {periods.map((period, idx) => {
                        const prev = periods[idx + 1] || null;
                        const equity = calculateEquityMovements(period, prev);
                        const value = equity.movements.kapitalforhoejelseOverkurs;
                        if (value === 0) return <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px] text-muted-foreground">-</TableCell>;
                        return (
                          <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] text-muted-foreground ${getValueColor(value)}`}>
                            {formatThousands(value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </>
                )}
                
                <TableRow className="hover:bg-muted/30">
                  <EquityRowWithTooltip
                    label="Årets resultat"
                    tooltipKey="aarets_resultat"
                    className="sticky left-0 bg-background text-xs py-1.5 w-[200px]"
                  />
                  {periods.map((period, idx) => {
                    const prev = periods[idx + 1] || null;
                    const equity = calculateEquityMovements(period, prev);
                    return (
                      <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(equity.movements.aaretsResultat)}`}>
                        {formatThousands(equity.movements.aaretsResultat)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <EquityRowWithTooltip
                      label="Overført fra overkurs"
                      tooltipKey="overfoert_fra_overkurs"
                      className="sticky left-0 bg-background text-xs py-1.5 w-[200px]"
                    />
                    {periods.map((period, idx) => {
                      const prev = periods[idx + 1] || null;
                      const equity = calculateEquityMovements(period, prev);
                      const value = equity.movements.overfoertFraOverkurs;
                      if (value === 0) return <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">-</TableCell>;
                      return (
                        <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(value)}`}>
                          {formatThousands(value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )}
                
                {/* CLOSING BALANCE */}
                <TableRow className="bg-muted/20 border-t-2">
                  <TableCell className="sticky left-0 bg-muted/20 font-bold text-xs py-2 w-[200px]" colSpan={periods.length + 1}>
                    ULTIMO EGENKAPITAL
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <>
                    <TableRow className="hover:bg-muted/30">
                      <EquityRowWithTooltip
                        label="  Virksomhedskapital"
                        tooltipKey="virksomhedskapital"
                        className="sticky left-0 bg-background text-xs py-1.5 w-[200px] pl-4"
                      />
                      {periods.map((period, idx) => {
                        const prev = periods[idx + 1] || null;
                        const equity = calculateEquityMovements(period, prev);
                        return (
                          <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(equity.closing.virksomhedskapital)}`}>
                            {formatThousands(equity.closing.virksomhedskapital)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    
                    <TableRow className="hover:bg-muted/30">
                      <EquityRowWithTooltip
                        label="  Overkurs ved emission"
                        tooltipKey="overkurs_ved_emission"
                        className="sticky left-0 bg-background text-xs py-1.5 w-[200px] pl-4"
                      />
                      {periods.map((period, idx) => {
                        const prev = periods[idx + 1] || null;
                        const equity = calculateEquityMovements(period, prev);
                        return (
                          <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(equity.closing.overkursVedEmission)}`}>
                            {formatThousands(equity.closing.overkursVedEmission)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    
                    <TableRow className="hover:bg-muted/30">
                      <EquityRowWithTooltip
                        label="  Overført resultat"
                        tooltipKey="overfoert_resultat"
                        className="sticky left-0 bg-background text-xs py-1.5 w-[200px] pl-4"
                      />
                      {periods.map((period, idx) => {
                        const prev = periods[idx + 1] || null;
                        const equity = calculateEquityMovements(period, prev);
                        return (
                          <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(equity.closing.overfoertResultat)}`}>
                            {formatThousands(equity.closing.overfoertResultat)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </>
                )}
                
                <TableRow className="hover:bg-muted/30 border-t-2">
                  <EquityRowWithTooltip
                    label="I alt"
                    tooltipKey="egenkapital_closing"
                    className="sticky left-0 bg-background font-bold text-sm py-2 w-[200px] bg-muted/20"
                  />
                  {periods.map((period, idx) => {
                    const prev = periods[idx + 1] || null;
                    const equity = calculateEquityMovements(period, prev);
                    return (
                      <TableCell key={idx} className={`text-right font-bold text-sm py-2 w-[120px] border-t-2 bg-muted/20 ${getValueColor(equity.closing.total)}`}>
                        {formatThousands(equity.closing.total)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EquityStatementCard;

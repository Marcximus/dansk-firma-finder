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

interface FinancialSpreadsheetProps {
  historicalData: any[];
}

const FINANCIAL_EXPLANATIONS: Record<string, string> = {
  // Income Statement - Detailed
  'nettoomsaetning': 'Den samlede indtægt fra salg af varer og tjenester i perioden.',
  'vareforbrug': 'Direkte omkostninger til indkøb og produktion af solgte varer.',
  'ovrigeomkostninger': 'Andre driftsomkostninger der ikke kan kategoriseres andetsteds.',
  'bruttofortjeneste': 'Hvad virksomheden tjener på salget, før lønninger og andre driftsomkostninger er trukket fra.',
  'bruttotab': 'Når virksomhedens salg ikke kan dække de direkte omkostninger ved at producere varerne.',
  'personaleomkostninger': 'Samlet udgift til løn, pension og andre personaleydelser i perioden.',
  'afskrivninger': 'Værdifald på virksomhedens maskiner, computere og udstyr over tid.',
  'kapacitetsomkostninger': 'Omkostninger til at vedligeholde virksomhedens produktionskapacitet.',
  'primaertresultat': 'Resultat fra virksomhedens primære drift (EBIT).',
  'resultat_af_primaer_drift': 'Overskud eller underskud fra virksomhedens hovedaktivitet, før renter og skat.',
  'finansielleindtaegter': 'Penge tjent på renter, investeringer og valutakursgevinster.',
  'finansielleudgifter': 'Udgifter til renter på lån og andre finansieringsomkostninger.',
  'andrefinansielleposter': 'Andre finansielle indtægter eller udgifter.',
  'finansielleposterinetto': 'Samlet resultat af finansielle poster (indtægter minus udgifter).',
  'ordinaertresultat': 'Ordinært resultat før ekstraordinære poster.',
  'ekstraordinaereposter': 'Engangsindtægter eller -udgifter af ekstraordinær karakter.',
  'finansielle_indtaegter': 'Penge tjent på renter, investeringer og valutakursgevinster.',
  'finansielle_omkostninger': 'Udgifter til renter på lån og andre finansieringsomkostninger.',
  'driftsresultat': 'Virksomhedens resultat fra drift før renter og skat er fratrukket (EBIT).',
  'resultat_foer_skat': 'Virksomhedens samlede overskud eller underskud inden der betales selskabsskat.',
  'resultatfoerskat': 'Virksomhedens samlede overskud eller underskud inden der betales selskabsskat.',
  'skatafaaretsresultat': 'Den selskabsskat virksomheden skal betale af årets overskud.',
  'skat_af_aarets_resultat': 'Den selskabsskat virksomheden skal betale af årets overskud.',
  'aarets_resultat': 'Virksomhedens endelige overskud eller underskud efter alle omkostninger og skat.',
  
  // Balance Sheet - Assets (Detailed)
  'anlaegstiver': 'Virksomhedens langsigtede værdier som maskiner, bygninger og investeringer.',
  'goodwill': 'Immateriel værdi ved opkøb af virksomheder, der overstiger selskabets bogførte værdi.',
  'ovrigeimmaterielleanlaegsaktiver': 'Andre immaterielle anlægsaktiver som patenter, software og licenser.',
  'immaterielle_anlaegstiver': 'Værdier uden fysisk form som patenter, varemærker og goodwill.',
  'immaterielleanlaegsaktiver': 'Samlede immaterielle anlægsaktiver.',
  'grundeogbygninger': 'Værdien af virksomhedens grunde og bygninger.',
  'andreanlaegogdriftsmidler': 'Maskiner, produktionsudstyr og andre driftsmidler.',
  'ovrigematerielleanlaegsaktiver': 'Andre materielle anlægsaktiver.',
  'materielle_anlaegstiver': 'Fysiske ting virksomheden ejer som bygninger, maskiner og køretøjer.',
  'materielleanlaegsaktiver': 'Samlede materielle anlægsaktiver.',
  'andre_anlaeg': 'Computere, møbler, værktøj og andet udstyr til daglig drift.',
  'kapitalandele': 'Investeringer i andre virksomheder gennem aktie- eller andelsejerskap.',
  'langfristetilgodehavender': 'Tilgodehavender der forfalder om mere end ét år.',
  'andrefinansielleanlaegsaktiver': 'Andre langfristede finansielle aktiver.',
  'finansielle_anlaegstiver': 'Langsigtede investeringer i andre virksomheder og værdipapirer.',
  'finansielleanlaegsaktiver': 'Samlede finansielle anlægsaktiver.',
  'anlaegsaktiverValue': 'Samlet værdi af alle anlægsaktiver.',
  'deposita': 'Indskud eller depositum betalt som sikkerhed, fx for lejemål.',
  'omsaetningstiver': 'Virksomhedens kortsigtede værdier og penge, der kan omsættes hurtigt.',
  'varebeholdninger': 'Lagerbeholdning af varer klar til salg eller produktion.',
  'tilgodehavender': 'Penge virksomheden har tilgode fra kunder og andre.',
  'tilgodehavenderfrasalg': 'Penge kunder skylder for leverede varer eller tjenester.',
  'tilgodehavender_fra_salg': 'Penge kunder skylder for leverede varer eller tjenester.',
  'tilgodehavenderhosnaertstaende': 'Tilgodehavender hos nærtstående parter (fx moderselskab).',
  'andretilgodehavender': 'Diverse andre beløb virksomheden har tilgode.',
  'andre_tilgodehavender': 'Diverse andre beløb virksomheden har tilgode.',
  'vaerdipapirer': 'Kortfristede investeringer i værdipapirer.',
  'likvidemidler': 'Kontanter og penge på bankkonti, der er tilgængelige med det samme.',
  'krav_paa_indbetaling': 'Manglende indbetaling af ejerkapital fra ejerne.',
  'periodeafgraensningsposter_aktiver': 'Forudbetalte omkostninger eller indtægter der vedrører fremtidige perioder.',
  'likvide_midler': 'Kontanter og penge på bankkonti, der er tilgængelige med det samme.',
  'omsaetningsaktiver': 'Samlede omsætningsaktiver.',
  'aktiverialt': 'Virksomhedens samlede aktiver (balance).',
  
  // Balance Sheet - Equity & Liabilities (Detailed)
  'egenkapital': 'Virksomhedens egenværdi - forskellen mellem alt den ejer og alt den skylder.',
  'selskabskapital': 'Den indskudte startkapital fra ejerne ved virksomhedens oprettelse.',
  'virksomhedskapital': 'Den indskudte startkapital fra ejerne ved virksomhedens oprettelse.',
  'overfoertresultat': 'Opsparet overskud eller akkumuleret underskud fra tidligere år.',
  'overfoert_resultat': 'Opsparet overskud eller akkumuleret underskud fra tidligere år.',
  'udbytte': 'Foreslået udbytte til aktionærerne.',
  'ovrigereserver': 'Andre reserver i egenkapitalen.',
  'egenkapitalfoerminoritet': 'Egenkapital før minoritetsinteressers andel.',
  'minoritetsinteresser': 'Minoritetsaktionærers andel af egenkapitalen.',
  'egenkapitalialt': 'Samlet egenkapital inklusive minoritetsinteresser.',
  'udskudtskat': 'Fremtidig skatteforpligtelse eller -fordel.',
  'hensaettelser': 'Forventede fremtidige udgifter som virksomheden har sat penge til side til.',
  'hensatte_forpligtelser': 'Forventede fremtidige udgifter som virksomheden har sat penge til side til.',
  'langfristetgaeldtilrealkreditinstitutter': 'Langfristet gæld til realkreditinstitutter.',
  'langfristetgaeldtilbanker': 'Langfristet gæld til pengeinstitutter.',
  'langfristetgaeldtilnaertstaende': 'Langfristet gæld til nærtstående parter.',
  'andenlangfristetgaeld': 'Anden langfristet gæld.',
  'gaeldsforpligtelser': 'Samlet gæld til banker, leverandører og andre kreditorer.',
  'langfristet_gaeld': 'Lån og gæld der skal betales tilbage over mere end ét år.',
  'kortfristetgaeldtilnaertstaende': 'Kortfristet gæld til nærtstående parter.',
  'kortfristetgaeldtilrealkreditinstitutter': 'Kortfristet gæld til realkreditinstitutter.',
  'kortfristetgaeldtilbanker': 'Kortfristet gæld til pengeinstitutter.',
  'selskabsskat': 'Skyldigt selskabsskat for regnskabsåret.',
  'varekreditorer': 'Ubetalt gæld til leverandører for modtagne varer og tjenester.',
  'leverandoerer': 'Ubetalt gæld til leverandører for modtagne varer og tjenester.',
  'andengaeld': 'Diverse anden kortfristet gæld.',
  'gaeld_til_associerede': 'Penge skyldt til søsterselskaber eller moderselskab.',
  'anden_gaeld': 'Diverse anden kortfristet gæld som ikke passer i andre kategorier.',
  'kortfristet_gaeld': 'Gæld der skal betales tilbage inden for ét år.',
  'skyldige_moms': 'Moms og afgifter virksomheden har indkrævet men endnu ikke betalt.',
  'feriepengeforpligtelser': 'Optjent ferieløn til medarbejdere der endnu ikke er udbetalt.',
  'periodeafgraensningsposter_passiver': 'Forudbetalte indtægter eller omkostninger der vedrører fremtidige perioder.',
  'passiverialt': 'Virksomhedens samlede passiver (egenkapital + gæld).',
  
  // Key Ratios
  'soliditetsgrad': 'Viser hvor stor en del af virksomhedens aktiver der er finansieret med egenkapital. Høj soliditet betyder mindre gæld og bedre finansiel stabilitet.',
  'likviditetsgrad': 'Måler virksomhedens evne til at betale sine kortfristede forpligtelser. Over 100% betyder virksomheden kan dække sine kortsigtede gældsforpligtelser.',
  'afkastningsgrad': 'Viser hvor meget virksomheden tjener på sin investerede kapital. Høj afkastningsgrad betyder god indtjening i forhold til investeret kapital.',
  'overskudsgrad': 'Angiver hvor mange procent af omsætningen der bliver til overskud. Høj overskudsgrad betyder god indtjening på salget.'
};

interface RatioSpectrum {
  poor: number;
  fair: number;
  good: number;
  excellent: number;
}

const RATIO_SPECTRUMS: Record<string, RatioSpectrum> = {
  'soliditetsgrad': { poor: 0, fair: 20, good: 30, excellent: 50 },
  'likviditetsgrad': { poor: 0, fair: 100, good: 150, excellent: 200 },
  'afkastningsgrad': { poor: -10, fair: 5, good: 10, excellent: 20 },
  'overskudsgrad': { poor: -10, fair: 5, good: 10, excellent: 20 }
};

const SpectrumVisualization: React.FC<{
  value: number | null;
  spectrum: RatioSpectrum;
}> = ({ value, spectrum }) => {
  if (value === null) return null;
  
  const { poor, fair, good, excellent } = spectrum;
  const range = excellent - poor;
  const clampedValue = Math.max(poor, Math.min(excellent, value));
  const position = ((clampedValue - poor) / range) * 100;
  
  return (
    <div className="mt-3 space-y-2">
      <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-destructive via-yellow-500 to-green-500">
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-background shadow-lg"
          style={{ left: `${position}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-background rounded-full border-2 border-foreground shadow-lg"
          style={{ left: `calc(${position}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{poor}%</span>
        <span>{fair}%</span>
        <span>{good}%</span>
        <span>{excellent}%</span>
      </div>
      <div className="text-xs text-center font-medium">
        Nuværende: {value.toFixed(1)}%
      </div>
    </div>
  );
};

const FinancialRowWithTooltip: React.FC<{
  label: string;
  tooltipKey: string;
  className: string;
  value?: number | null;
  showSpectrum?: boolean;
}> = ({ label, tooltipKey, className, value, showSpectrum = false }) => {
  const explanation = FINANCIAL_EXPLANATIONS[tooltipKey];
  const spectrum = RATIO_SPECTRUMS[tooltipKey];
  
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
          {showSpectrum && spectrum && value !== undefined && (
            <SpectrumVisualization value={value} spectrum={spectrum} />
          )}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
};

const FinancialSpreadsheet: React.FC<FinancialSpreadsheetProps> = ({ historicalData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  console.log('[FinancialSpreadsheet] Received data:', historicalData.map(d => ({ 
    year: d.year, 
    periode: d.periode,
    hasData: !!d.nettoomsaetning || !!d.egenkapital
  })));
  
  // Data is already sorted by edge function and financialUtils - just take first 7
  const periods = historicalData.slice(0, 7);
  
  // Extract display years for the quality indicator
  const displayYears = periods.map(p => p.year).filter(y => y);
  
  console.log('[FinancialSpreadsheet] Displaying 5 most recent periods:', {
    count: periods.length,
    years: displayYears,
    periods: periods.map(d => d.periode)
  });
  
  // Format number in thousands with Danish locale (parser returns values in thousands)
  const formatThousands = (value: number | null | undefined, isNegativeContext: boolean = false): string => {
    if (value === null || value === undefined) return '-';
    const thousands = Math.round(value);
    const formatted = thousands.toLocaleString('da-DK');
    
    // Color negative numbers or bruttotab red
    if (thousands < 0 || isNegativeContext) {
      return formatted;
    }
    return formatted;
  };
  
  // Format percentage with 1 decimal
  const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(1);
  };
  
  // Helper to determine if value should be red
  const getValueColor = (value: number | null | undefined, isNegativeContext: boolean = false): string => {
    if (value === null || value === undefined) return '';
    if (value < 0 || isNegativeContext) return 'text-destructive';
    return '';
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
    <TooltipProvider delayDuration={300}>
      <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">Regnskabsdata</CardTitle>
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
                <span className="hidden sm:inline">Udvid Regnskabet</span>
              </>
            )}
          </Button>
        </div>
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
                  <FinancialRowWithTooltip
                    label="Nettoomsætning"
                    tooltipKey="nettoomsaetning"
                    className="sticky left-0 bg-background font-bold text-sm py-2 w-[200px] bg-muted/20"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className={`text-right font-semibold text-sm py-2 w-[120px] ${getValueColor(period.nettoomsaetning)}`}>{formatThousands(period.nettoomsaetning)}</TableCell>
                  ))}
                </TableRow>
                
                {/* Level 3: Cost of Sales */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Vareforbrug"
                      tooltipKey="vareforbrug"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(period.vareforbrug)}`}>{formatThousands(period.vareforbrug)}</TableCell>
                    ))}
                  </TableRow>
                )}
                
                {/* Level 3: Other Costs */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Øvrige omkostninger"
                      tooltipKey="ovrigeomkostninger"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(period.ovrigeomkostninger)}`}>{formatThousands(period.ovrigeomkostninger)}</TableCell>
                    ))}
                  </TableRow>
                )}
                
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Bruttofortjeneste"
                    tooltipKey="bruttofortjeneste"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className={`text-right font-medium text-xs py-1.5 w-[120px] border-t ${getValueColor(period.bruttofortjeneste)}`}>{formatThousands(period.bruttofortjeneste)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Bruttotab"
                      tooltipKey="bruttotab"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] text-destructive`}>{period.bruttotab ? formatThousands(period.bruttotab, true) : '-'}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Personaleomkostninger"
                      tooltipKey="personaleomkostninger"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(period.personaleomkostninger)}`}>{formatThousands(period.personaleomkostninger)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Afskrivninger"
                      tooltipKey="afskrivninger"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-6 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right italic text-xs py-1 w-[120px] text-muted-foreground ${getValueColor(period.afskrivninger)}`}>{formatThousands(period.afskrivninger)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Capacity Costs */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Kapacitetsomkostninger"
                      tooltipKey="kapacitetsomkostninger"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(period.kapacitetsomkostninger)}`}>{formatThousands(period.kapacitetsomkostninger)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 2: Primary Result (EBIT) */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Primært resultat (EBIT)"
                    tooltipKey="primaertresultat"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className={`text-right font-medium text-xs py-1.5 w-[120px] border-t ${getValueColor(period.primaertresultat || period.driftsresultat)}`}>{formatThousands(period.primaertresultat || period.driftsresultat)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Finansielle indtægter"
                      tooltipKey="finansielle_indtaegter"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-6 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right italic text-xs py-1 w-[120px] text-muted-foreground ${getValueColor(period.finansielleIndtaegter)}`}>{formatThousands(period.finansielleIndtaegter)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Finansielle omkostninger"
                      tooltipKey="finansielle_omkostninger"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-6 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right italic text-xs py-1 w-[120px] text-muted-foreground ${getValueColor(period.finansielleOmkostninger)}`}>{formatThousands(period.finansielleOmkostninger)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Driftsresultat (EBIT)"
                    tooltipKey="driftsresultat"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className={`text-right font-medium text-xs py-1.5 w-[120px] border-t ${getValueColor(period.driftsresultat)}`}>{formatThousands(period.driftsresultat)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Resultat før skat"
                    tooltipKey="resultat_foer_skat"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className={`text-right font-medium text-xs py-1.5 w-[120px] border-t ${getValueColor(period.resultatFoerSkat)}`}>{formatThousands(period.resultatFoerSkat)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Skat af årets resultat"
                      tooltipKey="skat_af_aarets_resultat"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-6 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right italic text-xs py-1 w-[120px] text-muted-foreground ${getValueColor(period.skatAfAaretsResultat)}`}>{formatThousands(period.skatAfAaretsResultat)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 1: Primary Total */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Årets Resultat"
                    tooltipKey="aarets_resultat"
                    className="sticky left-0 bg-background font-bold text-sm py-2 w-[200px] bg-muted/20 border-t-2"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className={`text-right font-semibold text-sm py-2 w-[120px] border-t-2 ${getValueColor(period.aaretsResultat)}`}>{formatThousands(period.aaretsResultat)}</TableCell>
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
                  <FinancialRowWithTooltip
                    label="Anlægsaktiver"
                    tooltipKey="anlaegstiver"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.anlaegsaktiverValue)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Immaterielle anlægsaktiver"
                      tooltipKey="immaterielle_anlaegstiver"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.immaterielleAnlaeggsaktiver)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Materielle anlægsaktiver"
                      tooltipKey="materielle_anlaegstiver"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.materielleAnlaeggsaktiver)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Andre anlæg, driftsmateriel og inventar"
                      tooltipKey="andre_anlaeg"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.andreAnlaegDriftsmaterielOgInventar)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Finansielle anlægsaktiver"
                      tooltipKey="finansielle_anlaegstiver"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.finansielleAnlaeggsaktiver)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Deposita"
                      tooltipKey="deposita"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.deposita)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Omsætningsaktiver"
                    tooltipKey="omsaetningstiver"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.omsaetningsaktiver)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Varebeholdninger"
                      tooltipKey="varebeholdninger"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.varebeholdninger)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Tilgodehavender"
                      tooltipKey="tilgodehavender"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.tilgodehavender)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Tilgodehavender fra salg"
                      tooltipKey="tilgodehavender_fra_salg"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.tilgodehavenderFraSalg)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Andre tilgodehavender"
                      tooltipKey="andre_tilgodehavender"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.andreTilgodehavender)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Krav på indbetaling af virksomhedskapital"
                      tooltipKey="krav_paa_indbetaling"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.kravPaaIndbetalingAfVirksomhedskapital)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Periodeafgrænsningsposter"
                      tooltipKey="periodeafgraensningsposter_aktiver"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.periodeafgraensningsporterAktiver)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Likvide midler"
                      tooltipKey="likvide_midler"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.likviderMidler)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Egenkapital"
                    tooltipKey="egenkapital"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className={`text-right font-medium text-xs py-1.5 w-[120px] border-t ${getValueColor(period.egenkapital)}`}>{formatThousands(period.egenkapital)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Virksomhedskapital"
                      tooltipKey="virksomhedskapital"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.virksomhedskapital)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Overført resultat"
                      tooltipKey="overfoert_resultat"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className={`text-right text-xs py-1.5 w-[120px] ${getValueColor(period.overfoertResultat)}`}>{formatThousands(period.overfoertResultat)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Hensatte forpligtelser"
                    tooltipKey="hensatte_forpligtelser"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.hensatteForpligtelser)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 2: Section Subtotal */}
                <TableRow className="hover:bg-muted/30">
                  <FinancialRowWithTooltip
                    label="Gældsforpligtelser"
                    tooltipKey="gaeldsforpligtelser"
                    className="sticky left-0 bg-background font-semibold text-xs py-1.5 w-[200px] border-t"
                  />
                  {periods.map((period, idx) => (
                    <TableCell key={idx} className="text-right font-medium text-xs py-1.5 w-[120px] border-t">{formatThousands(period.gaeldsforpligtelser)}</TableCell>
                  ))}
                </TableRow>
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Langfristet gæld"
                      tooltipKey="langfristet_gaeld"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.langfristetGaeld)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Leverandører af varer"
                      tooltipKey="leverandoerer"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.leverandoererAfVarer)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Gæld til associerede virksomheder"
                      tooltipKey="gaeld_til_associerede"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.gaeldTilAssocieretVirksomhed)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 3: Category Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Anden gæld"
                      tooltipKey="anden_gaeld"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px] pl-4"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatThousands(period.andenGaeld)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Skyldige moms og afgifter"
                      tooltipKey="skyldige_moms"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.skyldigeMomsOgAfgifter)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Feriepengeforpligtelser"
                      tooltipKey="feriepengeforpligtelser"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.feriepengeforpligtelse)}</TableCell>
                    ))}
                  </TableRow>
                )}
                {/* Level 4: Detail Item */}
                {isExpanded && (
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Periodeafgrænsningsposter"
                      tooltipKey="periodeafgraensningsposter_passiver"
                      className="sticky left-0 bg-background font-normal italic text-xs py-1 w-[200px] pl-8 text-muted-foreground"
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right italic text-xs py-1 w-[120px] text-muted-foreground">{formatThousands(period.periodeafgraensningsporterPassiver)}</TableCell>
                    ))}
                  </TableRow>
                )}
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
          {isExpanded && (
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
                    <FinancialRowWithTooltip
                      label="Soliditetsgrad"
                      tooltipKey="soliditetsgrad"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px]"
                      value={periods[0]?.soliditetsgrad}
                      showSpectrum={true}
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatPercent(period.soliditetsgrad)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Likviditetsgrad"
                      tooltipKey="likviditetsgrad"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px]"
                      value={periods[0]?.likviditetsgrad}
                      showSpectrum={true}
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatPercent(period.likviditetsgrad)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Afkastningsgrad"
                      tooltipKey="afkastningsgrad"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px]"
                      value={periods[0]?.afkastningsgrad}
                      showSpectrum={true}
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatPercent(period.afkastningsgrad)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="hover:bg-muted/30">
                    <FinancialRowWithTooltip
                      label="Overskudsgrad"
                      tooltipKey="overskudsgrad"
                      className="sticky left-0 bg-background font-medium text-xs py-1.5 w-[200px]"
                      value={periods[0]?.overskudsgrad}
                      showSpectrum={true}
                    />
                    {periods.map((period, idx) => (
                      <TableCell key={idx} className="text-right text-xs py-1.5 w-[120px]">{formatPercent(period.overskudsgrad)}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};

export default FinancialSpreadsheet;

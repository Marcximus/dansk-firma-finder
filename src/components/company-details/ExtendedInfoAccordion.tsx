
import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company, getFinancialData } from '@/services/companyAPI';
import { extractExtendedInfo } from '@/services/cvrUtils';
import { Info, Phone, MapPin, Briefcase, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Mail, Activity, User, Building2, Globe, Users, Shield } from 'lucide-react';
import { formatPhoneNumber } from '@/services/utils/formatUtils';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { useNavigate, Link } from 'react-router-dom';
import { generateCompanyUrl, generatePersonUrl } from '@/lib/urlUtils';
import { useToast } from '@/hooks/use-toast';
import { calculateRiskScore } from '@/services/utils/riskAssessment';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { extractFinancialData } from '@/services/utils/financialUtils';

interface ExtendedInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const ExtendedInfoAccordion: React.FC<ExtendedInfoAccordionProps> = ({ company, cvrData }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState<any>(null);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(true);
  
  console.log('ExtendedInfoAccordion - Raw CVR Data:', cvrData);
  
  const extendedInfo = extractExtendedInfo(cvrData);
  console.log('ExtendedInfoAccordion - Extracted Info:', extendedInfo);

  // Fetch financial data for comprehensive risk assessment
  useEffect(() => {
    const fetchFinancialDataForRisk = async () => {
      if (!company.cvr) {
        setIsLoadingFinancial(false);
        return;
      }
      
      try {
        const data = await getFinancialData(company.cvr);
        if (data && data.financialReports) {
          const parsedFinancialData = data.financialReports.length > 0 ? data : null;
          const extractedData = extractFinancialData(cvrData, parsedFinancialData);
          setFinancialData(extractedData);
        }
      } catch (error) {
        console.error('Error fetching financial data for risk assessment:', error);
      } finally {
        setIsLoadingFinancial(false);
      }
    };
    
    fetchFinancialDataForRisk();
  }, [company.cvr, cvrData]);

  const getContactInfo = () => {
    if (!cvrData) return { email: null, phone: null };
    
    const currentEmail = cvrData.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
    const currentPhone = cvrData.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
    
    return {
      email: currentEmail?.kontaktoplysning || 
             cvrData.elektroniskPost?.[cvrData.elektroniskPost.length - 1]?.kontaktoplysning || 
             company.email || null,
      phone: currentPhone?.kontaktoplysning || 
             cvrData.telefonNummer?.[cvrData.telefonNummer.length - 1]?.kontaktoplysning || null
    };
  };

  const getStatus = () => {
    if (!cvrData) return company.status || 'Ikke oplyst';
    
    const currentStatus = cvrData.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
    return currentStatus?.status || 
           cvrData.virksomhedsstatus?.[cvrData.virksomhedsstatus.length - 1]?.status ||
           company.status || 
           'Ikke oplyst';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Ikke oplyst';
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy', { locale: da });
    } catch {
      return dateString;
    }
  };

  const getStartDate = () => {
    // Extract the actual Vrvirksomhed data
    const vrvirksomhed = cvrData?.Vrvirksomhed || cvrData;
    
    // Priority 1: Direct stiftelsesDato field
    if (vrvirksomhed?.stiftelsesDato) {
      return formatDate(vrvirksomhed.stiftelsesDato);
    }
    
    // Priority 2: livsforloeb registration date
    const livsforloebDate = vrvirksomhed?.livsforloeb?.[0]?.periode?.gyldigFra;
    if (livsforloebDate) {
      return formatDate(livsforloebDate);
    }
    
    // Priority 3: Check for FØRSTE_REGNSKABSPERIODE_START in attributter
    const regnskabStart = vrvirksomhed?.attributter?.find((attr: any) => 
      attr.type === 'FØRSTE_REGNSKABSPERIODE_START'
    );
    if (regnskabStart?.vaerdier?.[0]?.vaerdi) {
      return formatDate(regnskabStart.vaerdier[0].vaerdi);
    }
    
    // Priority 4: Fallback to company.yearFounded
    if (company.yearFounded) {
      return company.yearFounded.toString();
    }
    
    return 'Ikke oplyst';
  };

  const getWebsite = () => {
    if (!cvrData) return company.website;
    
    const currentWebsite = cvrData.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null);
    return currentWebsite?.kontaktoplysning || 
           cvrData.hjemmeside?.[cvrData.hjemmeside.length - 1]?.kontaktoplysning || 
           company.website || null;
  };

  const getEmployeeCount = () => {
    const vrvirksomhed = cvrData?.Vrvirksomhed || cvrData;
    
    if (!vrvirksomhed) return { current: company.employeeCount, previous: null, change: null };
    
    // Helper to extract year/month/quarter from employment entry
    const getEntryDate = (entry: any, type: 'monthly' | 'quarterly' | 'yearly') => {
      if (type === 'monthly') {
        return new Date(entry.aar, entry.maaned - 1); // month is 0-indexed
      } else if (type === 'quarterly') {
        return new Date(entry.aar, (entry.kvartal - 1) * 3); // approximate month from quarter
      } else {
        return new Date(entry.aar, 11); // Use December for yearly data
      }
    };
    
    // Check all four employment data sources
    const sources = [
      { data: vrvirksomhed.erstMaanedsbeskaeftigelse, type: 'monthly' as const, name: 'ERST Monthly' },
      { data: vrvirksomhed.maanedsbeskaeftigelse, type: 'monthly' as const, name: 'Monthly' },
      { data: vrvirksomhed.kvartalsbeskaeftigelse, type: 'quarterly' as const, name: 'Quarterly' },
      { data: vrvirksomhed.aarsbeskaeftigelse, type: 'yearly' as const, name: 'Yearly' }
    ];
    
    // Collect all entries from all sources with dates
    const allEntries: Array<{ entry: any, date: Date, source: string }> = [];
    
    for (const source of sources) {
      if (!source.data || source.data.length === 0) continue;
      
      for (const entry of source.data) {
        const entryDate = getEntryDate(entry, source.type);
        allEntries.push({ entry, date: entryDate, source: source.name });
      }
    }
    
    // Sort all entries by date (newest first)
    allEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const latestEntry = allEntries[0];
    const previousEntry = allEntries[1]; // Second latest
    
    const currentCount = latestEntry?.entry?.antalAnsatte || latestEntry?.entry?.antalAarsvaerk || 0;
    const previousCount = previousEntry?.entry?.antalAnsatte || previousEntry?.entry?.antalAarsvaerk || null;
    
    let change = null;
    if (previousCount !== null && currentCount > 0) {
      change = currentCount - previousCount;
    }
    
    console.log('[ExtendedInfo] Employee Count:', {
      current: currentCount,
      previous: previousCount,
      change: change,
      source: latestEntry?.source,
      year: latestEntry?.entry?.aar,
      month: latestEntry?.entry?.maaned,
      quarter: latestEntry?.entry?.kvartal,
      date: latestEntry?.date?.toISOString(),
    });
    
    return { 
      current: currentCount || company.employeeCount,
      previous: previousCount,
      change: change
    };
  };

  const contactInfo = getContactInfo();
  const website = getWebsite();
  const employeeData = getEmployeeCount();
  
  // Calculate risk score with financial data (wait for loading to complete)
  const riskScore = !isLoadingFinancial 
    ? calculateRiskScore(company, cvrData, financialData)
    : { totalScore: 0, riskLevelText: 'Beregner...', riskLevel: 'medium' as const, factors: {} as any, warnings: [], criticalFlags: [] };
  
  // Get risk color based on score
  const getRiskColor = (score: number) => {
    if (score >= 8.0) return 'text-green-600 dark:text-green-400';
    if (score >= 5.0) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 2.0) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const InfoRow = ({ icon: Icon, label, value, className = "" }: { 
    icon: any, 
    label: string, 
    value: string | null | undefined | React.ReactNode, 
    className?: string 
  }) => (
    <div className={`flex flex-row items-start sm:items-center gap-1 sm:gap-2 md:gap-3 ${className}`}>
      <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 min-w-[90px] sm:min-w-[140px] flex-shrink-0">
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium whitespace-nowrap">{label}:</span>
      </div>
      <span className="text-[10px] sm:text-xs md:text-sm break-words flex-1">{value || 'Ikke tilgængelig'}</span>
    </div>
  );

  return (
    <AccordionItem value="extended" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Info className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Udvidede virksomhedsoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-1.5 sm:space-y-2">
          <InfoRow 
            icon={Mail} 
            label="Email"
            value={contactInfo.email ? (
              <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">
                {contactInfo.email}
              </a>
            ) : undefined}
          />
          
          <InfoRow 
            icon={Phone} 
            label="Telefon" 
            value={extendedInfo?.phone ? (
              <a 
                href={`tel:${extendedInfo.phone.replace(/[\s\-()]/g, '')}`} 
                className="text-primary hover:underline"
              >
                {formatPhoneNumber(extendedInfo.phone)}
              </a>
            ) : undefined}
          />
          
          <InfoRow 
            icon={Globe} 
            label="Hjemmeside" 
            value={website ? (
              <a 
                href={website.startsWith('http') ? website : `https://${website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline"
              >
                {website}
              </a>
            ) : undefined}
          />
          
          <InfoRow 
            icon={Activity} 
            label="Status" 
            value={getStatus()} 
          />

          {/* Alternative Names */}
          {extendedInfo?.binavne && extendedInfo.binavne.length > 0 && (
            <div className="flex flex-row items-start sm:items-center gap-1 sm:gap-2 md:gap-3">
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 min-w-[90px] sm:min-w-[140px] flex-shrink-0">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium whitespace-nowrap">Binavne:</span>
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm break-words flex-1">{extendedInfo.binavne.join(', ')}</span>
            </div>
          )}

          {/* Basic Information */}
          <InfoRow 
            icon={Users} 
            label="Antal Ansatte" 
            value={employeeData.current > 0 ? (
              <button
                onClick={() => {
                  const employeeSection = document.querySelector('[data-accordion-item="employees"]');
                  if (employeeSection) {
                    employeeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Ensure accordion is open
                    const trigger = employeeSection.querySelector('[data-state="closed"]');
                    if (trigger instanceof HTMLElement) {
                      trigger.click();
                    }
                  }
                }}
                className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
              >
                {employeeData.current.toLocaleString('da-DK')}
                {employeeData.change !== null && employeeData.change !== 0 && (
                  <span className={`flex items-center gap-1 text-xs ${employeeData.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {employeeData.change > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(employeeData.change).toLocaleString('da-DK')}
                  </span>
                )}
              </button>
            ) : undefined} 
          />
          
          <InfoRow 
            icon={Briefcase} 
            label="Branchekode" 
            value={extendedInfo?.primaryIndustry || company.industry} 
          />
          
          <InfoRow 
            icon={TrendingUp} 
            label="Børsnoteret" 
            value={extendedInfo?.isListed !== undefined ? (
              extendedInfo.isListed ? (
                <span className="flex items-center gap-2">
                  Ja
                  {extendedInfo.ticker && (
                    <a
                      href={`https://finance.yahoo.com/quote/${extendedInfo.ticker}.CO`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      ({extendedInfo.ticker})
                    </a>
                  )}
                </span>
              ) : 'Nej'
            ) : undefined} 
          />
          
          <InfoRow 
            icon={Calendar} 
            label="Regnskabsår" 
            value={extendedInfo?.accountingYear} 
          />
          
          <InfoRow 
            icon={Calendar} 
            label="Startdato" 
            value={getStartDate()} 
          />
          
          {company.founders && company.founders.length > 0 && (
            <InfoRow 
              icon={User} 
              label="Stiftet af" 
              value={
                <div className="flex flex-wrap gap-2">
                  {company.founders.map((founder, index) => {
                    const isPerson = founder.type === 'PERSON';
                    const isCompany = founder.type === 'VIRKSOMHED';
                    const canNavigate = (isPerson || isCompany) && founder.identifier;
                    
                    return (
                      <span key={index}>
                        {canNavigate ? (
                          <button
                            onClick={() => {
                              try {
                                if (isPerson) {
                                  const url = generatePersonUrl(founder.name, founder.identifier);
                                  navigate(url);
                                } else if (isCompany && founder.identifier) {
                                  // Check if identifier looks like a valid CVR (8 digits)
                                  const isCVR = founder.identifier.length === 8 && /^\d+$/.test(founder.identifier);
                                  if (!isCVR) {
                                    toast({
                                      title: "Kan ikke vise virksomhed",
                                      description: "Virksomhedsoplysninger er ikke tilgængelige for denne stifter.",
                                      variant: "destructive"
                                    });
                                    return;
                                  }
                                  const url = generateCompanyUrl(founder.name, founder.identifier);
                                  navigate(url);
                                }
                              } catch (error) {
                                console.error('Navigation error:', error);
                                toast({
                                  title: "Fejl",
                                  description: "Kunne ikke navigere til denne side.",
                                  variant: "destructive"
                                });
                              }
                            }}
                            className="font-medium hover:text-primary underline decoration-dotted underline-offset-2 text-left inline-flex items-center gap-1.5"
                          >
                            {isPerson ? (
                              <User className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                            ) : (
                              <Building2 className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                            )}
                            {founder.name}
                          </button>
                        ) : (
                          <span className="font-medium">{founder.name}</span>
                        )}
                        {index < company.founders!.length - 1 && ', '}
                      </span>
                    );
                  })}
                </div>
              }
            />
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-row items-start sm:items-center gap-1 sm:gap-2 md:gap-3">
                  <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 min-w-[90px] sm:min-w-[140px] flex-shrink-0">
                  <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium whitespace-nowrap">
                    SI Vurdering:
                  </span>
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm break-words flex-1">
                    <span className={`${getRiskColor(riskScore.totalScore)} pulse`}>
                      {riskScore.totalScore.toFixed(1)}/10.0 ({riskScore.riskLevelText})
                    </span>
                    {' - '}
                    <Link to="/virksomhedsrapporter" state={{ preselectedCompany: company }} className="text-primary hover:underline">
                      Skal du handle med selskabet? - Få en Virksomheds- og Kreditrapport
                    </Link>
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="font-semibold mb-2">Om SI Vurdering</p>
                <p className="text-sm mb-2">
                  SI Vurdering er en omfattende algoritmisk risikovurdering baseret på:
                </p>
                <ul className="text-xs space-y-1 mb-2">
                  <li>• <strong>Status (15%)</strong>: Aktiv/inaktiv, konkurs, likvidation</li>
                  <li>• <strong>Finansiel sundhed (38%)</strong>: Egenkapital, rentabilitet, likviditet</li>
                  <li>• <strong>Finansielle tendenser (14%)</strong>: 3-5 års udvikling</li>
                  <li>• <strong>Cash flow (9%)</strong>: Betalingsevne på kort sigt</li>
                  <li>• <strong>Gældsstruktur (7%)</strong>: Gældsbæreevne</li>
                  <li>• <strong>Virksomhedsalder (5%)</strong>: Erfaring og stabilitet</li>
                  <li>• <strong>Ledelse (4%)</strong>: Ledelsesmæssig stabilitet</li>
                  <li>• <strong>Ejerskab (3%)</strong>: Ejerskabsstabilitet</li>
                  <li>• <strong>Branche (3%)</strong>: Branchespecifik risiko</li>
                  <li>• <strong>Betalingshistorik (2%)</strong>: Registrerede anmærkninger</li>
                  <li>• <strong>Revisor (1,5%)</strong>: Revisorstabilitet</li>
                  <li>• <strong>Adresse (0,5%)</strong>: Adressestabilitet</li>
                  <li>• <strong>Datakvalitet (1,5%)</strong>: Tilgængelig data</li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Scoren går fra 0 (ekstrem risiko) til 10 (lav risiko). <strong>Inaktive virksomheder får automatisk 0.0</strong>. 
                  Virksomheder med negativ egenkapital eller flere år med tab får markant lavere score.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Secondary Industries */}
          {extendedInfo?.secondaryIndustries && extendedInfo.secondaryIndustries.length > 0 && (
            <div className="flex gap-1 sm:gap-2 md:gap-3 border-t mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4">
              <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Bibrancher:</span>
                <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                  {extendedInfo.secondaryIndustries.map((branch: any, index: number) => (
                    <div key={index} className="text-[11px] sm:text-xs md:text-sm break-words">
                      {branch.branchekode} {branch.branchetekst}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* Capital Classes */}
          {extendedInfo?.capitalClasses && extendedInfo.capitalClasses.length > 0 && (
            <div className="flex gap-1 sm:gap-2 md:gap-3 border-t mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4">
              <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">Kapitalklasser:</span>
                <div className="mt-0.5 sm:mt-1 space-y-1 sm:space-y-2">
                  {extendedInfo.capitalClasses.map((kapital: any, index: number) => (
                    <div key={index} className="text-[11px] sm:text-xs md:text-sm">
                      <div>{kapital.kapitalklasse || 'Ukendt kapitalklasse'}</div>
                      {kapital.kapitalbeloeb && (
                        <div className="text-muted-foreground">
                          {kapital.kapitalbeloeb.toLocaleString('da-DK')} {kapital.valuta || 'DKK'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ExtendedInfoAccordion;

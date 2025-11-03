
import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company, getFinancialData } from '@/services/companyAPI';
import { FileText, Building2, Hash, MapPin, Calendar, Briefcase, DollarSign, ScrollText, User, Shield, Info } from 'lucide-react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { extractExtendedInfo } from '@/services/cvrUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { calculateRiskScore } from '@/services/utils/riskAssessment';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { extractFinancialData } from '@/services/utils/financialUtils';

interface BasicInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const BasicInfoAccordion: React.FC<BasicInfoAccordionProps> = ({ company, cvrData }) => {
  const isMobile = useIsMobile();
  const [financialData, setFinancialData] = useState<any>(null);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(true);
  
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

  const getLegalForm = () => {
    if (!cvrData) return company.legalForm || 'Ikke oplyst';
    
    const currentForm = cvrData.virksomhedsform?.find((form: any) => form.periode?.gyldigTil === null);
    return currentForm?.langBeskrivelse || 
           currentForm?.kortBeskrivelse || 
           cvrData.virksomhedsform?.[cvrData.virksomhedsform.length - 1]?.langBeskrivelse ||
           company.legalForm || 
           'Ikke oplyst';
  };

  const getAddress = () => {
    if (!cvrData?.beliggenhedsadresse) {
      return {
        street: company.address || 'Ikke oplyst',
        postal: company.postalCode || '',
        city: company.city || ''
      };
    }
    
    const currentAddress = cvrData.beliggenhedsadresse.find((addr: any) => addr.periode?.gyldigTil === null);
    const addr = currentAddress || cvrData.beliggenhedsadresse[cvrData.beliggenhedsadresse.length - 1];
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage}. sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    return {
      street: parts.join(' ') || company.address || 'Ikke oplyst',
      postal: addr.postnummer?.toString() || company.postalCode || '',
      city: addr.postdistrikt || company.city || ''
    };
  };

  const getCEO = () => {
    const vrvirksomhed = cvrData?.Vrvirksomhed || cvrData;
    if (!vrvirksomhed?.deltagerRelation) return null;
    
    const today = new Date().toISOString().split('T')[0];
    
    for (const relation of vrvirksomhed.deltagerRelation) {
      const personName = relation.deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null)?.navn ||
                        relation.deltager?.navne?.[relation.deltager.navne.length - 1]?.navn;
      
      if (relation.organisationer) {
        for (const org of relation.organisationer) {
          // Only consider DIREKTION if it's currently active
          if (org.hovedtype === 'DIREKTION') {
            // Check if the organization membership is currently active
            const hasActiveMembership = org.medlemsData?.some((medlem: any) => {
              const gyldigTil = medlem.periode?.gyldigTil;
              return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
            });
            
            if (hasActiveMembership || !org.medlemsData) {
              return personName;
            }
          }
          
          // Check for DIREKTØR function in active membership data
          if (org.medlemsData) {
            for (const medlem of org.medlemsData) {
              const gyldigTil = medlem.periode?.gyldigTil;
              const isMembershipActive = gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
              
              if (isMembershipActive && medlem.attributter) {
                for (const attr of medlem.attributter) {
                  if (attr.type === 'FUNKTION' && attr.vaerdier) {
                    for (const vaerdi of attr.vaerdier) {
                      const funkGyldigTil = vaerdi.periode?.gyldigTil;
                      const isFunkActive = funkGyldigTil === null || funkGyldigTil === undefined || funkGyldigTil >= today;
                      
                      if (isFunkActive && (vaerdi.vaerdi === 'DIREKTØR' || vaerdi.vaerdi?.includes('DIREKTØR'))) {
                        return personName;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return null;
  };

  const address = getAddress();
  const ceo = getCEO();
  const extendedInfo = extractExtendedInfo(cvrData);
  
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

  return (
    <AccordionItem value="basic" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Grundoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-1.5 sm:space-y-2">
          <InfoRow 
            icon={Building2} 
            label="Navn" 
            value={company.name} 
          />
          
          <InfoRow 
            icon={Hash} 
            label="CVR-nummer" 
            value={company.cvr} 
          />
          
          <InfoRow 
            icon={MapPin} 
            label="Adresse" 
            value={`${address.street}, ${address.postal} ${address.city}`} 
          />
          
          {ceo && (
            <InfoRow 
              icon={User} 
              label="Direktør" 
              value={
                <button
                  onClick={() => {
                    const accordionTrigger = document.querySelector('[data-accordion-value="signing-rules"]') as HTMLElement;
                    if (accordionTrigger) {
                      const accordionItem = accordionTrigger.closest('[data-state]');
                      if (accordionItem && accordionItem.getAttribute('data-state') === 'closed') {
                        accordionTrigger.click();
                      }
                      setTimeout(() => {
                        accordionTrigger.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }
                  }}
                  className="text-primary hover:underline cursor-pointer text-left"
                >
                  {ceo}
                </button>
              }
            />
          )}
          
          <InfoRow 
            icon={Briefcase} 
            label={isMobile ? "Form" : "Virksomhedsform"} 
            value={getLegalForm()} 
          />
          
          <InfoRow 
            icon={DollarSign} 
            label={isMobile ? "Kapital" : "Registreret kapital"} 
            value={extendedInfo?.registeredCapital} 
          />
          
          {extendedInfo?.purpose && (
            <InfoRow 
              icon={ScrollText} 
              label="Formål" 
              value={extendedInfo.purpose}
              className="!items-start"
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
                    <Info className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm break-words flex-1">
                    <span className={getRiskColor(riskScore.totalScore)}>
                      {riskScore.totalScore.toFixed(1)}/10.0 ({riskScore.riskLevelText})
                    </span>
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="font-semibold mb-2">Om SI Vurdering</p>
                <p className="text-sm mb-2">
                  SI Vurdering er en omfattende algoritmisk risikovurdering baseret på:
                </p>
                <ul className="text-xs space-y-1 mb-2">
                  <li>• <strong>Finansiel sundhed (40%)</strong>: Egenkapital, rentabilitet, likviditet, gældsgrad</li>
                  <li>• <strong>Finansielle tendenser (15%)</strong>: 3-5 års udvikling i nøgletal</li>
                  <li>• <strong>Cash flow & likviditet (10%)</strong>: Betalingsevne på kort sigt</li>
                  <li>• <strong>Gældsstruktur (8%)</strong>: Gældsbæreevne og struktur</li>
                  <li>• <strong>Virksomhedsstatus (15%)</strong>: Aktiv/inaktiv status</li>
                  <li>• <strong>Virksomhedsalder (7%)</strong>: Erfaring og stabilitet</li>
                  <li>• <strong>Ledelse & revision (7%)</strong>: Organisatorisk stabilitet</li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Scoren går fra 0 (ekstrem risiko) til 10 (lav risiko). Virksomheder med negativ egenkapital 
                  eller flere år med tab vil få markant lavere score.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BasicInfoAccordion;

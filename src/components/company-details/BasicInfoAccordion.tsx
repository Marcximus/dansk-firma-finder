
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { FileText, Building2, Hash, MapPin, Calendar, Briefcase, Globe, DollarSign, ScrollText, User } from 'lucide-react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { extractExtendedInfo } from '@/services/cvrUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BasicInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const BasicInfoAccordion: React.FC<BasicInfoAccordionProps> = ({ company, cvrData }) => {
  const isMobile = useIsMobile();
  
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

  const getWebsite = () => {
    if (!cvrData) return company.website;
    
    const currentWebsite = cvrData.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null);
    return currentWebsite?.kontaktoplysning || 
           cvrData.hjemmeside?.[cvrData.hjemmeside.length - 1]?.kontaktoplysning || 
           company.website || null;
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

  const getFounders = () => {
    if (!cvrData?.deltagerRelation) return null;
    
    const founders = cvrData.deltagerRelation.filter((relation: any) => {
      const roles = relation.organisationer?.[0]?.attributter || [];
      return roles.some((attr: any) => attr.type === 'STIFTER');
    });
    
    if (founders.length === 0) return null;
    
    return founders.map((founder: any) => {
      const org = founder.organisationer?.[0];
      return org?.navn?.[0]?.navn || 'Ikke oplyst';
    }).join(', ');
  };

  const website = getWebsite();
  const address = getAddress();
  const extendedInfo = extractExtendedInfo(cvrData);

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
          
          <InfoRow 
            icon={Calendar} 
            label="Startdato" 
            value={getStartDate()} 
          />
          
          {getFounders() && (
            <InfoRow 
              icon={User} 
              label="Stiftet af" 
              value={getFounders()} 
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
          
          {website && (
            <InfoRow 
              icon={Globe} 
              label="Hjemmeside" 
              value={
                <a 
                  href={website.startsWith('http') ? website : `https://${website}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  {website}
                </a>
              }
            />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BasicInfoAccordion;

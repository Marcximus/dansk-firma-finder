
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { FileText, Building2, Hash, MapPin, Calendar, Briefcase, Mail, Phone, Globe, Activity, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { extractExtendedInfo } from '@/services/cvrUtils';

interface BasicInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const BasicInfoAccordion: React.FC<BasicInfoAccordionProps> = ({ company, cvrData }) => {
  const InfoRow = ({ icon: Icon, label, value, className = "" }: { 
    icon: any, 
    label: string, 
    value: string | null | undefined | React.ReactNode, 
    className?: string 
  }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-muted-foreground min-w-[120px]">{label}:</span>
      <span className="text-sm">{value || 'Ikke tilgængelig'}</span>
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

  const getStatus = () => {
    if (!cvrData) return company.status || 'Ikke oplyst';
    
    const currentStatus = cvrData.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
    return currentStatus?.status || 
           cvrData.virksomhedsstatus?.[cvrData.virksomhedsstatus.length - 1]?.status ||
           company.status || 
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

  const contactInfo = getContactInfo();
  const website = getWebsite();
  const address = getAddress();
  const extendedInfo = extractExtendedInfo(cvrData);

  return (
    <AccordionItem value="basic" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="text-lg font-semibold">Grundoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-1">
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
          
          <InfoRow 
            icon={Briefcase} 
            label="Virksomhedsform" 
            value={getLegalForm()} 
          />
          
          <InfoRow 
            icon={DollarSign} 
            label="Registreret kapital" 
            value={extendedInfo?.registeredCapital ? 
              `${extendedInfo.registeredCapital.toLocaleString('da-DK')} DKK` : 
              undefined
            } 
          />
          
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
            value={extendedInfo?.phone} 
          />
          
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
          
          <InfoRow 
            icon={Activity} 
            label="Status" 
            value={getStatus()} 
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BasicInfoAccordion;

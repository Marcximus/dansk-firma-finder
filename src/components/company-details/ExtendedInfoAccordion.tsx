
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { extractExtendedInfo } from '@/services/cvrUtils';
import { Info, Phone, MapPin, Briefcase, TrendingUp, DollarSign, Calendar, FileText, Mail, Activity } from 'lucide-react';
import { formatPhoneNumber } from '@/services/utils/formatUtils';

interface ExtendedInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const ExtendedInfoAccordion: React.FC<ExtendedInfoAccordionProps> = ({ company, cvrData }) => {
  console.log('ExtendedInfoAccordion - Raw CVR Data:', cvrData);
  
  const extendedInfo = extractExtendedInfo(cvrData);
  console.log('ExtendedInfoAccordion - Extracted Info:', extendedInfo);

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

  const contactInfo = getContactInfo();

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
            icon={MapPin} 
            label="Kommune" 
            value={extendedInfo?.municipality?.kommuneNavn || extendedInfo?.municipality} 
          />
          
          <InfoRow 
            icon={Briefcase} 
            label="Branchekode" 
            value={extendedInfo?.primaryIndustry || company.industry} 
          />
          
          <InfoRow 
            icon={TrendingUp} 
            label="Børsnoteret" 
            value={extendedInfo?.isListed !== undefined ? (extendedInfo.isListed ? 'Ja' : 'Nej') : undefined} 
          />
          
          <InfoRow 
            icon={Calendar} 
            label="Regnskabsår" 
            value={extendedInfo?.accountingYear} 
          />

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


import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { extractExtendedInfo } from '@/services/cvrUtils';
import { Info, Phone, MapPin, Briefcase, Target, TrendingUp, DollarSign, Calendar, FileText, Mail, Activity } from 'lucide-react';

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
    <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 ${className}`}>
      <div className="flex items-center gap-2 sm:min-w-[140px]">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground font-medium">{label}:</span>
      </div>
      <span className="text-sm pl-6 sm:pl-0 break-words">{value || 'Ikke tilgængelig'}</span>
    </div>
  );

  return (
    <AccordionItem value="extended" className="border rounded-lg">
      <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-base sm:text-lg font-semibold">Udvidede virksomhedsoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-3 sm:space-y-2">
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
          
          <InfoRow 
            icon={Activity} 
            label="Status" 
            value={getStatus()} 
          />

          {/* Alternative Names */}
          {extendedInfo?.binavne && extendedInfo.binavne.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="flex items-center gap-2 sm:min-w-[140px]">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground font-medium">Binavne:</span>
              </div>
              <span className="text-sm pl-6 sm:pl-0 break-words">{extendedInfo.binavne.join(', ')}</span>
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

          {/* Purpose - Special handling for long text */}
          {extendedInfo?.purpose && (
            <div className="flex gap-2 sm:gap-3 border-t mt-3 sm:mt-4 pt-3 sm:pt-4">
              <Target className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground font-medium">Formål:</span>
                <p className="text-sm mt-1 leading-relaxed">{extendedInfo.purpose}</p>
              </div>
            </div>
          )}

          {/* Secondary Industries */}
          {extendedInfo?.secondaryIndustries && extendedInfo.secondaryIndustries.length > 0 && (
            <div className="flex gap-2 sm:gap-3 border-t mt-3 sm:mt-4 pt-3 sm:pt-4">
              <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground font-medium">Bibrancher:</span>
                <div className="mt-1 space-y-1">
                  {extendedInfo.secondaryIndustries.map((branch: any, index: number) => (
                    <div key={index} className="text-xs sm:text-sm break-words">
                      {branch.branchekode} {branch.branchetekst}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* Capital Classes */}
          {extendedInfo?.capitalClasses && extendedInfo.capitalClasses.length > 0 && (
            <div className="flex gap-2 sm:gap-3 border-t mt-3 sm:mt-4 pt-3 sm:pt-4">
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground font-medium">Kapitalklasser:</span>
                <div className="mt-1 space-y-2">
                  {extendedInfo.capitalClasses.map((kapital: any, index: number) => (
                    <div key={index} className="text-xs sm:text-sm">
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

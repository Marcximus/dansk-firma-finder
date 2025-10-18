
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { extractExtendedInfo } from '@/services/cvrUtils';
import { Info, Phone, MapPin, Briefcase, Target, TrendingUp, DollarSign, Calendar, FileText, Mail, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <div className={`flex items-center gap-3 ${className}`}>
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-muted-foreground min-w-[120px]">{label}:</span>
      <span className="text-sm">{value || 'Ikke tilgængelig'}</span>
    </div>
  );

  return (
    <AccordionItem value="extended" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-lg font-semibold">Udvidede virksomhedsoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-1">
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
          
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground min-w-[120px]">Status:</span>
            <span className="text-sm">
              {(getStatus() === 'NORMAL' || getStatus() === 'Aktiv') ? (
                <Badge className="animate-pulse bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30">
                  {getStatus()}
                </Badge>
              ) : (
                getStatus()
              )}
            </span>
          </div>

          {/* Alternative Names */}
          {extendedInfo?.binavne && extendedInfo.binavne.length > 0 && (
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground min-w-[120px]">Binavne:</span>
              <span className="text-sm">{extendedInfo.binavne.join(', ')}</span>
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
            <div className="flex gap-3 border-t mt-4 pt-4">
              <Target className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Formål:</span>
                <p className="text-sm mt-1 leading-relaxed">{extendedInfo.purpose}</p>
              </div>
            </div>
          )}

          {/* Secondary Industries */}
          {extendedInfo?.secondaryIndustries && extendedInfo.secondaryIndustries.length > 0 && (
            <div className="flex gap-3 border-t mt-4 pt-4">
              <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Bibrancher:</span>
                <div className="mt-1 space-y-1">
                  {extendedInfo.secondaryIndustries.map((branch: any, index: number) => (
                    <div key={index} className="text-sm">
                      {branch.branchekode} {branch.branchetekst}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* Capital Classes */}
          {extendedInfo?.capitalClasses && extendedInfo.capitalClasses.length > 0 && (
            <div className="flex gap-3 border-t mt-4 pt-4">
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Kapitalklasser:</span>
                <div className="mt-1 space-y-2">
                  {extendedInfo.capitalClasses.map((kapital: any, index: number) => (
                    <div key={index} className="text-sm">
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


import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { extractExtendedInfo } from '@/services/cvrUtils';
import { Info, Phone, MapPin, Briefcase, Target, TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react';

interface ExtendedInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const ExtendedInfoAccordion: React.FC<ExtendedInfoAccordionProps> = ({ company, cvrData }) => {
  console.log('ExtendedInfoAccordion - Raw CVR Data:', cvrData);
  
  const extendedInfo = extractExtendedInfo(cvrData);
  console.log('ExtendedInfoAccordion - Extracted Info:', extendedInfo);

  const InfoRow = ({ icon: Icon, label, value, className = "" }: { 
    icon: any, 
    label: string, 
    value: string | null | undefined, 
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
          {/* Alternative Names */}
          {extendedInfo?.binavne && extendedInfo.binavne.length > 0 && (
            <div className="flex gap-3 mb-4">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Binavne:</span>
                <div className="mt-1">
                  {extendedInfo.binavne.map((navn: string, index: number) => (
                    <div key={index} className="text-sm">{navn}</div>
                  ))}
                </div>
              </div>
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
            value={company.industry} 
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
          
          <InfoRow 
            icon={Calendar} 
            label="Første regnskabsperiode" 
            value={extendedInfo?.firstAccountingPeriod} 
          />
          
          <InfoRow 
            icon={FileText} 
            label="Seneste vedtægtsdato" 
            value={extendedInfo?.latestStatuteDate} 
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

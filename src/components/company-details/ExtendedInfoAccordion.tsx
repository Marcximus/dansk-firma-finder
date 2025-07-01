
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
  const extendedInfo = extractExtendedInfo(cvrData);
  
  if (!extendedInfo) {
    return (
      <AccordionItem value="extended" className="border rounded-lg">
        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span className="text-lg font-semibold">Udvidede virksomhedsoplysninger</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div className="text-muted-foreground">Ingen udvidede oplysninger tilgængelige</div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem value="extended" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-lg font-semibold">Udvidede virksomhedsoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Telefon */}
          {extendedInfo.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Telefon</div>
                <div className="font-semibold">{extendedInfo.phone}</div>
              </div>
            </div>
          )}

          {/* Kommune */}
          {extendedInfo.municipality && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Kommune</div>
                <div className="font-semibold">
                  {extendedInfo.municipality.kommuneNavn || extendedInfo.municipality}
                </div>
              </div>
            </div>
          )}

          {/* Branchekode */}
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Branchekode</div>
              <div className="font-semibold">{company.industry}</div>
            </div>
          </div>

          {/* Børsnoteret */}
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Børsnoteret</div>
              <div className="font-semibold">{extendedInfo.isListed ? 'Ja' : 'Nej'}</div>
            </div>
          </div>

          {/* Regnskabsår */}
          {extendedInfo.accountingYear && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Regnskabsår</div>
                <div className="font-semibold">{extendedInfo.accountingYear}</div>
              </div>
            </div>
          )}

          {/* Seneste vedtægtsdato */}
          {extendedInfo.latestStatuteDate && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Seneste vedtægtsdato</div>
                <div className="font-semibold">{extendedInfo.latestStatuteDate}</div>
              </div>
            </div>
          )}

          {/* Registreret kapital */}
          {extendedInfo.registeredCapital && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Registreret kapital</div>
                <div className="font-semibold">{extendedInfo.registeredCapital.toLocaleString('da-DK')} DKK</div>
              </div>
            </div>
          )}

          {/* Bibrancher */}
          {extendedInfo.secondaryIndustries.length > 0 && (
            <div className="flex items-start gap-3 md:col-span-2">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-2">Bibrancher</div>
                <div className="space-y-1">
                  {extendedInfo.secondaryIndustries.map((branch: any, index: number) => (
                    <div key={index} className="font-medium text-sm">
                      {branch.branchekode} {branch.branchetekst}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Formål */}
          {extendedInfo.purpose && (
            <div className="flex items-start gap-3 md:col-span-2">
              <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Formål</div>
                <div className="font-semibold text-sm leading-relaxed">{extendedInfo.purpose}</div>
              </div>
            </div>
          )}

          {/* Binavne */}
          {extendedInfo.binavne.length > 0 && (
            <div className="flex items-start gap-3 md:col-span-2">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-2">Binavne</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {extendedInfo.binavne.map((navn: string, index: number) => (
                    <div key={index} className="font-medium text-sm">{navn}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Kapitalklasser */}
          {extendedInfo.capitalClasses.length > 0 && (
            <div className="flex items-start gap-3 md:col-span-2">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-2">Kapitalklasser</div>
                <div className="space-y-2">
                  {extendedInfo.capitalClasses.map((kapital: any, index: number) => (
                    <div key={index} className="text-sm border-l-2 border-gray-200 pl-3">
                      <div className="font-medium">{kapital.kapitalklasse}</div>
                      {kapital.kapitalbeloeb && (
                        <div className="text-muted-foreground">{kapital.kapitalbeloeb.toLocaleString('da-DK')} {kapital.valuta || 'DKK'}</div>
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

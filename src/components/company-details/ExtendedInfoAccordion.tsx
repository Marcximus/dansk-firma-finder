
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

  return (
    <AccordionItem value="extended" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-lg font-semibold">Udvidede virksomhedsoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Telefon */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Telefon</div>
                <div className="font-semibold">
                  {extendedInfo?.phone || 'Ikke tilgængelig'}
                </div>
              </div>
            </div>

            {/* Kommune */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Kommune</div>
                <div className="font-semibold">
                  {extendedInfo?.municipality?.kommuneNavn || extendedInfo?.municipality || 'Ikke tilgængelig'}
                </div>
              </div>
            </div>

            {/* Branchekode */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Branchekode</div>
                <div className="font-semibold">{company.industry || 'Ikke tilgængelig'}</div>
              </div>
            </div>

            {/* Børsnoteret */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Børsnoteret</div>
                <div className="font-semibold">
                  {extendedInfo?.isListed !== undefined ? (extendedInfo.isListed ? 'Ja' : 'Nej') : 'Ikke tilgængelig'}
                </div>
              </div>
            </div>

            {/* Regnskabsår */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Regnskabsår</div>
                <div className="font-semibold">{extendedInfo?.accountingYear || 'Ikke tilgængelig'}</div>
              </div>
            </div>

            {/* Seneste vedtægtsdato */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Seneste vedtægtsdato</div>
                <div className="font-semibold">{extendedInfo?.latestStatuteDate || 'Ikke tilgængelig'}</div>
              </div>
            </div>
          </div>

          {/* Registreret kapital - Single row */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Registreret kapital</div>
              <div className="font-semibold">
                {extendedInfo?.registeredCapital ? 
                  `${extendedInfo.registeredCapital.toLocaleString('da-DK')} DKK` : 
                  'Ikke tilgængelig'
                }
              </div>
            </div>
          </div>

          {/* Formål - Full width */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Formål</div>
              <div className="font-semibold text-sm leading-relaxed">
                {extendedInfo?.purpose || 'Ikke tilgængelig'}
              </div>
            </div>
          </div>

          {/* Bibrancher */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-2">Bibrancher</div>
              <div className="space-y-1">
                {extendedInfo?.secondaryIndustries && extendedInfo.secondaryIndustries.length > 0 ? (
                  extendedInfo.secondaryIndustries.map((branch: any, index: number) => (
                    <div key={index} className="font-medium text-sm">
                      {branch.branchekode} {branch.branchetekst}
                    </div>
                  ))
                ) : (
                  <div className="font-semibold text-sm">Ingen bibrancher registreret</div>
                )}
              </div>
            </div>
          </div>

          {/* Binavne */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-2">Binavne</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {extendedInfo?.binavne && extendedInfo.binavne.length > 0 ? (
                  extendedInfo.binavne.map((navn: string, index: number) => (
                    <div key={index} className="font-medium text-sm">{navn}</div>
                  ))
                ) : (
                  <div className="font-semibold text-sm">Ingen binavne registreret</div>
                )}
              </div>
            </div>
          </div>

          {/* Kapitalklasser */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-2">Kapitalklasser</div>
              <div className="space-y-2">
                {extendedInfo?.capitalClasses && extendedInfo.capitalClasses.length > 0 ? (
                  extendedInfo.capitalClasses.map((kapital: any, index: number) => (
                    <div key={index} className="text-sm border-l-2 border-gray-200 pl-3">
                      <div className="font-medium">{kapital.kapitalklasse || 'Ukendt kapitalklasse'}</div>
                      {kapital.kapitalbeloeb && (
                        <div className="text-muted-foreground">
                          {kapital.kapitalbeloeb.toLocaleString('da-DK')} {kapital.valuta || 'DKK'}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="font-semibold text-sm">Ingen kapitalklasser registreret</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ExtendedInfoAccordion;

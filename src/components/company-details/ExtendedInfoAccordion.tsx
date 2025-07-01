
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { Info, Phone, MapPin, Briefcase, Target, TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react';

interface ExtendedInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const ExtendedInfoAccordion: React.FC<ExtendedInfoAccordionProps> = ({ company, cvrData }) => {
  if (!cvrData) return null;

  const getCurrentValue = (array: any[], fieldName: string) => {
    if (!array || array.length === 0) return null;
    const current = array.find((item: any) => item.periode?.gyldigTil === null);
    return current?.[fieldName] || array[array.length - 1]?.[fieldName] || null;
  };

  const getAllNames = () => {
    const binavne = cvrData.binavne || [];
    return binavne.map((navn: any) => navn.navn).filter(Boolean);
  };

  const getSecondaryIndustries = () => {
    const secondary = [
      ...(cvrData.bibranche1 || []),
      ...(cvrData.bibranche2 || []),
      ...(cvrData.bibranche3 || [])
    ];
    return secondary.filter((branch: any) => !branch.periode?.gyldigTil);
  };

  const getAccountingYear = () => {
    const regnskabsperiode = cvrData.regnskabsperiode || [];
    const current = regnskabsperiode.find((periode: any) => periode.periode?.gyldigTil === null) || regnskabsperiode[regnskabsperiode.length - 1];
    if (current) {
      return `${current.regnskabsperiodefra} - ${current.regnskabsperiodetil}`;
    }
    return null;
  };

  const getLatestStatuteDate = () => {
    // Look for statute/vedtægt dates in various fields
    const vedtaegter = cvrData.vedtaegter || [];
    const latest = vedtaegter.find((v: any) => v.periode?.gyldigTil === null) || vedtaegter[vedtaegter.length - 1];
    return latest?.dato || null;
  };

  const getCapitalClasses = () => {
    const kapitalforhold = cvrData.kapitalforhold || [];
    return kapitalforhold.filter((k: any) => !k.periode?.gyldigTil);
  };

  const getRegisteredCapital = () => {
    const kapitalforhold = cvrData.kapitalforhold || [];
    const current = kapitalforhold.find((k: any) => !k.periode?.gyldigTil && k.kapitalbeloeb);
    return current?.kapitalbeloeb || cvrData.registreretKapital || null;
  };

  const currentPhone = cvrData.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
  const municipality = getCurrentValue(cvrData.beliggenhedsadresse, 'kommune');
  const purpose = cvrData.formaal || "Ikke oplyst";
  const binavne = getAllNames();
  const secondaryIndustries = getSecondaryIndustries();
  const isListed = cvrData.boersnoteret || false;
  const accountingYear = getAccountingYear();
  const latestStatuteDate = getLatestStatuteDate();
  const capitalClasses = getCapitalClasses();
  const registeredCapital = getRegisteredCapital();
  
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
          {currentPhone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Telefon</div>
                <div className="font-semibold">{currentPhone.kontaktoplysning}</div>
              </div>
            </div>
          )}

          {municipality && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Kommune</div>
                <div className="font-semibold">{municipality.kommuneNavn || municipality}</div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Branchekode</div>
              <div className="font-semibold">{company.industry}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Børsnoteret</div>
              <div className="font-semibold">{isListed ? 'Ja' : 'Nej'}</div>
            </div>
          </div>

          {accountingYear && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Regnskabsår</div>
                <div className="font-semibold">{accountingYear}</div>
              </div>
            </div>
          )}

          {latestStatuteDate && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Seneste vedtægtsdato</div>
                <div className="font-semibold">{latestStatuteDate}</div>
              </div>
            </div>
          )}

          {registeredCapital && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Registreret kapital</div>
                <div className="font-semibold">{registeredCapital.toLocaleString('da-DK')} DKK</div>
              </div>
            </div>
          )}

          {secondaryIndustries.length > 0 && (
            <div className="flex items-start gap-3 md:col-span-2">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-2">Bibrancher</div>
                <div className="space-y-1">
                  {secondaryIndustries.map((branch: any, index: number) => (
                    <div key={index} className="font-medium text-sm">
                      {branch.branchekode} {branch.branchetekst}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 md:col-span-2">
            <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Formål</div>
              <div className="font-semibold text-sm leading-relaxed">{purpose}</div>
            </div>
          </div>

          {binavne.length > 0 && (
            <div className="flex items-start gap-3 md:col-span-2">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-2">Binavne</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {binavne.map((navn: string, index: number) => (
                    <div key={index} className="font-medium text-sm">{navn}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {capitalClasses.length > 0 && (
            <div className="flex items-start gap-3 md:col-span-2">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-2">Kapitalklasser</div>
                <div className="space-y-2">
                  {capitalClasses.map((kapital: any, index: number) => (
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

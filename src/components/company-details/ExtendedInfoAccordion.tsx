
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Company } from '@/services/companyAPI';
import { Info, Phone, MapPin, Briefcase, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';

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

  const currentPhone = cvrData.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
  const municipality = getCurrentValue(cvrData.beliggenhedsadresse, 'kommune');
  const purpose = cvrData.formaal || "Ikke oplyst";
  const binavne = getAllNames();
  const secondaryIndustries = getSecondaryIndustries();
  const isListed = cvrData.boersnoteret || false;
  
  return (
    <AccordionItem value="extended" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-lg font-semibold">Udvidede virksomhedsoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {currentPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Telefon</div>
                      <div className="font-semibold">{currentPhone.kontaktoplysning}</div>
                    </div>
                  </div>
                )}

                {municipality && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Kommune</div>
                      <div className="font-semibold">{municipality}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Branchekode</div>
                    <div className="font-semibold">{company.industry}</div>
                  </div>
                </div>

                {secondaryIndustries.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Bibrancher</div>
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
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Formål</div>
                    <div className="font-semibold text-sm leading-relaxed">{purpose}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Børsnoteret</div>
                    <div className="font-semibold">{isListed ? 'Ja' : 'Nej'}</div>
                  </div>
                </div>

                {binavne.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Binavne</div>
                      <div className="space-y-1">
                        {binavne.map((navn: string, index: number) => (
                          <div key={index} className="font-medium text-sm">{navn}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {cvrData.registreretKapital && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Registreret kapital</div>
                      <div className="font-semibold">{cvrData.registreretKapital.toLocaleString('da-DK')} DKK</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ExtendedInfoAccordion;

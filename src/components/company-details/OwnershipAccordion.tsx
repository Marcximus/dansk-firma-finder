
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, MapPin, Calendar } from 'lucide-react';

interface OwnershipAccordionProps {
  cvrData: any;
}

const OwnershipAccordion: React.FC<OwnershipAccordionProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  // Mock ownership data - in real implementation this would come from CVR data
  const legaleEjere = cvrData.legaleEjere || [];
  const datterselskaber = cvrData.datterselskaber || [];

  return (
    <AccordionItem value="ownership" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <span className="text-lg font-semibold">Ejerforhold & Datterselskaber</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {legaleEjere.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-4">Legale ejere</h4>
                  <div className="space-y-4">
                    {legaleEjere.map((ejer: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <div className="font-semibold">{ejer.navn}</div>
                            <div className="text-sm text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {ejer.adresse}
                            </div>
                            <div className="text-sm">
                              <div>Ejerandel: {ejer.ejerandel}</div>
                              <div>Stemmerettigheder: {ejer.stemmerettigheder}</div>
                              {ejer.periode && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Periode: {ejer.periode}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold mb-4">Legale ejere</h4>
                  <div className="text-muted-foreground">Ingen oplysninger om legale ejere tilgængelige</div>
                </div>
              )}

              {datterselskaber.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-4">Datterselskaber</h4>
                  <div className="space-y-4">
                    {datterselskaber.map((datter: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <div className="font-semibold">{datter.navn}</div>
                            <div className="text-sm text-muted-foreground">
                              CVR: {datter.cvr}
                            </div>
                            <div className="text-sm">
                              Ejerandel: {datter.ejerandel}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold mb-4">Datterselskaber</h4>
                  <div className="text-muted-foreground">Ingen oplysninger om datterselskaber tilgængelige</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};

export default OwnershipAccordion;

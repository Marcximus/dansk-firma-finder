
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building2, MapPin, Calendar } from 'lucide-react';

interface OwnershipAccordionProps {
  cvrData: any;
}

const OwnershipAccordion: React.FC<OwnershipAccordionProps> = ({ cvrData }) => {
  if (!cvrData) return null;

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
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Legale ejere
            </h4>
            {legaleEjere.length > 0 ? (
              <div className="space-y-3">
                {legaleEjere.map((ejer: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-200 pl-4">
                    <div className="font-semibold text-base">{ejer.navn}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" />
                      {ejer.adresse}
                    </div>
                    <div className="text-sm space-y-0.5">
                      <div>Ejerandel: <span className="font-medium">{ejer.ejerandel}</span></div>
                      <div>Stemmerettigheder: <span className="font-medium">{ejer.stemmerettigheder}</span></div>
                      {ejer.periode && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Periode: {ejer.periode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Ingen oplysninger om legale ejere tilgængelige</div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Datterselskaber
            </h4>
            {datterselskaber.length > 0 ? (
              <div className="space-y-3">
                {datterselskaber.map((datter: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <div className="font-semibold text-base">{datter.navn}</div>
                    <div className="text-sm text-muted-foreground">
                      CVR: {datter.cvr}
                    </div>
                    <div className="text-sm">
                      Ejerandel: <span className="font-medium">{datter.ejerandel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Ingen oplysninger om datterselskaber tilgængelige</div>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default OwnershipAccordion;

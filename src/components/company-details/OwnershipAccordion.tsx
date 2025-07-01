
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { extractOwnershipData } from '@/services/cvrUtils';
import { Building2, MapPin, Calendar, Percent, Users, X } from 'lucide-react';

interface OwnershipAccordionProps {
  cvrData: any;
}

const OwnershipAccordion: React.FC<OwnershipAccordionProps> = ({ cvrData }) => {
  const ownershipData = extractOwnershipData(cvrData);
  
  if (!ownershipData) {
    return (
      <AccordionItem value="ownership" className="border rounded-lg">
        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <span className="text-lg font-semibold">Ejerforhold & Datterselskaber</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div className="text-muted-foreground text-sm">Ingen oplysninger om ejerforhold tilgængelige</div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  const renderOwners = (owners: any[], title: string, icon: JSX.Element, isFormer: boolean = false) => {
    if (owners.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <div className="space-y-3">
          {owners.map((ejer: any, index: number) => (
            <div key={index} className={`border-l-4 ${isFormer ? 'border-red-200' : 'border-green-200'} pl-4`}>
              <div className="font-semibold text-base">{ejer.navn}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" />
                {ejer.adresse}
              </div>
              <div className="text-sm space-y-0.5">
                {ejer.ejerandel && ejer.ejerandel !== 'Ikke oplyst' && (
                  <div className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    <span>Ejerandel: <span className="font-medium">{ejer.ejerandel}</span></span>
                  </div>
                )}
                {ejer.stemmerettigheder && ejer.stemmerettigheder !== 'Ikke oplyst' && (
                  <div className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    <span>Stemmerettigheder: <span className="font-medium">{ejer.stemmerettigheder}</span></span>
                  </div>
                )}
                {ejer.periode && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Periode: {ejer.periode.gyldigFra || 'Ukendt'} - {ejer.periode.gyldigTil || 'Nuværende'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
          {/* Legale ejere */}
          {renderOwners(ownershipData.currentOwners, 'Legale ejere', <Users className="h-4 w-4 text-green-600" />)}
          
          {/* Ophørte legale ejere */}
          {renderOwners(ownershipData.formerOwners, 'Ophørte legale ejere', <X className="h-4 w-4 text-red-600" />, true)}

          {/* Reelle ejere */}
          {ownershipData.rielleEjere.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Reelle ejere
              </h4>
              <div className="space-y-3">
                {ownershipData.rielleEjere.map((ejer: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <div className="font-semibold text-base">{ejer.navn}</div>
                    <div className="text-sm text-muted-foreground mb-1">{ejer.adresse}</div>
                    {ejer.kontrolform && (
                      <div className="text-sm">
                        Kontrolform: <span className="font-medium">{ejer.kontrolform}</span>
                      </div>
                    )}
                    {ejer.periode && (
                      <div className="text-sm text-muted-foreground">
                        Periode: {ejer.periode.gyldigFra || 'Ukendt'} - {ejer.periode.gyldigTil || 'Nuværende'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {ownershipData.currentOwners.length === 0 && ownershipData.formerOwners.length === 0 && ownershipData.rielleEjere.length === 0 && (
            <div className="text-muted-foreground text-sm">Ingen oplysninger om ejerforhold tilgængelige</div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default OwnershipAccordion;

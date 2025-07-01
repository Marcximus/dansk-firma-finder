
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building2, MapPin, Calendar, Percent, Users, X } from 'lucide-react';

interface OwnershipAccordionProps {
  cvrData: any;
}

const OwnershipAccordion: React.FC<OwnershipAccordionProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  const formatAddress = (addr: any) => {
    if (!addr) return 'Adresse ikke tilgængelig';
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage}. sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return streetAddress && postalInfo ? `${streetAddress}, ${postalInfo}` : 'Adresse ikke tilgængelig';
  };

  const getOwnershipFromRelations = () => {
    const relations = cvrData.deltagerRelation || [];
    return relations.filter((relation: any) => 
      relation.organisationer?.some((org: any) => 
        org.hovedtype === 'EJER' || 
        org.hovedtype === 'FULDT_ANSVARLIG_DELTAGERE' ||
        org.medlemsData?.some((medlem: any) => 
          medlem.attributter?.some((attr: any) => 
            attr.type === 'EJERANDEL' || attr.type === 'STEMMERETTIGHEDER'
          )
        )
      )
    ).map((relation: any) => {
      const deltager = relation.deltager;
      const personName = deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null)?.navn || 
                       deltager?.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
      
      const address = deltager?.adresser?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                     deltager?.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                     deltager?.adresser?.[0] ||
                     deltager?.beliggenhedsadresse?.[0];

      let ejerandel = null;
      let stemmerettigheder = null;
      let periode = null;

      relation.organisationer?.forEach((org: any) => {
        org.medlemsData?.forEach((medlem: any) => {
          periode = periode || medlem.periode;
          medlem.attributter?.forEach((attr: any) => {
            if (attr.type === 'EJERANDEL' && attr.vaerdier?.[0]?.vaerdi) {
              ejerandel = attr.vaerdier[0].vaerdi;
            }
            if (attr.type === 'STEMMERETTIGHEDER' && attr.vaerdier?.[0]?.vaerdi) {
              stemmerettigheder = attr.vaerdier[0].vaerdi;
            }
          });
        });
      });

      return {
        navn: personName,
        adresse: formatAddress(address),
        ejerandel: ejerandel || 'Ikke oplyst',
        stemmerettigheder: stemmerettigheder || 'Ikke oplyst',
        periode: periode,
        isActive: !periode?.gyldigTil
      };
    });
  };

  // Get legal owners from CVR data
  const legaleEjere = cvrData.legaleEjere || [];
  
  // Get ownership from relations
  const ownershipFromRelations = getOwnershipFromRelations();
  
  // Combine all current owners
  const currentOwners = [
    ...legaleEjere.filter((ejer: any) => !ejer.periode?.gyldigTil),
    ...ownershipFromRelations.filter((owner: any) => owner.isActive)
  ];

  // Get former owners
  const formerOwners = [
    ...legaleEjere.filter((ejer: any) => ejer.periode?.gyldigTil),
    ...ownershipFromRelations.filter((owner: any) => !owner.isActive)
  ];

  // Get beneficial owners (reelle ejere)
  const rielleEjere = cvrData.rielleEjere || cvrData.beneficialOwners || [];

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
          {renderOwners(currentOwners, 'Legale ejere', <Users className="h-4 w-4 text-green-600" />)}
          
          {renderOwners(formerOwners, 'Ophørte legale ejere', <X className="h-4 w-4 text-red-600" />, true)}

          {rielleEjere.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Reelle ejere
              </h4>
              <div className="space-y-3">
                {rielleEjere.map((ejer: any, index: number) => (
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

          {currentOwners.length === 0 && formerOwners.length === 0 && rielleEjere.length === 0 && (
            <div className="text-muted-foreground text-sm">Ingen oplysninger om ejerforhold tilgængelige</div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default OwnershipAccordion;

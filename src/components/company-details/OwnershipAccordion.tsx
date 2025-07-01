
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building2, MapPin, Calendar, Percent, Users } from 'lucide-react';

interface OwnershipAccordionProps {
  cvrData: any;
}

const OwnershipAccordion: React.FC<OwnershipAccordionProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  // Enhanced data extraction for ownership information
  const legaleEjere = cvrData.legaleEjere || [];
  const datterselskaber = cvrData.datterselskaber || [];
  const moderselskaber = cvrData.moderselskaber || [];
  const koncernforhold = cvrData.koncernforhold || [];
  
  // Extract ownership from deltagerRelation as well
  const ownershipFromRelations = cvrData.deltagerRelation?.filter((relation: any) => 
    relation.organisationer?.some((org: any) => 
      org.hovedtype === 'EJER' || 
      org.hovedtype === 'FULDT_ANSVARLIG_DELTAGERE' ||
      org.medlemsData?.some((medlem: any) => 
        medlem.attributter?.some((attr: any) => 
          attr.type === 'EJERANDEL' || attr.type === 'STEMMERETTIGHEDER'
        )
      )
    )
  ) || [];

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

  const getOwnershipFromRelation = (relation: any) => {
    const deltager = relation.deltager;
    const personName = deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null)?.navn || 
                     deltager?.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
    
    const address = deltager?.adresser?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                   deltager?.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                   deltager?.adresser?.[0] ||
                   deltager?.beliggenhedsadresse?.[0];

    let ejerandel = null;
    let stemmerettigheder = null;

    relation.organisationer?.forEach((org: any) => {
      org.medlemsData?.forEach((medlem: any) => {
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
      periode: relation.organisationer?.[0]?.medlemsData?.[0]?.periode || null
    };
  };

  const allOwners = [
    ...legaleEjere,
    ...ownershipFromRelations.map(getOwnershipFromRelation)
  ];

  return (
    <AccordionItem value="ownership" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <span className="text-lg font-semibold">Ejerforhold & Koncernstruktur</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Ownership Information */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ejere og interessenter
            </h4>
            {allOwners.length > 0 ? (
              <div className="space-y-3">
                {allOwners.map((ejer: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-200 pl-4">
                    <div className="font-semibold text-base">{ejer.navn}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" />
                      {ejer.adresse}
                    </div>
                    <div className="text-sm space-y-0.5">
                      {ejer.ejerandel && (
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          <span>Ejerandel: <span className="font-medium">{ejer.ejerandel}</span></span>
                        </div>
                      )}
                      {ejer.stemmerettigheder && (
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
            ) : (
              <div className="text-muted-foreground text-sm">Ingen oplysninger om ejere tilgængelige</div>
            )}
          </div>

          {/* Parent Companies */}
          {moderselskaber.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Moderselskaber
              </h4>
              <div className="space-y-3">
                {moderselskaber.map((moder: any, index: number) => (
                  <div key={index} className="border-l-4 border-purple-200 pl-4">
                    <div className="font-semibold text-base">{moder.navn}</div>
                    {moder.cvr && (
                      <div className="text-sm text-muted-foreground">CVR: {moder.cvr}</div>
                    )}
                    {moder.land && (
                      <div className="text-sm text-muted-foreground">Land: {moder.land}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subsidiaries */}
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
                    {datter.cvr && (
                      <div className="text-sm text-muted-foreground">CVR: {datter.cvr}</div>
                    )}
                    {datter.ejerandel && (
                      <div className="text-sm">
                        Ejerandel: <span className="font-medium">{datter.ejerandel}</span>
                      </div>
                    )}
                    {datter.land && (
                      <div className="text-sm text-muted-foreground">Land: {datter.land}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Ingen oplysninger om datterselskaber tilgængelige</div>
            )}
          </div>

          {/* Group Relations */}
          {koncernforhold.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Koncernforhold
              </h4>
              <div className="space-y-3">
                {koncernforhold.map((koncern: any, index: number) => (
                  <div key={index} className="border-l-4 border-orange-200 pl-4">
                    <div className="font-semibold text-base">{koncern.navn || koncern.type}</div>
                    {koncern.beskrivelse && (
                      <div className="text-sm">{koncern.beskrivelse}</div>
                    )}
                    {koncern.periode && (
                      <div className="text-sm text-muted-foreground">
                        Periode: {koncern.periode.gyldigFra || 'Ukendt'} - {koncern.periode.gyldigTil || 'Nuværende'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default OwnershipAccordion;

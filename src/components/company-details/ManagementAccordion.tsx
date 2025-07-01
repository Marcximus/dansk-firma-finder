
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Crown, Shield, UserCheck, Building } from 'lucide-react';

interface ManagementAccordionProps {
  cvrData: any;
}

const ManagementAccordion: React.FC<ManagementAccordionProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  const relations = cvrData.deltagerRelation || [];

  const getPersonName = (deltager: any) => {
    if (!deltager) return 'Ukendt';
    const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
    return currentName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
  };

  const getPersonAddress = (deltager: any) => {
    if (!deltager) return 'Adresse ikke tilgængelig';
    
    // Check for addresses in the deltager object
    const currentAddress = deltager.adresser?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                          deltager.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
    
    const addr = currentAddress || 
                deltager.adresser?.[deltager.adresser.length - 1] ||
                deltager.beliggenhedsadresse?.[deltager.beliggenhedsadresse.length - 1];
    
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

  const getRoleIcon = (hovedtype: string) => {
    switch (hovedtype) {
      case 'DIREKTION':
        return <Crown className="h-4 w-4 text-amber-600" />;
      case 'BESTYRELSE':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'FULDT_ANSVARLIG_DELTAGERE':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'EJER':
        return <Building className="h-4 w-4 text-purple-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleDisplayName = (hovedtype: string, memberData?: any) => {
    let baseName = hovedtype;
    
    switch (hovedtype) {
      case 'DIREKTION':
        baseName = 'Direktion';
        break;
      case 'BESTYRELSE':
        baseName = 'Bestyrelse';
        break;
      case 'FULDT_ANSVARLIG_DELTAGERE':
        baseName = 'Fuldt Ansvarlig Deltager';
        break;
      case 'REVISION':
        baseName = 'Revision';
        break;
      case 'EJER':
        baseName = 'Ejer';
        break;
      default:
        baseName = hovedtype.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    // Get more specific role from member data
    if (memberData && memberData.attributter) {
      const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
      if (funkAttribute && funkAttribute.vaerdier && funkAttribute.vaerdier.length > 0) {
        const specificRole = funkAttribute.vaerdier[0].vaerdi;
        if (specificRole !== hovedtype) {
          return `${baseName} - ${specificRole}`;
        }
      }
    }

    return baseName;
  };

  const formatPeriod = (periode: any) => {
    if (!periode) return 'Ukendt periode';
    const from = periode.gyldigFra || 'Ukendt';
    const to = periode.gyldigTil || 'Nuværende';
    return `${from} - ${to}`;
  };

  if (relations.length === 0) {
    return (
      <AccordionItem value="management" className="border rounded-lg">
        <AccordionTrigger className="px-6 py-4 hover:no-underline">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="text-lg font-semibold">Ledelse & Ejerskab</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6">
          <div className="text-muted-foreground">Ingen ledelsesoplysninger tilgængelige</div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem value="management" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="text-lg font-semibold">Ledelse & Ejerskab</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-4">
          {relations.map((relation: any, index: number) => {
            const personName = getPersonName(relation.deltager);
            const personAddress = getPersonAddress(relation.deltager);

            return (
              <div key={index} className="border-l-4 border-blue-200 pl-4 py-3">
                <div className="font-semibold text-base mb-2">{personName}</div>
                <div className="text-sm text-muted-foreground mb-3">{personAddress}</div>
                
                {relation.organisationer && relation.organisationer.length > 0 && (
                  <div className="space-y-2">
                    {relation.organisationer.map((org: any, orgIndex: number) => (
                      <div key={orgIndex} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                        {getRoleIcon(org.hovedtype)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {getRoleDisplayName(org.hovedtype, org.medlemsData?.[0])}
                          </div>
                          {org.medlemsData && org.medlemsData.map((medlem: any, medlemIndex: number) => (
                            <div key={medlemIndex} className="text-xs text-muted-foreground mt-1">
                              {medlem.periode && (
                                <div>Periode: {formatPeriod(medlem.periode)}</div>
                              )}
                              {medlem.attributter && medlem.attributter.map((attr: any, attrIndex: number) => (
                                <div key={attrIndex} className="mt-1">
                                  {attr.type !== 'FUNKTION' && attr.vaerdier && (
                                    <div>
                                      <strong>{attr.type}:</strong> {attr.vaerdier.map((v: any) => v.vaerdi).join(', ')}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ManagementAccordion;

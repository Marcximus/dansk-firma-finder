
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Crown, Shield, UserCheck, FileText } from 'lucide-react';

interface ManagementAccordionProps {
  cvrData: any;
}

const ManagementAccordion: React.FC<ManagementAccordionProps> = ({ cvrData }) => {
  if (!cvrData?.deltagerRelation) return null;

  const relations = cvrData.deltagerRelation || [];

  const getPersonName = (deltager: any) => {
    const currentName = deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
    return currentName?.navn || deltager?.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
  };

  const getPersonAddress = (deltager: any) => {
    const currentAddress = deltager?.adresser?.find((addr: any) => addr.periode?.gyldigTil === null);
    const addr = currentAddress || deltager?.adresser?.[deltager.adresser.length - 1];
    
    if (!addr) return 'Adresse ikke tilgængelig';
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return `${streetAddress}, ${postalInfo}`;
  };

  const getRoleIcon = (hovedtype: string) => {
    switch (hovedtype) {
      case 'DIREKTION':
        return <Crown className="h-4 w-4" />;
      case 'BESTYRELSE':
        return <Shield className="h-4 w-4" />;
      case 'FULDT_ANSVARLIG_DELTAGERE':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleDisplayName = (hovedtype: string) => {
    switch (hovedtype) {
      case 'DIREKTION':
        return 'Direktion';
      case 'BESTYRELSE':
        return 'Bestyrelse';
      case 'FULDT_ANSVARLIG_DELTAGERE':
        return 'Fuldt Ansvarlig Deltager';
      case 'REVISION':
        return 'Revision';
      default:
        return hovedtype.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getSigningRules = () => {
    return cvrData.tegningsregel || "Ikke oplyst";
  };

  return (
    <AccordionItem value="management" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="text-lg font-semibold">Tegningsregel & personkreds</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">Tegningsregel</div>
              <div className="font-medium text-sm leading-relaxed">{getSigningRules()}</div>
            </div>
          </div>

          {relations.map((relation: any, index: number) => {
            const personName = getPersonName(relation.deltager);
            const personAddress = getPersonAddress(relation.deltager);

            return (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <div className="font-semibold text-base mb-1">{personName}</div>
                <div className="text-sm text-muted-foreground mb-3">{personAddress}</div>
                
                {relation.organisationer && relation.organisationer.length > 0 && (
                  <div className="space-y-2">
                    {relation.organisationer.map((org: any, orgIndex: number) => (
                      <div key={orgIndex} className="flex items-start gap-2">
                        {getRoleIcon(org.hovedtype)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {getRoleDisplayName(org.hovedtype)}
                          </div>
                          {org.medlemsData && org.medlemsData.map((medlem: any, medlemIndex: number) => (
                            <div key={medlemIndex} className="text-xs text-muted-foreground mt-1">
                              {medlem.periode && (
                                <div>
                                  Periode: {medlem.periode.gyldigFra || 'Ukendt'} - {medlem.periode.gyldigTil || 'Nuværende'}
                                </div>
                              )}
                              {medlem.attributter && medlem.attributter.map((attr: any, attrIndex: number) => (
                                <div key={attrIndex}>
                                  {attr.type === 'VALGFORM' && attr.vaerdier && (
                                    <div>Valgform: {attr.vaerdier[0]?.vaerdi}</div>
                                  )}
                                  {attr.type === 'FUNKTION' && attr.vaerdier && (
                                    <div>Funktion: {attr.vaerdier[0]?.vaerdi}</div>
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

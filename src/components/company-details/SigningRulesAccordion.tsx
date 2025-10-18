
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { extractSigningRulesData } from '@/services/cvrUtils';
import { Users, Crown, Shield, UserCheck, FileText } from 'lucide-react';

interface SigningRulesAccordionProps {
  cvrData: any;
}

const SigningRulesAccordion: React.FC<SigningRulesAccordionProps> = ({ cvrData }) => {
  console.log('SigningRulesAccordion - Raw CVR Data:', cvrData);
  
  const signingData = extractSigningRulesData(cvrData);
  console.log('SigningRulesAccordion - Extracted Data:', signingData);

  const getPersonName = (deltager: any) => {
    if (!deltager) return 'Ukendt';
    const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
    return currentName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
  };

  const getPersonAddress = (deltager: any) => {
    if (!deltager) return 'Adresse ikke tilgængelig';
    
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

  const getRoleDisplayName = (hovedtype: string, memberData?: any) => {
    // First check for specific FUNKTION attribute
    if (memberData && memberData.attributter) {
      const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
      if (funkAttribute?.vaerdier?.[0]?.vaerdi) {
        const specificRole = funkAttribute.vaerdier[0].vaerdi;
        // Return the specific role directly (e.g., BESTYRELSESFORMAND, DIREKTØR)
        return specificRole;
      }
    }

    // Fallback to hovedtype mapping
    switch (hovedtype) {
      case 'DIREKTION':
        return 'Direktion';
      case 'BESTYRELSE':
        return 'Bestyrelse';
      case 'LEDELSESORGAN':
        return 'Ledelse';
      case 'REVISION':
        return 'Revisor';
      default:
        return hovedtype.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatPeriod = (periode: any) => {
    if (!periode) return 'Ukendt periode';
    const from = periode.gyldigFra || 'Ukendt';
    const to = periode.gyldigTil || 'Nuværende';
    return `${from} - ${to}`;
  };

  const renderPersons = (persons: any[], title: string, icon: JSX.Element) => {
    return (
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <div className="space-y-3">
          {persons && persons.length > 0 ? (
            persons.map((relation: any, index: number) => {
              const personName = getPersonName(relation.deltager);
              const personAddress = getPersonAddress(relation.deltager);

              return (
                <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="font-semibold text-base">{personName}</div>
                  <div className="text-sm text-muted-foreground mb-2">{personAddress}</div>
                  
                  {relation.organisationer && relation.organisationer.map((org: any, orgIndex: number) => (
                    <div key={orgIndex} className="text-sm">
                      <div className="font-medium">
                        {getRoleDisplayName(org.hovedtype, org.medlemsData?.[0])}
                      </div>
                      {org.medlemsData && org.medlemsData.map((medlem: any, medlemIndex: number) => (
                        <div key={medlemIndex} className="text-xs text-muted-foreground mt-1">
                          {medlem.periode && (
                            <div>Periode: {formatPeriod(medlem.periode)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="text-muted-foreground text-sm border-l-4 border-gray-200 pl-4 py-2">
              Ingen oplysninger tilgængelige
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AccordionItem value="signing-rules" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="text-lg font-semibold">Tegningsregel og personkreds</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Tegningsregel */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tegningsregel
            </h4>
            <div className="space-y-2">
              {signingData?.signingRules && signingData.signingRules.length > 0 ? (
                signingData.signingRules.map((rule: string, index: number) => (
                  <div key={index} className="border-l-4 border-green-200 pl-4 py-2">
                    <div className="font-medium text-sm">{rule}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm border-l-4 border-gray-200 pl-4 py-2">
                  Ingen oplysninger om tegningsregler tilgængelige
                </div>
              )}
            </div>
          </div>

          {/* Direktion */}
          {renderPersons(signingData?.management || [], 'Direktion', <Crown className="h-4 w-4 text-amber-600" />)}
          
          {/* Bestyrelse */}
          {renderPersons(signingData?.board || [], 'Bestyrelse', <Shield className="h-4 w-4 text-blue-600" />)}
          
          {/* Revisor */}
          {renderPersons(signingData?.auditors || [], 'Revisor', <UserCheck className="h-4 w-4 text-green-600" />)}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default SigningRulesAccordion;

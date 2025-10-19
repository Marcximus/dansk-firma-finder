
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
      if (funkAttribute?.vaerdier) {
        // Find the ACTIVE role (where gyldigTil === null)
        const activeRole = funkAttribute.vaerdier.find((v: any) => 
          v.periode?.gyldigTil === null || v.periode?.gyldigTil === undefined
        );
        
        if (activeRole?.vaerdi) {
          const specificRole = activeRole.vaerdi;
          
          // Format specific roles for better display
          const roleMap: Record<string, string> = {
            'BESTYRELSESFORMAND': 'Bestyrelsesformand',
            'BESTYRELSESMEDLEM': 'Bestyrelsesmedlem',
            'BESTYRELSESMEDLEM.NÆSTFORMAND': 'Næstformand',
            'DIREKTØR': 'Direktør',
            'REVISOR': 'Revisor',
          };
          
          return roleMap[specificRole] || specificRole;
        }
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
      <div className="mb-3 sm:mb-4">
        <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
          {icon}
          {title}
        </h4>
        <div className="space-y-1.5 sm:space-y-2">
          {persons && persons.length > 0 ? (
            persons.map((relation: any, index: number) => {
              const personName = getPersonName(relation.deltager);
              const personAddress = getPersonAddress(relation.deltager);

              return (
                <div key={index} className="border-l-2 sm:border-l-3 border-blue-200 pl-2 sm:pl-3 py-1.5 sm:py-2">
                  <div className="font-semibold text-xs sm:text-sm md:text-base">{personName}</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 sm:mb-1.5 break-words">{personAddress}</div>
                  
                  {relation.organisationer && relation.organisationer.map((org: any, orgIndex: number) => {
                    // Only show active memberships (already filtered by signingRulesUtils)
                    const activeMemberships = org.medlemsData || [];
                    
                    return activeMemberships.map((medlem: any, medlemIndex: number) => (
                      <div key={`${orgIndex}-${medlemIndex}`} className="text-[10px] sm:text-xs md:text-sm">
                        <div className="font-medium">
                          {getRoleDisplayName(org.hovedtype, medlem)}
                        </div>
                        <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                          {(() => {
                            const funkAttr = medlem.attributter?.find((attr: any) => attr.type === 'FUNKTION');
                            const activeFunk = funkAttr?.vaerdier?.find((v: any) => 
                              v.periode?.gyldigTil === null || v.periode?.gyldigTil === undefined
                            );
                            return activeFunk?.periode?.gyldigFra ? (
                              <div>Siden: {activeFunk.periode.gyldigFra}</div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    ));
                  })}
                </div>
              );
            })
          ) : (
            <div className="text-muted-foreground text-[10px] sm:text-xs md:text-sm border-l-2 sm:border-l-3 border-gray-200 pl-2 sm:pl-3 py-1.5 sm:py-2">
              Ingen oplysninger tilgængelige
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AccordionItem value="signing-rules" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Tegningsregel og personkreds</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {/* Tegningsregel */}
          <div>
            <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Tegningsregel
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              {signingData?.signingRules && signingData.signingRules.length > 0 ? (
                signingData.signingRules.map((rule: string, index: number) => (
                  <div key={index} className="border-l-2 sm:border-l-3 border-green-200 pl-2 sm:pl-3 py-1.5 sm:py-2">
                    <div className="font-medium text-[10px] sm:text-xs md:text-sm">{rule}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-[10px] sm:text-xs md:text-sm border-l-2 sm:border-l-3 border-gray-200 pl-2 sm:pl-3 py-1.5 sm:py-2">
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

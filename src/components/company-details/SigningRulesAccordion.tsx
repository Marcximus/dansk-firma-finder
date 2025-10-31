
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { extractSigningRulesData } from '@/services/cvrUtils';
import { generatePersonUrl } from '@/lib/urlUtils';
import { Users, Crown, Shield, UserCheck, FileText, Search } from 'lucide-react';

interface SigningRulesAccordionProps {
  cvrData: any;
}

const SigningRulesAccordion: React.FC<SigningRulesAccordionProps> = ({ cvrData }) => {
  const navigate = useNavigate();
  console.log('SigningRulesAccordion - Raw CVR Data:', cvrData);
  
  const signingData = extractSigningRulesData(cvrData);
  console.log('SigningRulesAccordion - Extracted Data:', signingData);

  const handleNameClick = (name: string, enhedsNummer?: string | number) => {
    if (enhedsNummer) {
      const url = generatePersonUrl(name, enhedsNummer);
      navigate(url);
    } else {
      // Fallback to search if no ID available
      navigate(`/?search=${encodeURIComponent(name)}&type=person`);
    }
  };

  const getPersonName = (deltager: any) => {
    if (!deltager) return 'Ukendt';
    const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
    return currentName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
  };

  const getPersonAddress = (deltager: any) => {
    if (!deltager) return 'Adressebeskyttelse';
    
    const currentAddress = deltager.adresser?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                          deltager.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
    
    const addr = currentAddress || 
                deltager.adresser?.[deltager.adresser.length - 1] ||
                deltager.beliggenhedsadresse?.[deltager.beliggenhedsadresse.length - 1];
    
    if (!addr) return 'Adressebeskyttelse';
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage}. sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return streetAddress && postalInfo ? `${streetAddress}, ${postalInfo}` : 'Adressebeskyttelse';
  };

  const getRoleDisplayName = (hovedtype: string, org?: any, medlem?: any, relation?: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Try to get FUNKTION from medlem.attributter first
    let funkAttribute = medlem?.attributter?.find((attr: any) => attr.type === 'FUNKTION');
    
    if (funkAttribute?.vaerdier && Array.isArray(funkAttribute.vaerdier)) {
      // Find the ACTIVE role (where gyldigTil === null OR future date)
      let activeRole = funkAttribute.vaerdier.find((v: any) => {
        const gyldigTil = v.periode?.gyldigTil;
        return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
      });
      
      // If no active role found and this is a board member, use the most recent role
      const orgName = org?.organisationsNavn?.[0]?.navn;
      if (!activeRole && orgName === 'Bestyrelse' && funkAttribute.vaerdier.length > 0) {
        activeRole = funkAttribute.vaerdier.reduce((latest: any, current: any) => {
          if (!latest) return current;
          const latestDate = latest.periode?.gyldigFra || '';
          const currentDate = current.periode?.gyldigFra || '';
          return currentDate > latestDate ? current : latest;
        }, null);
      }
      
      if (activeRole?.vaerdi) {
        const specificRole = activeRole.vaerdi;
        
        // Check if this is an employee-elected board member
        const valgformAttr = medlem?.attributter?.find((attr: any) => attr.type === 'VALGFORM');
        const activeValgform = valgformAttr?.vaerdier?.find((v: any) => {
          const gyldigTil = v.periode?.gyldigTil;
          return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
        });
        const isEmployeeElected = activeValgform?.vaerdi?.includes('medarbejdere i selskabet') || activeValgform?.vaerdi?.includes('medarbejdere i koncernen');
        
        // Format specific roles for better display
        const roleMap: Record<string, string> = {
          'BESTYRELSESFORMAND': 'Bestyrelsesformand',
          'FORMAND': 'Formand',
          'BESTYRELSESMEDLEM': isEmployeeElected ? 'Medarbejdervalgt bestyrelsesmedlem' : 'Bestyrelsesmedlem',
          'NÆSTFORMAND': 'Næstformand',
          'BESTYRELSESMEDLEM.NÆSTFORMAND': 'Næstformand',
          'DIREKTØR': 'Direktør',
          'REVISOR': 'Revisor',
          'BESTYRELSESSUPPLEANT': 'Medarbejdervalgt Suppleant',
          'SUPPLEANT': 'Medarbejdervalgt Suppleant',
        };
        
        let mappedRole = roleMap[specificRole] || specificRole;
        
        // Don't add (Suppleant) suffix here - we'll show suppleant status separately with proper styling
        
        return mappedRole;
      }
    }
    
    // If not found in medlem, try org.attributter
    if (!funkAttribute && org?.attributter) {
      console.log('→ Trying org.attributter as fallback');
      funkAttribute = org.attributter.find((attr: any) => attr.type === 'FUNKTION');
      
      if (funkAttribute) {
        console.log('✓ Found FUNKTION in org.attributter:', JSON.stringify(funkAttribute, null, 2));
        // Same logic as above but for org
        if (funkAttribute.vaerdier) {
          const today = new Date().toISOString().split('T')[0];
          let activeRole = funkAttribute.vaerdier.find((v: any) => {
            const gyldigTil = v.periode?.gyldigTil;
            return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
          });
          
          // If no active role found and this is a board member, use the most recent role
          const orgName = org?.organisationsNavn?.[0]?.navn;
          if (!activeRole && orgName === 'Bestyrelse' && funkAttribute.vaerdier.length > 0) {
            activeRole = funkAttribute.vaerdier.reduce((latest: any, current: any) => {
              if (!latest) return current;
              const latestDate = latest.periode?.gyldigFra || '';
              const currentDate = current.periode?.gyldigFra || '';
              return currentDate > latestDate ? current : latest;
            }, null);
          }
          
          if (activeRole?.vaerdi) {
            const specificRole = activeRole.vaerdi;
            
            // Check if this is an employee-elected board member (for org.attributter fallback)
            const orgValgformAttr = org?.attributter?.find((attr: any) => attr.type === 'VALGFORM');
            const activeOrgValgform = orgValgformAttr?.vaerdier?.find((v: any) => {
              const gyldigTil = v.periode?.gyldigTil;
              return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
            });
            const isEmployeeElectedOrg = activeOrgValgform?.vaerdi?.includes('medarbejdere i selskabet') || activeOrgValgform?.vaerdi?.includes('medarbejdere i koncernen');
            
            const roleMap: Record<string, string> = {
              'BESTYRELSESFORMAND': 'Bestyrelsesformand',
              'FORMAND': 'Formand',
              'BESTYRELSESMEDLEM': isEmployeeElectedOrg ? 'Medarbejdervalgt Bestyrelsesmedlem' : 'Bestyrelsesmedlem',
              'BESTYRELSESMEDLEM.NÆSTFORMAND': 'Næstformand',
              'DIREKTØR': 'Direktør',
              'REVISOR': 'Revisor',
              'BESTYRELSESSUPPLEANT': 'Medarbejdervalgt Suppleant',
              'SUPPLEANT': 'Medarbejdervalgt Suppleant',
            };
            
            let mappedRole = roleMap[specificRole] || specificRole;
            
            console.log('✓ Mapped role from org.attributter:', mappedRole);
            return mappedRole;
          }
        }
      } else {
        console.log('✗ No FUNKTION attribute found in org.attributter either');
      }
    }

    // Fallback to hovedtype mapping
    console.log('→ Using fallback hoofdtype mapping for:', hovedtype);
    switch (hovedtype) {
      case 'DIREKTION':
        return 'Direktion';
      case 'BESTYRELSE':
        // Default to "Bestyrelsesmedlem" for board members without specific role
        return 'Bestyrelsesmedlem';
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

  const sortBoardMembers = (persons: any[]) => {
    if (!persons || persons.length === 0) return persons;
    
    const today = new Date().toISOString().split('T')[0];
    
    return [...persons].sort((a, b) => {
      // Helper function to get role, valgform, and suppleant status for a person
      const getPersonInfo = (relation: any) => {
        let role = '';
        let valgform = '';
        let isSuppleant = false;
        
        relation.organisationer?.forEach((org: any) => {
          org.medlemsData?.forEach((medlem: any) => {
            const funkAttr = medlem.attributter?.find((attr: any) => attr.type === 'FUNKTION');
            const valgformAttr = medlem.attributter?.find((attr: any) => attr.type === 'VALGFORM');
            
            const activeFunk = funkAttr?.vaerdier?.find((v: any) => {
              const gyldigTil = v.periode?.gyldigTil;
              return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
            });
            
            const activeValgform = valgformAttr?.vaerdier?.find((v: any) => {
              const gyldigTil = v.periode?.gyldigTil;
              return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
            });
            
            if (activeFunk?.vaerdi) {
              role = activeFunk.vaerdi;
              if (role === 'SUPPLEANT') isSuppleant = true;
            }
            if (activeValgform?.vaerdi) valgform = activeValgform.vaerdi.toLowerCase();
          });
        });
        
        return { role, valgform, isSuppleant };
      };
      
      const infoA = getPersonInfo(a);
      const infoB = getPersonInfo(b);
      
      // Priority order: Formand > Næstformand > Regular members > Suppleants, then by valgform
      const getRolePriority = (role: string) => {
        if (role.includes('FORMAND') && !role.includes('NÆSTFORMAND')) return 1; // Formand/Bestyrelsesformand
        if (role.includes('NÆSTFORMAND')) return 2; // Næstformand
        return 3; // Others
      };
      
      const getValgformPriority = (valgform: string) => {
        if (valgform.includes('generalforsamling')) return 1;
        if (valgform.includes('medarbejder')) return 2;
        return 3;
      };
      
      const roleAPriority = getRolePriority(infoA.role);
      const roleBPriority = getRolePriority(infoB.role);
      
      if (roleAPriority !== roleBPriority) {
        return roleAPriority - roleBPriority;
      }
      
      // If roles are equal, sort by valgform
      const valgformAPriority = getValgformPriority(infoA.valgform);
      const valgformBPriority = getValgformPriority(infoB.valgform);
      
      if (valgformAPriority !== valgformBPriority) {
        return valgformAPriority - valgformBPriority;
      }
      
      // If valgform is also equal, non-suppleants come before suppleants
      if (infoA.isSuppleant !== infoB.isSuppleant) {
        return infoA.isSuppleant ? 1 : -1;
      }
      
      return 0;
    });
  };

  const renderPersons = (persons: any[], title: string, icon: JSX.Element) => {
    // Sort board members if this is the board section
    const sortedPersons = title === 'Bestyrelse' ? sortBoardMembers(persons) : persons;
    
    return (
      <div className="mb-3 sm:mb-4">
        <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
          {icon}
          {title}
        </h4>
        <div className="space-y-1.5 sm:space-y-2">
          {sortedPersons && sortedPersons.length > 0 ? (
            sortedPersons.map((relation: any, index: number) => {
              const personName = getPersonName(relation.deltager);
              const personAddress = getPersonAddress(relation.deltager);
              const enhedsNummer = relation.deltager?.enhedsNummer;
              
              // Check if this person is an employee representative
              const today = new Date().toISOString().split('T')[0];
              const isEmployeeRep = relation.organisationer?.some((org: any) => 
                org.medlemsData?.some((medlem: any) => {
                  const valgformAttr = medlem.attributter?.find((attr: any) => attr.type === 'VALGFORM');
                  return valgformAttr?.vaerdier?.some((v: any) => {
                    const gyldigTil = v.periode?.gyldigTil;
                    const isActive = gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
                    return isActive && (
                      v.vaerdi?.includes('medarbejdere i selskabet') || 
                      v.vaerdi?.includes('medarbejdere i koncernen')
                    );
                  });
                })
              );
              
              const borderColor = isEmployeeRep ? 'border-green-200' : 'border-blue-200';

              return (
                <div key={index} className={`border-l-2 sm:border-l-3 ${borderColor} pl-2 sm:pl-3 py-1.5 sm:py-2`}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleNameClick(personName, enhedsNummer)}
                          className={`font-semibold text-xs sm:text-sm md:text-base transition-colors flex items-center gap-1.5 cursor-pointer mb-1 ${
                            isEmployeeRep 
                              ? 'text-green-600 hover:text-green-700 hover:underline'
                              : 'text-primary hover:text-primary/80 hover:underline'
                          }`}
                        >
                          {personName}
                          <Search className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Se personens profil og tilknyttede virksomheder</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 sm:mb-1.5 break-words">{personAddress}</div>
                  
                  {relation.organisationer && relation.organisationer.map((org: any, orgIndex: number) => {
                    // Only show active memberships (already filtered by signingRulesUtils)
                    const activeMemberships = org.medlemsData || [];
                    
                    return activeMemberships.map((medlem: any, medlemIndex: number) => {
                      return (
                        <div key={`${orgIndex}-${medlemIndex}`} className="text-[10px] sm:text-xs md:text-sm">
                          <div className={`font-medium ${getRoleDisplayName(org.hovedtype, org, medlem, relation).includes('Suppleant') ? 'text-orange-600 dark:text-orange-500' : ''}`}>
                            {getRoleDisplayName(org.hovedtype, org, medlem, relation)}
                          </div>
                          <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                            {(() => {
                              const funkAttr = medlem.attributter?.find((attr: any) => attr.type === 'FUNKTION');
                              const valgformAttr = medlem.attributter?.find((attr: any) => attr.type === 'VALGFORM');
                              const today = new Date().toISOString().split('T')[0];
                              
                              const activeFunk = funkAttr?.vaerdier?.find((v: any) => {
                                const gyldigTil = v.periode?.gyldigTil;
                                return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
                              });
                              
                              const activeValgform = valgformAttr?.vaerdier?.find((v: any) => {
                                const gyldigTil = v.periode?.gyldigTil;
                                return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
                              });
                              
                              // Check if person is a Suppleant
                              const isSuppleant = funkAttr?.vaerdier?.some((v: any) => {
                                const gyldigTil = v.periode?.gyldigTil;
                                const isActive = gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
                                return isActive && v.vaerdi?.includes('SUPPLEANT');
                              });
                              
                              const isEmployeeElectedSuppleant = isSuppleant && activeValgform?.vaerdi?.includes('medarbejdere i selskabet');
                              
                              return (
                                <>
                                  {activeFunk?.periode?.gyldigFra && (
                                    <div>Siden: {activeFunk.periode.gyldigFra}</div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    });
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
    <AccordionItem value="signing-rules" data-accordion-value="signing-rules" className="border rounded-lg">
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
                    <div className="font-normal italic text-sm sm:text-sm md:text-base text-blue-600">{rule}</div>
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

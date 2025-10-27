
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Crown, Shield, UserCheck, Building, Search } from 'lucide-react';
import { generatePersonUrl } from '@/lib/urlUtils';

interface ManagementAccordionProps {
  cvrData: any;
}

const ManagementAccordion: React.FC<ManagementAccordionProps> = ({ cvrData }) => {
  const navigate = useNavigate();

  const handleNameClick = (name: string, enhedsNummer?: string | number) => {
    if (enhedsNummer) {
      const url = generatePersonUrl(name, enhedsNummer);
      navigate(url);
    } else {
      // Fallback to search if no ID available
      navigate(`/?search=${encodeURIComponent(name)}&type=person`);
    }
  };
  if (!cvrData) return null;

  console.log('=== MANAGEMENT ACCORDION DEBUG ===');
  console.log('Full cvrData:', cvrData);
  console.log('cvrData.deltagerRelation:', cvrData.deltagerRelation);
  console.log('cvrData keys:', Object.keys(cvrData));
  
  const relations = cvrData.deltagerRelation || [];
  console.log('Relations found:', relations.length);
  
  // Log each relation in detail with deep inspection
  relations.forEach((relation: any, index: number) => {
    console.log(`\n=== RELATION ${index} DEEP DIVE ===`);
    console.log(`Full relation object:`, relation);
    console.log(`- Deltager:`, relation.deltager);
    console.log(`- Organisationer count:`, relation.organisationer?.length);
    
    // Log each organisation in detail
    relation.organisationer?.forEach((org: any, orgIndex: number) => {
      console.log(`\n  Organisation ${orgIndex}:`);
      console.log(`  - hovedtype:`, org.hovedtype);
      console.log(`  - organisationsNavn:`, org.organisationsNavn);
      console.log(`  - Full org:`, org);
      console.log(`  - medlemsData:`, org.medlemsData);
      
      // Log member data attributes in detail
      org.medlemsData?.forEach((medlem: any, medlemIndex: number) => {
        console.log(`\n    MedlemsData ${medlemIndex}:`);
        console.log(`    - periode:`, medlem.periode);
        console.log(`    - attributter:`, medlem.attributter);
        
        medlem.attributter?.forEach((attr: any, attrIndex: number) => {
          console.log(`\n      Attribut ${attrIndex}:`);
          console.log(`      - type:`, attr.type);
          console.log(`      - vaerdier:`, attr.vaerdier);
        });
      });
    });
  });

  const getPersonName = (deltager: any) => {
    if (!deltager) return 'Ukendt';
    const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
    return currentName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
  };

  const getPersonAddress = (deltager: any) => {
    if (!deltager) return 'Adressebeskyttelse';
    
    // Check for addresses in the deltager object
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
      const today = new Date().toISOString().split('T')[0];
      const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
      const valgformAttr = memberData.attributter.find((attr: any) => attr.type === 'VALGFORM');
      
      if (funkAttribute && funkAttribute.vaerdier && funkAttribute.vaerdier.length > 0) {
        const specificRole = funkAttribute.vaerdier[0].vaerdi;
        
        // If the role is a SUPPLEANT role, just return the base name
        // The suppleant badge will be displayed separately
        if (specificRole?.includes('SUPPLEANT')) {
          return baseName;
        }
        
        // Check if this is an employee-elected board member
        const activeValgform = valgformAttr?.vaerdier?.find((v: any) => {
          const gyldigTil = v.periode?.gyldigTil;
          return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
        });
        
        const isEmployeeElected = activeValgform?.vaerdi?.includes('medarbejdere i selskabet');
        
        if (specificRole === 'BESTYRELSESMEDLEM' && isEmployeeElected) {
          return 'Medarbejdervalgt bestyrelsesmedlem';
        }
        
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
        <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
            <span className="text-sm sm:text-base md:text-lg font-semibold">Ledelse & Ejerskab</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
          <div className="text-muted-foreground text-xs sm:text-sm">Ingen ledelsesoplysninger tilgængelige</div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem value="management" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Ledelse & Ejerskab</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
          {relations.map((relation: any, index: number) => {
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
                      <p>Se personens profil og tilknytninger</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1.5 sm:mb-2">{personAddress}</div>
                
                {relation.organisationer && relation.organisationer.length > 0 && (
                  <div className="space-y-1 sm:space-y-1.5">
                    {relation.organisationer.map((org: any, orgIndex: number) => (
                      <div key={orgIndex} className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gray-50 rounded">
                        {getRoleIcon(org.hovedtype)}
                        <div className="flex-1">
                          <div className="font-medium text-[10px] sm:text-xs md:text-sm">
                            {getRoleDisplayName(org.hovedtype, org.medlemsData?.[0])}
                          </div>
                          {org.medlemsData && org.medlemsData.map((medlem: any, medlemIndex: number) => {
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
                              <div key={medlemIndex} className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                {isSuppleant && (
                                  <div className={`text-xs font-medium mb-1 ${isEmployeeElectedSuppleant ? 'text-orange-600 dark:text-orange-500' : 'text-amber-600 dark:text-amber-500'}`}>
                                    {isEmployeeElectedSuppleant ? 'Medarbejdervalgt suppleant' : 'Suppleant'}
                                  </div>
                                )}
                                {activeFunk?.periode?.gyldigFra && (
                                  <div>Siden: {activeFunk.periode.gyldigFra}</div>
                                )}
                                {medlem.attributter && medlem.attributter.map((attr: any, attrIndex: number) => (
                                  <div key={attrIndex} className="mt-0.5 sm:mt-1">
                                    {attr.type !== 'FUNKTION' && attr.type !== 'VALGFORM' && attr.vaerdier && !attr.vaerdier.some((v: any) => v.vaerdi?.includes('SUPPLEANT')) && (
                                      <div>
                                        <strong>{attr.type}:</strong> {attr.vaerdier.map((v: any) => v.vaerdi).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
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

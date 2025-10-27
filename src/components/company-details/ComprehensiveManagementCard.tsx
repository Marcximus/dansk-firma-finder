
import React from 'react';
import { Users, Crown, Shield, UserCheck } from 'lucide-react';

interface ComprehensiveManagementCardProps {
  cvrData: any;
}

const ComprehensiveManagementCard: React.FC<ComprehensiveManagementCardProps> = ({ cvrData }) => {
  if (!cvrData || !cvrData.deltagerRelation) return null;

  const relations = cvrData.deltagerRelation || [];

  const getPersonName = (deltager: any) => {
    const currentName = deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
    return currentName?.navn || deltager?.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
  };

  const getPersonAddress = (deltager: any) => {
    const currentAddress = deltager?.adresser?.find((addr: any) => addr.periode?.gyldigTil === null);
    const addr = currentAddress || deltager?.adresser?.[deltager.adresser.length - 1];
    
    if (!addr) return 'Adressebeskyttelse';
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return streetAddress && postalInfo ? `${streetAddress}, ${postalInfo}` : 'Adressebeskyttelse';
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
        
        // Check if this is an employee-elected board member
        const activeValgform = valgformAttr?.vaerdier?.find((v: any) => {
          const gyldigTil = v.periode?.gyldigTil;
          return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
        });
        
        const isEmployeeElected = activeValgform?.vaerdi?.includes('medarbejdere i selskabet');
        
        if (specificRole === 'BESTYRELSESMEDLEM' && isEmployeeElected) {
          return 'Medarbejdervalgt bestyrelsesmedlem';
        }
        
        if (specificRole === 'SUPPLEANT' && isEmployeeElected) {
          return 'Medarbejdervalgt suppleant';
        }
        
        if (specificRole !== hovedtype) {
          return `${baseName} (${specificRole})`;
        }
      }
    }

    return baseName;
  };

  if (relations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Users className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Komplet Ledelse & Ejerskab</h3>
      </div>

      <div className="space-y-6">
        {relations.map((relation: any, index: number) => {
          const personName = getPersonName(relation.deltager);
          const personAddress = getPersonAddress(relation.deltager);
          
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
            <div key={index} className={`border ${borderColor} rounded p-4`}>
              <div className="font-medium text-lg mb-3">{personName}</div>
              <div className="text-sm text-muted-foreground mb-3">{personAddress}</div>
              
              {relation.organisationer && relation.organisationer.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-sm text-muted-foreground">Roller:</h5>
                  {relation.organisationer.map((org: any, orgIndex: number) => (
                    <div key={orgIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                      {getRoleIcon(org.hovedtype)}
                      <div className="flex-1">
                        <div className="font-medium">
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
                            <div key={medlemIndex} className="text-sm text-muted-foreground mt-1">
                              {isSuppleant && (
                                <div className={`text-sm font-medium mb-1 ${isEmployeeElectedSuppleant ? 'text-orange-600 dark:text-orange-500' : 'text-amber-600 dark:text-amber-500'}`}>
                                  {isEmployeeElectedSuppleant ? 'Medarbejdervalgt suppleant' : 'Suppleant'}
                                </div>
                              )}
                              {activeFunk?.periode?.gyldigFra && (
                                <div>Siden: {activeFunk.periode.gyldigFra}</div>
                              )}
                              {medlem.periode && (
                                <div>
                                  Periode: {medlem.periode.gyldigFra || 'Ukendt'} - {medlem.periode.gyldigTil || 'Nuværende'}
                                </div>
                              )}
                              {medlem.attributter && medlem.attributter.map((attr: any, attrIndex: number) => (
                                <div key={attrIndex} className="mt-1">
                                  {attr.type !== 'FUNKTION' && attr.type !== 'VALGFORM' && attr.vaerdier && (
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
    </div>
  );
};

export default ComprehensiveManagementCard;

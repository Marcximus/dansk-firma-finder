
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, Shield, UserCheck } from 'lucide-react';

interface ManagementSectionProps {
  cvrData: any;
}

const ManagementSection: React.FC<ManagementSectionProps> = ({ cvrData }) => {
  if (!cvrData?.deltagerRelation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ledelse & Ejerskab
          </CardTitle>
          <CardDescription>Ingen ledelsesoplysninger tilgængelige</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ledelse & Ejerskab
          </CardTitle>
          <CardDescription>Alle personer tilknyttet virksomheden</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {relations.map((relation: any, index: number) => {
              const personName = getPersonName(relation.deltager);
              const personAddress = getPersonAddress(relation.deltager);

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-semibold text-lg mb-2">{personName}</div>
                  <div className="text-sm text-muted-foreground mb-4">{personAddress}</div>
                  
                  {relation.organisationer && relation.organisationer.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-medium text-sm">Roller:</h5>
                      {relation.organisationer.map((org: any, orgIndex: number) => (
                        <div key={orgIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                          {getRoleIcon(org.hovedtype)}
                          <div className="flex-1">
                            <div className="font-medium">
                              {getRoleDisplayName(org.hovedtype)}
                            </div>
                            {org.medlemsData && org.medlemsData.map((medlem: any, medlemIndex: number) => (
                              <div key={medlemIndex} className="text-sm text-muted-foreground mt-1">
                                {medlem.periode && (
                                  <div>
                                    Periode: {medlem.periode.gyldigFra || 'Ukendt'} - {medlem.periode.gyldigTil || 'Nuværende'}
                                  </div>
                                )}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagementSection;

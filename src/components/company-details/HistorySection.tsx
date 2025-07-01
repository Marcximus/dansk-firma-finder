
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MapPin, Building2, Activity } from 'lucide-react';

interface HistorySectionProps {
  cvrData: any;
}

const HistorySection: React.FC<HistorySectionProps> = ({ cvrData }) => {
  const names = cvrData?.navne || [];
  const beliggenhedsadresse = cvrData?.beliggenhedsadresse || [];
  const mainIndustries = cvrData?.hovedbranche || [];
  const statuses = cvrData?.virksomhedsstatus || [];

  const formatAddress = (addr: any) => {
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage} sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return `${streetAddress}\n${postalInfo}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Navnehistorik
            </CardTitle>
            <CardDescription>Alle registrerede navne</CardDescription>
          </CardHeader>
          <CardContent>
            {names.length > 0 ? (
              <div className="space-y-3">
                {names.map((name: any, index: number) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{name.navn}</div>
                        {name.periode?.gyldigTil === null && (
                          <div className="text-sm text-green-600 font-medium">Nuværende navn</div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground ml-4">
                        {name.periode?.gyldigFra || 'Ukendt'} - {name.periode?.gyldigTil || 'Nuværende'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ingen navnehistorik tilgængelig</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adressehistorik
            </CardTitle>
            <CardDescription>Alle registrerede adresser</CardDescription>
          </CardHeader>
          <CardContent>
            {beliggenhedsadresse.length > 0 ? (
              <div className="space-y-3">
                {beliggenhedsadresse.map((addr: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="whitespace-pre-line font-medium">{formatAddress(addr)}</div>
                        {addr.conavn && (
                          <div className="text-sm text-muted-foreground mt-1">c/o {addr.conavn}</div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground ml-4">
                        {addr.periode?.gyldigFra || 'Ukendt'} - {addr.periode?.gyldigTil || 'Nuværende'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ingen adressehistorik tilgængelig</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Branchehistorik
            </CardTitle>
            <CardDescription>Hovedbrancher gennem tiden</CardDescription>
          </CardHeader>
          <CardContent>
            {mainIndustries.length > 0 ? (
              <div className="space-y-3">
                {mainIndustries.map((industry: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{industry.branchetekst}</div>
                        <div className="text-sm text-muted-foreground">Kode: {industry.branchekode}</div>
                      </div>
                      <div className="text-sm text-muted-foreground ml-4">
                        {industry.periode?.gyldigFra || 'Ukendt'} - {industry.periode?.gyldigTil || 'Nuværende'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ingen branchehistorik tilgængelig</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statushistorik
            </CardTitle>
            <CardDescription>Virksomhedens status gennem tiden</CardDescription>
          </CardHeader>
          <CardContent>
            {statuses.length > 0 ? (
              <div className="space-y-3">
                {statuses.map((status: any, index: number) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{status.status}</div>
                        {status.periode?.gyldigTil === null && (
                          <div className="text-sm text-green-600 font-medium">Nuværende status</div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground ml-4">
                        {status.periode?.gyldigFra || 'Ukendt'} - {status.periode?.gyldigTil || 'Nuværende'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ingen statushistorik tilgængelig</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistorySection;


import React from 'react';
import { MapPin, Home, Building } from 'lucide-react';

interface ComprehensiveAddressCardProps {
  cvrData: any;
}

const ComprehensiveAddressCard: React.FC<ComprehensiveAddressCardProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  const beliggenhedsadresse = cvrData.beliggenhedsadresse || [];
  const postadresse = cvrData.postadresse || [];

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

  if (beliggenhedsadresse.length === 0 && postadresse.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <MapPin className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Komplet Adressehistorik</h3>
      </div>
      
      {beliggenhedsadresse.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Building className="h-4 w-4" />
            <h4 className="font-medium">Beliggenhedsadresser</h4>
          </div>
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
        </div>
      )}

      {postadresse.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Home className="h-4 w-4" />
            <h4 className="font-medium">Postadresser</h4>
          </div>
          <div className="space-y-3">
            {postadresse.map((addr: any, index: number) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
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
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAddressCard;

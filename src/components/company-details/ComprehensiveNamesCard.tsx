
import React from 'react';
import { FileText } from 'lucide-react';

interface ComprehensiveNamesCardProps {
  cvrData: any;
}

const ComprehensiveNamesCard: React.FC<ComprehensiveNamesCardProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  const names = cvrData.navne || [];
  const additionalNames = [
    ...(cvrData.binavne || []),
    ...(cvrData.attributter?.filter((attr: any) => attr.type === 'NAVNE') || [])
  ];

  if (names.length === 0 && additionalNames.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Komplet Navnehistorik</h3>
      </div>
      
      {names.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Hovednavne</h4>
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
                {name.sidstOpdateret && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Opdateret: {new Date(name.sidstOpdateret).toLocaleDateString('da-DK')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {additionalNames.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Binavne og Yderligere Navne</h4>
          <div className="space-y-3">
            {additionalNames.map((item: any, index: number) => (
              <div key={index} className="border-l-4 border-muted pl-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.navn || (item.vaerdier && item.vaerdier[0]?.vaerdi) || 'Ukendt navn'}
                    </div>
                    {item.type && (
                      <div className="text-sm text-muted-foreground">Type: {item.type}</div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground ml-4">
                    {item.periode?.gyldigFra || 'Ukendt'} - {item.periode?.gyldigTil || 'Nuværende'}
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

export default ComprehensiveNamesCard;

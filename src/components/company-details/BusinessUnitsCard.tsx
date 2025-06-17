
import React from 'react';
import { MapPin } from 'lucide-react';

interface BusinessUnitsCardProps {
  cvrData: any;
}

const BusinessUnitsCard: React.FC<BusinessUnitsCardProps> = ({ cvrData }) => {
  if (!cvrData || !cvrData.penheder) return null;

  const businessUnits = cvrData.penheder || [];

  if (businessUnits.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <MapPin className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Business Units (P-numbers)</h3>
      </div>
      
      <div className="space-y-3">
        {businessUnits.map((unit: any, index: number) => (
          <div key={index} className="border rounded p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">P-number: {unit.pNummer}</div>
                <div className="text-sm text-muted-foreground">
                  Active: {unit.periode?.gyldigFra || 'Unknown'} - {unit.periode?.gyldigTil || 'Present'}
                </div>
              </div>
              {unit.sidstOpdateret && (
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(unit.sidstOpdateret).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        P-numbers represent individual business units or production units within the company.
      </div>
    </div>
  );
};

export default BusinessUnitsCard;

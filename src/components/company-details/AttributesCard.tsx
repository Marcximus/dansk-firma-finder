
import React from 'react';
import { Tag } from 'lucide-react';

interface AttributesCardProps {
  cvrData: any;
}

const AttributesCard: React.FC<AttributesCardProps> = ({ cvrData }) => {
  if (!cvrData || !cvrData.attributter) return null;

  const attributes = cvrData.attributter || [];

  if (attributes.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Tag className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Company Attributes</h3>
      </div>
      
      <div className="space-y-4">
        {attributes.map((attribute: any, index: number) => (
          <div key={index} className="border rounded p-3">
            <div className="font-medium text-sm mb-2">
              {attribute.type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </div>
            {attribute.vaerdier && attribute.vaerdier.length > 0 && (
              <div className="space-y-2">
                {attribute.vaerdier.map((value: any, valueIndex: number) => (
                  <div key={valueIndex} className="text-sm">
                    <div className="font-medium">{value.vaerdi}</div>
                    {value.periode && (
                      <div className="text-muted-foreground">
                        {value.periode.gyldigFra || 'Unknown'} - {value.periode.gyldigTil || 'Present'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttributesCard;


import React from 'react';
import { Building2 } from 'lucide-react';

interface IndustryHistoryCardProps {
  cvrData: any;
}

const IndustryHistoryCard: React.FC<IndustryHistoryCardProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  const mainIndustries = cvrData.hovedbranche || [];
  const secondaryIndustries = [
    ...(cvrData.bibranche1 || []),
    ...(cvrData.bibranche2 || []),
    ...(cvrData.bibranche3 || [])
  ];

  if (mainIndustries.length === 0 && secondaryIndustries.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Building2 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Industry Classification History</h3>
      </div>
      
      {mainIndustries.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Main Industries</h4>
          <div className="space-y-3">
            {mainIndustries.map((industry: any, index: number) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{industry.branchetekst}</div>
                    <div className="text-sm text-muted-foreground">Code: {industry.branchekode}</div>
                  </div>
                  <div className="text-sm text-muted-foreground ml-4">
                    {industry.periode?.gyldigFra || 'Unknown'} - {industry.periode?.gyldigTil || 'Present'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {secondaryIndustries.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Secondary Industries</h4>
          <div className="space-y-3">
            {secondaryIndustries.map((industry: any, index: number) => (
              <div key={index} className="border-l-4 border-muted pl-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{industry.branchetekst}</div>
                    <div className="text-sm text-muted-foreground">Code: {industry.branchekode}</div>
                  </div>
                  <div className="text-sm text-muted-foreground ml-4">
                    {industry.periode?.gyldigFra || 'Unknown'} - {industry.periode?.gyldigTil || 'Present'}
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

export default IndustryHistoryCard;


import React from 'react';
import { Company } from '@/services/companyAPI';

interface AdditionalInfoCardProps {
  company: Company;
  adProtection: string;
}

const AdditionalInfoCard: React.FC<AdditionalInfoCardProps> = ({ company, adProtection }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Additional Info</h3>
      <div className="space-y-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">CVR Number</span>
          <span className="font-medium">{company.cvr}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Status</span>
          <span className="font-medium">{company.status || 'N/A'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Protection against advertisement</span>
          <span className="font-medium">{adProtection}</span>
        </div>
        {company.yearFounded && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Founded</span>
            <span className="font-medium">{company.yearFounded}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalInfoCard;

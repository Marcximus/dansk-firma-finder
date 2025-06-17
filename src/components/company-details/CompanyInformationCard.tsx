
import React from 'react';

interface CompanyInformationCardProps {
  purposeText: string;
}

const CompanyInformationCard: React.FC<CompanyInformationCardProps> = ({ purposeText }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Company Information</h3>
      <p className="text-muted-foreground">{purposeText}</p>
    </div>
  );
};

export default CompanyInformationCard;

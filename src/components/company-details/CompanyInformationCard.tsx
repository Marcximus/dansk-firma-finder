
import React from 'react';

interface CompanyInformationCardProps {
  purposeText: string;
}

const CompanyInformationCard: React.FC<CompanyInformationCardProps> = ({ purposeText }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Company Information</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Business Purpose</h4>
          <p className="text-muted-foreground">{purposeText}</p>
        </div>
        
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
          <strong>Note:</strong> Complete company purpose and articles of association details require direct access to the Danish Business Authority's extended CVR data or company documents.
        </div>
      </div>
    </div>
  );
};

export default CompanyInformationCard;

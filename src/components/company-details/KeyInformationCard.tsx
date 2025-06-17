
import React from 'react';
import { Company } from '@/services/companyAPI';

interface KeyInformationCardProps {
  company: Company;
  legalForm: string;
}

const KeyInformationCard: React.FC<KeyInformationCardProps> = ({ company, legalForm }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Key Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Company Type</span>
          <span className="font-medium">{legalForm}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Address</span>
          <span className="font-medium">{company.address}<br/>{company.postalCode} {company.city}</span>
        </div>
        {company.email && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Email</span>
            <a href={`mailto:${company.email}`} className="font-medium text-primary hover:underline">
              {company.email}
            </a>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Industry</span>
          <span className="font-medium">{company.industry}</span>
        </div>
        {company.employeeCount > 0 && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Employees</span>
            <span className="font-medium">{company.employeeCount.toLocaleString()}</span>
          </div>
        )}
        {company.website && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Website</span>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              {company.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyInformationCard;

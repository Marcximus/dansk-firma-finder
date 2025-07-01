
import React from 'react';
import { Company, extractCvrDetails } from '@/services/companyAPI';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompanyHeader from './company-details/CompanyHeader';
import KeyInformationCard from './company-details/KeyInformationCard';
import CompanyInformationCard from './company-details/CompanyInformationCard';
import ManagementCard from './company-details/ManagementCard';
import HistoricalNamesCard from './company-details/HistoricalNamesCard';
import AdditionalInfoCard from './company-details/AdditionalInfoCard';
import HistoricalAddressesCard from './company-details/HistoricalAddressesCard';
import DataSourceInfo from './company-details/DataSourceInfo';
import EmploymentHistoryCard from './company-details/EmploymentHistoryCard';
import IndustryHistoryCard from './company-details/IndustryHistoryCard';
import StatusHistoryCard from './company-details/StatusHistoryCard';
import ContactInformationCard from './company-details/ContactInformationCard';
import BusinessUnitsCard from './company-details/BusinessUnitsCard';
import AttributesCard from './company-details/AttributesCard';
import FinancialReportsCard from './company-details/FinancialReportsCard';
import ComprehensiveAddressCard from './company-details/ComprehensiveAddressCard';
import ComprehensiveManagementCard from './company-details/ComprehensiveManagementCard';
import ComprehensiveNamesCard from './company-details/ComprehensiveNamesCard';

interface CompanyDetailsProps {
  company: Company;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  // Extract real CVR data if available
  const cvrDetails = company.realCvrData ? extractCvrDetails(company.realCvrData) : null;
  
  // Use real data when available, fall back to mock data
  const companyData = {
    ...company,
    email: company.email || "contact@" + company.name.toLowerCase().replace(/\s+/g, '') + ".dk",
    legalForm: company.legalForm || "Anpartsselskab",
    purposeText: cvrDetails?.purposeText || "Company information from Danish Business Authority. Full purpose description not available in current data structure.",
    management: cvrDetails?.management || [
      { role: "Information not available", name: "Data not accessible through current API", address: "N/A" }
    ],
    historicalNames: cvrDetails?.historicalNames || [
      { period: "Current", name: company.name }
    ],
    historicalAddresses: cvrDetails?.historicalAddresses || [
      { period: "Current", address: `${company.address}\n${company.postalCode} ${company.city}` }
    ],
    adProtection: company.realCvrData?.reklamebeskyttet ? "Yes" : "No"
  };

  return (
    <div className="py-6">
      <CompanyHeader company={company} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <KeyInformationCard company={company} legalForm={companyData.legalForm} />
          <CompanyInformationCard purposeText={companyData.purposeText} />
          <ContactInformationCard company={company} />
          
          {/* Comprehensive Management - Replaces basic management card */}
          <ComprehensiveManagementCard cvrData={company.realCvrData} />
          
          {/* Financial Reports - NEW */}
          <FinancialReportsCard cvr={company.cvr} />
          
          <EmploymentHistoryCard cvrData={company.realCvrData} />
          <IndustryHistoryCard cvrData={company.realCvrData} />
          <StatusHistoryCard cvrData={company.realCvrData} />
          
          {/* Comprehensive Names - Replaces basic historical names */}
          <ComprehensiveNamesCard cvrData={company.realCvrData} />
          
          {/* Comprehensive Addresses - NEW */}
          <ComprehensiveAddressCard cvrData={company.realCvrData} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <AdditionalInfoCard company={company} adProtection={companyData.adProtection} />
          <BusinessUnitsCard cvrData={company.realCvrData} />
          <AttributesCard cvrData={company.realCvrData} />
          <HistoricalAddressesCard historicalAddresses={companyData.historicalAddresses} />
          <DataSourceInfo />
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline" className="flex gap-1.5">
          <Link to="/">
            <ArrowLeft className="w-4 h-4" />
            Tilbage til søgning
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CompanyDetails;

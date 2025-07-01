
import React from 'react';
import { Company, extractCvrDetails } from '@/services/companyAPI';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CompanyHeader from './company-details/CompanyHeader';
import BasicInfoAccordion from './company-details/BasicInfoAccordion';
import ExtendedInfoAccordion from './company-details/ExtendedInfoAccordion';
import SigningRulesAccordion from './company-details/SigningRulesAccordion';
import OwnershipAccordion from './company-details/OwnershipAccordion';
import FinancialAccordion from './company-details/FinancialAccordion';
import HistoryAccordion from './company-details/HistoryAccordion';
import RawDataAccordion from './company-details/RawDataAccordion';
import DataSourceInfo from './company-details/DataSourceInfo';

interface CompanyDetailsProps {
  company: Company;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  const cvrDetails = company.realCvrData ? extractCvrDetails(company.realCvrData) : null;
  
  return (
    <div className="py-6 max-w-7xl mx-auto px-4">
      <CompanyHeader company={company} />

      <Accordion type="multiple" defaultValue={["basic", "extended", "signing-rules", "ownership", "financial", "history"]} className="w-full space-y-4">
        <BasicInfoAccordion company={company} cvrData={company.realCvrData} />
        <ExtendedInfoAccordion company={company} cvrData={company.realCvrData} />
        <SigningRulesAccordion cvrData={company.realCvrData} />
        <OwnershipAccordion cvrData={company.realCvrData} />
        <FinancialAccordion cvr={company.cvr} cvrData={company.realCvrData} />
        <HistoryAccordion cvrData={company.realCvrData} />
        <RawDataAccordion cvrData={company.realCvrData} />
      </Accordion>
      
      <div className="mt-8 space-y-4">
        <DataSourceInfo />
        <div className="flex justify-center">
          <Button asChild variant="outline" className="flex gap-1.5">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Tilbage til søgning
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;

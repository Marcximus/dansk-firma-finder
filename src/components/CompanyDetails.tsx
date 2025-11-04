
import React from 'react';
import { Company, extractCvrDetails, extractOwnershipData } from '@/services/companyAPI';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CompanyHeader from './company-details/CompanyHeader';
import BasicInfoAccordion from './company-details/BasicInfoAccordion';
import ExtendedInfoAccordion from './company-details/ExtendedInfoAccordion';
import SigningRulesAccordion from './company-details/SigningRulesAccordion';
import OwnershipAccordion from './company-details/OwnershipAccordion';
import { ProductionUnitsAccordion } from './company-details/ProductionUnitsAccordion';
import FinancialAccordion from './company-details/FinancialAccordion';
import EmployeeAccordion from './company-details/EmployeeAccordion';
import HistoryAccordion from './company-details/HistoryAccordion';

interface CompanyDetailsProps {
  company: Company;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  const cvrDetails = company.realCvrData ? extractCvrDetails(company.realCvrData) : null;
  
  // Extract subsidiaries directly from CVR data
  const subsidiaries = React.useMemo(() => {
    if (!company.realCvrData) return [];
    const ownershipData = extractOwnershipData(company.realCvrData);
    return ownershipData.subsidiaries || [];
  }, [company.realCvrData]);
  
  return (
    <div className="py-2 sm:py-4 md:py-6 max-w-7xl mx-auto px-2 sm:px-3 md:px-4">
      <CompanyHeader company={company} />

      <Alert className="my-4 bg-primary/5 border-primary/20">
        <FileText className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm">Skal du handle med selskabet? - Få en Virksomheds- og Kreditrapport</span>
          <Button asChild size="sm" variant="default">
            <Link to="/virksomhedsrapporter" state={{ preselectedCompany: company }}>
              Se rapporter
            </Link>
          </Button>
        </AlertDescription>
      </Alert>

      <Accordion type="multiple" defaultValue={["basic", "extended", "signing-rules", "ownership", "production-units", "financial", "employees", "history"]} className="w-full space-y-2 sm:space-y-3 md:space-y-4">
        <BasicInfoAccordion company={company} cvrData={company.realCvrData} />
        <ExtendedInfoAccordion company={company} cvrData={company.realCvrData} />
        <SigningRulesAccordion cvrData={company.realCvrData} />
        <OwnershipAccordion 
          cvrData={company.realCvrData} 
          subsidiaries={subsidiaries}
        />
        <ProductionUnitsAccordion productionUnits={company.productionUnits || []} />
        <FinancialAccordion cvr={company.cvr} cvrData={company.realCvrData} />
        <EmployeeAccordion cvr={company.cvr} cvrData={company.realCvrData} />
        <HistoryAccordion cvrData={company.realCvrData} />
      </Accordion>
      
      <div className="mt-4 sm:mt-6 md:mt-8 space-y-3 sm:space-y-4">
        <div className="flex justify-center">
          <Button asChild variant="outline" className="flex gap-1 h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 text-xs sm:text-sm">
            <Link to="/">
              <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              Tilbage til søgning
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;

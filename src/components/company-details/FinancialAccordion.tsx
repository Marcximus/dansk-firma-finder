
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { extractFinancialData } from '@/services/cvrUtils';
import { TrendingUp } from 'lucide-react';
import FinancialKPICard from './financial/FinancialKPICard';
import EmploymentDataCard from './financial/EmploymentDataCard';
import CapitalInformationCard from './financial/CapitalInformationCard';
import FinancialReportsSection from './financial/FinancialReportsSection';

interface FinancialAccordionProps {
  cvr: string;
  cvrData: any;
}

const FinancialAccordion: React.FC<FinancialAccordionProps> = ({ cvr, cvrData }) => {
  console.log('FinancialAccordion - Raw CVR Data:', cvrData);
  
  const financialData = extractFinancialData(cvrData);
  console.log('FinancialAccordion - Extracted Data:', financialData);

  return (
    <AccordionItem value="financial" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <span className="text-lg font-semibold">Regnskaber & Finansielle data</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Key Financial Figures - Always show these */}
          <FinancialKPICard financialKPIs={financialData?.financialKPIs} />

          {/* Employment Data */}
          <EmploymentDataCard 
            yearlyEmployment={financialData?.yearlyEmployment || []}
            quarterlyEmployment={financialData?.quarterlyEmployment || []}
          />

          {/* Capital Information & Accounting Periods */}
          <CapitalInformationCard 
            kapitalforhold={financialData?.kapitalforhold || []}
            regnskabsperiode={financialData?.regnskabsperiode || []}
          />

          {/* Financial Reports */}
          <FinancialReportsSection cvr={cvr} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FinancialAccordion;

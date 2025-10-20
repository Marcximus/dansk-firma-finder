
import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { extractFinancialData } from '@/services/utils/financialUtils';
import { TrendingUp } from 'lucide-react';
import FinancialKPICard from './financial/FinancialKPICard';
import EmploymentDataCard from './financial/EmploymentDataCard';
import CapitalInformationCard from './financial/CapitalInformationCard';
import FinancialReportsSection from './financial/FinancialReportsSection';
import FinancialChartsSection from './financial/FinancialChartsSection';
import { getFinancialData } from '@/services/companyAPI';

interface FinancialAccordionProps {
  cvr: string;
  cvrData: any;
}

const FinancialAccordion: React.FC<FinancialAccordionProps> = ({ cvr, cvrData }) => {
  console.log('FinancialAccordion - Raw CVR Data:', cvrData);
  
  const [parsedFinancialData, setParsedFinancialData] = useState<any>(null);
  
  // Fetch parsed XBRL financial data
  useEffect(() => {
    const fetchParsedData = async () => {
      try {
        const data = await getFinancialData(cvr);
        console.log('FinancialAccordion - Parsed XBRL data:', data);
        setParsedFinancialData(data);
      } catch (error) {
        console.error('Error fetching parsed financial data:', error);
      }
    };
    
    fetchParsedData();
  }, [cvr]);
  
  // Extract and process financial data (now includes parsed XBRL data)
  const financialData = extractFinancialData(cvrData, parsedFinancialData);
  console.log('FinancialAccordion - Extracted Data:', financialData);

  return (
    <AccordionItem value="financial" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <TrendingUp className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Regnskaber & Finansielle data</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Key Financial Figures - Always show these */}
          <FinancialKPICard financialKPIs={financialData?.financialKPIs} />

          {/* Financial Charts - Show historical data if available */}
          {financialData?.historicalData && financialData.historicalData.length > 0 && (
            <FinancialChartsSection historicalData={financialData.historicalData} />
          )}

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

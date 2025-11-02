
import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { extractFinancialData } from '@/services/utils/financialUtils';
import { TrendingUp } from 'lucide-react';
import FinancialKPICard from './financial/FinancialKPICard';
import CapitalInformationCard from './financial/CapitalInformationCard';
import RevenueResultChart from './financial/RevenueResultChart';
import EquityChart from './financial/EquityChart';
import FinancialSpreadsheet from './financial/FinancialSpreadsheet';
import EquityStatementCard from './financial/EquityStatementCard';
import { getFinancialData } from '@/services/companyAPI';

interface FinancialAccordionProps {
  cvr: string;
  cvrData: any;
}

const FinancialAccordion: React.FC<FinancialAccordionProps> = ({ cvr, cvrData }) => {
  console.log('FinancialAccordion - Raw CVR Data:', cvrData);
  
  const [parsedFinancialData, setParsedFinancialData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch parsed XBRL financial data
  useEffect(() => {
    const fetchParsedData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFinancialData(cvr);
        console.log('FinancialAccordion - Parsed XBRL data:', data);
        
        // Check if we should fallback to mock data
        if (data?.fallbackToMockData && data?.error) {
          console.log('FinancialAccordion - Using mock data due to API timeout');
          setError(data.error);
          setParsedFinancialData(null); // Let extractFinancialData handle fallback
        } else {
          setParsedFinancialData(data);
        }
      } catch (error) {
        console.error('Error fetching parsed financial data:', error);
        setError('Kunne ikke hente regnskabsdata fra XBRL');
      } finally {
        setIsLoading(false);
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
          {/* Loading state */}
          {isLoading && (
            <div className="text-sm text-muted-foreground">
              Henter regnskabsdata...
            </div>
          )}
          
          {/* Error state */}
          {error && !isLoading && (
            <div className="text-sm text-amber-600 dark:text-amber-500 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="font-semibold mb-1">⚠️ Regnskabsdata midlertidigt utilgængelig</div>
              <div className="text-xs">{error}</div>
              <div className="text-xs mt-2 opacity-80">
                Vi viser tilgængelige data fra CVR nedenfor. XBRL regnskabsdata fra Erhvervsstyrelsen kan ikke hentes lige nu.
              </div>
            </div>
          )}
          {/* Revenue & Result Chart - Show above spreadsheet if available */}
          {financialData?.historicalData && financialData.historicalData.length > 0 && (
            <RevenueResultChart historicalData={financialData.historicalData} />
          )}

          {/* Financial Spreadsheet - Show comprehensive data if available */}
          {financialData?.historicalData && financialData.historicalData.length > 0 && (
            <FinancialSpreadsheet historicalData={financialData.historicalData} />
          )}

          {/* Equity Chart - Show above equity statement if available */}
          {financialData?.historicalData && financialData.historicalData.length > 0 && (
            <EquityChart historicalData={financialData.historicalData} />
          )}

          {/* Equity Statement - Show if we have historical data */}
          {financialData?.historicalData && financialData.historicalData.length >= 2 && (
            <EquityStatementCard historicalData={financialData.historicalData} />
          )}

          {/* Key Financial Figures - Show if no spreadsheet data */}
          {(!financialData?.historicalData || financialData.historicalData.length === 0) && (
            <FinancialKPICard financialKPIs={financialData?.financialKPIs} />
          )}

          {/* Capital Information & Accounting Periods */}
          <CapitalInformationCard 
            kapitalforhold={financialData?.kapitalforhold || []}
            regnskabsperiode={financialData?.regnskabsperiode || []}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FinancialAccordion;

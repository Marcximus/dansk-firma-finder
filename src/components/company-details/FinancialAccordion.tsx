
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { extractFinancialData } from '@/services/utils/financialUtils';
import { TrendingUp, Download, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FinancialKPICard from './financial/FinancialKPICard';
import EmploymentDataCard from './financial/EmploymentDataCard';
import CapitalInformationCard from './financial/CapitalInformationCard';
import FinancialReportsSection from './financial/FinancialReportsSection';
import FinancialChartsSection from './financial/FinancialChartsSection';
import FinancialSpreadsheet from './financial/FinancialSpreadsheet';
import { getFinancialData } from '@/services/companyAPI';

interface FinancialAccordionProps {
  cvr: string;
  cvrData: any;
}

const CACHE_KEY_PREFIX = 'financial_data_';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const FinancialAccordion: React.FC<FinancialAccordionProps> = ({ cvr, cvrData }) => {
  console.log('FinancialAccordion - Raw CVR Data:', cvrData);
  
  const [parsedFinancialData, setParsedFinancialData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Check for cached data on mount
  React.useEffect(() => {
    const cacheKey = `${CACHE_KEY_PREFIX}${cvr}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_DURATION_MS) {
          console.log('FinancialAccordion - Using cached data:', data);
          setParsedFinancialData(data);
          setLastUpdated(new Date(timestamp).toLocaleString('da-DK'));
        } else {
          // Cache expired
          localStorage.removeItem(cacheKey);
        }
      } catch (err) {
        console.error('Error loading cached data:', err);
        localStorage.removeItem(cacheKey);
      }
    }
  }, [cvr]);
  
  // Manual fetch function
  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setElapsedTime(0);
      
      // Start elapsed time counter
      const startTime = Date.now();
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      const data = await getFinancialData(cvr);
      clearInterval(timer);
      
      console.log('FinancialAccordion - Parsed XBRL data:', data);
      
      // Check if we should fallback to mock data
      if (data?.fallbackToMockData && data?.error) {
        console.log('FinancialAccordion - Using mock data due to API timeout');
        setError(data.error);
        setParsedFinancialData(null);
      } else {
        setParsedFinancialData(data);
        
        // Cache successful responses
        if (data && data.financialData && data.financialData.length > 0) {
          const cacheKey = `${CACHE_KEY_PREFIX}${cvr}`;
          const timestamp = Date.now();
          localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp }));
          setLastUpdated(new Date(timestamp).toLocaleString('da-DK'));
        }
      }
    } catch (error) {
      console.error('Error fetching parsed financial data:', error);
      setError('Kunne ikke hente regnskabsdata fra XBRL');
    } finally {
      setIsLoading(false);
      setElapsedTime(0);
    }
  };
  
  // Extract and process financial data (now includes parsed XBRL data)
  const financialData = extractFinancialData(cvrData, parsedFinancialData);
  console.log('FinancialAccordion - Extracted Data:', financialData);
  
  const hasFinancialData = parsedFinancialData && parsedFinancialData.financialData && parsedFinancialData.financialData.length > 0;

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
          
          {/* Manual fetch button */}
          {!hasFinancialData && !isLoading && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                    Hent detaljerede regnskabsdata (XBRL)
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Klik for at hente og parse XBRL-regnskaber fra Erhvervsstyrelsen. Dette kan tage op til 60 sekunder.
                  </p>
                  {lastUpdated && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Senest hentet: {lastUpdated}
                    </p>
                  )}
                  <Button 
                    onClick={fetchFinancialData}
                    disabled={isLoading}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Hent regnskabsdata
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Loading state with elapsed time */}
          {isLoading && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Henter regnskabsdata fra Erhvervsstyrelsen...
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {elapsedTime}s / ~60s
                  </p>
                </div>
              </div>
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
              <Button 
                onClick={fetchFinancialData}
                disabled={isLoading}
                size="sm"
                variant="outline"
                className="mt-3 text-xs"
              >
                Prøv igen
              </Button>
            </div>
          )}
          
          {/* Success message with refresh option */}
          {hasFinancialData && !isLoading && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  XBRL-data hentet {lastUpdated && `- ${lastUpdated}`}
                </p>
              </div>
              <Button 
                onClick={fetchFinancialData}
                disabled={isLoading}
                size="sm"
                variant="ghost"
                className="text-xs h-7"
              >
                Opdater
              </Button>
            </div>
          )}
          
          {/* Financial Spreadsheet - Show comprehensive data if available */}
          {financialData?.historicalData && financialData.historicalData.length > 0 && (
            <FinancialSpreadsheet historicalData={financialData.historicalData} />
          )}

          {/* Key Financial Figures - Show if no spreadsheet data */}
          {(!financialData?.historicalData || financialData.historicalData.length === 0) && (
            <FinancialKPICard financialKPIs={financialData?.financialKPIs} />
          )}

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

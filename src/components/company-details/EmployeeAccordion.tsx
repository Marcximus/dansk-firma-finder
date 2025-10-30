import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { extractFinancialData } from '@/services/utils/financialUtils';
import { getFinancialData } from '@/services/companyAPI';
import EmploymentDataCard from './financial/EmploymentDataCard';

interface EmployeeAccordionProps {
  cvr: string;
  cvrData: any;
}

const EmployeeAccordion: React.FC<EmployeeAccordionProps> = ({ cvr, cvrData }) => {
  const [parsedFinancialData, setParsedFinancialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch parsed XBRL financial data
  useEffect(() => {
    const fetchParsedData = async () => {
      try {
        setIsLoading(true);
        const data = await getFinancialData(cvr);
        setParsedFinancialData(data);
      } catch (error) {
        console.error('Error fetching parsed financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParsedData();
  }, [cvr]);
  
  // Extract and process financial data
  const financialData = extractFinancialData(cvrData, parsedFinancialData);

  // Process employment data for chart - show quarterly data for last 24 quarters
  const processEmploymentData = () => {
    const employmentData: Array<{
      periode: string;
      total: number;
      fuldtid: number;
      deltid: number;
    }> = [];

    // Use quarterly data only
    if (financialData?.quarterlyEmployment && financialData.quarterlyEmployment.length > 0) {
      console.log('Available quarterly employment data:', financialData.quarterlyEmployment.slice(0, 24));
      financialData.quarterlyEmployment
        .slice(0, 24) // Last 24 quarters
        .forEach((item: any) => {
          const total = item.antalAnsatte || 0;
          const fuldtid = item.antalAarsvaerk || 0;
          const deltid = Math.max(0, total - fuldtid); // Part-time = Total - Full-time equivalent
          
          if (item.aar && item.kvartal !== undefined && item.kvartal !== null) {
            const periode = `Q${item.kvartal} ${item.aar}`;
            employmentData.push({ periode, total, fuldtid, deltid });
          }
        });
    }
    
    // Data is newest first, reverse to show oldest → newest (left to right) in chart
    return employmentData.reverse();
  };

  const chartData = processEmploymentData();
  
  // Calculate latest quarter for data availability message
  const getLatestQuarterInfo = () => {
    if (chartData.length === 0) return { year: 0, quarter: 0, isOld: false };
    
    const latest = chartData[chartData.length - 1]; // Last item (newest after reverse)
    const match = latest.periode.match(/Q(\d+)\s+(\d{4})/);
    if (!match) return { year: 0, quarter: 0, isOld: false };
    
    const quarter = parseInt(match[1]);
    const year = parseInt(match[2]);
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    
    // Calculate quarters difference (consider data old if more than 2 quarters behind)
    const quartersDiff = (currentYear - year) * 4 + (currentQuarter - quarter);
    const isOld = quartersDiff > 2;
    
    return { year, quarter, isOld };
  };
  
  const latestInfo = getLatestQuarterInfo();
  const isDataOld = latestInfo.isOld;

  const formatEmployees = (value: number) => value.toString();

  return (
    <AccordionItem value="employees" className="border rounded-lg" data-accordion-item="employees">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Medarbejdere</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Loading state */}
          {isLoading && (
            <div className="text-sm text-muted-foreground">
              Henter medarbejderdata...
            </div>
          )}
          
          {/* Employee Development Chart */}
          {!isLoading && chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Medarbejderudvikling over tid
                  {isDataOld && latestInfo.year > 0 && (
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      (Seneste data: Q{latestInfo.quarter} {latestInfo.year})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="periode" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      className="text-sm"
                      tickFormatter={formatEmployees}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone"
                      dataKey="total" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="Total"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone"
                      dataKey="fuldtid" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Fuldtid (Årsværk)"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone"
                      dataKey="deltid" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      name="Deltid"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Employment Data Cards */}
          <EmploymentDataCard 
            monthlyEmployment={financialData?.monthlyEmployment || []}
            yearlyEmployment={financialData?.yearlyEmployment || []}
            quarterlyEmployment={financialData?.quarterlyEmployment || []}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EmployeeAccordion;

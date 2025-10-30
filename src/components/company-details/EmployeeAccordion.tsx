import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  // Process employment data for chart - show quarterly data for last 12 quarters
  const processEmploymentData = () => {
    const employmentData: Array<{
      periode: string;
      ansatte: number;
    }> = [];

    // Use quarterly data only
    if (financialData?.quarterlyEmployment && financialData.quarterlyEmployment.length > 0) {
      financialData.quarterlyEmployment
        .slice(0, 12) // Last 12 quarters
        .forEach((item: any) => {
          const ansatte = item.antalAnsatte || 0;
          
          if (item.aar && item.kvartal !== undefined && item.kvartal !== null) {
            const periode = `Q${item.kvartal} ${item.aar}`;
            employmentData.push({ periode, ansatte });
          }
        });
    }
    
    // Data is newest first, reverse to show oldest → newest (left to right) in chart
    return employmentData.reverse();
  };

  const chartData = processEmploymentData();
  
  // Calculate latest year for data availability message
  const latestYear = chartData.length > 0 
    ? Math.max(...chartData.map(d => {
        const match = d.periode.match(/\d{4}/);
        return match ? parseInt(match[0]) : 0;
      }))
    : 0;
  const currentYear = new Date().getFullYear();
  const isDataOld = latestYear > 0 && latestYear < currentYear - 1;

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
                  {isDataOld && (
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      (Seneste data: {latestYear})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                    <Bar 
                      dataKey="ansatte" 
                      fill="hsl(var(--primary))" 
                      name="Ansatte"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
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

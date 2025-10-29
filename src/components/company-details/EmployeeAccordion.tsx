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

  // Format data for employee chart - reverse to show newest on left
  const chartData = financialData?.historicalData?.map(data => ({
    year: data.year.toString(),
    antalAnsatte: data.antalAnsatte
  })).reverse() || [];

  const formatEmployees = (value: number) => `${value} ansatte`;

  return (
    <AccordionItem value="employees" className="border rounded-lg">
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
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Medarbejderudvikling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="year" 
                      reversed={true}
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      className="text-sm"
                      tickFormatter={formatEmployees}
                      domain={[0, 'auto']}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatEmployees(value), 'Antal ansatte']}
                      labelFormatter={(label) => `År ${label}`}
                    />
                    <Bar 
                      dataKey="antalAnsatte" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Employment Data Cards */}
          <EmploymentDataCard 
            yearlyEmployment={financialData?.yearlyEmployment || []}
            quarterlyEmployment={financialData?.quarterlyEmployment || []}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EmployeeAccordion;

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

  // Process employment data for chart - prefer monthly over quarterly
  const processEmploymentData = () => {
    const employmentData: Array<{
      periode: string;
      total: number;
      fuldtid: number;
      deltid: number;
    }> = [];

    // Priority 1: Try monthly data (maanedsbeskaeftigelse or erstMaanedsbeskaeftigelse)
    if (financialData?.monthlyEmployment && financialData.monthlyEmployment.length > 0) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
      
      financialData.monthlyEmployment
        .slice(-12) // Take last 12 months (most recent)
        .forEach((item: any) => {
          const total = item.antalAnsatte || 0;
          const fuldtid = Math.round((item.antalAarsvaerk || 0) * 100) / 100; // Handle decimal values
          const deltid = Math.max(0, total - fuldtid);
          
          if (item.maaned && item.aar) {
            const periode = `${monthNames[item.maaned - 1]} ${item.aar}`;
            employmentData.push({ periode, total, fuldtid, deltid });
          }
        });
    }
    
    // Priority 2: Fallback to quarterly data if no monthly data
    if (employmentData.length === 0 && financialData?.quarterlyEmployment && financialData.quarterlyEmployment.length > 0) {
      financialData.quarterlyEmployment
        .slice(-12) // Take last 12 quarters (most recent)
        .forEach((item: any) => {
          const total = item.antalAnsatte || 0;
          const fuldtid = item.antalAarsvaerk || 0;
          const deltid = Math.max(0, total - fuldtid);
          
          if (item.kvartal && item.aar) {
            const periode = `${item.kvartal}. kvt ${item.aar}`;
            employmentData.push({ periode, total, fuldtid, deltid });
          }
        });
    }
    
    // Priority 3: Last resort - use yearly data if neither monthly nor quarterly exists
    if (employmentData.length === 0 && financialData?.yearlyEmployment && financialData.yearlyEmployment.length > 0) {
      financialData.yearlyEmployment
        .slice(-10) // Take last 10 years (most recent)
        .forEach((item: any) => {
          const total = item.antalAnsatte || 0;
          const fuldtid = item.antalAarsvaerk || 0;
          const deltid = Math.max(0, total - fuldtid);
          
          if (item.aar) {
            const periode = item.aar.toString();
            employmentData.push({ periode, total, fuldtid, deltid });
          }
        });
    }
    
    // Reverse to show oldest → newest (left to right)
    return employmentData.reverse();
  };

  const chartData = processEmploymentData();

  const formatEmployees = (value: number) => value.toString();

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
                  Medarbejderudvikling (seneste 12 måneder)
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
                      formatter={(value: number) => [value, '']}
                      labelFormatter={(label) => label}
                    />
                    <Bar 
                      dataKey="fuldtid" 
                      fill="hsl(var(--primary))" 
                      stackId="a"
                      name="Fuldtid (Årsværk)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="deltid" 
                      fill="hsl(var(--chart-2))" 
                      stackId="a"
                      name="Deltid"
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

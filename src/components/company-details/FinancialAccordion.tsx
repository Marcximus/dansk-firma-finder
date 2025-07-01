
import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { getFinancialData } from '@/services/companyAPI';
import { TrendingUp, Download, Calendar, DollarSign } from 'lucide-react';

interface FinancialAccordionProps {
  cvr: string;
  cvrData: any;
}

const FinancialAccordion: React.FC<FinancialAccordionProps> = ({ cvr, cvrData }) => {
  const [financialData, setFinancialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const data = await getFinancialData(cvr);
        setFinancialData(data);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [cvr]);

  const reports = financialData?.financialReports || [];

  return (
    <AccordionItem value="financial" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <span className="text-lg font-semibold">Regnskaber</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        {isLoading ? (
          <div className="text-muted-foreground">Indlæser regnskabsdata...</div>
        ) : (
          <div className="space-y-4">
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-200 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="font-semibold text-base">Periode: {report.period}</span>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Offentliggjort: {report.publishDate}</div>
                          <div>Godkendt: {report.approvalDate}</div>
                          {report.revenue && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>Omsætning: {report.revenue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {report.documentUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(report.documentUrl, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Hent
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">
                Ingen regnskabsoplysninger tilgængelige i øjeblikket.
              </div>
            )}
            
            <div className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded">
              <strong>Note:</strong> Regnskabsoplysninger hentes fra Erhvervsstyrelsens offentliggørelsesdatabase. 
              Ikke alle virksomheder har offentligt tilgængelige regnskaber.
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default FinancialAccordion;

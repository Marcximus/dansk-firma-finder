
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFinancialData } from '@/services/companyAPI';

interface FinancialReportsSectionProps {
  cvr: string;
}

const FinancialReportsSection: React.FC<FinancialReportsSectionProps> = ({ cvr }) => {
  const [financialReports, setFinancialReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const data = await getFinancialData(cvr);
        setFinancialReports(data?.financialReports || []);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [cvr]);

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Offentliggjorte regnskaber
      </h4>
      {isLoading ? (
        <div className="text-muted-foreground">Indlæser regnskabsdata...</div>
      ) : (
        <div className="space-y-4">
          {financialReports.length > 0 ? (
            <div className="space-y-3">
              {financialReports.map((report: any, index: number) => (
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
                        {report.documentType && (
                          <div>Type: {report.documentType}</div>
                        )}
                        {report.companyName && (
                          <div>Selskab: {report.companyName}</div>
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
    </div>
  );
};

export default FinancialReportsSection;

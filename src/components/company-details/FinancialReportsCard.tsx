
import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar } from 'lucide-react';
import { getFinancialData } from '@/services/companyAPI';
import { Button } from '@/components/ui/button';

interface FinancialReportsCardProps {
  cvr: string;
}

const FinancialReportsCard: React.FC<FinancialReportsCardProps> = ({ cvr }) => {
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <TrendingUp className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Regnskabsoplysninger</h3>
        </div>
        <p className="text-muted-foreground">Indlæser regnskabsdata...</p>
      </div>
    );
  }

  const reports = financialData?.financialReports || [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <TrendingUp className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Regnskabsoplysninger</h3>
      </div>
      
      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report: any, index: number) => (
            <div key={index} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Periode: {report.period}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Offentliggjort: {report.publishDate}</div>
                    <div>Godkendt: {report.approvalDate}</div>
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
  );
};

export default FinancialReportsCard;

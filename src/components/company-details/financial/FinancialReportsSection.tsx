
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Download, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFinancialData } from '@/services/companyAPI';

interface FinancialReportsSectionProps {
  cvr: string;
}

const FinancialReportsSection: React.FC<FinancialReportsSectionProps> = ({ cvr }) => {
  const [financialReports, setFinancialReports] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [hasRealData, setHasRealData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const data = await getFinancialData(cvr);
        
        setFinancialReports(data?.financialReports || []);
        setFinancialData(data?.financialData || []);
        setHasRealData(data?.hasRealData || false);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setFinancialReports([]);
        setFinancialData([]);
        setHasRealData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [cvr]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toLocaleString('da-DK')} DKK`;
  };

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
              {financialReports.map((report: any, index: number) => {
                // Find corresponding parsed financial data for this period
                const parsedData = financialData.find(fd => fd.periode === report.period);
                
                return (
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
                        </div>
                        
                        {/* Show parsed financial data if available */}
                        {parsedData && (
                          <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                            <div className="font-semibold text-sm text-green-800 mb-2 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Regnskabstal fra XBRL
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {parsedData.nettoomsaetning !== null && (
                                <div>
                                  <span className="text-muted-foreground">Nettoomsætning:</span>
                                  <div className="font-semibold">{formatCurrency(parsedData.nettoomsaetning)}</div>
                                </div>
                              )}
                              {parsedData.bruttofortjeneste !== null && (
                                <div>
                                  <span className="text-muted-foreground">Bruttofortjeneste:</span>
                                  <div className="font-semibold">{formatCurrency(parsedData.bruttofortjeneste)}</div>
                                </div>
                              )}
                              {parsedData.aaretsResultat !== null && (
                                <div>
                                  <span className="text-muted-foreground">Årets resultat:</span>
                                  <div className="font-semibold">{formatCurrency(parsedData.aaretsResultat)}</div>
                                </div>
                              )}
                              {parsedData.egenkapital !== null && (
                                <div>
                                  <span className="text-muted-foreground">Egenkapital:</span>
                                  <div className="font-semibold">{formatCurrency(parsedData.egenkapital)}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {report.documentUrl ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(report.documentUrl, '_blank')}
                          className="flex items-center gap-1 ml-2"
                        >
                          <Download className="h-4 w-4" />
                          Hent XBRL
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground">
              Ingen offentliggjorte regnskaber fundet for dette CVR-nummer.
            </div>
          )}
          
          {hasRealData && (
            <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded">
              <strong>✓ Rigtige data:</strong> Regnskabstal er hentet og parset fra officielle XBRL-filer fra Erhvervsstyrelsen.
            </div>
          )}
          {!hasRealData && financialReports.length > 0 && (
            <div className="mt-4 text-sm text-orange-600 bg-orange-50 p-3 rounded">
              <strong>Note:</strong> XBRL-filer kunne ikke parses. Download filerne for at se detaljerede regnskabsdata.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialReportsSection;

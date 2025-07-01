
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Download, Calendar } from 'lucide-react';
import { getFinancialData } from '@/services/companyAPI';
import { Button } from '@/components/ui/button';

interface FinancialSectionProps {
  cvr: string;
  cvrData: any;
}

const FinancialSection: React.FC<FinancialSectionProps> = ({ cvr, cvrData }) => {
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

  const yearlyEmployment = cvrData?.aarsbeskaeftigelse || [];
  const quarterlyEmployment = cvrData?.kvartalsbeskaeftigelse || [];
  const reports = financialData?.financialReports || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Beskæftigelseshistorik
            </CardTitle>
            <CardDescription>Årsdata for medarbejdere</CardDescription>
          </CardHeader>
          <CardContent>
            {yearlyEmployment.length > 0 ? (
              <div className="space-y-3">
                {yearlyEmployment.slice(0, 10).map((employment: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-4 text-sm border-b pb-3">
                    <div>
                      <span className="font-medium">{employment.aar}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ansatte:</span>
                      <div className="font-medium">{employment.antalAnsatte || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Årsværk:</span>
                      <div className="font-medium">{employment.antalAarsvaerk || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Inkl. ejere:</span>
                      <div className="font-medium">{employment.antalInklusivEjere || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ingen beskæftigelsesdata tilgængelig</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Regnskabsoplysninger
            </CardTitle>
            <CardDescription>Offentliggjorte regnskaber</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Indlæser regnskabsdata...</p>
            ) : reports.length > 0 ? (
              <div className="space-y-4">
                {reports.slice(0, 5).map((report: any, index: number) => (
                  <div key={index} className="border rounded p-3">
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
              <p className="text-muted-foreground">Ingen regnskabsoplysninger tilgængelige</p>
            )}
          </CardContent>
        </Card>
      </div>

      {quarterlyEmployment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kvartalsdata</CardTitle>
            <CardDescription>Seneste kvartalsvise beskæftigelsestal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quarterlyEmployment.slice(0, 8).map((employment: any, index: number) => (
                <div key={index} className="border rounded p-3 text-center">
                  <div className="font-medium">Q{employment.kvartal} {employment.aar}</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    <div>Ansatte: {employment.antalAnsatte || 'N/A'}</div>
                    <div>Årsværk: {employment.antalAarsvaerk || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialSection;

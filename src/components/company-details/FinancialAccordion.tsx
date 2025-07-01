
import React, { useState, useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { getFinancialData } from '@/services/companyAPI';
import { TrendingUp, Download, Calendar, DollarSign, Users, Building, FileText } from 'lucide-react';

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
  const yearlyEmployment = cvrData?.aarsbeskaeftigelse || [];
  const quarterlyEmployment = cvrData?.kvartalsbeskaeftigelse || [];
  const kapitalforhold = cvrData?.kapitalforhold || [];
  const regnskabsperiode = cvrData?.regnskabsperiode || [];

  return (
    <AccordionItem value="financial" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <span className="text-lg font-semibold">Økonomi & Regnskaber</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* Employment Data */}
          {yearlyEmployment.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Beskæftigelse (årlige tal)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearlyEmployment.slice(0, 6).map((employment: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <div className="font-semibold text-center text-lg">{employment.aar}</div>
                    <div className="space-y-1 text-sm mt-2">
                      {employment.antalAnsatte && (
                        <div>Ansatte: <span className="font-medium">{employment.antalAnsatte}</span></div>
                      )}
                      {employment.antalAarsvaerk && (
                        <div>Årsværk: <span className="font-medium">{employment.antalAarsvaerk}</span></div>
                      )}
                      {employment.antalInklusivEjere && (
                        <div>Inkl. ejere: <span className="font-medium">{employment.antalInklusivEjere}</span></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capital Information */}
          {kapitalforhold.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Kapitalforhold
              </h4>
              <div className="space-y-3">
                {kapitalforhold.map((kapital: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-200 pl-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {kapital.kapitalklasse && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Kapitalklasse</span>
                          <div className="font-medium">{kapital.kapitalklasse}</div>
                        </div>
                      )}
                      {kapital.kapitalbeloeb && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Beløb</span>
                          <div className="font-medium">{kapital.kapitalbeloeb.toLocaleString('da-DK')} DKK</div>
                        </div>
                      )}
                      {kapital.valuta && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Valuta</span>
                          <div className="font-medium">{kapital.valuta}</div>
                        </div>
                      )}
                      {kapital.periode && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Periode</span>
                          <div className="font-medium">
                            {kapital.periode.gyldigFra || 'Ukendt'} - {kapital.periode.gyldigTil || 'Nuværende'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accounting Period */}
          {regnskabsperiode.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Regnskabsperioder
              </h4>
              <div className="space-y-2">
                {regnskabsperiode.map((periode: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="font-medium">
                      {periode.regnskabsperiodefra} - {periode.regnskabsperiodetil}
                    </div>
                    {periode.regnskabsform && (
                      <div className="text-sm text-muted-foreground">Form: {periode.regnskabsform}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Reports */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Offentliggjorte regnskaber
            </h4>
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

          {/* Quarterly Employment Data */}
          {quarterlyEmployment.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Kvartalsvise beskæftigelsestal
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quarterlyEmployment.slice(0, 8).map((employment: any, index: number) => (
                  <div key={index} className="border rounded p-3 text-center">
                    <div className="font-medium">Q{employment.kvartal} {employment.aar}</div>
                    <div className="text-sm text-muted-foreground space-y-1 mt-2">
                      {employment.antalAnsatte && (
                        <div>Ansatte: {employment.antalAnsatte}</div>
                      )}
                      {employment.antalAarsvaerk && (
                        <div>Årsværk: {employment.antalAarsvaerk}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FinancialAccordion;


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface FinancialSectionProps {
  cvr: string;
  cvrData: any;
}

const FinancialSection: React.FC<FinancialSectionProps> = ({ cvr, cvrData }) => {
  const yearlyEmployment = cvrData?.aarsbeskaeftigelse || [];
  const quarterlyEmployment = cvrData?.kvartalsbeskaeftigelse || [];

  return (
    <div className="space-y-6">
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

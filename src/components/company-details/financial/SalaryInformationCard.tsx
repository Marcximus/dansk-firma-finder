import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface SalaryInformationCardProps {
  historicalData: any[];
}

const SalaryInformationCard: React.FC<SalaryInformationCardProps> = ({ historicalData }) => {
  // Get the most recent period with personnel cost data
  const latestData = historicalData.find(d => d.personaleomkostninger && d.personaleomkostninger > 0);
  
  if (!latestData || !latestData.personaleomkostninger) {
    return null;
  }

  const personaleomkostninger = latestData.personaleomkostninger;
  const antalAnsatte = latestData.antalAnsatte || 0;
  const antalAarsvaerk = latestData.antalAarsvaerk || 0;

  // Calculate average salary per employee (annual)
  const avgSalaryPerEmployee = antalAnsatte > 0 
    ? personaleomkostninger / antalAnsatte 
    : 0;

  // Calculate average salary per full-time equivalent (annual)
  const avgSalaryPerFTE = antalAarsvaerk > 0 
    ? personaleomkostninger / antalAarsvaerk 
    : 0;

  // Calculate monthly averages
  const avgMonthlySalaryPerEmployee = avgSalaryPerEmployee / 12;
  const avgMonthlySalaryPerFTE = avgSalaryPerFTE / 12;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5" />
          Lønforhold
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Personnel Costs */}
        <div className="pb-3 border-b">
          <div className="text-sm text-muted-foreground mb-1">
            Samlede personaleomkostninger ({latestData.periode})
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(personaleomkostninger)}
          </div>
        </div>

        {/* Average Salaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Per Employee */}
          {antalAnsatte > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Gennemsnitlig løn pr. medarbejder
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(avgMonthlySalaryPerEmployee)}/md
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(avgSalaryPerEmployee)} årligt
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Baseret på {antalAnsatte} medarbejder{antalAnsatte !== 1 ? 'e' : ''}
              </div>
            </div>
          )}

          {/* Per Full-Time Equivalent */}
          {antalAarsvaerk > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Gennemsnitlig løn pr. årsværk
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(avgMonthlySalaryPerFTE)}/md
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(avgSalaryPerFTE)} årligt
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Baseret på {antalAarsvaerk.toFixed(1)} årsværk
              </div>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="text-xs text-muted-foreground pt-3 border-t">
          <strong>Note:</strong> Gennemsnitslønnen er beregnet ud fra de samlede personaleomkostninger, 
          som inkluderer løn, pension, sociale bidrag og andre medarbejderrelaterede omkostninger.
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryInformationCard;

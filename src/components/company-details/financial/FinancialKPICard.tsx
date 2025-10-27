
import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialKPICardProps {
  financialKPIs: any;
}

const FinancialKPICard: React.FC<FinancialKPICardProps> = ({ financialKPIs }) => {
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'Ikke tilgængelig';
    return `${value.toLocaleString('da-DK')} DKK`;
  };

  const kpiData = [
    {
      label: 'Nettoomsætning',
      value: financialKPIs?.nettoomsaetning,
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      label: 'Bruttofortjeneste',
      value: financialKPIs?.bruttofortjeneste,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Årets resultat',
      value: financialKPIs?.aaretsResultat,
      icon: financialKPIs?.aaretsResultat > 0 ? TrendingUp : TrendingDown,
      color: financialKPIs?.aaretsResultat > 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      label: 'Egenkapital i alt',
      value: financialKPIs?.egenkapital,
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      label: 'Status balance',
      value: financialKPIs?.statusBalance,
      icon: DollarSign,
      color: 'text-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Nøgletal
          {financialKPIs?.periode && (
            <span className="text-sm font-normal text-muted-foreground">
              ({financialKPIs.periode})
            </span>
          )}
        </CardTitle>
        {financialKPIs?.dataSource && (
          <div className="text-xs text-muted-foreground">
            Kilde: {financialKPIs.dataSource === 'XBRL' ? 'XBRL-fil (Erhvervsstyrelsen)' : 'CVR API'}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">{kpi.label}</div>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(kpi.value)}
                </div>
              </div>
            );
          })}
        </div>
        
        {!financialKPIs && (
          <div className="text-center py-8 text-muted-foreground">
            Ingen finansielle nøgletal tilgængelige
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialKPICard;

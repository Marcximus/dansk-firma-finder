
import React from 'react';
import { DollarSign } from 'lucide-react';

interface FinancialKPICardProps {
  financialKPIs: any;
}

const FinancialKPICard: React.FC<FinancialKPICardProps> = ({ financialKPIs }) => {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Nøgletal
        {financialKPIs?.periode && (
          <span className="text-sm font-normal text-muted-foreground">({financialKPIs.periode})</span>
        )}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Nettoomsætning */}
        <div className="border rounded p-3">
          <div className="text-sm font-medium text-muted-foreground">Nettoomsætning</div>
          <div className="text-lg font-semibold">
            {financialKPIs?.nettoomsaetning ? 
              `${financialKPIs.nettoomsaetning.toLocaleString('da-DK')} DKK` : 
              'Ikke tilgængelig'
            }
          </div>
        </div>
        
        {/* Bruttofortjeneste */}
        <div className="border rounded p-3">
          <div className="text-sm font-medium text-muted-foreground">Bruttofortjeneste</div>
          <div className="text-lg font-semibold">
            {financialKPIs?.bruttofortjeneste ? 
              `${financialKPIs.bruttofortjeneste.toLocaleString('da-DK')} DKK` : 
              'Ikke tilgængelig'
            }
          </div>
        </div>
        
        {/* Årets resultat */}
        <div className="border rounded p-3">
          <div className="text-sm font-medium text-muted-foreground">Årets resultat</div>
          <div className="text-lg font-semibold">
            {financialKPIs?.aaretsResultat ? 
              `${financialKPIs.aaretsResultat.toLocaleString('da-DK')} DKK` : 
              'Ikke tilgængelig'
            }
          </div>
        </div>
        
        {/* Egenkapital i alt */}
        <div className="border rounded p-3">
          <div className="text-sm font-medium text-muted-foreground">Egenkapital i alt</div>
          <div className="text-lg font-semibold">
            {financialKPIs?.egenkapital ? 
              `${financialKPIs.egenkapital.toLocaleString('da-DK')} DKK` : 
              'Ikke tilgængelig'
            }
          </div>
        </div>
        
        {/* Status balance */}
        <div className="border rounded p-3">
          <div className="text-sm font-medium text-muted-foreground">Status balance</div>
          <div className="text-lg font-semibold">
            {financialKPIs?.statusBalance ? 
              `${financialKPIs.statusBalance.toLocaleString('da-DK')} DKK` : 
              'Ikke tilgængelig'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialKPICard;

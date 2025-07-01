
import React from 'react';
import { DollarSign, Calendar } from 'lucide-react';

interface CapitalInformationCardProps {
  kapitalforhold: any[];
  regnskabsperiode: any[];
}

const CapitalInformationCard: React.FC<CapitalInformationCardProps> = ({ kapitalforhold, regnskabsperiode }) => {
  return (
    <>
      {/* Capital Information */}
      {kapitalforhold && kapitalforhold.length > 0 && (
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
      {regnskabsperiode && regnskabsperiode.length > 0 && (
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
    </>
  );
};

export default CapitalInformationCard;

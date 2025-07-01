
import React from 'react';
import { Users } from 'lucide-react';

interface EmploymentDataCardProps {
  yearlyEmployment: any[];
  quarterlyEmployment: any[];
}

const EmploymentDataCard: React.FC<EmploymentDataCardProps> = ({ yearlyEmployment, quarterlyEmployment }) => {
  return (
    <>
      {/* Employment Data */}
      {yearlyEmployment && yearlyEmployment.length > 0 && (
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

      {/* Quarterly Employment Data */}
      {quarterlyEmployment && quarterlyEmployment.length > 0 && (
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
    </>
  );
};

export default EmploymentDataCard;

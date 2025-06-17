
import React from 'react';
import { Users } from 'lucide-react';

interface EmploymentHistoryCardProps {
  cvrData: any;
}

const EmploymentHistoryCard: React.FC<EmploymentHistoryCardProps> = ({ cvrData }) => {
  if (!cvrData || (!cvrData.aarsbeskaeftigelse && !cvrData.kvartalsbeskaeftigelse)) return null;

  const yearlyEmployment = cvrData.aarsbeskaeftigelse || [];
  const quarterlyEmployment = cvrData.kvartalsbeskaeftigelse || [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Users className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Employment History</h3>
      </div>
      
      {yearlyEmployment.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Annual Employment Data</h4>
          <div className="space-y-3">
            {yearlyEmployment.slice(0, 10).map((employment: any, index: number) => (
              <div key={index} className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">{employment.aar}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Employees:</span>
                  <div className="font-medium">{employment.antalAnsatte || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Full-time equiv.:</span>
                  <div className="font-medium">{employment.antalAarsvaerk || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Incl. owners:</span>
                  <div className="font-medium">{employment.antalInklusivEjere || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quarterlyEmployment.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Recent Quarterly Data</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {quarterlyEmployment.slice(0, 8).map((employment: any, index: number) => (
              <div key={index} className="flex justify-between text-sm border-b pb-2">
                <span className="font-medium">Q{employment.kvartal} {employment.aar}</span>
                <div className="text-right">
                  <div>Employees: {employment.antalAnsatte || 'N/A'}</div>
                  <div>FTE: {employment.antalAarsvaerk || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentHistoryCard;

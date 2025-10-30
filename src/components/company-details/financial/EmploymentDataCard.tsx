
import React from 'react';
import { Users, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmploymentDataCardProps {
  monthlyEmployment?: any[];
  yearlyEmployment: any[];
  quarterlyEmployment: any[];
}

const EmploymentDataCard: React.FC<EmploymentDataCardProps> = ({ monthlyEmployment, yearlyEmployment, quarterlyEmployment }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
  
  return (
    <>
      {/* Monthly Employment Data */}
      {monthlyEmployment && monthlyEmployment.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Antal ansatte pr måned
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Periode</th>
                  <th className="text-right py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1">
                          Ansatte <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Det samlede antal ansatte (hovedtal)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="text-right py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1">
                          Fuldtid <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Årsværk (FTE) - arbejdskapacitet målt i fuldtidsækvivalenter.<br />F.eks. 1.47 = 1 fuldtid + 1 person på 47% tid</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="text-right py-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1">
                          Deltid <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Beregnet forskel mellem ansatte og årsværk.<br />Ikke præcis antal deltidsansatte</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyEmployment.slice(-12).reverse().map((item: any, index: number) => {
                  const periode = item.maaned && item.aar ? `${monthNames[item.maaned - 1]} ${item.aar}` : item.aar;
                  const ansatte = item.antalAnsatte || 0;
                  const fuldtid = item.antalAarsvaerk || 0;
                  const deltid = ansatte - fuldtid;
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2">{periode}</td>
                      <td className="text-right">{ansatte}</td>
                      <td className="text-right">{fuldtid}</td>
                      <td className="text-right">{deltid}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Yearly Employment Data */}
      {yearlyEmployment && yearlyEmployment.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Antal ansatte pr år
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yearlyEmployment.slice(-6).reverse().map((employment: any, index: number) => (
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
            Antal ansatte pr kvartal
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quarterlyEmployment.slice(-8).reverse().map((employment: any, index: number) => (
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

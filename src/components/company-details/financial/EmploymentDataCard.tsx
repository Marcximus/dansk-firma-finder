import React, { useState } from 'react';
import { Users, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmploymentDataCardProps {
  monthlyEmployment?: any[];
  yearlyEmployment: any[];
  quarterlyEmployment: any[];
}

const EmploymentDataCard: React.FC<EmploymentDataCardProps> = ({ 
  monthlyEmployment, 
  yearlyEmployment, 
  quarterlyEmployment 
}) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Helper to format period
  const formatPeriod = (item: any) => {
    if (item.maaned !== undefined && item.maaned !== null && item.aar) {
      return `${monthNames[item.maaned - 1]} ${item.aar}`;
    }
    if (item.kvartal !== undefined && item.kvartal !== null && item.aar) {
      return `Q${item.kvartal} ${item.aar}`;
    }
    return item.aar?.toString() || '-';
  };

  // Helper to calculate difference
  const calculateDiff = (total: number, fte: number) => {
    const diff = total - fte;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  };

  // Determine which data to display (priority: monthly > quarterly > yearly)
  // For monthly: show 36 months (3 years)
  const displayData = monthlyEmployment && monthlyEmployment.length > 0 
    ? { data: monthlyEmployment.slice(0, 36), type: 'Månedsdata', icon: Calendar, collapsible: true, defaultShow: 8 }
    : quarterlyEmployment && quarterlyEmployment.length > 0
    ? { data: quarterlyEmployment.slice(0, 12), type: 'Kvartalsdata', icon: TrendingUp, collapsible: false, defaultShow: 12 }
    : yearlyEmployment && yearlyEmployment.length > 0
    ? { data: yearlyEmployment.slice(0, 10), type: 'Årsdata', icon: Users, collapsible: false, defaultShow: 10 }
    : null;

  if (!displayData) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground text-center">
            Ingen medarbejderdata tilgængelig
          </p>
        </CardContent>
      </Card>
    );
  }

  const Icon = displayData.icon;
  
  // Determine how many rows to show
  const visibleData = displayData.collapsible && !isExpanded 
    ? displayData.data.slice(0, displayData.defaultShow)
    : displayData.data;
  
  const hasMoreData = displayData.collapsible && displayData.data.length > displayData.defaultShow;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5" />
            Medarbejderhistorik - {displayData.type}
          </div>
          {hasMoreData && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              {isExpanded ? (
                <>
                  Vis mindre <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Vis alle ({displayData.data.length}) <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-border bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Periode</th>
                <th className="text-right py-3 px-4 font-semibold">
                  Ansatte
                  <div className="text-xs text-muted-foreground font-normal">(Hovedtal)</div>
                </th>
                <th className="text-right py-3 px-4 font-semibold">
                  Årsværk
                  <div className="text-xs text-muted-foreground font-normal">(FTE)</div>
                </th>
                <th className="text-right py-3 px-4 font-semibold">
                  Forskel
                  <div className="text-xs text-muted-foreground font-normal">(Deltid)</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleData.map((item: any, index: number) => {
                const ansatte = item.antalAnsatte || 0;
                const aarsvaerk = item.antalAarsvaerk || 0;
                const diff = ansatte - aarsvaerk;
                
                return (
                  <tr 
                    key={index} 
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium">
                      {formatPeriod(item)}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums font-semibold">
                      {ansatte}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      {aarsvaerk.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums text-muted-foreground">
                      {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Show expand button at bottom if collapsed */}
        {hasMoreData && !isExpanded && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="gap-2"
            >
              Vis yderligere {displayData.data.length - displayData.defaultShow} måneder
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Additional info if we have it */}
        {displayData.data.some((item: any) => item.antalInklusivEjere) && (
          <div className="mt-4 px-4 py-3 bg-muted/30 rounded-md text-xs text-muted-foreground">
            <strong>Note:</strong> Nogle perioder inkluderer antal ansatte inkl. ejere
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmploymentDataCard;

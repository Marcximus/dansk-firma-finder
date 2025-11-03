import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimelineFilters, TimelineEvent } from '@/services/utils/timelineUtils';
import { Button } from '@/components/ui/button';
import { FileText, Users, Building2, TrendingUp } from 'lucide-react';

interface TimelineFiltersProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  events: TimelineEvent[];
}

type FilterMode = 'all' | 'basic' | 'management' | 'ownership' | 'financial';

export const TimelineFiltersComponent: React.FC<TimelineFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  events 
}) => {
  const getCurrentMode = (): FilterMode => {
    const allEnabled = Object.values(filters).every(v => v);
    if (allEnabled) return 'all';
    
    const basicEnabled = filters.showName && filters.showAddress && filters.showStatus && 
                         filters.showLegal && filters.showIndustry && filters.showPurpose && filters.showContact;
    const basicOnly = basicEnabled && !filters.showManagement && !filters.showBoard && 
                      !filters.showOwnership && !filters.showCapital && !filters.showFinancial;
    if (basicOnly) return 'basic';
    
    const managementEnabled = filters.showManagement && filters.showBoard;
    const managementOnly = managementEnabled && !filters.showName && !filters.showAddress && 
                          !filters.showStatus && !filters.showLegal && !filters.showIndustry && 
                          !filters.showPurpose && !filters.showContact && !filters.showOwnership && 
                          !filters.showCapital && !filters.showFinancial;
    if (managementOnly) return 'management';
    
    const ownershipEnabled = filters.showOwnership && filters.showCapital;
    const ownershipOnly = ownershipEnabled && !filters.showName && !filters.showAddress && 
                          !filters.showStatus && !filters.showLegal && !filters.showIndustry && 
                          !filters.showPurpose && !filters.showContact && !filters.showManagement && 
                          !filters.showBoard && !filters.showFinancial;
    if (ownershipOnly) return 'ownership';
    
    const financialOnly = filters.showFinancial && !filters.showName && !filters.showAddress && 
                          !filters.showStatus && !filters.showLegal && !filters.showIndustry && 
                          !filters.showPurpose && !filters.showContact && !filters.showManagement && 
                          !filters.showBoard && !filters.showOwnership && !filters.showCapital;
    if (financialOnly) return 'financial';
    
    return 'all';
  };

  const setMode = (mode: FilterMode) => {
    const newFilters: TimelineFilters = {
      showManagement: mode === 'management' || mode === 'all',
      showBoard: mode === 'management' || mode === 'all',
      showOwnership: mode === 'ownership' || mode === 'all',
      showCapital: mode === 'ownership' || mode === 'all',
      showFinancial: mode === 'financial' || mode === 'all',
      showAddress: mode === 'basic' || mode === 'all',
      showName: mode === 'basic' || mode === 'all',
      showIndustry: mode === 'basic' || mode === 'all',
      showStatus: mode === 'basic' || mode === 'all',
      showLegal: mode === 'basic' || mode === 'all',
      showContact: mode === 'basic' || mode === 'all',
      showPurpose: mode === 'basic' || mode === 'all',
    };
    onFiltersChange(newFilters);
  };

  const currentMode = getCurrentMode();
  
  const basicCount = events.filter(e => 
    ['name', 'address', 'status', 'legal', 'industry', 'purpose', 'contact'].includes(e.category)
  ).length;
  
  const managementCount = events.filter(e => 
    ['management', 'board'].includes(e.category)
  ).length;
  
  const ownershipCount = events.filter(e => 
    ['ownership', 'capital'].includes(e.category)
  ).length;
  
  const financialCount = events.filter(e => 
    e.category === 'financial'
  ).length;

  return (
    <Card className="p-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={currentMode === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('all')}
          className="gap-1.5"
        >
          Alle
          <Badge variant={currentMode === 'all' ? 'secondary' : 'outline'} className="text-xs">
            {events.length}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'basic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('basic')}
          className="gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          Grundlæggende
          <Badge variant={currentMode === 'basic' ? 'secondary' : 'outline'} className="text-xs">
            {basicCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'management' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('management')}
          className="gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          Ledelse
          <Badge variant={currentMode === 'management' ? 'secondary' : 'outline'} className="text-xs">
            {managementCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'ownership' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('ownership')}
          className="gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Ejerskab
          <Badge variant={currentMode === 'ownership' ? 'secondary' : 'outline'} className="text-xs">
            {ownershipCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'financial' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('financial')}
          className="gap-1.5"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Finansielle
          <Badge variant={currentMode === 'financial' ? 'secondary' : 'outline'} className="text-xs">
            {financialCount}
          </Badge>
        </Button>
      </div>
    </Card>
  );
};

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimelineFilters, TimelineEvent } from '@/services/utils/timelineUtils';
import { Button } from '@/components/ui/button';

interface TimelineFiltersProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  events: TimelineEvent[];
}

type FilterMode = 'important' | 'admin' | 'all';

export const TimelineFiltersComponent: React.FC<TimelineFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  events 
}) => {
  const getCurrentMode = (): FilterMode => {
    const importantEnabled = filters.showManagement && filters.showBoard && filters.showOwnership && filters.showStatus && filters.showLegal && filters.showCapital;
    const adminDisabled = !filters.showAddress && !filters.showName && !filters.showIndustry && !filters.showPurpose && !filters.showContact && !filters.showFinancial;
    
    if (importantEnabled && adminDisabled) return 'important';
    
    const allEnabled = Object.values(filters).every(v => v);
    if (allEnabled) return 'all';
    
    return 'admin';
  };

  const setMode = (mode: FilterMode) => {
    const newFilters: TimelineFilters = {
      showManagement: mode === 'important' || mode === 'all',
      showBoard: mode === 'important' || mode === 'all',
      showOwnership: mode === 'important' || mode === 'all',
      showStatus: mode === 'important' || mode === 'all',
      showLegal: mode === 'important' || mode === 'all',
      showCapital: mode === 'important' || mode === 'all',
      showAddress: mode === 'admin' || mode === 'all',
      showName: mode === 'admin' || mode === 'all',
      showIndustry: mode === 'admin' || mode === 'all',
      showPurpose: mode === 'admin' || mode === 'all',
      showContact: mode === 'admin' || mode === 'all',
      showFinancial: mode === 'all',
    };
    onFiltersChange(newFilters);
  };

  const currentMode = getCurrentMode();
  
  const importantCount = events.filter(e => 
    ['management', 'board', 'ownership', 'status', 'legal', 'capital'].includes(e.category)
  ).length;
  
  const adminCount = events.filter(e => 
    ['address', 'name', 'industry', 'purpose', 'contact'].includes(e.category)
  ).length;

  return (
    <Card className="p-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={currentMode === 'important' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('important')}
          className="gap-1.5"
        >
          Vigtige
          <Badge variant={currentMode === 'important' ? 'secondary' : 'outline'} className="text-xs">
            {importantCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('admin')}
          className="gap-1.5"
        >
          Administrative
          <Badge variant={currentMode === 'admin' ? 'secondary' : 'outline'} className="text-xs">
            {adminCount}
          </Badge>
        </Button>
        
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
      </div>
    </Card>
  );
};

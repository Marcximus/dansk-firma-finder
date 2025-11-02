import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimelineFilters, TimelineEvent, FilterGroup } from '@/services/utils/timelineUtils';
import { Button } from '@/components/ui/button';
import { 
  ListFilter,
  FileText,
  Users,
  Building2,
  TrendingUp
} from 'lucide-react';

interface TimelineFiltersProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  events: TimelineEvent[];
}

export const TimelineFiltersComponent: React.FC<TimelineFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  events 
}) => {
  const getCurrentMode = (): FilterGroup => {
    // Check if all filters are enabled (Alle)
    const allEnabled = Object.values(filters).every(v => v);
    if (allEnabled) return 'all';
    
    // Check Ledelse (management + board + signing)
    const ledelseEnabled = filters.showManagement && filters.showBoard && filters.showSigning;
    const ledelseOnly = ledelseEnabled && 
      !filters.showOwnership && !filters.showCapital &&
      !filters.showAddress && !filters.showName && !filters.showStatus && 
      !filters.showLegal && !filters.showIndustry && !filters.showPurpose &&
      !filters.showFinancial && !filters.showContact;
    if (ledelseOnly) return 'ledelse';
    
    // Check Ejerskab (ownership + capital)
    const ejerskabEnabled = filters.showOwnership && filters.showCapital;
    const ejerskabOnly = ejerskabEnabled &&
      !filters.showManagement && !filters.showBoard && !filters.showSigning &&
      !filters.showAddress && !filters.showName && !filters.showStatus && 
      !filters.showLegal && !filters.showIndustry && !filters.showPurpose &&
      !filters.showFinancial && !filters.showContact;
    if (ejerskabOnly) return 'ejerskab';
    
    // Check Grundlæggende (name, address, status, legal, industry, purpose)
    const grundlaeggendeEnabled = filters.showName && filters.showAddress && 
      filters.showStatus && filters.showLegal && filters.showIndustry && filters.showPurpose;
    const grundlaeggendeOnly = grundlaeggendeEnabled &&
      !filters.showManagement && !filters.showBoard && !filters.showSigning &&
      !filters.showOwnership && !filters.showCapital &&
      !filters.showFinancial && !filters.showContact;
    if (grundlaeggendeOnly) return 'grundlaeggende';
    
    // Check Finansielle (financial + contact)
    const finansielleEnabled = filters.showFinancial && filters.showContact;
    const finansielleOnly = finansielleEnabled &&
      !filters.showManagement && !filters.showBoard && !filters.showSigning &&
      !filters.showOwnership && !filters.showCapital &&
      !filters.showAddress && !filters.showName && !filters.showStatus && 
      !filters.showLegal && !filters.showIndustry && !filters.showPurpose;
    if (finansielleOnly) return 'finansielle';
    
    // Default to all if mixed
    return 'all';
  };

  const setMode = (mode: FilterGroup) => {
    const newFilters: TimelineFilters = {
      showManagement: mode === 'ledelse' || mode === 'all',
      showBoard: mode === 'ledelse' || mode === 'all',
      showSigning: mode === 'ledelse' || mode === 'all',
      showOwnership: mode === 'ejerskab' || mode === 'all',
      showCapital: mode === 'ejerskab' || mode === 'all',
      showAddress: mode === 'grundlaeggende' || mode === 'all',
      showName: mode === 'grundlaeggende' || mode === 'all',
      showStatus: mode === 'grundlaeggende' || mode === 'all',
      showLegal: mode === 'grundlaeggende' || mode === 'all',
      showIndustry: mode === 'grundlaeggende' || mode === 'all',
      showPurpose: mode === 'grundlaeggende' || mode === 'all',
      showFinancial: mode === 'finansielle' || mode === 'all',
      showContact: mode === 'finansielle' || mode === 'all',
    };
    onFiltersChange(newFilters);
  };

  const currentMode = getCurrentMode();
  
  // Count events by category groups
  const grundlaeggendeCount = events.filter(e => 
    ['name', 'address', 'status', 'legal', 'industry', 'purpose'].includes(e.category)
  ).length;
  
  const ledelseCount = events.filter(e => 
    ['management', 'board', 'signing'].includes(e.category)
  ).length;
  
  const ejerskabCount = events.filter(e => 
    ['ownership', 'capital'].includes(e.category)
  ).length;
  
  const finansielleCount = events.filter(e => 
    ['financial', 'contact'].includes(e.category)
  ).length;

  return (
    <Card className="p-3 mb-4 border-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={currentMode === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('all')}
          className="gap-1.5"
        >
          <ListFilter className="w-4 h-4" />
          Alle
          <Badge variant={currentMode === 'all' ? 'secondary' : 'outline'} className="text-xs">
            {events.length}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'grundlaeggende' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('grundlaeggende')}
          className="gap-1.5 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
          data-active={currentMode === 'grundlaeggende'}
        >
          <FileText className="w-4 h-4" />
          Grundlæggende
          <Badge variant={currentMode === 'grundlaeggende' ? 'secondary' : 'outline'} className="text-xs">
            {grundlaeggendeCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'ledelse' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('ledelse')}
          className="gap-1.5 data-[active=true]:bg-purple-600 data-[active=true]:text-white"
          data-active={currentMode === 'ledelse'}
        >
          <Users className="w-4 h-4" />
          Ledelse
          <Badge variant={currentMode === 'ledelse' ? 'secondary' : 'outline'} className="text-xs">
            {ledelseCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'ejerskab' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('ejerskab')}
          className="gap-1.5 data-[active=true]:bg-green-600 data-[active=true]:text-white"
          data-active={currentMode === 'ejerskab'}
        >
          <Building2 className="w-4 h-4" />
          Ejerskab
          <Badge variant={currentMode === 'ejerskab' ? 'secondary' : 'outline'} className="text-xs">
            {ejerskabCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentMode === 'finansielle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('finansielle')}
          className="gap-1.5 data-[active=true]:bg-orange-600 data-[active=true]:text-white"
          data-active={currentMode === 'finansielle'}
        >
          <TrendingUp className="w-4 h-4" />
          Finansielle data
          <Badge variant={currentMode === 'finansielle' ? 'secondary' : 'outline'} className="text-xs">
            {finansielleCount}
          </Badge>
        </Button>
      </div>
    </Card>
  );
};

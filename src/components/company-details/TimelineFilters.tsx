import React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TimelineFilters, TimelineEvent, getCategoryLabel } from '@/services/utils/timelineUtils';

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
  const getCategoryCount = (category: string) => {
    return events.filter(e => e.category === category).length;
  };

  const filterOptions = [
    { key: 'showManagement', category: 'management' },
    { key: 'showBoard', category: 'board' },
    { key: 'showOwnership', category: 'ownership' },
    { key: 'showAddress', category: 'address' },
    { key: 'showName', category: 'name' },
    { key: 'showIndustry', category: 'industry' },
    { key: 'showStatus', category: 'status' },
    { key: 'showLegal', category: 'legal' },
    { key: 'showCapital', category: 'capital' },
    { key: 'showPurpose', category: 'purpose' },
    { key: 'showContact', category: 'contact' },
    { key: 'showFinancial', category: 'financial' },
  ];

  const handleToggle = (key: string) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key as keyof TimelineFilters],
    });
  };

  const enabledCount = Object.values(filters).filter(Boolean).length;
  const totalCount = Object.keys(filters).length;

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Filtrer hændelser</h3>
        <Badge variant="outline">
          {enabledCount}/{totalCount} aktive
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filterOptions.map(({ key, category }) => {
          const count = getCategoryCount(category);
          if (count === 0) return null;
          
          return (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={filters[key as keyof TimelineFilters]}
                onCheckedChange={() => handleToggle(key)}
              />
              <Label 
                htmlFor={key} 
                className="text-xs cursor-pointer flex items-center gap-1 flex-1"
              >
                {getCategoryLabel(category)}
                <Badge variant="secondary" className="text-xs ml-auto">
                  {count}
                </Badge>
              </Label>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

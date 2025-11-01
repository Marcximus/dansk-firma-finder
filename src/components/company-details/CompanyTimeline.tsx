import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { 
  extractAllHistoricalEvents, 
  filterEvents, 
  groupEventsByYear,
  defaultFilters,
  TimelineFilters
} from '@/services/utils/timelineUtils';
import { TimelineEventCard } from './TimelineEventCard';
import { TimelineFiltersComponent } from './TimelineFilters';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyTimelineProps {
  cvrData: any;
  financialData?: any;
}

export const CompanyTimeline: React.FC<CompanyTimelineProps> = ({ cvrData, financialData }) => {
  const [filters, setFilters] = useState<TimelineFilters>(defaultFilters);

  // Extract all events
  const allEvents = useMemo(() => {
    console.log('[CompanyTimeline] ========== COMPONENT RENDER ==========');
    console.log('[CompanyTimeline] Received cvrData:', !!cvrData);
    console.log('[CompanyTimeline] Received financialData:', !!financialData);
    
    if (!cvrData) {
      console.warn('[CompanyTimeline] No cvrData provided!');
      return [];
    }
    
    try {
      const events = extractAllHistoricalEvents(cvrData, financialData);
      console.log('[CompanyTimeline] Extracted events:', events.length);
      return events;
    } catch (error) {
      console.error('[CompanyTimeline] Error extracting events:', error);
      return [];
    }
  }, [cvrData, financialData]);

  console.log('[CompanyTimeline] All events count:', allEvents.length);

  // Apply filters
  const filteredEvents = useMemo(() => {
    return filterEvents(allEvents, filters);
  }, [allEvents, filters]);

  // Group by year
  const groupedByYear = useMemo(() => {
    return groupEventsByYear(filteredEvents);
  }, [filteredEvents]);

  const years = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  if (allEvents.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Ingen historiske data tilgængelig for denne virksomhed.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <TimelineFiltersComponent 
          filters={filters} 
          onFiltersChange={setFilters}
          events={allEvents}
        />
        <Button 
          onClick={() => {
            console.log('=== RAW CVR DATA DUMP ===');
            console.log(JSON.stringify(cvrData, null, 2));
          }}
          variant="outline"
          size="sm"
        >
          🐛 Debug Data
        </Button>
      </div>

      {filteredEvents.length === 0 ? (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Ingen hændelser matcher de valgte filtre. Prøv at aktivere flere kategorier.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Viser {filteredEvents.length} af {allEvents.length} hændelser
          </div>

          <ScrollArea className="h-[600px] pr-4">
            {years.map((year, yearIdx) => (
              <div key={year} className="space-y-4">
                {/* Year divider */}
                <div className="sticky top-0 z-10 bg-background py-2">
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <h3 className="text-lg font-bold px-3 bg-muted rounded-full">
                      {year}
                    </h3>
                    <Separator className="flex-1" />
                  </div>
                </div>

                {/* Events for this year */}
                <div className="space-y-3 pb-6">
                  {groupedByYear[year].map((event) => (
                    <div key={event.id} className="relative pl-6">
                      {/* Timeline connector */}
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
                      <div className="absolute left-[-3px] top-4 w-2 h-2 rounded-full bg-primary" />
                      
                      <TimelineEventCard event={event} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCog, 
  Building2, 
  MapPin, 
  FileText, 
  Briefcase, 
  AlertCircle, 
  TrendingUp, 
  Scale, 
  Phone,
  DollarSign,
  Target
} from 'lucide-react';
import { TimelineEvent, getCategoryLabel } from '@/services/utils/timelineUtils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface TimelineEventCardProps {
  event: TimelineEvent;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ElementType> = {
    management: UserCog,
    board: Users,
    ownership: Building2,
    address: MapPin,
    name: FileText,
    industry: Briefcase,
    status: AlertCircle,
    financial: TrendingUp,
    legal: Scale,
    contact: Phone,
    capital: DollarSign,
    purpose: Target,
  };
  const Icon = icons[category] || FileText;
  return <Icon className="w-4 h-4" />;
};

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    high: 'border-l-destructive',
    medium: 'border-l-primary',
    low: 'border-l-muted-foreground',
  };
  return colors[severity] || 'border-l-muted-foreground';
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    management: 'bg-primary/10 text-primary',
    board: 'bg-secondary/10 text-secondary-foreground',
    ownership: 'bg-accent/10 text-accent-foreground',
    address: 'bg-muted text-muted-foreground',
    name: 'bg-primary/10 text-primary',
    industry: 'bg-secondary/10 text-secondary-foreground',
    status: 'bg-destructive/10 text-destructive',
    financial: 'bg-success/10 text-success',
    legal: 'bg-primary/10 text-primary',
    contact: 'bg-accent/10 text-accent-foreground',
    capital: 'bg-success/10 text-success',
    purpose: 'bg-muted text-muted-foreground',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasMetadata = event.metadata && Object.keys(event.metadata).length > 0;

  return (
    <Card className={`border-l-4 ${getSeverityColor(event.severity)} p-3 sm:p-4 hover:shadow-md transition-shadow`}>
      <div className="flex gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(event.category)}`}>
          {getCategoryIcon(event.category)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {format(event.date, 'd. MMMM yyyy', { locale: da })}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {getCategoryLabel(event.category)}
            </Badge>
          </div>
          
          <h4 className="font-semibold text-sm sm:text-base mb-1">{event.title}</h4>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          
          {(event.oldValue || event.newValue) && (
            <div className="mt-2 text-xs space-y-1">
              {event.oldValue && (
                <div className="text-muted-foreground">
                  <span className="font-medium">Fra: </span>
                  <span>{event.oldValue}</span>
                </div>
              )}
              {event.newValue && (
                <div className="text-foreground">
                  <span className="font-medium">Til: </span>
                  <span>{event.newValue}</span>
                </div>
              )}
            </div>
          )}

          {hasMetadata && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs p-0 hover:bg-transparent">
                  <ChevronDown className={`w-3 h-3 mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  {isOpen ? 'Skjul detaljer' : 'Vis detaljer'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-muted/50 rounded p-2 text-xs">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </Card>
  );
};

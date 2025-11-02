import React from 'react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
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
import { TimelineEvent } from '@/services/utils/timelineUtils';

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


export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event }) => {
  const formatChange = () => {
    if (event.oldValue && event.newValue) {
      return `${event.description} (${event.oldValue} → ${event.newValue})`;
    }
    return event.description;
  };

  return (
    <div className="group hover:bg-muted/50 p-1.5 sm:p-2 rounded-md transition-colors">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          {getCategoryIcon(event.category)}
        </div>
        
        <div className="flex-1 min-w-0 text-sm">
          <span className="text-muted-foreground">
            {format(event.date, 'd MMM yyyy', { locale: da })}
          </span>
          <span className="mx-1.5 text-muted-foreground">•</span>
          <span className="font-medium">{event.title}:</span>
          <span className="ml-1.5">{formatChange()}</span>
        </div>
      </div>
    </div>
  );
};

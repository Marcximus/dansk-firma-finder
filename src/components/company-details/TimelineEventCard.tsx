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
  allEvents: TimelineEvent[];
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    management: 'text-blue-600 dark:text-blue-400',
    board: 'text-purple-600 dark:text-purple-400',
    ownership: 'text-amber-600 dark:text-amber-400',
    address: 'text-green-600 dark:text-green-400',
    name: 'text-slate-600 dark:text-slate-400',
    industry: 'text-cyan-600 dark:text-cyan-400',
    status: 'text-red-600 dark:text-red-400',
    financial: 'text-emerald-600 dark:text-emerald-400',
    legal: 'text-indigo-600 dark:text-indigo-400',
    contact: 'text-sky-600 dark:text-sky-400',
    capital: 'text-yellow-600 dark:text-yellow-500',
    purpose: 'text-violet-600 dark:text-violet-400',
  };
  return colors[category] || 'text-muted-foreground';
};

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
  const colorClass = getCategoryColor(category);
  return <Icon className={`w-4 h-4 ${colorClass}`} />;
};


export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, allEvents }) => {
  const formatEventDescription = () => {
    const date = format(event.date, 'd MMM yyyy', { locale: da });
    
    // Check if there's a capital event on the same day
    const hasCapitalEventSameDay = allEvents.some(e => 
      e.category === 'capital' && 
      e.date.toDateString() === event.date.toDateString() &&
      e.id !== event.id
    );
    
    // Capital changes
    if (event.category === 'capital') {
      if (event.title === 'Selskabskapital registreret') {
        return `blev stiftelseskapitalen registreret på ${event.newValue}`;
      }
      if (event.title === 'Kapitalforhøjelse' && event.oldValue && event.newValue) {
        return `blev der gennemført en kapitalforhøjelse, hvor kapitalen steg fra ${event.oldValue} til ${event.newValue}`;
      }
      if (event.title === 'Kapitalnedsættelse' && event.oldValue && event.newValue) {
        return `blev der gennemført en kapitalnedsættelse, hvor kapitalen faldt fra ${event.oldValue} til ${event.newValue}`;
      }
    }
    
    // Status changes
    if (event.category === 'status') {
      if (event.oldValue && event.newValue) {
        return `ændrede status fra "${event.oldValue}" til "${event.newValue}"`;
      }
      return `ændrede status til "${event.newValue || event.description}"`;
    }
    
    // Address changes
    if (event.category === 'address') {
      if (event.oldValue && event.newValue) {
        return `flyttede adresse fra ${event.oldValue} til ${event.newValue}`;
      }
      return `fik ny adresse: ${event.newValue || event.description}`;
    }
    
    // Name changes
    if (event.category === 'name') {
      if (event.oldValue && event.newValue) {
        return `skiftede navn fra "${event.oldValue}" til "${event.newValue}"`;
      }
      return `fik nyt navn: "${event.newValue || event.description}"`;
    }
    
    // Industry changes
    if (event.category === 'industry') {
      if (event.oldValue && event.newValue) {
        return `skiftede branche fra ${event.oldValue} til ${event.newValue}`;
      }
      return `fik ny branche: ${event.newValue || event.description}`;
    }
    
    // Management/Board/Ownership changes
    if (['management', 'board', 'ownership'].includes(event.category)) {
      // Special handling for ownership changes
      if (event.category === 'ownership' && event.newValue) {
        const ownerName = event.title.split(' - ')[0];
        const ownershipRange = event.newValue; // e.g., "5-10%"
        
        // Check if there's a capital event on the same day
        if (hasCapitalEventSameDay) {
          if (event.oldValue) {
            return `${ownerName} - ejerandel og stemmeandel steg fra ${event.oldValue} til ${ownershipRange} i forbindelse med kapitalforhøjelsen samme dag`;
          } else {
            return `${ownerName} - ejerandel og stemmeandel på ${ownershipRange} registreret i forbindelse med kapitalforhøjelsen samme dag`;
          }
        }
        
        // No capital event same day
        if (event.oldValue) {
          return `${ownerName} - ejerandel og stemmeandel ændrede sig fra ${event.oldValue} til ${ownershipRange}`;
        } else {
          return `${ownerName} - ejerandel og stemmeandel registreret på ${ownershipRange}`;
        }
      }
      
      if (event.title.includes('tiltrådt') || event.title.includes('tilføjet')) {
        return `${event.title.toLowerCase()}`;
      }
      if (event.title.includes('fratrådt') || event.title.includes('fjernet')) {
        return `${event.title.toLowerCase()}`;
      }
      if (event.oldValue && event.newValue) {
        return `${event.title.toLowerCase()}: ${event.oldValue} → ${event.newValue}`;
      }
      return event.title.toLowerCase();
    }
    
    // Contact changes
    if (event.category === 'contact') {
      if (event.oldValue && event.newValue) {
        return `opdaterede ${event.title.toLowerCase()} fra ${event.oldValue} til ${event.newValue}`;
      }
      return `${event.title.toLowerCase()}: ${event.newValue || event.description}`;
    }
    
    // Financial and Legal changes
    if (['financial', 'legal'].includes(event.category)) {
      if (event.oldValue && event.newValue) {
        return `${event.title.toLowerCase()}: fra ${event.oldValue} til ${event.newValue}`;
      }
      return `${event.title.toLowerCase()}: ${event.newValue || event.description}`;
    }
    
    // Default fallback
    if (event.oldValue && event.newValue && event.oldValue !== event.newValue) {
      return `${event.title}: ${event.oldValue} → ${event.newValue}`;
    }
    
    if (event.newValue && !event.oldValue) {
      return `${event.title}: ${event.description}`;
    }
    
    return `${event.title}: ${event.description}`;
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
          <span className="mx-1.5 text-muted-foreground"></span>
          <span>{formatEventDescription()}</span>
        </div>
      </div>
    </div>
  );
};

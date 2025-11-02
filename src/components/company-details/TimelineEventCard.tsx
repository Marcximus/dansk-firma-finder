import React from 'react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { 
  Users, 
  UserCog, 
  Building2, 
  MapPin, 
  FileEdit, 
  Briefcase, 
  Activity, 
  TrendingUp, 
  Scale, 
  Phone,
  Coins,
  Target,
  FileSignature,
  Receipt
} from 'lucide-react';
import { TimelineEvent, getCategoryColor } from '@/services/utils/timelineUtils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEventCardProps {
  event: TimelineEvent;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ElementType> = {
    management: UserCog,
    board: Users,
    signing: FileSignature,
    ownership: Building2,
    capital: Coins,
    address: MapPin,
    name: FileEdit,
    industry: Briefcase,
    status: Activity,
    legal: Scale,
    contact: Phone,
    financial: Receipt,
    purpose: Target,
  };
  const Icon = icons[category] || FileEdit;
  return <Icon className="w-4 h-4" />;
};

const getCategoryBadgeColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    purple: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
    green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    orange: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
    gray: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700',
  };
  return colorMap[color] || colorMap.gray;
};

const getBorderColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    green: 'border-l-green-500',
    orange: 'border-l-orange-500',
    gray: 'border-l-gray-500',
  };
  return colorMap[color] || colorMap.gray;
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    management: 'Ledelse',
    board: 'Bestyrelse',
    signing: 'Tegningsregel',
    ownership: 'Ejerskab',
    capital: 'Kapital',
    address: 'Adresse',
    name: 'Navn',
    industry: 'Branche',
    status: 'Status',
    legal: 'Juridisk',
    contact: 'Kontakt',
    financial: 'Regnskab',
    purpose: 'Formål',
  };
  return labels[category] || category;
};

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event }) => {
  const color = getCategoryColor(event.category);
  const borderColor = getBorderColor(color);
  const badgeColor = getCategoryBadgeColor(color);

  return (
    <div className={cn(
      "group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200",
      "border-l-4",
      borderColor,
      "hover:shadow-sm"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className={cn(
            "p-1.5 rounded-md",
            color === 'blue' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            color === 'purple' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            color === 'green' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            color === 'orange' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            color === 'gray' && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
          )}>
            {getCategoryIcon(event.category)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">
              {format(event.date, 'd. MMM yyyy', { locale: da })}
            </span>
            <Badge variant="outline" className={cn("text-xs px-2 py-0", badgeColor)}>
              {getCategoryLabel(event.category)}
            </Badge>
          </div>
          
          <div>
            <p className="font-semibold text-sm leading-snug">
              {event.title}
            </p>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

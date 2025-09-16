import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getTotalChangeCount } from '@/services/utils/changeUtils';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [hasNewChanges, setHasNewChanges] = useState(false);
  const [changeCount, setChangeCount] = useState(0);
  const { toast } = useToast();

  // Check for new changes in followed companies
  const checkForNewChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: followedCompanies, error } = await supabase
        .from('followed_companies')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching followed companies:', error);
        return;
      }

      const totalChanges = getTotalChangeCount(followedCompanies || []);
      setChangeCount(totalChanges);
      setHasNewChanges(totalChanges > 0);
    } catch (error) {
      console.error('Error checking for changes:', error);
    }
  };

  // Check for changes on component mount and periodically
  useEffect(() => {
    checkForNewChanges();
    
    // Check for changes every 5 minutes
    const interval = setInterval(checkForNewChanges, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle bell click
  const handleBellClick = () => {
    if (hasNewChanges) {
      toast({
        title: "Nye ændringer",
        description: `Du har ${changeCount} nye ændringer i dine fulgte virksomheder.`,
      });
      
      // Navigate to profile page to see changes
      window.location.href = '/profile';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBellClick}
        className="relative hover:bg-primary/10"
      >
        <Bell className="h-5 w-5" />
        {hasNewChanges && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs min-w-[20px] animate-pulse"
          >
            {changeCount > 9 ? '9+' : changeCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default NotificationBell;
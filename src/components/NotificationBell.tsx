import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getTotalChangeCount, getRecentChanges, CompanyChange } from '@/services/utils/changeUtils';
import { useNavigate } from 'react-router-dom';
import { generateCompanyChangesUrl } from '@/lib/urlUtils';

interface NotificationBellProps {
  className?: string;
}

interface CompanyWithChanges {
  company_name: string;
  company_cvr: string;
  changes: CompanyChange[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [hasNewChanges, setHasNewChanges] = useState(false);
  const [changeCount, setChangeCount] = useState(0);
  const [companiesWithChanges, setCompaniesWithChanges] = useState<CompanyWithChanges[]>([]);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for new changes in followed companies
  const checkForNewChanges = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('Notification bell: user check:', currentUser?.id);
      setUser(currentUser);
      
      if (!currentUser) {
        console.log('No user found, clearing changes');
        setCompaniesWithChanges([]);
        setChangeCount(0);
        setHasNewChanges(false);
        return;
      }

      const { data: followedCompanies, error } = await supabase
        .from('followed_companies')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching followed companies:', error);
        return;
      }

      console.log('Followed companies data:', followedCompanies);
      const companiesWithChanges: CompanyWithChanges[] = [];
      let totalChanges = 0;

      followedCompanies?.forEach(company => {
        console.log('Checking changes for company:', company.company_name, company.company_data);
        const changes = getRecentChanges(company.company_data);
        console.log('Changes found for', company.company_name, ':', changes);
        
        if (changes.length > 0) {
          companiesWithChanges.push({
            company_name: company.company_name,
            company_cvr: company.company_cvr,
            changes: changes
          });
          totalChanges += changes.length;
        }
      });

      console.log('Total companies with changes:', companiesWithChanges);
      console.log('Total change count:', totalChanges);
      
      setCompaniesWithChanges(companiesWithChanges);
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

  // Handle company click in dropdown
  const handleCompanyClick = (companyName: string, cvr: string) => {
    setOpen(false);
    navigate(generateCompanyChangesUrl(companyName, cvr));
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-primary/10"
            disabled={!user}
            aria-label="View notifications"
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
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Seneste ændringer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {companiesWithChanges.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground text-sm">Ingen nye ændringer</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vi tjekker dine fulgte virksomheder for ændringer
                  </p>
                </div>
              ) : (
                companiesWithChanges.map((company) => (
                  <div
                    key={company.company_cvr}
                    className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleCompanyClick(company.company_name, company.company_cvr)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{company.company_name}</h4>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      {company.changes.slice(0, 2).map((change, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground">
                          <span className={`font-medium ${getSeverityColor(change.severity)}`}>
                            {change.type}:
                          </span>{' '}
                          {change.description}
                        </div>
                      ))}
                      {company.changes.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{company.changes.length - 2} flere ændringer
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationBell;
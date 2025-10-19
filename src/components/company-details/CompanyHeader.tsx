
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Company } from '@/services/companyAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, FileText, Map, Star, Check, Bell, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS } from '@/constants/subscriptions';
import UpgradeDialog from '../UpgradeDialog';
import type { User } from '@supabase/supabase-js';

interface CompanyHeaderProps {
  company: Company;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, subscriptionTier, loading: subscriptionLoading } = useSubscription();
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingId, setFollowingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [followedCompaniesCount, setFollowedCompaniesCount] = useState(0);

  useEffect(() => {
    // Get current user and check if following
    const checkUserAndFollowStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await checkFollowStatus(user.id);
      }
    };

    checkUserAndFollowStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await checkFollowStatus(session.user.id);
      } else {
        setIsFollowing(false);
        setFollowingId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [company.cvr]);

  const checkFollowStatus = async (userId: string) => {
    try {
      // Check if user is following this specific company
      const { data, error } = await supabase
        .from('followed_companies')
        .select('id')
        .eq('user_id', userId)
        .eq('company_cvr', company.cvr)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking follow status:', error);
        return;
      }

      if (data) {
        setIsFollowing(true);
        setFollowingId(data.id);
      } else {
        setIsFollowing(false);
        setFollowingId(null);
      }

      // Get total count of followed companies
      const { data: allFollowed, error: countError } = await supabase
        .from('followed_companies')
        .select('id')
        .eq('user_id', userId);

      if (countError) {
        console.error('Error checking followed companies count:', countError);
        return;
      }

      setFollowedCompaniesCount(allFollowed?.length || 0);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleTrackClick = async () => {
    if (!user) {
      // Redirect to auth page with current company as context
      navigate(`/auth?redirect=/company/${company.cvr}`);
      return;
    }

    // Check subscription limits before allowing follow
    if (!isFollowing) {
      const maxCompanies = subscriptionTier && subscriptionTier in SUBSCRIPTION_TIERS 
        ? SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof SUBSCRIPTION_TIERS].maxCompanies 
        : 1; // Default to 1 for standard plan

      if (followedCompaniesCount >= maxCompanies) {
        setShowUpgradeDialog(true);
        return;
      }
    }

    setLoading(true);

    try {
      if (isFollowing && followingId) {
        // Unfollow the company
        const { error } = await supabase
          .from('followed_companies')
          .delete()
          .eq('id', followingId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowingId(null);
        setFollowedCompaniesCount(prev => prev - 1);
        toast({
          title: "Virksomhed ikke længere fulgt",
          description: `Du får ikke længere opdateringer om ${company.name}`,
        });
      } else {
        // Follow the company
        const { data, error } = await supabase
          .from('followed_companies')
          .insert({
            user_id: user.id,
            company_cvr: company.cvr,
            company_name: company.name,
            company_data: {
              name: company.name,
              industry: company.industry,
              city: company.city,
              address: company.address,
            },
            notification_preferences: {
              email: true,
              sms: false
            }
          })
          .select('id')
          .single();

        if (error) throw error;

        setIsFollowing(true);
        setFollowingId(data.id);
        setFollowedCompaniesCount(prev => prev + 1);
        toast({
          title: "Virksomhed følges nu",
          description: `Du får nu opdateringer om ændringer i ${company.name} via e-mail`,
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke opdatere følgestatus. Prøv igen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangesClick = () => {
    console.log('Changes button clicked, navigating to:', `/company/${company.cvr}/changes`);
    navigate(`/company/${company.cvr}/changes`);
  };

  const handleReportClick = () => {
    navigate('/virksomhedsrapporter', { 
      state: { preloadedCompany: company }
    });
  };

  // Function to get appropriate color and display text for status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return { color: 'bg-green-500', text: 'Aktiv' };
      case 'UNDER KONKURS':
        return { color: 'bg-orange-500', text: 'Under konkurs' };
      case 'UNDER LIKVIDATION':
        return { color: 'bg-orange-400', text: 'Under likvidation' };
      case 'OPHØRT':
        return { color: 'bg-gray-500', text: 'Ophørt' };
      case 'UKENDT':
        return { color: 'bg-gray-400', text: 'Ukendt' };
      default:
        // Show full status for dissolved companies and others
        if (status?.includes('OPLØST')) {
          return { color: 'bg-red-500', text: status };
        }
        return { color: 'bg-gray-500', text: status || 'Ukendt' };
    }
  };

  const statusDisplay = getStatusDisplay(company.status);

  return (
    <TooltipProvider>
      <div className="bg-background sticky top-[36px] sm:top-[46px] md:top-[54px] lg:top-[66px] z-40 rounded-lg shadow-sm pt-1 sm:pt-1.5 md:pt-2 lg:pt-3 px-1.5 sm:px-2 md:px-3 lg:px-4 pb-1.5 sm:pb-2 md:pb-3 lg:pb-4 backdrop-blur-sm border-b mb-2 sm:mb-3 md:mb-4 lg:mb-6 relative text-center lg:text-left">
        {/* Desktop buttons - absolute positioned on the right */}
        <div className="hidden lg:flex absolute top-3 right-3 gap-2">
          <Button 
            variant="default" 
            size="default" 
            className="px-4 py-2 text-sm"
            onClick={handleReportClick}
          >
            Virksomhedsrapport
          </Button>
          <Button 
            variant="outline" 
            size="default" 
            className="px-4 py-2 text-sm"
            onClick={handleChangesClick}
          >
            Seneste Ændringer
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isFollowing ? "default" : "outline"} 
                size="default" 
                className={`px-4 py-2 text-sm flex items-center gap-2 ${
                  isFollowing 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200'
                }`}
                onClick={handleTrackClick}
                disabled={loading}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-4 w-4" />
                    Følges
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    Track & Følg Dette Selskab
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-64">
                {isFollowing ? (
                  <div className="space-y-2">
                    <p>Du følger denne virksomhed</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">E-mail notifikationer aktive</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Klik for at stoppe med at følge</p>
                  </div>
                ) : user ? (
                  <p>Få besked på mail når der er ændringer i selskabet, fx nye bestyrelsesmedlemmer, kapital eller regnskaber</p>
                ) : (
                  <p>Log ind for at følge denne virksomhed og få automatiske opdateringer</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <h1 className="text-base sm:text-xl md:text-2xl lg:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 lg:pr-52">{company.name}</h1>
        <div className="hidden md:flex flex-wrap gap-2 lg:gap-4 text-sm lg:text-base text-muted-foreground mb-2 lg:mb-0">
          {company.yearFounded && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
              <span>Etableret: {company.yearFounded}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
            <span>CVR: {company.cvr}</span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Map className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
            <span>{company.city}</span>
          </div>
          <Badge className={`text-[10px] sm:text-xs ${statusDisplay.color} text-white ${company.status === 'NORMAL' ? 'animate-pulse' : ''}`}>
            {statusDisplay.text}
          </Badge>
        </div>

        {/* Mobile buttons - shown below company info on small screens */}
        <div className="flex lg:hidden flex-row flex-wrap justify-center gap-1.5 sm:gap-2">
          <Button 
            variant="default"
            size="sm"
            className="h-8 sm:h-9 px-3 py-1.5 text-xs sm:text-sm"
            onClick={handleReportClick}
          >
            <span className="hidden sm:inline">Virksomhedsrapport</span>
            <span className="sm:hidden">Rapport</span>
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 px-3 py-1.5 text-xs sm:text-sm"
            onClick={handleChangesClick}
          >
            <span className="hidden sm:inline">Seneste Ændringer</span>
            <span className="sm:hidden">Ændringer</span>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isFollowing ? "default" : "outline"}
                size="sm"
                className={`h-8 sm:h-9 px-3 py-1.5 text-xs sm:text-sm flex items-center justify-center gap-1 ${
                  isFollowing 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200'
                }`}
                onClick={handleTrackClick}
                disabled={loading}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>Følges</span>
                  </>
                ) : (
                  <>
                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>Følg</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-64">
                {isFollowing ? (
                  <div className="space-y-2">
                    <p>Du følger denne virksomhed</p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">E-mail notifikationer aktive</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Klik for at stoppe med at følge</p>
                  </div>
                ) : user ? (
                  <p>Få besked på mail når der er ændringer i selskabet, fx nye bestyrelsesmedlemmer, kapital eller regnskaber</p>
                ) : (
                  <p>Log ind for at følge denne virksomhed og få automatiske opdateringer</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <UpgradeDialog 
        open={showUpgradeDialog} 
        onClose={() => setShowUpgradeDialog(false)} 
      />
    </TooltipProvider>
  );
};

export default CompanyHeader;

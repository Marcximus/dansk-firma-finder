import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const UserMenu: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { openCustomerPortal, subscribed } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    }
  };

  if (!user) {
    return (
      <Button asChild>
        <a href="/auth">Log ind</a>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <a href="/profil" className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
      </a>
    </Button>
  );
};

export default UserMenu;
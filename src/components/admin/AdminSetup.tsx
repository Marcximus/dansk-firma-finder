import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Crown, Loader2 } from 'lucide-react';

export const AdminSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const setupAdmin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin');
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Success!',
        description: 'Admin privileges granted. Refreshing page...',
      });

      // Refresh the page to update admin status
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Error setting up admin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant admin privileges',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You need admin privileges to access the admin dashboard. Click the button below to grant yourself admin access.
          </p>
          
          <Button 
            onClick={setupAdmin} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up admin access...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-4 w-4" />
                Grant Admin Access
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This will add admin role to your current user account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
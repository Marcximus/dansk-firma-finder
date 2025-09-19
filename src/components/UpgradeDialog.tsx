import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Users } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS } from '@/constants/subscriptions';

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
}

const UpgradeDialog: React.FC<UpgradeDialogProps> = ({ open, onClose }) => {
  const { createCheckout, loading } = useSubscription();

  const handleSubscribe = async (tier: keyof typeof SUBSCRIPTION_TIERS) => {
    await createCheckout(SUBSCRIPTION_TIERS[tier].price_id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center mb-4">
            Brugere på vores Standard Plan kan kun følge 1 virksomhed
          </DialogTitle>
          <p className="text-muted-foreground text-center">
            Opgrader til Premium eller Enterprise for at følge flere virksomheder
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-4 h-[480px]">
          {/* Premium Package */}
          <Card className="relative hover:shadow-lg border-primary h-full flex flex-col">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
                Mest populær
              </Badge>
            </div>
            <CardHeader className="text-center pb-3 pt-5">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg mb-1">{SUBSCRIPTION_TIERS.premium.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 flex flex-col flex-1">
              <div className="text-center mb-4 pb-3 border-b border-border">
                <div className="mb-1">
                  <div className="text-base text-muted-foreground line-through opacity-70 mb-1">
                    {SUBSCRIPTION_TIERS.premium.originalPrice},-
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {SUBSCRIPTION_TIERS.premium.price},-
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">pr. måned</div>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {SUBSCRIPTION_TIERS.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg mt-auto" 
                size="lg"
                onClick={() => handleSubscribe('premium')}
                disabled={loading}
              >
                Opgrader til Premium
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Package */}
          <Card className="relative hover:shadow-lg h-full flex flex-col">
            <CardHeader className="text-center pb-3 pt-5">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-lg mb-1">{SUBSCRIPTION_TIERS.enterprise.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 flex flex-col flex-1">
              <div className="text-center mb-4 pb-3 border-b border-border">
                <div className="mb-1">
                  <div className="text-base text-muted-foreground line-through opacity-70 mb-1">
                    {SUBSCRIPTION_TIERS.enterprise.originalPrice},-
                  </div>
                  <div className="text-3xl font-bold">
                    {SUBSCRIPTION_TIERS.enterprise.price},-
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">pr. måned</div>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {SUBSCRIPTION_TIERS.enterprise.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-auto" 
                size="lg"
                onClick={() => handleSubscribe('enterprise')}
                disabled={loading}
              >
                Opgrader til Enterprise
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
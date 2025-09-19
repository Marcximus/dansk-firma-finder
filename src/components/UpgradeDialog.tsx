import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Users, ArrowLeft } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS } from '@/constants/subscriptions';
import { StripeProvider } from '@/components/stripe/StripeProvider';
import { PaymentForm } from '@/components/stripe/PaymentForm';

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
}

type PaymentState = {
  step: 'selection' | 'payment';
  selectedTier?: keyof typeof SUBSCRIPTION_TIERS;
  paymentData?: {
    clientSecret: string;
    customerId: string;
    priceId: string;
  };
};

const UpgradeDialog: React.FC<UpgradeDialogProps> = ({ open, onClose }) => {
  const { createPaymentIntent, checkSubscription } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    step: 'selection'
  });

  const handleSelectPlan = async (tier: keyof typeof SUBSCRIPTION_TIERS) => {
    setLoading(true);
    try {
      const paymentData = await createPaymentIntent(SUBSCRIPTION_TIERS[tier].price_id);
      setPaymentState({
        step: 'payment',
        selectedTier: tier,
        paymentData
      });
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Refresh subscription status
    await checkSubscription();
    // Reset state and close dialog
    setPaymentState({ step: 'selection' });
    onClose();
  };

  const handleBackToSelection = () => {
    setPaymentState({ step: 'selection' });
  };

  const handleCancel = () => {
    setPaymentState({ step: 'selection' });
    onClose();
  };

  const renderSelectionStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl text-center mb-4">
          Brugere på vores Standard Plan kan kun følge 1 virksomhed
        </DialogTitle>
        <p className="text-muted-foreground text-center">
          Opgrader til Premium eller Enterprise for at følge flere virksomheder
        </p>
      </DialogHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Premium Package */}
        <Card className="relative hover:shadow-lg border-primary flex flex-col h-full">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
              Mest populær
            </Badge>
          </div>
          <CardHeader className="text-center pb-4 pt-6">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">{SUBSCRIPTION_TIERS.premium.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col">
            <div className="text-center mb-6 pb-4 border-b border-border">
              <div className="mb-1">
                <div className="text-lg text-muted-foreground line-through opacity-70 mb-1">
                  {SUBSCRIPTION_TIERS.premium.originalPrice},-
                </div>
                <div className="text-4xl font-bold text-primary">
                  {SUBSCRIPTION_TIERS.premium.price},-
                </div>
              </div>
              <div className="text-sm text-muted-foreground">pr. måned</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {SUBSCRIPTION_TIERS.premium.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg" 
              size="lg"
              onClick={() => handleSelectPlan('premium')}
              disabled={loading}
            >
              Vælg Premium
            </Button>
          </CardContent>
        </Card>

        {/* Enterprise Package */}
        <Card className="relative hover:shadow-lg flex flex-col h-full">
          <CardHeader className="text-center pb-4 pt-9">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-xl mb-2">{SUBSCRIPTION_TIERS.enterprise.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col">
            <div className="text-center mb-6 pb-4 border-b border-border">
              <div className="mb-1">
                <div className="text-lg text-muted-foreground line-through opacity-70 mb-1">
                  {SUBSCRIPTION_TIERS.enterprise.originalPrice},-
                </div>
                <div className="text-4xl font-bold">
                  {SUBSCRIPTION_TIERS.enterprise.price},-
                </div>
              </div>
              <div className="text-sm text-muted-foreground">pr. måned</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {SUBSCRIPTION_TIERS.enterprise.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
              size="lg"
              onClick={() => handleSelectPlan('enterprise')}
              disabled={loading}
            >
              Vælg Enterprise
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderPaymentStep = () => {
    if (!paymentState.selectedTier || !paymentState.paymentData) return null;

    const selectedPlan = SUBSCRIPTION_TIERS[paymentState.selectedTier];

    return (
      <StripeProvider clientSecret={paymentState.paymentData.clientSecret}>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSelection}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbage til planer
            </Button>
          </div>
          
          <PaymentForm
            priceId={paymentState.paymentData.priceId}
            customerId={paymentState.paymentData.customerId}
            planName={selectedPlan.name}
            price={selectedPlan.price}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        </div>
      </StripeProvider>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl min-h-fit p-6">
        {paymentState.step === 'selection' ? renderSelectionStep() : renderPaymentStep()}
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
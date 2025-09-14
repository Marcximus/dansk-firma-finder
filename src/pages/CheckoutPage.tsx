import React from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ArrowLeft, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/constants/subscriptions';

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const packageParam = searchParams.get('package') as SubscriptionTier | null;
  const { createCheckout, subscribed, subscriptionTier } = useSubscription();

  // Redirect if no package specified or invalid package
  if (!packageParam || !(packageParam in SUBSCRIPTION_TIERS)) {
    return <Navigate to="/track-foelg" replace />
  }

  const selectedPackage = SUBSCRIPTION_TIERS[packageParam];

  // If user already has this subscription tier, redirect to track-foelg
  if (subscribed && subscriptionTier === packageParam) {
    return <Navigate to="/track-foelg" replace />
  }

  const handleSubscribe = async () => {
    await createCheckout(selectedPackage.price_id);
  };

  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/track-foelg" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tilbage til pakkeoversigt
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">
              Du er ved at tilmelde dig {selectedPackage.name} pakken
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Abonnement Sammendrag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedPackage.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Månedligt abonnement
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {selectedPackage.price} {selectedPackage.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">pr. måned</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Inkluderet:</h5>
                    {selectedPackage.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total pr. måned</span>
                    <span>{selectedPackage.price} {selectedPackage.currency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Info */}
          <div className="order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Secure Stripe Checkout
                </CardTitle>
                <CardDescription>
                  Du vil blive omdirigeret til Stripe for sikker betaling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>SSL-kryptering og sikker betaling</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Administrer dit abonnement når som helst</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Opsig dit abonnement når som helst</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Understøtter alle gængse betalingskort</span>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={handleSubscribe}
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="lg"
                >
                  Fortsæt til Stripe Checkout
                </Button>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Sikret af Stripe - Branchens standard for betalinger</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              <span>SSL-sikret</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>30 dages returret</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>Opsig når som helst</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
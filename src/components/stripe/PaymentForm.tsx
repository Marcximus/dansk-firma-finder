import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentFormProps {
  priceId: string;
  customerId: string;
  planName: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  priceId,
  customerId,
  planName,
  price,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Confirm the setup intent
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/track-foelg?success=true',
        },
        redirect: 'if_required',
      });

      if (setupError) {
        throw new Error(setupError.message);
      }

      if (setupIntent?.payment_method && setupIntent.status === 'succeeded') {
        // Create the subscription with the payment method
        const { data, error } = await supabase.functions.invoke('create-subscription', {
          body: {
            paymentMethodId: setupIntent.payment_method,
            priceId,
            customerId,
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.success) {
          toast({
            title: "Betaling gennemført!",
            description: `Du er nu tilmeldt ${planName} planen.`,
          });
          onSuccess();
        } else {
          throw new Error("Subscription creation failed");
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Betalingsfejl",
        description: error instanceof Error ? error.message : "Der opstod en fejl under betalingen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Betal for {planName}
        </CardTitle>
        <p className="text-center text-muted-foreground">
          {price},- DKK/måned
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement 
            options={{
              layout: 'tabs'
            }}
          />
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Annuller
            </Button>
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Behandler...
                </>
              ) : (
                `Betal ${price},-`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
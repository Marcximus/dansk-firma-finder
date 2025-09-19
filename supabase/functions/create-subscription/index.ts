import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("User not authenticated");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { paymentMethodId, priceId, customerId } = await req.json();
    if (!paymentMethodId || !priceId || !customerId) {
      throw new Error("Payment method ID, price ID, and customer ID are required");
    }
    logStep("Request data received", { paymentMethodId, priceId, customerId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    logStep("Payment method attached to customer");

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    logStep("Payment method set as default");

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      default_payment_method: paymentMethodId,
      metadata: {
        user_id: user.id,
      },
    });

    logStep("Subscription created", { subscriptionId: subscription.id, status: subscription.status });

    return new Response(JSON.stringify({ 
      subscriptionId: subscription.id,
      status: subscription.status,
      success: subscription.status === 'active'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
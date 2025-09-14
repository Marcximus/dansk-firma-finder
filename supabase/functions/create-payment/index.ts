import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the anon key for user authentication.
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { reportType, companies } = await req.json();

    if (!reportType || !companies || companies.length === 0) {
      throw new Error("Missing required parameters: reportType and companies");
    }

    console.log("Creating payment for:", { reportType, companiesCount: companies.length });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Map report types to Stripe price IDs
    const priceMap = {
      premium: "price_1S7Ea3CiBj9ds2dSou6BX6MD", // 199 DKK
      enterprise: "price_1S7EaMCiBj9ds2dSirZlnofG", // 499 DKK
    };

    const priceId = priceMap[reportType as keyof typeof priceMap];
    if (!priceId) {
      throw new Error(`Invalid report type: ${reportType}`);
    }

    // Create line items for each company
    const lineItems = companies.map((company: any) => ({
      price_data: {
        currency: "dkk",
        product_data: {
          name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} virksomhedsrapport`,
          description: `Rapport for ${company.name} (CVR: ${company.cvr})`,
        },
        unit_amount: reportType === "premium" ? 19900 : 49900, // Amount in øre
      },
      quantity: 1,
    }));

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/virksomhedsrapporter`,
      metadata: {
        reportType,
        companies: JSON.stringify(companies.map((c: any) => ({ name: c.name, cvr: c.cvr }))),
      },
    });

    console.log("Payment session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-payment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
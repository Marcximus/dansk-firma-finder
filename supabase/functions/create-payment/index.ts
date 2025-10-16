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
    const { companyReports } = await req.json();

    if (!companyReports || companyReports.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: companyReports" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate companyReports structure and content
    if (!Array.isArray(companyReports)) {
      return new Response(
        JSON.stringify({ error: "companyReports must be an array" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate each report
    const validReportTypes = ['standard', 'premium', 'enterprise'];
    for (const report of companyReports) {
      if (!report.company?.name || !report.company?.cvr || !report.reportType) {
        return new Response(
          JSON.stringify({ error: "Invalid report structure: missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!validReportTypes.includes(report.reportType)) {
        return new Response(
          JSON.stringify({ error: `Invalid report type: ${report.reportType}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!/^\d{8}$/.test(report.company.cvr)) {
        return new Response(
          JSON.stringify({ error: "CVR must be exactly 8 digits" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (typeof report.company.name !== 'string' || report.company.name.length === 0 || report.company.name.length > 200) {
        return new Response(
          JSON.stringify({ error: "Company name must be between 1 and 200 characters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    console.log("Creating payment for:", { reportsCount: companyReports.length });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create line items for each company report
    const lineItems = companyReports.map((report: any) => {
      const reportTypeNames = {
        standard: "Standard virksomhedsrapport",
        premium: "Premium virksomhedsrapport",
        enterprise: "Enterprise virksomhedsrapport"
      };

      const unitAmounts = {
        standard: 4900, // 49 DKK in øre
        premium: 19900, // 199 DKK in øre
        enterprise: 49900 // 499 DKK in øre
      };

      return {
        price_data: {
          currency: "dkk",
          product_data: {
            name: reportTypeNames[report.reportType as keyof typeof reportTypeNames],
            description: `Rapport for ${report.company.name} (CVR: ${report.company.cvr})`,
          },
          unit_amount: unitAmounts[report.reportType as keyof typeof unitAmounts],
        },
        quantity: 1,
      };
    });

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/virksomhedsrapporter`,
      metadata: {
        companyReports: JSON.stringify(companyReports.map((report: any) => ({ 
          companyName: report.company.name, 
          cvr: report.company.cvr, 
          reportType: report.reportType 
        }))),
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
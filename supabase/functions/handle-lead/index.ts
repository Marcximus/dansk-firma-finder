import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_type: 'legal' | 'accounting';
  message: string;
  user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const leadData: LeadRequest = await req.json();

    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.service_type || !leadData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Insert lead into database
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone || null,
        company: leadData.company || null,
        service_type: leadData.service_type,
        message: leadData.message,
        user_id: leadData.user_id || null,
        status: 'new',
        source: 'contact_form',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Lead created successfully:', lead);

    // Log user activity if user_id is provided
    if (leadData.user_id) {
      await supabase
        .from('user_activity_log')
        .insert({
          user_id: leadData.user_id,
          activity_type: 'lead_submitted',
          activity_data: {
            lead_id: lead.id,
            service_type: leadData.service_type,
            timestamp: new Date().toISOString(),
          },
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead submitted successfully',
        lead_id: lead.id 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in handle-lead function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
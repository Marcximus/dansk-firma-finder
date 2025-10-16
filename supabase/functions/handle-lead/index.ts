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

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true;
  const phoneRegex = /^(\+?45\s?)?[0-9\s-]{8,20}$/;
  return phoneRegex.test(phone);
};

const validateString = (str: string, minLen: number, maxLen: number): boolean => {
  const trimmed = str.trim();
  return trimmed.length >= minLen && trimmed.length <= maxLen;
};

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

    // Validate input formats and lengths
    if (!validateString(leadData.name, 2, 100)) {
      return new Response(
        JSON.stringify({ error: 'Name must be between 2 and 100 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!validateEmail(leadData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (leadData.phone && !validatePhone(leadData.phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (leadData.company && !validateString(leadData.company, 1, 200)) {
      return new Response(
        JSON.stringify({ error: 'Company name must not exceed 200 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!validateString(leadData.message, 10, 2000)) {
      return new Response(
        JSON.stringify({ error: 'Message must be between 10 and 2000 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!['legal', 'accounting'].includes(leadData.service_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid service type' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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
      console.error('[ERROR]', {
        function: 'handle-lead',
        error: insertError.message,
        timestamp: new Date().toISOString()
      });
      return new Response(
        JSON.stringify({ error: 'Failed to submit request. Please try again.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('[INFO] Lead created successfully with ID:', lead.id);

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
    console.error('[ERROR]', {
      function: 'handle-lead',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
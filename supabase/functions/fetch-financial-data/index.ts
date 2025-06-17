
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvr } = await req.json();
    
    if (!cvr) {
      throw new Error('CVR number is required');
    }
    
    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');
    
    if (!username || !password) {
      throw new Error('Danish Business API credentials not configured');
    }

    // Create basic auth header
    const auth = btoa(`${username}:${password}`);
    
    // Search for financial reports (regnskaber)
    const searchUrl = 'https://distribution.virk.dk/offentliggoerelser/_search';
    const searchParams = new URLSearchParams();
    searchParams.append('q', `cvrNummer:${cvr} AND dokumenttype:AARSRAPPORT`);
    searchParams.append('size', '5');
    searchParams.append('sort', 'offentliggoerelsesTidspunkt:desc');

    console.log(`Fetching financial data from: ${searchUrl}?${searchParams.toString()}`);

    const response = await fetch(`${searchUrl}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Financial API request failed: ${response.status} ${response.statusText}`);
      throw new Error(`Danish Business Financial API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Financial API Response:', JSON.stringify(data, null, 2));

    // Transform the financial data
    const financialReports = data.hits?.hits?.map((hit: any) => {
      const source = hit._source;
      return {
        period: source.regnskabsperiode || 'N/A',
        publishDate: source.offentliggoerelsesTidspunkt ? new Date(source.offentliggoerelsesTidspunkt).toLocaleDateString('da-DK') : 'N/A',
        approvalDate: source.indlaesningsTidspunkt ? new Date(source.indlaesningsTidspunkt).toLocaleDateString('da-DK') : 'N/A',
        documentUrl: source.dokumentUrl || null
      };
    }) || [];

    return new Response(
      JSON.stringify({ financialReports }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching financial data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        financialReports: [] 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

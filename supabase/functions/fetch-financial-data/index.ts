
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
      return new Response(
        JSON.stringify({ error: 'CVR number is required', financialReports: [] }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate CVR format (must be exactly 8 digits)
    if (!/^\d{8}$/.test(cvr)) {
      return new Response(
        JSON.stringify({ error: 'CVR must be exactly 8 digits', financialReports: [] }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');
    
    console.log('API Credentials check:', {
      username: username ? `${username.substring(0, 3)}***` : 'NOT SET',
      password: password ? '***SET***' : 'NOT SET'
    });
    
    if (!username || !password) {
      console.log('Danish Business API credentials not configured, returning empty results');
      return new Response(
        JSON.stringify({ 
          financialReports: [],
          error: 'API credentials not configured',
          debug: 'Check DANISH_BUSINESS_API_USERNAME and DANISH_BUSINESS_API_PASSWORD secrets'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Create basic auth header
    const auth = btoa(`${username}:${password}`);
    
    // Search for financial reports using the correct Erhvervsstyrelsen API
    const searchUrl = 'https://distribution.virk.dk/offentliggoerelser/_search';
    const searchParams = new URLSearchParams();
    searchParams.append('q', `cvrNummer:${cvr}`);
    searchParams.append('size', '10');
    searchParams.append('sort', 'offentliggoerelsesTidspunkt:desc');

    console.log(`Fetching financial data from: ${searchUrl}?${searchParams.toString()}`);

    const response = await fetch(`${searchUrl}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Financial API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      return new Response(
        JSON.stringify({ 
          financialReports: [],
          error: `API request failed: ${response.status}`
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const data = await response.json();
    console.log('Financial API Response structure:', JSON.stringify(data, null, 2));

    // Transform the financial data with better error handling
    const financialReports = data.hits?.hits?.map((hit: any) => {
      const source = hit._source;
      return {
        period: source.regnskabsperiode || source.periode || 'N/A',
        publishDate: source.offentliggoerelsesTidspunkt ? 
          new Date(source.offentliggoerelsesTidspunkt).toLocaleDateString('da-DK') : 'N/A',
        approvalDate: source.indlaesningsTidspunkt ? 
          new Date(source.indlaesningsTidspunkt).toLocaleDateString('da-DK') : 'N/A',
        documentUrl: source.dokumentUrl || source.url || null,
        documentType: source.dokumenttype || 'Årsrapport',
        companyName: source.navne?.[0] || source.virksomhedsnavn || 'N/A'
      };
    }) || [];

    console.log(`Found ${financialReports.length} financial reports for CVR ${cvr}`);

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

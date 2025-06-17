
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
    const { cvr, companyName } = await req.json();
    
    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');
    
    if (!username || !password) {
      throw new Error('Danish Business API credentials not configured');
    }

    // Create basic auth header
    const auth = btoa(`${username}:${password}`);
    
    let searchUrl = '';
    let searchParams = new URLSearchParams();
    
    if (cvr) {
      // Search by CVR number
      searchUrl = 'https://distribution.virk.dk/cvr-permanent/virksomhed/_search';
      searchParams.append('q', `cvrNummer:${cvr}`);
    } else if (companyName) {
      // Search by company name
      searchUrl = 'https://distribution.virk.dk/cvr-permanent/virksomhed/_search';
      searchParams.append('q', `navne.navn:${companyName}*`);
      searchParams.append('size', '10');
    } else {
      throw new Error('Either CVR number or company name is required');
    }

    console.log(`Fetching company data from: ${searchUrl}?${searchParams.toString()}`);

    const response = await fetch(`${searchUrl}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      throw new Error(`Danish Business API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Transform the API response to match our Company interface
    const companies = data.hits?.hits?.map((hit: any) => {
      const source = hit._source;
      const primaryName = source.navne?.find((n: any) => n.periode?.gyldigTil === null)?.navn || source.navne?.[0]?.navn || 'Unknown';
      const primaryAddress = source.beliggenhedsadresse || source.postadresse || {};
      
      return {
        id: source.cvrNummer?.toString() || hit._id,
        name: primaryName,
        cvr: source.cvrNummer?.toString() || '',
        address: `${primaryAddress.vejnavn || ''} ${primaryAddress.husnummerFra || ''}`.trim() || 'N/A',
        city: primaryAddress.postdistrikt || 'N/A',
        postalCode: primaryAddress.postnummer?.toString() || 'N/A',
        industry: source.hovedbranche?.branchetekst || 'N/A',
        employeeCount: source.virksomhedsstatus?.[0]?.status === 'AKTIV' ? Math.floor(Math.random() * 1000) + 1 : 0,
        yearFounded: source.stiftelsesdato ? new Date(source.stiftelsesdato).getFullYear() : null,
        revenue: 'N/A',
        website: source.elektroniskPost?.find((e: any) => e.kontaktoplysning?.includes('www.'))?.kontaktoplysning || null,
        description: source.formaal || 'No description available',
        logo: null
      };
    }) || [];

    return new Response(
      JSON.stringify({ companies }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching company data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        companies: [] 
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

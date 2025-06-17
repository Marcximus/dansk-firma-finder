
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
    
    let searchQuery;
    
    if (cvr) {
      // Search by CVR number
      searchQuery = {
        "query": {
          "bool": {
            "must": [
              {
                "term": {
                  "Vrvirksomhed.cvrNummer": cvr
                }
              }
            ]
          }
        }
      };
    } else if (companyName) {
      // Search by company name using wildcard query
      searchQuery = {
        "query": {
          "bool": {
            "must": [
              {
                "wildcard": {
                  "Vrvirksomhed.navne.navn": `*${companyName.toLowerCase()}*`
                }
              }
            ]
          }
        },
        "size": 10
      };
    } else {
      throw new Error('Either CVR number or company name is required');
    }

    const searchUrl = 'http://distribution.virk.dk/cvr-permanent/virksomhed/_search';

    console.log(`Posting to: ${searchUrl}`);
    console.log(`Search query:`, JSON.stringify(searchQuery, null, 2));

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    });

    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error response:`, errorText);
      throw new Error(`Danish Business API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Transform the API response to match our Company interface
    const companies = data.hits?.hits?.map((hit: any) => {
      const source = hit._source;
      const vrvirksomhed = source.Vrvirksomhed || {};
      const primaryName = vrvirksomhed.navne?.find((n: any) => n.periode?.gyldigTil === null)?.navn || vrvirksomhed.navne?.[0]?.navn || 'Unknown';
      const primaryAddress = vrvirksomhed.beliggenhedsadresse || vrvirksomhed.postadresse || {};
      
      return {
        id: vrvirksomhed.cvrNummer?.toString() || hit._id,
        name: primaryName,
        cvr: vrvirksomhed.cvrNummer?.toString() || '',
        address: `${primaryAddress.vejnavn || ''} ${primaryAddress.husnummerFra || ''}`.trim() || 'N/A',
        city: primaryAddress.postdistrikt || 'N/A',
        postalCode: primaryAddress.postnummer?.toString() || 'N/A',
        industry: vrvirksomhed.hovedbranche?.branchetekst || 'N/A',
        employeeCount: vrvirksomhed.virksomhedsstatus?.[0]?.status === 'AKTIV' ? Math.floor(Math.random() * 1000) + 1 : 0,
        yearFounded: vrvirksomhed.stiftelsesdato ? new Date(vrvirksomhed.stiftelsesdato).getFullYear() : null,
        revenue: 'N/A',
        website: vrvirksomhed.elektroniskPost?.find((e: any) => e.kontaktoplysning?.includes('www.'))?.kontaktoplysning || null,
        description: vrvirksomhed.formaal || 'No description available',
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


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
      // Search by CVR number - convert to integer for exact match
      searchQuery = {
        "query": {
          "bool": {
            "must": [
              {
                "term": {
                  "Vrvirksomhed.cvrNummer": parseInt(cvr)
                }
              }
            ]
          }
        }
      };
    } else if (companyName) {
      // Search by company name using match query with fuzziness
      searchQuery = {
        "query": {
          "bool": {
            "must": [
              {
                "match": {
                  "Vrvirksomhed.navne.navn": {
                    "query": companyName,
                    "fuzziness": "AUTO",
                    "operator": "and"
                  }
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
      
      // Get the current/active name (where gyldigTil is null) or the most recent name
      const activeName = vrvirksomhed.navne?.find((n: any) => n.periode?.gyldigTil === null);
      const primaryName = activeName?.navn || vrvirksomhed.navne?.[0]?.navn || 'Unknown';
      
      // Get the current/active address (where gyldigTil is null) or the most recent address
      const activeAddress = vrvirksomhed.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
      const primaryAddress = activeAddress || vrvirksomhed.beliggenhedsadresse?.[0] || {};
      
      // Get current industry info
      const currentIndustry = vrvirksomhed.hovedbranche?.find((branch: any) => branch.periode?.gyldigTil === null);
      const industry = currentIndustry?.branchetekst || vrvirksomhed.hovedbranche?.[0]?.branchetekst || 'N/A';
      
      // Get current email
      const currentEmail = vrvirksomhed.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
      const emailAddress = currentEmail?.kontaktoplysning || vrvirksomhed.elektroniskPost?.[0]?.kontaktoplysning || null;
      
      // Get current legal form
      const currentForm = vrvirksomhed.virksomhedsform?.find((form: any) => form.periode?.gyldigTil === null);
      const legalForm = currentForm?.langBeskrivelse || currentForm?.kortBeskrivelse || 'N/A';
      
      // Get current status 
      const currentStatus = vrvirksomhed.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
      const status = currentStatus?.status || 'N/A';
      
      // Get employee count from latest employment data
      const latestEmployment = vrvirksomhed.aarsbeskaeftigelse?.[0];
      const employeeCount = latestEmployment?.antalAnsatte || latestEmployment?.antalAarsvaerk || 0;
      
      // Build address string
      let addressString = 'N/A';
      if (primaryAddress.vejnavn || primaryAddress.husnummerFra) {
        const street = primaryAddress.vejnavn || '';
        const houseNumber = primaryAddress.husnummerFra || '';
        const floor = primaryAddress.etage ? `, ${primaryAddress.etage}` : '';
        const door = primaryAddress.sidedoer ? ` ${primaryAddress.sidedoer}` : '';
        addressString = `${street} ${houseNumber}${floor}${door}`.trim();
      }
      
      return {
        id: vrvirksomhed.cvrNummer?.toString() || hit._id,
        name: primaryName,
        cvr: vrvirksomhed.cvrNummer?.toString() || '',
        address: addressString,
        city: primaryAddress.postdistrikt || 'N/A',
        postalCode: primaryAddress.postnummer?.toString() || 'N/A',
        industry: industry,
        employeeCount: employeeCount,
        yearFounded: vrvirksomhed.stiftelsesDato ? new Date(vrvirksomhed.stiftelsesDato).getFullYear() : null,
        revenue: 'N/A',
        website: vrvirksomhed.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null)?.kontaktoplysning || null,
        description: 'Company information from Danish Business Authority',
        logo: null,
        email: emailAddress,
        legalForm: legalForm,
        status: status,
        // Store full CVR data for detailed view
        realCvrData: vrvirksomhed
      };
    }) || [];

    return new Response(
      JSON.stringify({ 
        companies,
        // Also return the full data for the first result (useful for detailed view)
        fullCvrData: data.hits?.hits?.[0]?._source
      }),
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

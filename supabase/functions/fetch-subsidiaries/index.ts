import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvr } = await req.json();
    
    if (!cvr) {
      return new Response(
        JSON.stringify({ error: 'CVR number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');

    if (!username || !password) {
      console.error('Missing API credentials');
      return new Response(
        JSON.stringify({ error: 'API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const auth = btoa(`${username}:${password}`);
    
    // Build Elasticsearch query to find companies where this CVR appears as an owner
    // Broadened search to find all ownership relations, not just EJERREGISTER
    const query = {
      query: {
        bool: {
          must: [
            {
              nested: {
                path: "Vrvirksomhed.deltagerRelation",
                query: {
                  bool: {
                    must: [
                      {
                        term: {
                          "Vrvirksomhed.deltagerRelation.deltager.forretningsnoegle": cvr
                        }
                      },
                      {
                        bool: {
                          must_not: {
                            exists: {
                              field: "Vrvirksomhed.deltagerRelation.periode.gyldigTil"
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      },
      size: 100,
      _source: [
        "Vrvirksomhed.cvrNummer",
        "Vrvirksomhed.virksomhedMetadata.nyesteNavn",
        "Vrvirksomhed.virksomhedMetadata.sammensatStatus",
        "Vrvirksomhed.deltagerRelation"
      ]
    };

    console.log('Searching for subsidiaries of CVR:', cvr);

    const response = await fetch(
      'https://distribution.virk.dk/cvr-permanent/virksomhed/_search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify(query),
      }
    );

    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subsidiaries', subsidiaries: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('API response hits:', data.hits?.total?.value || 0);

    const subsidiaries = (data.hits?.hits || []).map((hit: any) => {
      const vrvirksomhed = hit._source?.Vrvirksomhed;
      
      // Find the relation with this parent CVR to get ownership percentage
      const ownerRelation = vrvirksomhed?.deltagerRelation?.find((rel: any) => 
        rel.deltager?.forretningsnoegle === cvr && !rel.periode?.gyldigTil
      );

      let ownershipPercentage = null;
      let votingRights = null;
      let relationshipType = null;

      if (ownerRelation) {
        // Look for ownership data in all organizations, not just EJERREGISTER
        const allOrganizations = ownerRelation.organisationer || [];
        
        for (const org of allOrganizations) {
          const medlemsData = org.medlemsData || [];
          
          // Extract organization type for display
          if (org.organisationsNavn && org.organisationsNavn.length > 0) {
            relationshipType = org.organisationsNavn[0].navn;
          }
          
          // Look for ownership attributes
          for (const medlem of medlemsData) {
            const attributter = medlem.attributter || [];
            for (const attr of attributter) {
              if (attr.type === 'EJERANDEL_PROCENT' && attr.vaerdi) {
                ownershipPercentage = attr.vaerdi;
              }
              if (attr.type === 'EJERANDEL_STEMMERET_PROCENT' && attr.vaerdi) {
                votingRights = attr.vaerdi;
              }
            }
          }
        }
      }

      return {
        cvr: vrvirksomhed?.cvrNummer,
        name: vrvirksomhed?.virksomhedMetadata?.nyesteNavn?.navn || 'Ukendt',
        status: vrvirksomhed?.virksomhedMetadata?.sammensatStatus || 'NORMAL',
        ownershipPercentage,
        votingRights,
        relationshipType
      };
    }).filter((sub: any) => sub.cvr); // Only filter out invalid entries, keep all with CVR

    console.log('Found subsidiaries:', subsidiaries.length);

    return new Response(
      JSON.stringify({ subsidiaries }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-subsidiaries function:', error);
    return new Response(
      JSON.stringify({ error: error.message, subsidiaries: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

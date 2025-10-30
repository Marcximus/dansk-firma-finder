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
    
    console.log('Step 1: Fetching enhedsNummer for CVR:', cvr);
    const startTime = Date.now();

    // Step 1: Get the enhedsNummer (10-digit entity number) for this CVR
    const enhedsNummerQuery = {
      query: {
        term: {
          "Vrvirksomhed.cvrNummer": cvr
        }
      },
      _source: ["Vrvirksomhed.enhedsNummer", "Vrvirksomhed.cvrNummer"],
      size: 1
    };

    const timeoutPromise = (seconds: number) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Request timeout after ${seconds} seconds`)), seconds * 1000)
    );

    const enhedsNummerResponse = await Promise.race([
      fetch('https://distribution.virk.dk/cvr-permanent/virksomhed/_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify(enhedsNummerQuery),
      }),
      timeoutPromise(15)
    ]) as Response;

    if (!enhedsNummerResponse.ok) {
      console.error('Failed to fetch enhedsNummer:', enhedsNummerResponse.status);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch company entity number', 
          subsidiaries: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const enhedsNummerData = await enhedsNummerResponse.json();
    const enhedsNummer = enhedsNummerData.hits?.hits?.[0]?._source?.Vrvirksomhed?.enhedsNummer;

    if (!enhedsNummer) {
      console.log('No enhedsNummer found for CVR:', cvr);
      return new Response(
        JSON.stringify({ subsidiaries: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Step 2: Searching for subsidiaries using enhedsNummer:', enhedsNummer);

    // Step 2: Find all companies that list this entity as their HOVEDSELSKAB (parent company)
    const subsidiaryQuery = {
      query: {
        bool: {
          must: [
            {
              nested: {
                path: "Vrvirksomhed.deltagerRelation",
                query: {
                  nested: {
                    path: "Vrvirksomhed.deltagerRelation.organisationer",
                    query: {
                      bool: {
                        must: [
                          {
                            term: {
                              "Vrvirksomhed.deltagerRelation.organisationer.enhedsNummerOrganisation": enhedsNummer
                            }
                          },
                          {
                            term: {
                              "Vrvirksomhed.deltagerRelation.organisationer.hovedtype": "HOVEDSELSKAB"
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            {
              nested: {
                path: "Vrvirksomhed.livsforloeb",
                query: {
                  bool: {
                    must_not: {
                      exists: {
                        field: "Vrvirksomhed.livsforloeb.periode.gyldigTil"
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      },
      _source: [
        "Vrvirksomhed.cvrNummer",
        "Vrvirksomhed.virksomhedMetadata.nyesteNavn",
        "Vrvirksomhed.virksomhedMetadata.sammensatStatus",
        "Vrvirksomhed.deltagerRelation"
      ],
      size: 50
    };

    const subsidiaryResponse = await Promise.race([
      fetch('https://distribution.virk.dk/cvr-permanent/virksomhed/_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
        body: JSON.stringify(subsidiaryQuery),
      }),
      timeoutPromise(30)
    ]) as Response;

    const elapsed = Date.now() - startTime;
    console.log(`Total request completed in ${elapsed}ms`);

    if (!subsidiaryResponse.ok) {
      console.error('API request failed:', subsidiaryResponse.status, subsidiaryResponse.statusText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch subsidiaries', 
          subsidiaries: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await subsidiaryResponse.json();
    console.log('Found subsidiary hits:', data.hits?.total?.value || 0);

    const subsidiaries = (data.hits?.hits || []).map((hit: any) => {
      const vrvirksomhed = hit._source?.Vrvirksomhed;
      
      // Find the HOVEDSELSKAB relationship to extract ownership details
      let ownershipPercentage = null;
      let votingRights = null;

      const deltagerRelations = vrvirksomhed?.deltagerRelation || [];
      
      for (const relation of deltagerRelations) {
        const organisations = relation.organisationer || [];
        
        for (const org of organisations) {
          // Check if this is the parent company relationship
          if (org.enhedsNummerOrganisation === enhedsNummer && org.hovedtype === "HOVEDSELSKAB") {
            // Extract ownership attributes
            const attributter = org.attributter || [];
            
            for (const attr of attributter) {
              const vaerdier = attr.vaerdier || [];
              
              for (const vaerdi of vaerdier) {
                // Check if this is an active value (no gyldigTil)
                if (!vaerdi.periode?.gyldigTil) {
                  if (attr.type === 'EJERANDEL_PROCENT') {
                    ownershipPercentage = vaerdi.vaerdi;
                  }
                  if (attr.type === 'EJERANDEL_STEMMEANDEL_PROCENT') {
                    votingRights = vaerdi.vaerdi;
                  }
                }
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
        relationshipType: 'DATTERSELSKAB'
      };
    }).filter((sub: any) => sub.cvr);

    console.log('Processed subsidiaries:', subsidiaries.length);

    return new Response(
      JSON.stringify({ subsidiaries }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-subsidiaries function:', error);
    const isTimeout = error.message?.includes('timeout');
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        subsidiaries: [],
        timeout: isTimeout
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

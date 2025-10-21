import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PERSON-DATA] Function invoked');
    const { personName, enhedsNummer } = await req.json();
    
    console.log('[PERSON-DATA] Received request:', { personName, enhedsNummer });
    
    if (!personName && !enhedsNummer) {
      console.error('[PERSON-DATA] ERROR: No person name or ID provided');
      return new Response(
        JSON.stringify({ 
          error: 'Person name or enhedsNummer is required',
          debug: { personName, enhedsNummer }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');

    if (!username || !password) {
      console.error('[PERSON-DATA] ERROR: API credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Danish Business API credentials not configured',
          debug: { hasUsername: !!username, hasPassword: !!password }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('[PERSON-DATA] API credentials OK, starting search...');

    // Helper function to build ID-based search query
    const buildPersonIdQuery = (id: string | number) => {
      return {
        query: {
          nested: {
            path: "Vrvirksomhed.deltagerRelation",
            query: {
              nested: {
                path: "Vrvirksomhed.deltagerRelation.deltager",
                query: {
                  term: {
                    "Vrvirksomhed.deltagerRelation.deltager.enhedsNummer": Number(id)
                  }
                }
              }
            }
          }
        },
        size: 100,
        _source: ["Vrvirksomhed.cvrNummer", "Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn", 
                  "Vrvirksomhed.virksomhedsstatus", "Vrvirksomhed.deltagerRelation"]
      };
    };

    // Helper function to build search query
    const buildPersonSearchQuery = (name: string, fuzzy = false) => {
      if (fuzzy) {
        return {
          query: {
            nested: {
              path: "Vrvirksomhed.deltagerRelation",
              query: {
                nested: {
                  path: "Vrvirksomhed.deltagerRelation.deltager",
                  query: {
                    nested: {
                      path: "Vrvirksomhed.deltagerRelation.deltager.navne",
                      query: {
                        bool: {
                          should: [
                            {
                              match: {
                                "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                  query: name,
                                  fuzziness: "AUTO",
                                  operator: "and"
                                }
                              }
                            },
                            {
                              wildcard: {
                                "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                  value: `*${name.toLowerCase()}*`,
                                  case_insensitive: true
                                }
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          size: 100,
          _source: ["Vrvirksomhed.cvrNummer", "Vrvirksomhed.navne", "Vrvirksomhed.virksomhedsstatus", "Vrvirksomhed.deltagerRelation"]
        };
      }
      
      // Exact match query
      return {
        query: {
          nested: {
            path: "Vrvirksomhed.deltagerRelation",
            query: {
              nested: {
                path: "Vrvirksomhed.deltagerRelation.deltager",
                query: {
                  nested: {
                    path: "Vrvirksomhed.deltagerRelation.deltager.navne",
                    query: {
                      bool: {
                        should: [
                          {
                            match_phrase: {
                              "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                query: name,
                                boost: 10
                              }
                            }
                          },
                          {
                            match: {
                              "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                query: name,
                                operator: "and",
                                boost: 5
                              }
                            }
                          }
                        ],
                        minimum_should_match: 1
                      }
                    }
                  }
                }
              }
            }
          },
          size: 100,
          sort: [{ "_score": { "order": "desc" } }],
          _source: ["Vrvirksomhed.cvrNummer", "Vrvirksomhed.navne", "Vrvirksomhed.virksomhedsstatus", "Vrvirksomhed.deltagerRelation"]
        }
      };
    };

    let searchResults: any[] = [];
    let searchMethod = 'unknown';
    
    // Priority 1: If enhedsNummer is provided, use ID-based search (most accurate)
    if (enhedsNummer) {
      console.log('[PERSON-DATA] Using ID-based search with enhedsNummer:', enhedsNummer);
      searchMethod = 'id';
      const idQuery = buildPersonIdQuery(enhedsNummer);
      console.log('[PERSON-DATA] ID query:', JSON.stringify(idQuery, null, 2));
      
      const apiResponse = await fetch(
        'http://distribution.virk.dk:80/cvr-permanent/virksomhed/_search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          },
          body: JSON.stringify(idQuery),
        }
      );
      
      console.log('[PERSON-DATA] API response status:', apiResponse.status);
      
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        searchResults = result.hits?.hits || [];
        console.log(`[PERSON-DATA] ID-based search found ${searchResults.length} results`);
        if (searchResults.length > 0) {
          console.log('[PERSON-DATA] First result CVR:', searchResults[0]._source?.Vrvirksomhed?.cvrNummer);
        }
      } else {
        const errorText = await apiResponse.text();
        console.error('[PERSON-DATA] ID-based search failed with status', apiResponse.status, ':', errorText);
      }
    }
    
    // Fallback to name-based search if ID search failed or no ID provided
    if (searchResults.length === 0 && personName) {
      // Try 1: Exact match
      console.log('[PERSON-DATA] Attempting exact match search for:', personName);
      searchMethod = 'exact';
      const exactQuery = buildPersonSearchQuery(personName, false);
      console.log('[PERSON-DATA] Exact query:', JSON.stringify(exactQuery, null, 2));
      
      let apiResponse = await fetch(
        'http://distribution.virk.dk:80/cvr-permanent/virksomhed/_search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          },
          body: JSON.stringify(exactQuery),
        }
      );
      
      console.log('[PERSON-DATA] Exact match API response status:', apiResponse.status);
      
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        searchResults = result.hits?.hits || [];
        console.log(`[PERSON-DATA] Exact match found ${searchResults.length} results`);
      } else {
        const errorText = await apiResponse.text();
        console.error('[PERSON-DATA] Exact match failed:', errorText);
      }
      
      // Try 2: Fuzzy match if exact fails
      if (searchResults.length === 0) {
        console.log('Exact match failed, trying fuzzy match...');
        searchMethod = 'fuzzy';
        const fuzzyQuery = buildPersonSearchQuery(personName, true);
        apiResponse = await fetch(
          'http://distribution.virk.dk:80/cvr-permanent/virksomhed/_search',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(`${username}:${password}`),
            },
            body: JSON.stringify(fuzzyQuery),
          }
        );
        
        if (apiResponse.ok) {
          const result = await apiResponse.json();
          searchResults = result.hits?.hits || [];
          console.log(`Fuzzy match found ${searchResults.length} results`);
        }
      }
      
      // Try 3: First + Last name only if fuzzy also fails
      if (searchResults.length === 0) {
        const names = personName.trim().split(/\s+/);
        if (names.length > 2) {
          const simplifiedName = `${names[0]} ${names[names.length - 1]}`;
          console.log(`Trying simplified name search: ${simplifiedName}...`);
          searchMethod = 'simplified';
          const simplifiedQuery = buildPersonSearchQuery(simplifiedName, false);
          apiResponse = await fetch(
            'http://distribution.virk.dk:80/cvr-permanent/virksomhed/_search',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${username}:${password}`),
              },
              body: JSON.stringify(simplifiedQuery),
            }
          );
          
          if (apiResponse.ok) {
            const result = await apiResponse.json();
            searchResults = result.hits?.hits || [];
            console.log(`Simplified name search found ${searchResults.length} results`);
          }
        }
      }
    }

    console.log(`[PERSON-DATA] Processing ${searchResults.length} companies`);

    // Process results - use a Map to deduplicate by CVR
    const companiesMap = new Map();

    searchResults.forEach((hit: any) => {
      const company = hit._source?.Vrvirksomhed;
      if (!company) return;

      const companyName = company.navne?.[0]?.navn || company.virksomhedMetadata?.nyesteNavn?.navn || 'Ukendt virksomhed';
      const companyCvr = company.cvrNummer?.toString() || '';
      const companyStatus = company.virksomhedsstatus?.[0]?.status || 'Ukendt';

      // Find all relations for this person in this company
      const relations = company.deltagerRelation || [];
      
      relations.forEach((rel: any) => {
        // Check if this relation is for our person
        const deltagerNavn = rel.deltager?.navne?.[0]?.navn || '';
        const deltagerEnhedsNummer = rel.deltager?.enhedsNummer;
        
        // Match by enhedsNummer if provided, otherwise by name
        const isMatch = enhedsNummer 
          ? deltagerEnhedsNummer?.toString() === enhedsNummer.toString()
          : deltagerNavn.toLowerCase().includes((personName || '').toLowerCase());
          
        if (isMatch) {
          const isActive = !rel.periode?.gyldigTil || new Date(rel.periode.gyldigTil) >= new Date();
          
          // Extract roles from organizations
          const roles: any[] = [];
          (rel.organisationer || []).forEach((org: any) => {
            const orgType = org.hovedtype || '';
            const orgName = org.organisationsNavn?.[0]?.navn || '';
            
            (org.medlemsData || []).forEach((member: any) => {
              const role: any = {
                type: orgName || orgType,
                validFrom: member.periode?.gyldigFra || rel.periode?.gyldigFra,
                validTo: member.periode?.gyldigTil || rel.periode?.gyldigTil
              };
              
              // Extract title for LEDELSE roles
              if (orgName === 'LEDELSE' && member.attributter) {
                member.attributter.forEach((attr: any) => {
                  if (attr.type === 'FUNKTION') {
                    role.title = attr.vaerdier?.[0]?.vaerdi;
                  }
                });
              }
              
              // Extract ownership percentage for EJERREGISTER
              if (orgName === 'EJERREGISTER' && member.attributter) {
                member.attributter.forEach((attr: any) => {
                  if (attr.type === 'EJERANDEL_PROCENT') {
                    role.ownershipPercentage = parseFloat(attr.vaerdier?.[0]?.vaerdi || '0');
                  }
                  if (attr.type === 'STEMMERET_PROCENT') {
                    role.votingRights = parseFloat(attr.vaerdier?.[0]?.vaerdi || '0');
                  }
                });
              }
              
              roles.push(role);
            });
          });
          
          // Add or update company in map
          if (!companiesMap.has(companyCvr)) {
            companiesMap.set(companyCvr, {
              companyName,
              companyCvr,
              companyStatus,
              roles,
              validTo: rel.periode?.gyldigTil
            });
          } else {
            // Merge roles if company already exists
            const existing = companiesMap.get(companyCvr);
            existing.roles.push(...roles);
          }
        }
      });
    });

    console.log(`[PERSON-DATA] Total unique companies found: ${companiesMap.size}`);
    
    // Convert to arrays
    const allRelations = Array.from(companiesMap.values());
    const activeRelations = allRelations.filter(rel => !rel.validTo);
    const historicalRelations = allRelations.filter(rel => rel.validTo);
    
    console.log(`[PERSON-DATA] Active relations: ${activeRelations.length}, Historical: ${historicalRelations.length}`);
    console.log(`[PERSON-DATA] Returning response with searchMethod: ${searchMethod}`);
    
    const response = {
      personName: personName || 'Ukendt',
      personId: enhedsNummer || null,
      activeRelations,
      historicalRelations,
      totalCompanies: companiesMap.size,
      searchMethod,
      debug: {
        searchedName: personName,
        searchedId: enhedsNummer,
        rawResultsCount: searchResults.length,
        uniqueCompaniesCount: companiesMap.size
      }
    };
    
    console.log('[PERSON-DATA] SUCCESS - Response summary:', {
      totalCompanies: response.totalCompanies,
      activeCount: response.activeRelations.length,
      historicalCount: response.historicalRelations.length,
      searchMethod: response.searchMethod
    });
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[PERSON-DATA] FATAL ERROR:', error);
    console.error('[PERSON-DATA] Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        debug: {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

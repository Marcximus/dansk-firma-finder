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

    // Helper function to build direct deltager endpoint query (most accurate)
    const buildDeltagerQuery = (id: string | number) => {
      return {
        query: {
          bool: {
            must: [
              {
                term: {
                  "Vrdeltagerperson.enhedsNummer": Number(id)
                }
              }
            ]
          }
        },
        _source: [
          "Vrdeltagerperson.enhedsNummer",
          "Vrdeltagerperson.navne",
          "Vrdeltagerperson.beliggenhedsadresse",
          "Vrdeltagerperson.deltagelseInformation"
        ],
        size: 1
      };
    };

    // Helper function to build ID-based search query on virksomhed (fallback)
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
    let deltagerResponse: any = null;
    
    // Priority 1: If enhedsNummer is provided, use direct deltager endpoint (most accurate)
    if (enhedsNummer) {
      console.log('[PERSON-DATA] Using direct deltager endpoint with enhedsNummer:', enhedsNummer);
      searchMethod = 'deltager-direct';
      const deltagerQuery = buildDeltagerQuery(enhedsNummer);
      console.log('[PERSON-DATA] Deltager query:', JSON.stringify(deltagerQuery, null, 2));
      
      const apiResponse = await fetch(
        'http://distribution.virk.dk:80/cvr-permanent/deltager/_search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          },
          body: JSON.stringify(deltagerQuery),
        }
      );
      
      console.log('[PERSON-DATA] Deltager API response status:', apiResponse.status);
      
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        const hits = result.hits?.hits || [];
        console.log(`[PERSON-DATA] Deltager search found ${hits.length} results`);
        
        if (hits.length > 0) {
          deltagerResponse = hits[0]._source?.Vrdeltagerperson;
          console.log('[PERSON-DATA] Found deltager person:', deltagerResponse?.navne?.[0]?.navn);
          console.log('[PERSON-DATA] Deltager has', deltagerResponse?.deltagelseInformation?.length || 0, 'company relations');
        }
      } else {
        const errorText = await apiResponse.text();
        console.error('[PERSON-DATA] Deltager search failed with status', apiResponse.status, ':', errorText);
      }
      
      // If deltager search failed, fall back to virksomhed endpoint
      if (!deltagerResponse) {
        console.log('[PERSON-DATA] Deltager search failed, falling back to virksomhed endpoint');
        searchMethod = 'id-fallback';
        const idQuery = buildPersonIdQuery(enhedsNummer);
        
        const fallbackResponse = await fetch(
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
        
        if (fallbackResponse.ok) {
          const result = await fallbackResponse.json();
          searchResults = result.hits?.hits || [];
          console.log(`[PERSON-DATA] Fallback ID search found ${searchResults.length} results`);
        }
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

    console.log(`[PERSON-DATA] Processing results...`);

    // Process results - use a Map to deduplicate by CVR
    const companiesMap = new Map();
    
    // If we have deltager response, process it directly (cleaner data structure)
    if (deltagerResponse) {
      console.log('[PERSON-DATA] Processing deltager response');
      const deltagelseInfo = deltagerResponse.deltagelseInformation || [];
      console.log(`[PERSON-DATA] Found ${deltagelseInfo.length} company relations in deltager data`);
      
      deltagelseInfo.forEach((deltagelse: any) => {
        const deltagende = deltagelse.deltagende;
        if (!deltagende) return;
        
        const companyCvr = deltagende.enhedsNummer?.toString() || '';
        const companyName = deltagende.navne?.[0]?.navn || 'Ukendt virksomhed';
        const companyStatus = deltagende.virksomhedsstatus?.[0]?.status || 'Ukendt';
        
        // Extract roles from organizations
        const roles: any[] = [];
        const organisationer = deltagelse.organisationer || [];
        
        organisationer.forEach((org: any) => {
          const orgType = org.hovedtype || '';
          const orgName = org.organisationsNavn?.[0]?.navn || orgType;
          
          (org.medlemsData || []).forEach((member: any) => {
            const role: any = {
              type: orgName,
              validFrom: member.periode?.gyldigFra || deltagelse.periode?.gyldigFra,
              validTo: member.periode?.gyldigTil || deltagelse.periode?.gyldigTil
            };
            
            // Extract attributes (FUNKTION, ownership, etc.)
            (member.attributter || []).forEach((attr: any) => {
              if (attr.type === 'FUNKTION') {
                role.title = attr.vaerdier?.[0]?.vaerdi;
              }
              if (attr.type === 'EJERANDEL_PROCENT') {
                role.ownershipPercentage = parseFloat(attr.vaerdier?.[0]?.vaerdi || '0');
              }
              if (attr.type === 'EJERANDEL_STEMMERET_PROCENT') {
                role.votingRights = parseFloat(attr.vaerdier?.[0]?.vaerdi || '0');
              }
            });
            
            roles.push(role);
          });
        });
        
        if (companyCvr) {
          companiesMap.set(companyCvr, {
            companyName,
            companyCvr,
            companyStatus,
            roles,
            validTo: deltagelse.periode?.gyldigTil
          });
        }
      });
      
      console.log(`[PERSON-DATA] Processed ${companiesMap.size} companies from deltager data`);
    } else {
      console.log(`[PERSON-DATA] Processing ${searchResults.length} company search results`);
    }

    // Process virksomhed search results (fallback method)
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

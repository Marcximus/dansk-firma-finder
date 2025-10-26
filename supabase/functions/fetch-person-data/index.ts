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
              term: {
                "Vrvirksomhed.deltagerRelation.deltager.enhedsNummer": parseInt(id.toString())
              }
            }
          }
        },
        size: 100,
        _source: [
          "Vrvirksomhed.cvrNummer", 
          "Vrvirksomhed.navne",
          "Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn", 
          "Vrvirksomhed.virksomhedsstatus", 
          "Vrvirksomhed.deltagerRelation"
        ]
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
    
    // When we have enhedsNummer, run BOTH searches in parallel for best results
    if (enhedsNummer) {
      console.log('[PERSON-DATA] Running parallel searches with enhedsNummer:', enhedsNummer);
      searchMethod = 'parallel-id-search';
      
      const deltagerQuery = buildDeltagerQuery(enhedsNummer);
      const virksomhedQuery = buildPersonIdQuery(enhedsNummer);
      
      console.log('[DEBUG] Virksomhed query:', JSON.stringify(virksomhedQuery, null, 2));
      
      // Run both searches in parallel
      const [deltagerResult, virksomhedResult] = await Promise.all([
        fetch('http://distribution.virk.dk:80/cvr-permanent/deltager/_search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          },
          body: JSON.stringify(deltagerQuery),
        }).then(r => r.ok ? r.json() : { hits: { hits: [] } }).catch(e => { 
          console.error('[PERSON-DATA] Deltager search error:', e); 
          return { hits: { hits: [] } }; 
        }),
        
        fetch('http://distribution.virk.dk:80/cvr-permanent/virksomhed/_search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          },
          body: JSON.stringify(virksomhedQuery),
        }).then(r => r.ok ? r.json() : { hits: { hits: [] } }).catch(e => { 
          console.error('[PERSON-DATA] Virksomhed search error:', e); 
          return { hits: { hits: [] } }; 
        })
      ]);
      
      // Extract deltager person info (for name, address, basic info)
      const deltagerHits = deltagerResult?.hits?.hits || [];
      if (deltagerHits.length > 0) {
        deltagerResponse = deltagerHits[0]._source?.Vrdeltagerperson;
        console.log('[PERSON-DATA] Deltager found:', deltagerResponse?.navne?.[0]?.navn);
        console.log('[PERSON-DATA] Deltager deltagelseInformation count:', deltagerResponse?.deltagelseInformation?.length || 0);
      }
      
      // Extract virksomhed search results (for company relations via deltagerRelation)
      searchResults = virksomhedResult?.hits?.hits || [];
      console.log('[PERSON-DATA] Virksomhed search found', searchResults.length, 'companies with person in deltagerRelation');
      console.log('[DEBUG] Virksomhed result total:', virksomhedResult?.hits?.total);
      console.log('[DEBUG] Virksomhed result status:', virksomhedResult?.status || 'unknown');
      if (searchResults.length > 0) {
        console.log('[DEBUG] First company CVR:', searchResults[0]._source?.Vrvirksomhed?.cvrNummer);
        console.log('[DEBUG] First company relations count:', searchResults[0]._source?.Vrvirksomhed?.deltagerRelation?.length);
      } else {
        console.log('[DEBUG] No companies found in virksomhed search - checking raw response');
        console.log('[DEBUG] Raw virksomhed response:', JSON.stringify(virksomhedResult, null, 2).substring(0, 1000));
      }
    }
    
    // Fallback to name search ONLY if no enhedsNummer was provided
    if (!enhedsNummer && searchResults.length === 0 && personName) {
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

    // Extract person address from deltager response
    let personAddress = undefined;
    if (deltagerResponse?.beliggenhedsadresse?.[0]) {
      const addr = deltagerResponse.beliggenhedsadresse[0];
      personAddress = {
        street: [addr.vejnavn, addr.husnummerFra].filter(Boolean).join(' '),
        zipCode: addr.postnummer?.toString() || '',
        city: addr.postdistrikt || ''
      };
      console.log('[PERSON-DATA] Extracted address:', personAddress);
    }

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
        // Use the most recent name (last in array)
        const companyName = deltagende.navne?.[deltagende.navne?.length - 1]?.navn || 'Ukendt virksomhed';
        const companyStatus = deltagende.virksomhedsstatus?.[0]?.status || 'Ukendt';
        
        // Extract roles from organizations
        const roles: any[] = [];
        const organisationer = deltagelse.organisationer || [];
        
        organisationer.forEach((org: any) => {
          const orgType = org.hovedtype || '';
          const orgName = org.organisationsNavn?.[0]?.navn || orgType;
          
          (org.medlemsData || []).forEach((member: any) => {
            // Try multiple sources for dates
            const validFrom = member.periode?.gyldigFra || org.periode?.gyldigFra || deltagelse.periode?.gyldigFra;
            const validTo = member.periode?.gyldigTil || org.periode?.gyldigTil || deltagelse.periode?.gyldigTil;
            
            const role: any = {
              type: orgName,
              validFrom: validFrom,
              validTo: validTo
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

      // Prioritize nyesteNavn (current name) over old names in navne array
      const companyName = company.virksomhedMetadata?.nyesteNavn?.navn || company.navne?.[company.navne?.length - 1]?.navn || 'Ukendt virksomhed';
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
          ? parseInt(deltagerEnhedsNummer?.toString() || '0') === parseInt(enhedsNummer.toString())
          : deltagerNavn.toLowerCase().includes((personName || '').toLowerCase());
          
        if (isMatch) {
          const isActive = !rel.periode?.gyldigTil || new Date(rel.periode.gyldigTil) >= new Date();
          
          // Extract roles from organizations
          const roles: any[] = [];
          (rel.organisationer || []).forEach((org: any) => {
            const orgType = org.hovedtype || '';
            const orgName = org.organisationsNavn?.[0]?.navn || '';
            
            (org.medlemsData || []).forEach((member: any) => {
              // Try multiple sources for dates
              const validFrom = member.periode?.gyldigFra || rel.periode?.gyldigFra || org.periode?.gyldigFra;
              const validTo = member.periode?.gyldigTil || rel.periode?.gyldigTil || org.periode?.gyldigTil;
              
              const role: any = {
                type: orgName || orgType,
                validFrom: validFrom,
                validTo: validTo
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
      address: personAddress,
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

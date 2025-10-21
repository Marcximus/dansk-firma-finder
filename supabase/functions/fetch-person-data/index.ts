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
    const { personName, enhedsNummer } = await req.json();
    
    console.log('Received person data request for:', { personName, enhedsNummer });
    
    if (!personName && !enhedsNummer) {
      console.error('No person name or ID provided');
      return new Response(
        JSON.stringify({ error: 'Person name or enhedsNummer is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');

    if (!username || !password) {
      console.error('API credentials not configured');
      throw new Error('Danish Business API credentials not configured');
    }

    console.log('API credentials OK, starting search...');

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
      console.log('Using ID-based search with enhedsNummer:', enhedsNummer);
      searchMethod = 'id';
      const idQuery = buildPersonIdQuery(enhedsNummer);
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
      
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        searchResults = result.hits?.hits || [];
        console.log(`ID-based search found ${searchResults.length} results`);
      } else {
        console.error('ID-based search failed:', await apiResponse.text());
      }
    }
    
    // Fallback to name-based search if ID search failed or no ID provided
    if (searchResults.length === 0 && personName) {
      // Try 1: Exact match
      console.log('Attempting exact match search...');
      searchMethod = 'exact';
      const exactQuery = buildPersonSearchQuery(personName, false);
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
      
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        searchResults = result.hits?.hits || [];
        console.log(`Exact match found ${searchResults.length} results`);
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

    console.log(`Processing ${searchResults.length} companies`);

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

    console.log(`Total unique companies found: ${companiesMap.size}`);
    
    // Convert to arrays
    const allRelations = Array.from(companiesMap.values());
    const activeRelations = allRelations.filter(rel => !rel.validTo);
    const historicalRelations = allRelations.filter(rel => rel.validTo);
    
    console.log(`Active relations: ${activeRelations.length}, Historical: ${historicalRelations.length}`);
    
    return new Response(
      JSON.stringify({
        personName: personName || 'Ukendt',
        personId: enhedsNummer || null,
        activeRelations,
        historicalRelations,
        totalCompanies: companiesMap.size,
        searchMethod
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in fetch-person-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

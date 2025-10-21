import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to build search query with fuzzy matching
const buildPersonSearchQuery = (personName: string, fuzzy: boolean = false) => {
  if (fuzzy) {
    return {
      "_source": [
        "Vrvirksomhed.cvrNummer",
        "Vrvirksomhed.navne",
        "Vrvirksomhed.virksomhedsstatus",
        "Vrvirksomhed.deltagerRelation"
      ],
      "query": {
        "nested": {
          "path": "Vrvirksomhed.deltagerRelation",
          "query": {
            "bool": {
              "must": [
                {
                  "nested": {
                    "path": "Vrvirksomhed.deltagerRelation.deltager",
                    "query": {
                      "nested": {
                        "path": "Vrvirksomhed.deltagerRelation.deltager.navne",
                        "query": {
                          "bool": {
                            "should": [
                              {
                                "match": {
                                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                    "query": personName,
                                    "fuzziness": "AUTO",
                                    "operator": "and"
                                  }
                                }
                              },
                              {
                                "wildcard": {
                                  "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                    "value": `*${personName.toLowerCase()}*`,
                                    "case_insensitive": true
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
              ]
            }
          }
        }
      },
      "size": 100
    };
  }
  
  // Exact match query (original)
  return {
    "_source": [
      "Vrvirksomhed.cvrNummer",
      "Vrvirksomhed.navne",
      "Vrvirksomhed.virksomhedsstatus",
      "Vrvirksomhed.deltagerRelation"
    ],
    "query": {
      "nested": {
        "path": "Vrvirksomhed.deltagerRelation",
        "query": {
          "bool": {
            "must": [
              {
                "nested": {
                  "path": "Vrvirksomhed.deltagerRelation.deltager",
                  "query": {
                    "nested": {
                      "path": "Vrvirksomhed.deltagerRelation.deltager.navne",
                      "query": {
                        "bool": {
                          "should": [
                            {
                              "match_phrase": {
                                "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                  "query": personName,
                                  "boost": 10
                                }
                              }
                            },
                            {
                              "match": {
                                "Vrvirksomhed.deltagerRelation.deltager.navne.navn": {
                                  "query": personName,
                                  "operator": "and",
                                  "boost": 5
                                }
                              }
                            }
                          ],
                          "minimum_should_match": 1
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      },
      "size": 100,
      "sort": [
        { "_score": { "order": "desc" } }
      ]
    };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personName } = await req.json();
    console.log('[FETCH-PERSON-DATA] Request received for person:', personName);

    if (!personName) {
      console.error('[FETCH-PERSON-DATA] No person name provided');
      return new Response(
        JSON.stringify({ error: 'Person name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');

    if (!username || !password) {
      console.error('[FETCH-PERSON-DATA] API credentials not configured');
      throw new Error('Danish Business API credentials not configured');
    }

    console.log('[FETCH-PERSON-DATA] API credentials OK, searching for:', personName);

    const authString = btoa(`${username}:${password}`);
    const apiUrl = 'http://distribution.virk.dk:80/cvr-permanent/virksomhed/_search';

    // Try exact match first
    let searchQuery = buildPersonSearchQuery(personName, false);
    console.log('[FETCH-PERSON-DATA] Trying exact match search');
    
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FETCH-PERSON-DATA] API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    let data = await response.json();
    let hits = data.hits?.hits || [];
    
    console.log('[FETCH-PERSON-DATA] Exact match results:', hits.length);

    // If no results, try fuzzy matching
    if (hits.length === 0) {
      console.log('[FETCH-PERSON-DATA] No exact matches, trying fuzzy search');
      searchQuery = buildPersonSearchQuery(personName, true);
      
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchQuery),
      });

      if (response.ok) {
        data = await response.json();
        hits = data.hits?.hits || [];
        console.log('[FETCH-PERSON-DATA] Fuzzy match results:', hits.length);
      }
    }

    // If still no results, try first + last name only
    if (hits.length === 0) {
      const nameParts = personName.trim().split(/\s+/);
      if (nameParts.length > 2) {
        const firstLastName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
        console.log('[FETCH-PERSON-DATA] Trying first+last name only:', firstLastName);
        
        searchQuery = buildPersonSearchQuery(firstLastName, false);
        
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchQuery),
        });

        if (response.ok) {
          data = await response.json();
          hits = data.hits?.hits || [];
          console.log('[FETCH-PERSON-DATA] First+last name results:', hits.length);
        }
      }
    }

    const activeRelations: any[] = [];
    const historicalRelations: any[] = [];

    console.log('[FETCH-PERSON-DATA] Processing', hits.length, 'companies');

    // Process each company where the person has relations
    hits.forEach((hit: any) => {
      const company = hit._source?.Vrvirksomhed;
      if (!company) return;

      const companyName = company.navne?.[0]?.navn || 'Ukendt virksomhed';
      const companyCvr = company.cvrNummer?.toString() || '';
      const companyStatus = company.virksomhedsstatus?.[0]?.status || 'Ukendt';

      // Find all relations for this person in this company
      const relations = company.deltagerRelation || [];
      
      relations.forEach((rel: any) => {
        // Check if this relation is for our person
        const deltagerNavn = rel.deltager?.navne?.[0]?.navn || '';
        if (deltagerNavn.toLowerCase().includes(personName.toLowerCase())) {
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
          
          const relationData = {
            companyName,
            companyCvr,
            companyStatus,
            roles
          };
          
          if (isActive) {
            activeRelations.push(relationData);
          } else {
            historicalRelations.push(relationData);
          }
        }
      });
    });

    const result = {
      personName,
      activeRelations,
      historicalRelations,
      totalCompanies: activeRelations.length + historicalRelations.length
    };

    console.log('[FETCH-PERSON-DATA] Returning results:', {
      personName,
      activeRelations: result.activeRelations.length,
      historicalRelations: result.historicalRelations.length,
      totalCompanies: result.totalCompanies
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[FETCH-PERSON-DATA] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

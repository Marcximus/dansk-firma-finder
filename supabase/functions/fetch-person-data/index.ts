import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personName } = await req.json();
    console.log('Fetching person data for:', personName);

    if (!personName) {
      throw new Error('Person name is required');
    }

    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');

    if (!username || !password) {
      throw new Error('Danish Business API credentials not configured');
    }

    const authString = btoa(`${username}:${password}`);
    const today = new Date().toISOString().split('T')[0];

    // Build query to find all companies where this person has relations
    const searchQuery = {
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
        }
      },
      "size": 100,
      "sort": [
        { "_score": { "order": "desc" } }
      ]
    };

    console.log('Searching with query:', JSON.stringify(searchQuery, null, 2));

    const apiUrl = 'http://distribution.virk.dk:80/cvr-permanent/virksomhed/_search';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    const hits = data.hits?.hits || [];
    const activeRelations: any[] = [];
    const historicalRelations: any[] = [];

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

    console.log('Processed result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-person-data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

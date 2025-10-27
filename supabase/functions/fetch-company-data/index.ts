
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { buildSearchQuery } from "./helpers/query-builder.ts"
import { determineLegalForm } from "./helpers/legal-form-detector.ts"
import { determineStatus } from "./helpers/status-detector.ts"
import { transformCompanyData } from "./helpers/company-transformer.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fetch detailed participant data from deltager endpoint and enrich with medlemsData
async function enrichWithParticipantData(companyData: any, auth: string) {
  if (!companyData.hits?.hits?.[0]?._source?.Vrvirksomhed?.deltagerRelation) {
    console.log('[INFO] No deltagerRelation found, skipping participant enrichment');
    return companyData;
  }

  const deltagerRelation = companyData.hits.hits[0]._source.Vrvirksomhed.deltagerRelation;
  const companyData_cvrNummer = companyData.hits.hits[0]._source.Vrvirksomhed?.cvrNummer;
  
  console.log(`[INFO] Enriching ${deltagerRelation.length} participants with detailed data and medlemsData IN PARALLEL`);

  // Enrich all participants in parallel using Promise.all
  const enrichmentPromises = deltagerRelation.map(async (relation) => {
    const enhedsNummer = relation.deltager?.enhedsNummer;
    
    console.log('[DEBUG] Processing relation:', {
      hasEnhedsNummer: !!enhedsNummer,
      enhedstype: relation.deltager?.enhedstype,
      deltagerKeys: relation.deltager ? Object.keys(relation.deltager) : [],
      enhedsNummer: enhedsNummer
    });
    
    if (!enhedsNummer) {
      console.log('[WARN] Skipping relation without enhedsNummer');
      return relation;
    }

    try {
      const deltagerQuery = {
        "query": {
          "bool": {
            "must": [
              { "term": { "Vrdeltagerperson.enhedsNummer": parseInt(enhedsNummer) } }
            ]
          }
        },
        "size": 1
      };

      const deltagerResponse = await fetch('http://distribution.virk.dk/cvr-permanent/deltager/_search', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deltagerQuery)
      });

      if (deltagerResponse.ok) {
        const deltagerData = await deltagerResponse.json();
        const vrdeltagerperson = deltagerData.hits?.hits?.[0]?._source?.Vrdeltagerperson;
        
        if (vrdeltagerperson) {
          console.log(`[SUCCESS] Enriched participant ${enhedsNummer}`);
          
          // Extract medlemsData for this specific company from virksomhedSummariskRelation
          let medlemsDataForCompany = null;
          
          if (vrdeltagerperson.virksomhedSummariskRelation && companyData_cvrNummer) {
            const companyRelation = vrdeltagerperson.virksomhedSummariskRelation.find(
              (rel: any) => rel.virksomhed?.cvrNummer === companyData_cvrNummer
            );
            
            if (companyRelation?.organisationer) {
              // Find the organization that matches the relation's hovedtype
              const matchingOrg = companyRelation.organisationer.find((org: any) => {
                return relation.organisationer?.some((relOrg: any) => 
                  relOrg.hovedtype === org.hovedtype
                );
              });
              
              if (matchingOrg?.medlemsData) {
                medlemsDataForCompany = matchingOrg.medlemsData[0]; // Take first medlemsData
                console.log(`[INFO] Found medlemsData for participant ${enhedsNummer} in company ${companyData_cvrNummer}`);
              }
            }
          }
          
          return {
            ...relation,
            _enrichedDeltagerData: vrdeltagerperson,
            _medlemsData: medlemsDataForCompany // Add medlemsData to relation
          };
        } else {
          return relation;
        }
      } else {
        console.log(`[WARN] Failed to fetch participant ${enhedsNummer}: ${deltagerResponse.status}`);
        return relation;
      }
    } catch (error) {
      console.error(`[ERROR] Error fetching participant ${enhedsNummer}:`, error.message);
      return relation;
    }
  });

  // Wait for all enrichments to complete
  const enrichedParticipants = await Promise.all(enrichmentPromises);

  // Replace deltagerRelation with enriched data
  companyData.hits.hits[0]._source.Vrvirksomhed.deltagerRelation = enrichedParticipants;
  
  console.log('[DEBUG] After enrichment, sample deltager:', {
    count: enrichedParticipants.length,
    sample: enrichedParticipants[0] ? {
      hasEnhedsNummer: !!enrichedParticipants[0].deltager?.enhedsNummer,
      enhedstype: enrichedParticipants[0].deltager?.enhedstype,
      hasEnrichedData: !!enrichedParticipants[0]._enrichedDeltagerData,
      hasMlemsData: !!enrichedParticipants[0]._medlemsData
    } : null
  });
  
  return companyData;
}

// Fetch production units for a company
async function fetchProductionUnits(cvr: string, auth: string) {
  console.log(`[INFO] Fetching production units for CVR ${cvr}`);
  
  try {
    const productionUnitQuery = {
      "query": {
        "bool": {
          "must": [
            { "term": { "VrproduktionsEnhed.virksomhedMetadata.nyesteVirksomhed.cvrNummer": parseInt(cvr) } }
          ]
        }
      },
      "size": 100
    };

    const response = await fetch('http://distribution.virk.dk/cvr-permanent/produktionsenhed/_search', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productionUnitQuery)
    });

    if (!response.ok) {
      console.error(`[ERROR] Failed to fetch production units: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const units = data.hits?.hits?.map((hit: any) => hit._source?.VrproduktionsEnhed) || [];
    console.log(`[SUCCESS] Found ${units.length} production units`);
    return units;
  } catch (error) {
    console.error('[ERROR] Error fetching production units:', error.message);
    return [];
  }
}

serve(async (req) => {
  console.log('[STARTUP] fetch-company-data edge function loaded - version with deltagerRelation & virksomhedsRelation');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { cvr, companyName, personName } = requestBody;
    
    // Validate inputs
    if (!cvr && !companyName && !personName) {
      return new Response(
        JSON.stringify({ error: 'Either CVR, company name, or person name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (cvr && (!/^\d{8}$/.test(cvr))) {
      return new Response(
        JSON.stringify({ error: 'CVR must be exactly 8 digits' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (companyName && (typeof companyName !== 'string' || companyName.trim().length === 0 || companyName.length > 200)) {
      return new Response(
        JSON.stringify({ error: 'Company name must be between 1 and 200 characters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (personName && (typeof personName !== 'string' || personName.trim().length === 0 || personName.length > 200)) {
      return new Response(
        JSON.stringify({ error: 'Person name must be between 1 and 200 characters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');
    
    if (!username || !password) {
      console.error('[ERROR] API credentials not configured');
      throw new Error('Service configuration error');
    }

    // Create basic auth header
    const auth = btoa(`${username}:${password}`);
    const searchQuery = buildSearchQuery(cvr, companyName, personName);
    
    // Log what fields we're requesting from the API
    console.log('[DEBUG] Query _source fields:', searchQuery._source);
    console.log('[DEBUG] Requesting deltagerRelation?', searchQuery._source?.includes('Vrvirksomhed.deltagerRelation'));
    console.log('[DEBUG] Requesting virksomhedsRelation?', searchQuery._source?.includes('Vrvirksomhed.virksomhedsRelation'));
    
    const searchUrl = 'http://distribution.virk.dk/cvr-permanent/virksomhed/_search';

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    });

    if (!response.ok) {
      console.error(`[ERROR] External API request failed: ${response.status}`);
      throw new Error('Failed to fetch company data');
    }

    const data = await response.json();
    
    // Log what we received from the API
    console.log('[DEBUG] API Response hits:', data.hits?.hits?.length);
    if (data.hits?.hits?.[0]?._source) {
      const source = data.hits.hits[0]._source;
      console.log('[DEBUG] Full CVR Data keys:', Object.keys(source));
      console.log('[DEBUG] Has Vrvirksomhed?', !!source.Vrvirksomhed);
      console.log('[DEBUG] Has deltagerRelation?', !!source.Vrvirksomhed?.deltagerRelation);
      console.log('[DEBUG] deltagerRelation count:', source.Vrvirksomhed?.deltagerRelation?.length || 0);
      console.log('[DEBUG] Has virksomhedsRelation?', !!source.Vrvirksomhed?.virksomhedsRelation);
      console.log('[DEBUG] virksomhedsRelation count:', source.Vrvirksomhed?.virksomhedsRelation?.length || 0);
    }

    // Step 2: Fetch detailed participant data for owners
    const enrichedData = await enrichWithParticipantData(data, auth);
    
    // Step 3: Fetch production units if searching by CVR
    let productionUnits = [];
    if (cvr && enrichedData.hits?.hits?.[0]?._source) {
      productionUnits = await fetchProductionUnits(cvr, auth);
    }

    // Transform the API response to match our Company interface
    const companies = enrichedData.hits?.hits?.map((hit: any) => {
      const transformedCompany = transformCompanyData(hit, determineLegalForm, determineStatus, companyName);
      return {
        ...transformedCompany,
        _debugScore: hit._score
      };
    }) || [];
    
    return new Response(
      JSON.stringify({ 
        companies,
        // Also return the full data for the first result (useful for detailed view)
        fullCvrData: enrichedData.hits?.hits?.[0]?._source,
        productionUnits,
        _debug: {
          totalHits: enrichedData.hits?.total,
          maxScore: enrichedData.hits?.max_score,
          searchQuery: personName || companyName || cvr,
          searchType: personName ? 'person' : (cvr ? 'cvr' : 'company'),
          hasDeltagerRelation: !!enrichedData.hits?.hits?.[0]?._source?.Vrvirksomhed?.deltagerRelation,
          hasVirksomhedsRelation: !!enrichedData.hits?.hits?.[0]?._source?.Vrvirksomhed?.virksomhedsRelation,
          hasEnrichedParticipants: !!enrichedData.hits?.hits?.[0]?._source?.Vrvirksomhed?.deltagerRelation?.some((r: any) => r._enrichedDeltagerData),
          productionUnitsCount: productionUnits.length
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[ERROR]', {
      function: 'fetch-company-data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch company data. Please try again.',
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

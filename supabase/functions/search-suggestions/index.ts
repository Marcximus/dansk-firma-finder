import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEARCH-SUGGESTIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { query } = await req.json();
    
    if (!query || query.length < 2) {
      logStep("Query too short", { query, length: query?.length });
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("Processing query", { query });
    
    const username = Deno.env.get("DANISH_BUSINESS_API_USERNAME");
    const password = Deno.env.get("DANISH_BUSINESS_API_PASSWORD");
    
    if (!username || !password) {
      throw new Error("Danish Business API credentials not configured");
    }
    
    const credentials = btoa(`${username}:${password}`);
    
    // Use a simplified search for suggestions - just get company names
    const apiUrl = `https://distribution.virk.dk/cvr-permanent/virksomhed/_search`;
    
    const searchBody = {
      "from": 0,
      "size": 5, // Limit to 5 suggestions
      "query": {
        "bool": {
          "must": [
            {
              "multi_match": {
                "query": query,
                "fields": [
                  "Vrvirksomhed.navne.navn^3",
                  "Vrvirksomhed.virksomhedMetadata.sammensatStatus"
                ],
                "type": "best_fields",
                "fuzziness": "AUTO"
              }
            }
          ],
          "filter": [
            {
              "term": {
                "Vrvirksomhed.virksomhedMetadata.sammensatStatus": "AKTIV"
              }
            }
          ]
        }
      },
      "_source": [
        "Vrvirksomhed.cvrNummer",
        "Vrvirksomhed.navne",
        "Vrvirksomhed.beliggenhedsadresse"
      ]
    };
    
    logStep("Making API request to Danish Business Authority");
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchBody)
    });
    
    logStep("API response status", { status: response.status, ok: response.ok });
    
    if (!response.ok) {
      const errorText = await response.text();
      logStep("API request failed", { 
        status: response.status, 
        statusText: response.statusText,
        errorBody: errorText.substring(0, 500) // Log first 500 chars of error
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    logStep("API response received", { 
      totalHits: data.hits?.total?.value || 0,
      actualHits: data.hits?.hits?.length || 0,
      hasData: !!data
    });
    
    // Process suggestions using same logic as main search
    const suggestions = (data.hits?.hits || []).map((hit: any, index: number) => {
      logStep(`Processing hit ${index}`, { hit: JSON.stringify(hit).substring(0, 200) });
      
      const virksomhed = hit._source?.Vrvirksomhed;
      if (!virksomhed) {
        logStep(`No Vrvirksomhed found in hit ${index}`);
        return null;
      }
      
      // Get the current/active name (where gyldigTil is null) or the most recent name
      const currentName = virksomhed.navne?.find((n: any) => n.periode?.gyldigTil === null);
      const navn = currentName?.navn || virksomhed.navne?.[virksomhed.navne?.length - 1]?.navn;
      
      // Get the current/active address (where gyldigTil is null) or the most recent address
      const currentAddress = virksomhed.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
      const primaryAddress = currentAddress || virksomhed.beliggenhedsadresse?.[virksomhed.beliggenhedsadresse?.length - 1];
      
      const cvr = virksomhed.cvrNummer;
      const kommune = primaryAddress?.postdistrikt || '';
      
      logStep(`Extracted data for hit ${index}`, { navn, cvr, kommune });
      
      if (!navn || !cvr) {
        logStep(`Missing navn or cvr for hit ${index}`, { navn, cvr });
        return null;
      }
      
      return {
        name: navn,
        cvr: cvr.toString().padStart(8, '0'),
        city: kommune || '',
        displayText: kommune ? `${navn} - ${kommune}` : navn
      };
    }).filter(Boolean);
    
    logStep("Processed suggestions", { count: suggestions.length, suggestions });
    
    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in search-suggestions", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      suggestions: []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
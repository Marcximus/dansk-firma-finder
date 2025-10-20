import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to parse XBRL/XML and extract financial data
const parseXBRL = (xmlContent: string, period: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, "text/xml");
    
    if (!doc) {
      console.error('Failed to parse XML document');
      return null;
    }

    // Helper to extract numeric value from XML element
    const extractValue = (selectors: string[]): number | null => {
      for (const selector of selectors) {
        const elements = doc.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent?.trim();
          if (text) {
            // Remove any non-numeric characters except minus and decimal point
            const numericText = text.replace(/[^\d.-]/g, '');
            const value = parseFloat(numericText);
            if (!isNaN(value)) {
              return value;
            }
          }
        }
      }
      return null;
    };

    // Extract financial KPIs with multiple possible tag names (Danish and English)
    const financialData = {
      periode: period,
      nettoomsaetning: extractValue([
        'Revenue', 'Nettoomsætning', 'NetRevenue', 'Omsætning',
        'fsa\\:Revenue', 'fsa\\:Nettoomsætning'
      ]),
      bruttofortjeneste: extractValue([
        'GrossProfit', 'GrossResult', 'Bruttofortjeneste', 'Bruttoavance',
        'fsa\\:GrossProfit', 'fsa\\:Bruttofortjeneste'
      ]),
      aaretsResultat: extractValue([
        'ProfitLoss', 'NetIncome', 'ÅretsResultat', 'Resultat',
        'fsa\\:ProfitLoss', 'fsa\\:ÅretsResultat'
      ]),
      egenkapital: extractValue([
        'Equity', 'Egenkapital', 'ShareholdersEquity',
        'fsa\\:Equity', 'fsa\\:Egenkapital'
      ]),
      statusBalance: extractValue([
        'Assets', 'TotalAssets', 'AktiverIAlt', 'Balance',
        'fsa\\:Assets', 'fsa\\:AktiverIAlt'
      ])
    };

    // Check if we got at least some data
    const hasData = Object.values(financialData).some(v => v !== null && v !== period);
    
    if (hasData) {
      console.log(`✅ Successfully parsed financial data for period ${period}:`, financialData);
      return financialData;
    } else {
      console.log(`⚠️ No financial data found in XBRL for period ${period}`);
      return null;
    }
    
  } catch (error) {
    console.error('Error parsing XBRL:', error);
    return null;
  }
};

serve(async (req) => {
  console.log('[STARTUP] fetch-financial-data edge function - XBRL parser version');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvr } = await req.json();
    
    if (!cvr) {
      return new Response(
        JSON.stringify({ error: 'CVR number is required', financialReports: [], financialData: [] }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate CVR format (must be exactly 8 digits)
    if (!/^\d{8}$/.test(cvr)) {
      return new Response(
        JSON.stringify({ error: 'CVR must be exactly 8 digits', financialReports: [], financialData: [] }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');
    
    console.log('API Credentials check:', {
      username: username ? `${username.substring(0, 3)}***` : 'NOT SET',
      password: password ? '***SET***' : 'NOT SET'
    });
    
    if (!username || !password) {
      console.log('Danish Business API credentials not configured');
      return new Response(
        JSON.stringify({ 
          financialReports: [],
          financialData: [],
          error: 'API credentials not configured'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Create basic auth header
    const auth = btoa(`${username}:${password}`);
    
    // Step 1: Search for financial reports using POST with Elasticsearch query
    const searchUrl = 'https://distribution.virk.dk/offentliggoerelser/_search';
    
    // Build Elasticsearch query according to Danish Business Authority documentation
    const searchQuery = {
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "cvrNummer": parseInt(cvr)
              }
            }
          ]
        }
      },
      "size": 5,
      "sort": [
        {
          "offentliggoerelsesTidspunkt": {
            "order": "desc"
          }
        }
      ]
    };

    console.log(`[STEP 1] Searching for financial reports with POST: ${searchUrl}`);
    console.log('[STEP 1] Query:', JSON.stringify(searchQuery));

    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    });

    if (!searchResponse.ok) {
      console.error(`Financial API request failed: ${searchResponse.status} ${searchResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          financialReports: [],
          financialData: [],
          error: `API request failed: ${searchResponse.status}`
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const searchData = await searchResponse.json();
    console.log(`[STEP 1] Found ${searchData.hits?.hits?.length || 0} financial reports`);

    // Step 2: Download and parse XBRL files
    const financialReports = [];
    const financialData = [];

    for (const hit of (searchData.hits?.hits || [])) {
      const source = hit._source;
      const period = source.regnskabsperiode || source.periode || 'N/A';
      
      // Build report metadata
      const reportMetadata = {
        period,
        publishDate: source.offentliggoerelsesTidspunkt ? 
          new Date(source.offentliggoerelsesTidspunkt).toLocaleDateString('da-DK') : 'N/A',
        approvalDate: source.indlaesningsTidspunkt ? 
          new Date(source.indlaesningsTidspunkt).toLocaleDateString('da-DK') : 'N/A',
        documentUrl: null,
        documentGuid: null,
        documentType: source.dokumenttype || 'Årsrapport',
        companyName: source.navne?.[0] || source.virksomhedsnavn || 'N/A'
      };

      // Try to find document URL/GUID
      let documentUrl = null;
      
      // Check for dokumentUrl directly in source
      if (source.dokumentUrl) {
        documentUrl = source.dokumentUrl;
        reportMetadata.documentUrl = documentUrl;
      } 
      // Check for dokument array
      else if (source.dokument && source.dokument.length > 0) {
        const doc = source.dokument[0];
        if (doc.dokumentUrl) {
          documentUrl = doc.dokumentUrl;
          reportMetadata.documentUrl = documentUrl;
        } else if (doc.id || doc.guid) {
          const guid = doc.id || doc.guid;
          documentUrl = `https://distribution.virk.dk/offentliggoerelser/${guid}`;
          reportMetadata.documentGuid = guid;
          reportMetadata.documentUrl = documentUrl;
        }
      }
      // Check for _id from the hit itself
      else if (hit._id) {
        documentUrl = `https://distribution.virk.dk/offentliggoerelser/${hit._id}`;
        reportMetadata.documentGuid = hit._id;
        reportMetadata.documentUrl = documentUrl;
      }

      financialReports.push(reportMetadata);

      // Step 3: Download and parse XBRL file if we have a URL
      if (documentUrl) {
        console.log(`[STEP 2] Downloading XBRL file for period ${period}: ${documentUrl}`);
        
        try {
          const xbrlResponse = await fetch(documentUrl, {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Accept': 'application/xml, text/xml, */*',
            },
          });

          if (xbrlResponse.ok) {
            const xbrlContent = await xbrlResponse.text();
            console.log(`[STEP 2] Downloaded XBRL file (${xbrlContent.length} bytes)`);
            
            // Parse XBRL
            console.log(`[STEP 3] Parsing XBRL for period ${period}...`);
            const parsedData = parseXBRL(xbrlContent, period);
            
            if (parsedData) {
              financialData.push(parsedData);
            }
          } else {
            console.warn(`Failed to download XBRL: ${xbrlResponse.status} - ${documentUrl}`);
          }
        } catch (error) {
          console.error(`Error downloading/parsing XBRL for ${period}:`, error);
        }
      } else {
        console.warn(`No document URL found for period ${period}`);
      }
    }

    console.log(`[RESULT] Returning ${financialReports.length} report metadata and ${financialData.length} parsed financial datasets`);

    return new Response(
      JSON.stringify({ 
        financialReports,
        financialData,
        hasRealData: financialData.length > 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching financial data:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        financialReports: [],
        financialData: []
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

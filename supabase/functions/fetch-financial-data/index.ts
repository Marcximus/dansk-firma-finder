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

    // Helper to extract numeric value from XML element - supports ÅRL and ESEF taxonomy
    const extractValue = (selectors: string[]): number | null => {
      for (const selector of selectors) {
        // Try multiple methods to find elements
        let elements = doc.querySelectorAll(selector);
        
        // If not found, try case-insensitive search
        if (elements.length === 0) {
          const lowerSelector = selector.toLowerCase();
          elements = doc.querySelectorAll(`[name*="${lowerSelector}" i]`);
        }
        
        for (const element of elements) {
          const text = element.textContent?.trim();
          if (text) {
            // Remove any non-numeric characters except minus and decimal point
            const numericText = text.replace(/[^\d.-]/g, '');
            const value = parseFloat(numericText);
            if (!isNaN(value)) {
              console.log(`✅ Found ${selector}: ${value}`);
              return value;
            }
          }
        }
      }
      return null;
    };

    // Extract financial KPIs - ÅRL taxonomy uses gsd: prefix for most fields
    const financialData = {
      periode: period,
      // Income Statement - try ÅRL taxonomy (gsd:) and legacy names
      nettoomsaetning: extractValue([
        'gsd\\:Revenue', 'Revenue', 'Nettoomsætning', 'NetRevenue', 'Omsætning',
        'fsa\\:Revenue', 'fsa\\:Nettoomsætning', 'cmn\\:Revenue'
      ]),
      bruttofortjeneste: extractValue([
        'gsd\\:GrossProfit', 'GrossProfit', 'GrossResult', 'Bruttofortjeneste', 'Bruttoavance',
        'fsa\\:GrossProfit', 'fsa\\:Bruttofortjeneste', 'cmn\\:GrossProfit'
      ]),
      driftsresultat: extractValue([
        'gsd\\:ProfitLossFromOperatingActivities', 'ProfitLossFromOperatingActivities', 
        'OperatingProfitLoss', 'Driftsresultat', 'EBIT',
        'fsa\\:ProfitLossFromOperatingActivities', 'fsa\\:Driftsresultat', 'cmn\\:EBIT'
      ]),
      resultatFoerSkat: extractValue([
        'gsd\\:ProfitLossBeforeTax', 'ProfitLossBeforeTax', 'ResultatFørSkat', 'ProfitBeforeTax',
        'fsa\\:ProfitLossBeforeTax', 'fsa\\:ResultatFørSkat', 'cmn\\:ProfitLossBeforeTax'
      ]),
      aaretsResultat: extractValue([
        'gsd\\:ProfitLoss', 'ProfitLoss', 'NetIncome', 'ÅretsResultat', 'Resultat',
        'fsa\\:ProfitLoss', 'fsa\\:ÅretsResultat', 'cmn\\:ProfitLoss'
      ]),
      // Balance Sheet - ÅRL taxonomy (gsd:) fields
      anlaegsaktiverValue: extractValue([
        'gsd\\:NoncurrentAssets', 'NoncurrentAssets', 'Anlægsaktiver', 'FixedAssets', 'LongtermAssets',
        'fsa\\:NoncurrentAssets', 'fsa\\:Anlægsaktiver', 'cmn\\:NoncurrentAssets'
      ]),
      omsaetningsaktiver: extractValue([
        'gsd\\:CurrentAssets', 'CurrentAssets', 'Omsætningsaktiver', 'ShorttermAssets',
        'fsa\\:CurrentAssets', 'fsa\\:Omsætningsaktiver', 'cmn\\:CurrentAssets'
      ]),
      egenkapital: extractValue([
        'gsd\\:Equity', 'Equity', 'Egenkapital', 'ShareholdersEquity',
        'fsa\\:Equity', 'fsa\\:Egenkapital', 'cmn\\:Equity'
      ]),
      hensatteForpligtelser: extractValue([
        'gsd\\:Provisions', 'Provisions', 'HensatteForpligtelser', 'ProvisionsForLiabilities',
        'fsa\\:Provisions', 'fsa\\:HensatteForpligtelser', 'cmn\\:Provisions'
      ]),
      gaeldsforpligtelser: extractValue([
        'gsd\\:Liabilities', 'Liabilities', 'Gældsforpligtelser', 'ShortTermLiabilities', 'LongTermLiabilities',
        'fsa\\:Liabilities', 'fsa\\:Gældsforpligtelser', 'cmn\\:Liabilities'
      ]),
      kortfristetGaeld: extractValue([
        'gsd\\:ShorttermLiabilitiesOtherThanProvisions', 'ShorttermLiabilitiesOtherThanProvisions', 
        'KortfristetGæld', 'CurrentLiabilities',
        'fsa\\:ShorttermLiabilitiesOtherThanProvisions', 'fsa\\:KortfristetGæld', 
        'cmn\\:CurrentLiabilities'
      ]),
      statusBalance: extractValue([
        'gsd\\:Assets', 'Assets', 'TotalAssets', 'AktiverIAlt', 'Balance',
        'fsa\\:Assets', 'fsa\\:AktiverIAlt', 'cmn\\:Assets'
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
    
    // Build Elasticsearch query using official documentation pattern
    // The dokumenter.dokumentMimeType field is tokenized, so "application/xml" becomes ["application", "xml"]
    // This allows us to match both tokens with separate term filters
    const searchQuery = {
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "cvrNummer": parseInt(cvr)
              }
            },
            {
              "term": {
                "dokumenter.dokumentMimeType": "application"
              }
            },
            {
              "term": {
                "dokumenter.dokumentMimeType": "xml"
              }
            }
          ]
        }
      },
      "size": 10,
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
    console.log('[STEP 1] Request details:', {
      hasAuth: !!auth,
      cvrParsed: parseInt(cvr),
      queryType: 'tokenized term filters (official pattern)',
      filters: ['application', 'xml']
    });

    // Add timeout protection for main API request
    const SEARCH_TIMEOUT_MS = 30000;
    const searchController = new AbortController();
    const searchTimeoutId = setTimeout(() => searchController.abort(), SEARCH_TIMEOUT_MS);

    let searchResponse;
    try {
      console.log('[STEP 1.5] Sending search request to Danish Business API...');
      searchResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate'
        },
        body: JSON.stringify(searchQuery),
        signal: searchController.signal
      });
      clearTimeout(searchTimeoutId);
      console.log(`[STEP 2] Search API response status: ${searchResponse.status}`);
    } catch (fetchError) {
      clearTimeout(searchTimeoutId);
      if (fetchError.name === 'AbortError') {
        console.error(`[ERROR] Search request timed out after ${SEARCH_TIMEOUT_MS}ms`);
        return new Response(
          JSON.stringify({ 
            financialReports: [],
            financialData: [],
            error: 'Erhvervsstyrelsens API er i øjeblikket langsom eller utilgængelig. Prøv igen senere.',
            fallbackToMockData: true
          }),
          { 
            status: 504,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      console.error('[ERROR] Search request failed:', fetchError);
      return new Response(
        JSON.stringify({ 
          financialReports: [],
          financialData: [],
          error: 'Der opstod en fejl ved hentning af regnskabsdata'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error(`[ERROR] Financial API request failed: ${searchResponse.status}`);
      console.error(`[ERROR] Error response: ${errorText.substring(0, 500)}`);
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

    let searchData;
    try {
      searchData = await searchResponse.json();
      console.log(`[STEP 2] JSON parsed successfully`);
      console.log(`[STEP 2] Response structure keys:`, Object.keys(searchData));
      console.log(`[STEP 2] Found ${searchData.hits?.hits?.length || 0} financial reports`);
    } catch (jsonError) {
      console.error('[ERROR] Failed to parse JSON response:', jsonError);
      try {
        const responseText = await searchResponse.text();
        console.error('[ERROR] Raw response text:', responseText.substring(0, 500));
      } catch (textError) {
        console.error('[ERROR] Could not read response as text either');
      }
      return new Response(
        JSON.stringify({ 
          financialReports: [],
          financialData: [],
          error: 'Failed to parse API response'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!searchData.hits || !searchData.hits.hits || searchData.hits.hits.length === 0) {
      console.log('[STEP 1] No XBRL reports found - returning empty result');
      return new Response(
        JSON.stringify({ 
          financialReports: [],
          financialData: [],
          hasRealData: false,
          message: 'No XBRL financial reports found for this CVR'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

      // Try to find XBRL document URL/GUID
      let documentUrl = null;
      
      // Look for XBRL document specifically (application/xml)
      const xbrlDoc = source.dokumenter?.find((doc: any) => 
        (doc.dokumentMimeType?.toLowerCase().includes('xml') || 
         doc.dokumentType?.toLowerCase().includes('xbrl')) &&
        doc.dokumentMimeType?.toLowerCase().includes('application')
      );
      
      if (xbrlDoc) {
        if (xbrlDoc.dokumentUrl) {
          documentUrl = xbrlDoc.dokumentUrl;
          reportMetadata.documentUrl = documentUrl;
        } else if (xbrlDoc.dokumentGuid || xbrlDoc.guid) {
          const guid = xbrlDoc.dokumentGuid || xbrlDoc.guid;
          documentUrl = `https://distribution.virk.dk/dokumenter/${guid}/download`;
          reportMetadata.documentGuid = guid;
          reportMetadata.documentUrl = documentUrl;
        }
      }
      // Fallback: check for dokumentUrl directly in source
      else if (source.dokumentUrl) {
        documentUrl = source.dokumentUrl;
        reportMetadata.documentUrl = documentUrl;
      }
      // Fallback: use _id from the hit itself
      else if (hit._id) {
        documentUrl = `https://distribution.virk.dk/dokumenter/${hit._id}/download`;
        reportMetadata.documentGuid = hit._id;
        reportMetadata.documentUrl = documentUrl;
      }

      financialReports.push(reportMetadata);

      // Step 3: Download and parse XBRL file if we have a URL
      if (documentUrl) {
        console.log(`[STEP 2] Downloading XBRL file for period ${period}: ${documentUrl}`);
        
        try {
          // Add timeout protection (8 seconds per document)
          const TIMEOUT_MS = 8000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
          
          const xbrlResponse = await fetch(documentUrl, {
            headers: {
              'Authorization': `Basic ${auth}`,
              'Accept': 'application/xml, text/xml, */*',
              'Accept-Encoding': 'gzip, deflate'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

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
            console.warn(`⚠️ Failed to download XBRL: ${xbrlResponse.status} - ${documentUrl}`);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.warn(`⏱️ Timeout downloading XBRL for ${period}`);
          } else {
            console.error(`❌ Error downloading/parsing XBRL for ${period}:`, error);
          }
        }
      } else {
        console.warn(`⚠️ No XBRL document URL found for period ${period}`);
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

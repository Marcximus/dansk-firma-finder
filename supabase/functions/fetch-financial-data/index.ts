import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to extract the period end date from XBRL context
const extractPeriodFromXBRL = (xmlContent: string): string => {
  // Try to find period end date in context elements
  const endDatePattern = /<[^:]+:endDate>(\d{4}-\d{2}-\d{2})<\/[^:]+:endDate>/i;
  const match = xmlContent.match(endDatePattern);
  
  if (match && match[1]) {
    // Format as YYYY-MM for display
    const date = new Date(match[1]);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  
  // Fallback: try instant date
  const instantPattern = /<[^:]+:instant>(\d{4}-\d{2}-\d{2})<\/[^:]+:instant>/i;
  const instantMatch = xmlContent.match(instantPattern);
  
  if (instantMatch && instantMatch[1]) {
    const date = new Date(instantMatch[1]);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  
  return 'N/A';
};

// Helper function to parse XBRL/XML and extract financial data using regex
const parseXBRL = (xmlContent: string, period: string) => {
  try {
    console.log(`[XBRL Parser] Processing ${xmlContent.length} bytes for period ${period}`);
    
    // Helper to extract numeric value from XBRL tags
    // Matches: <anyprefix:TagName contextRef="..." unitRef="..." decimals="...">VALUE</anyprefix:TagName>
    const extractValue = (tagNames: string[]): number | null => {
      for (const tagName of tagNames) {
        // Create regex that matches any namespace prefix
        // Pattern: <prefix:TagName ...>NUMBER</prefix:TagName>
        const pattern = new RegExp(
          `<[^:]+:${tagName}[^>]*>\\s*([\\d.-]+)\\s*</[^:]+:${tagName}>`,
          'gi'
        );
        
        const matches = Array.from(xmlContent.matchAll(pattern));
        
        if (matches.length > 0) {
          // Take the first valid number found
          for (const match of matches) {
            const value = parseFloat(match[1]);
            if (!isNaN(value) && value !== 0) {
              console.log(`✅ Found ${tagName}: ${value}`);
              return value;
            }
          }
        }
      }
      return null;
    };

    // Extract all financial metrics
    const financialData = {
      periode: period,
      
      // Income Statement (Resultatopgørelse)
      nettoomsaetning: extractValue([
        'Revenue', 'Nettoomsætning', 'NetRevenue', 'Omsætning',
        'GrossProfitLoss', 'TotalRevenue'
      ]),
      
      bruttofortjeneste: extractValue([
        'GrossProfit', 'GrossResult', 'Bruttofortjeneste', 'Bruttoavance',
        'GrossProfitOrLoss'
      ]),
      
      driftsresultat: extractValue([
        'ProfitLossFromOperatingActivities', 'OperatingProfitLoss', 
        'Driftsresultat', 'EBIT', 'OperatingProfit'
      ]),
      
      resultatFoerSkat: extractValue([
        'ProfitLossBeforeTax', 'ResultatFørSkat', 'ProfitBeforeTax',
        'ProfitLossFromOrdinaryActivitiesBeforeTax'
      ]),
      
      aaretsResultat: extractValue([
        'ProfitLoss', 'NetIncome', 'ÅretsResultat', 'Resultat',
        'ProfitLossForYear', 'NetProfitLoss'
      ]),
      
      // Balance Sheet - Assets (Aktiver)
      anlaegsaktiverValue: extractValue([
        'NoncurrentAssets', 'Anlægsaktiver', 'FixedAssets', 
        'LongtermAssets', 'NonCurrentAssets'
      ]),
      
      omsaetningsaktiver: extractValue([
        'CurrentAssets', 'Omsætningsaktiver', 'ShorttermAssets',
        'ShortTermAssets'
      ]),
      
      statusBalance: extractValue([
        'Assets', 'TotalAssets', 'AktiverIAlt', 'Balance',
        'SumOfAssets'
      ]),
      
      // Balance Sheet - Equity & Liabilities (Passiver)
      egenkapital: extractValue([
        'Equity', 'Egenkapital', 'ShareholdersEquity',
        'TotalEquity', 'EquityAttributableToOwnersOfParent'
      ]),
      
      hensatteForpligtelser: extractValue([
        'Provisions', 'HensatteForpligtelser', 'ProvisionsForLiabilities',
        'TotalProvisions'
      ]),
      
      gaeldsforpligtelser: extractValue([
        'Liabilities', 'Gældsforpligtelser', 'TotalLiabilities',
        'LiabilitiesOtherThanProvisions'
      ]),
      
      kortfristetGaeld: extractValue([
        'ShorttermLiabilitiesOtherThanProvisions', 'KortfristetGæld', 
        'CurrentLiabilities', 'ShortTermLiabilities',
        'ShorttermDebt'
      ])
    };

    // Calculate financial ratios
    const ratios: any = {};
    
    // Soliditetsgrad (Equity Ratio): Egenkapital / Aktiver * 100
    if (financialData.egenkapital && financialData.statusBalance && financialData.statusBalance !== 0) {
      ratios.soliditetsgrad = (financialData.egenkapital / financialData.statusBalance) * 100;
      console.log(`✅ Calculated Soliditetsgrad: ${ratios.soliditetsgrad.toFixed(1)}%`);
    }
    
    // Likviditetsgrad (Liquidity Ratio): Omsætningsaktiver / Kortfristet gæld * 100
    if (financialData.omsaetningsaktiver && financialData.kortfristetGaeld && financialData.kortfristetGaeld !== 0) {
      ratios.likviditetsgrad = (financialData.omsaetningsaktiver / financialData.kortfristetGaeld) * 100;
      console.log(`✅ Calculated Likviditetsgrad: ${ratios.likviditetsgrad.toFixed(1)}%`);
    }
    
    // Afkastningsgrad (Return on Assets): Årets resultat / Aktiver * 100
    if (financialData.aaretsResultat && financialData.statusBalance && financialData.statusBalance !== 0) {
      ratios.afkastningsgrad = (financialData.aaretsResultat / financialData.statusBalance) * 100;
      console.log(`✅ Calculated Afkastningsgrad: ${ratios.afkastningsgrad.toFixed(1)}%`);
    }
    
    // Overskudsgrad (Profit Margin): Årets resultat / Omsætning * 100
    if (financialData.aaretsResultat && financialData.nettoomsaetning && financialData.nettoomsaetning !== 0) {
      ratios.overskudsgrad = (financialData.aaretsResultat / financialData.nettoomsaetning) * 100;
      console.log(`✅ Calculated Overskudsgrad: ${ratios.overskudsgrad.toFixed(1)}%`);
    }

    // Merge financial data with calculated ratios
    const result = {
      ...financialData,
      ...ratios
    };

    // Check if we extracted at least some financial data
    const hasData = Object.entries(result).some(([key, value]) => 
      key !== 'periode' && value !== null && typeof value === 'number' && !isNaN(value)
    );
    
    if (hasData) {
      console.log(`✅ Successfully parsed financial data for period ${period}`);
      console.log(`   Extracted: ${Object.keys(result).filter(k => result[k] !== null).length} fields`);
      return result;
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
    
    // Financial reports are publicly accessible - no credentials needed
    console.log('API Configuration:', {
      endpoint: 'offentliggoerelser (public announcements)',
      authentication: 'NONE - Public endpoint',
      note: 'This endpoint does not require credentials'
    });
    
    // Step 1: Search for financial reports using POST with Elasticsearch query
    const searchUrl = 'http://distribution.virk.dk/offentliggoerelser/_search';
    
    // Add date range to reduce query scope (last 2 years only for better performance)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    // Progressive query strategies - simple to complex
    // We'll try each strategy until one succeeds
    const queryStrategies = [
      {
        name: 'CVR Only (Simplest)',
        query: {
          "query": {
            "term": { "cvrNummer": parseInt(cvr) }
          },
          "size": 10,
          "sort": [{ "offentliggoerelsesTidspunkt": { "order": "desc" }}]
        }
      },
      {
        name: 'CVR + Document Type',
        query: {
          "query": {
            "bool": {
              "must": [
                { "term": { "cvrNummer": parseInt(cvr) }},
                { "term": { "dokumenttype": "AARSRAPPORT" }}
              ]
            }
          },
          "size": 10,
          "sort": [{ "offentliggoerelsesTidspunkt": { "order": "desc" }}]
        }
      },
      {
        name: 'CVR + Date Range (2 years)',
        query: {
          "query": {
            "bool": {
              "must": [
                { "term": { "cvrNummer": parseInt(cvr) }},
                { 
                  "range": { 
                    "offentliggoerelsesTidspunkt": {
                      "gte": twoYearsAgo.toISOString(),
                      "lte": new Date().toISOString()
                    }
                  }
                }
              ]
            }
          },
          "size": 10,
          "sort": [{ "offentliggoerelsesTidspunkt": { "order": "desc" }}]
        }
      },
      {
        name: 'CVR + Document Type + MIME Type (Complex)',
        query: {
          "query": {
            "bool": {
              "must": [
                { "term": { "cvrNummer": parseInt(cvr) }},
                { "term": { "dokumenttype": "AARSRAPPORT" }},
                { "term": { "dokumenter.dokumentMimeType": "application" }},
                { "term": { "dokumenter.dokumentMimeType": "xml" }}
              ]
            }
          },
          "size": 10,
          "sort": [{ "offentliggoerelsesTidspunkt": { "order": "desc" }}]
        }
      }
    ];

    console.log(`[STEP 1] Progressive query fallback with ${queryStrategies.length} strategies`);
    console.log('[STEP 1] Will try each strategy with 20s timeout until one succeeds');

    // Try each strategy until one works
    const STRATEGY_TIMEOUT_MS = 20000; // 20 seconds per strategy
    let searchResponse = null;
    let successfulStrategy = null;

    for (const strategy of queryStrategies) {
      console.log(`[STRATEGY] Trying: ${strategy.name}`);
      console.log(`[STRATEGY] Query:`, JSON.stringify(strategy.query));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), STRATEGY_TIMEOUT_MS);

      try {
        const startTime = Date.now();
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate'
        };
        // NO Authorization header - public endpoint
        
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(strategy.query),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const elapsed = Date.now() - startTime;
        
        if (response.ok) {
          console.log(`[SUCCESS] ✅ Strategy "${strategy.name}" succeeded in ${elapsed}ms!`);
          searchResponse = response;
          successfulStrategy = strategy.name;
          break; // Exit loop on first success
        } else {
          console.warn(`[STRATEGY] ⚠️ Strategy "${strategy.name}" returned ${response.status}`);
        }
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.warn(`[STRATEGY] ⏱️ Strategy "${strategy.name}" timed out after ${STRATEGY_TIMEOUT_MS}ms`);
        } else {
          console.warn(`[STRATEGY] ❌ Strategy "${strategy.name}" failed:`, fetchError.message);
        }
        // Continue to next strategy
      }
    }

    // If all strategies failed
    if (!searchResponse) {
      console.error('[ERROR] All query strategies failed or timed out');
      return new Response(
        JSON.stringify({ 
          financialReports: [],
          financialData: [],
          error: 'Erhvervsstyrelsens API er i øjeblikket langsom eller utilgængelig. Alle forsøg fejlede.',
          fallbackToMockData: true
        }),
        { 
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[STEP 2] Using successful strategy: ${successfulStrategy}`);
    console.log(`[STEP 2] Response status: ${searchResponse.status}`);

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
    
    // Process up to 10 most recent reports to ensure we get 5 years of data
    const hits = searchData.hits?.hits || [];
    const reportsToProcess = Math.min(hits.length, 10);

    for (let i = 0; i < reportsToProcess; i++) {
      const hit = hits[i];
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
          documentUrl = `http://distribution.virk.dk/dokumenter/${guid}/download`;
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
        documentUrl = `http://distribution.virk.dk/dokumenter/${hit._id}/download`;
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
          
          const downloadHeaders: Record<string, string> = {
            'Accept': 'application/xml, text/xml, */*',
            'Accept-Encoding': 'gzip, deflate'
          };
          // NO Authorization header - public endpoint
          
          const xbrlResponse = await fetch(documentUrl, {
            headers: downloadHeaders,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (xbrlResponse.ok) {
            const xbrlContent = await xbrlResponse.text();
            console.log(`[STEP 2] Downloaded XBRL file (${xbrlContent.length} bytes)`);
            
            // Extract the actual period from XBRL file
            const actualPeriod = extractPeriodFromXBRL(xbrlContent);
            console.log(`[STEP 3] Parsing XBRL for period ${actualPeriod}...`);
            const parsedData = parseXBRL(xbrlContent, actualPeriod);
            
            if (parsedData) {
              financialData.push(parsedData);
              
              // Stop once we have 5 parsed financial datasets
              if (financialData.length >= 5) {
                console.log(`✅ Successfully parsed 5 periods of financial data - stopping`);
                break;
              }
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

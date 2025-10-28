import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to extract the period (with date range when possible) from XBRL context
const extractPeriodFromXBRL = (xmlContent: string, fallbackPeriod?: string): string => {
  console.log('[Period Extract] Attempting to extract period from XBRL');
  
  // Strategy 1: Try to find both start and end dates for full range
  const startDatePattern = /<[^:]+:startDate>(\d{4}-\d{2}-\d{2})<\/[^:]+:startDate>/i;
  const endDatePattern = /<[^:]+:endDate>(\d{4}-\d{2}-\d{2})<\/[^:]+:endDate>/i;
  const startMatch = xmlContent.match(startDatePattern);
  const endMatch = xmlContent.match(endDatePattern);
  
  if (startMatch && endMatch && startMatch[1] && endMatch[1]) {
    const period = `${startMatch[1]} - ${endMatch[1]}`;
    console.log(`[Period Extract] ✅ Found full date range: ${period}`);
    return period;
  }
  
  // Strategy 2: Try just end date (for year extraction)
  if (endMatch && endMatch[1]) {
    const date = new Date(endMatch[1]);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    console.log(`[Period Extract] ✅ Found endDate: ${period}`);
    return period;
  }
  
  // Strategy 3: Try instant date
  const instantPattern = /<[^:]+:instant>(\d{4}-\d{2}-\d{2})<\/[^:]+:instant>/i;
  const instantMatch = xmlContent.match(instantPattern);
  
  if (instantMatch && instantMatch[1]) {
    const date = new Date(instantMatch[1]);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    console.log(`[Period Extract] ✅ Found instant: ${period}`);
    return period;
  }
  
  // Strategy 4: Look for regnskabsperiode or accountingPeriod tags
  const periodTagPattern = /<[^>]*(?:regnskabsperiode|accountingPeriod|period)[^>]*>([^<]+)<\/[^>]+>/i;
  const periodMatch = xmlContent.match(periodTagPattern);
  
  if (periodMatch && periodMatch[1]) {
    const periodText = periodMatch[1].trim();
    
    // Format: YYYY-MM-DD or YYYY/MM/DD
    const dateMatch = periodText.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
    if (dateMatch) {
      const period = `${dateMatch[1]}-${dateMatch[2]}`;
      console.log(`[Period Extract] ✅ Found period tag: ${period}`);
      return period;
    }
    
    // Format: DD-MM-YYYY or DD/MM/YYYY
    const euDateMatch = periodText.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (euDateMatch) {
      const period = `${euDateMatch[3]}-${euDateMatch[2]}`;
      console.log(`[Period Extract] ✅ Found EU date format: ${period}`);
      return period;
    }
  }
  
  // Strategy 5: Use fallback period from metadata
  if (fallbackPeriod && fallbackPeriod !== 'N/A') {
    console.log(`[Period Extract] ⚠️ Using fallback period from metadata: ${fallbackPeriod}`);
    return fallbackPeriod;
  }
  
  console.log('[Period Extract] ❌ Could not extract period, returning N/A');
  return 'N/A';
};

// Helper function to validate if a period represents a full year (~12 months)
const isFullYearPeriod = (periodString: string): boolean => {
  // Check if period is a full date range with ~12 months
  const rangeMatch = periodString.match(/(\d{4})-(\d{2})-(\d{2})\s*-\s*(\d{4})-(\d{2})-(\d{2})/);
  
  if (rangeMatch) {
    const startDate = new Date(`${rangeMatch[1]}-${rangeMatch[2]}-${rangeMatch[3]}`);
    const endDate = new Date(`${rangeMatch[4]}-${rangeMatch[5]}-${rangeMatch[6]}`);
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (endDate.getMonth() - startDate.getMonth());
    
    // Accept 11-13 months as yearly
    if (monthsDiff >= 11 && monthsDiff <= 13) {
      console.log(`[VALIDATION] ✅ Period validated as full year (${monthsDiff} months): ${periodString}`);
      return true;
    } else {
      console.log(`[VALIDATION] ❌ Period rejected as non-yearly (${monthsDiff} months): ${periodString}`);
      return false;
    }
  }
  
  // If we can't parse the period, accept it (don't over-filter)
  console.log(`[VALIDATION] ⚠️ Could not validate period format, accepting: ${periodString}`);
  return true;
};

// Helper function to parse XBRL/XML and extract financial data using regex
const parseXBRL = (xmlContent: string, period: string) => {
  try {
    console.log(`[XBRL Parser] Processing ${xmlContent.length} bytes for period ${period}`);
    
    // Helper to extract numeric value from XBRL tags
    // Matches: <anyprefix:TagName contextRef="..." unitRef="..." decimals="...">VALUE</anyprefix:TagName>
    const extractValue = (tagNames: string[]): number | null => {
      for (const tagName of tagNames) {
        // Pattern 1: iXBRL inline format with name attribute (ESEF 2023/2024)
        // <ix:nonFraction name="ifrs-full:Revenue" contextRef="..." unitRef="..." decimals="..." format="ixt:numdotdecimal">1.500.000</ix:nonFraction>
        const ixbrlInlinePattern = new RegExp(
          `<ix:nonFraction[^>]+name="[^"]*:${tagName}"[^>]*>([\\d.,-\\s]+)</ix:nonFraction>`,
          'gi'
        );
        
        // Pattern 2: iXBRL nested format
        const ixbrlNestedPattern = new RegExp(
          `name="[^"]*:${tagName}"[^>]*>[\\s\\S]*?>([\\d.,-\\s]+)</ix:nonFraction>`,
          'gi'
        );
        
        // Pattern 3: Standard XBRL format: <fsa:Revenue>1500000000</fsa:Revenue>
        const standardPattern = new RegExp(
          `<[^:]+:${tagName}[^>]*>\\s*([\\d.-]+)\\s*</[^:]+:${tagName}>`,
          'gi'
        );
        
        // Pattern 4: ESEF format with ifrs-full namespace
        const esefPattern = new RegExp(
          `<ifrs-full:${tagName}[^>]*>\\s*([\\d.,-]+)\\s*</ifrs-full:${tagName}>`,
          'gi'
        );
        
        // Pattern 5: No namespace
        const noNamespacePattern = new RegExp(
          `<${tagName}[^>]*>\\s*([\\d.,-]+)\\s*</${tagName}>`,
          'gi'
        );
        
        // Try all patterns (iXBRL first as it's most common in 2023/2024)
        for (const pattern of [ixbrlInlinePattern, ixbrlNestedPattern, standardPattern, esefPattern, noNamespacePattern]) {
          const matches = Array.from(xmlContent.matchAll(pattern));
          
          if (matches.length > 0) {
            for (const match of matches) {
              let rawValue = match[1].trim();
              
              // Check for transformation format attribute
              const formatMatch = xmlContent.match(new RegExp(
                `name="[^"]*:${tagName}"[^>]+format="([^"]+)"`,
                'i'
              ));
              
              let cleanValue = rawValue;
              
              if (formatMatch && formatMatch[1]) {
                const format = formatMatch[1];
                
                if (format.includes('numdotdecimal')) {
                  // European: 1.500.000,00 → remove dots, replace comma with dot
                  cleanValue = rawValue.replace(/\./g, '').replace(',', '.');
                } else if (format.includes('numcommadecimal')) {
                  // US: 1,500,000.00 → remove commas
                  cleanValue = rawValue.replace(/,/g, '');
                } else if (format.includes('zerodash') && rawValue === '-') {
                  cleanValue = '0';
                }
              } else {
                // Auto-detect format based on content
                if (rawValue.includes('.') && rawValue.includes(',')) {
                  const lastDot = rawValue.lastIndexOf('.');
                  const lastComma = rawValue.lastIndexOf(',');
                  if (lastComma > lastDot) {
                    // Format: 1.500.000,00
                    cleanValue = rawValue.replace(/\./g, '').replace(',', '.');
                  } else {
                    // Format: 1,500,000.00
                    cleanValue = rawValue.replace(/,/g, '');
                  }
                } else if (rawValue.includes('.')) {
                  // Assume European thousand separator unless it's clearly decimal
                  const parts = rawValue.split('.');
                  if (parts[parts.length - 1].length === 2 && parts.length === 2) {
                    // Likely decimal: 1500.00
                    cleanValue = rawValue;
                  } else {
                    // Thousand separator: 1.500.000
                    cleanValue = rawValue.replace(/\./g, '');
                  }
                } else if (rawValue.includes(',')) {
                  const parts = rawValue.split(',');
                  if (parts[parts.length - 1].length === 2) {
                    // Decimal: 1500,00
                    cleanValue = rawValue.replace(',', '.');
                  } else {
                    // Thousand separator: 1,500,000
                    cleanValue = rawValue.replace(/,/g, '');
                  }
                }
              }
              
              // Remove any remaining spaces
              cleanValue = cleanValue.replace(/\s/g, '');
              
              const value = parseFloat(cleanValue);
              if (!isNaN(value) && value !== 0) {
                console.log(`✅ Found ${tagName}: ${value} (raw: "${rawValue}")`);
                return value;
              }
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
        'RevenueFromContractsWithCustomers', 'Revenues', // ESEF variants
        'GrossProfitLoss', 'TotalRevenue', 'Omsaetning',
        'NetTurnover', 'Turnover', 'Sales'
      ]),
      
      bruttofortjeneste: extractValue([
        'GrossProfit', 'GrossResult', 'Bruttofortjeneste', 'Bruttoavance',
        'GrossProfitOrLoss', 'GrossProfitLoss', 'Bruttoavanse' // ESEF variant
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
        'ProfitOrLoss', 'ProfitLossAttributableToOwnersOfParent', // ESEF variants
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
        'SumOfAssets', 'TotalAssetsAndEquityAndLiabilities' // ESEF variant (balance sheet total)
      ]),
      
      // Balance Sheet - Equity & Liabilities (Passiver)
      egenkapital: extractValue([
        'Equity', 'Egenkapital', 'ShareholdersEquity',
        'TotalEquity', 'EquityAttributableToOwnersOfParent',
        'EquityAttributableToEquityHoldersOfParent', 'TotalShareholdersEquity' // ESEF variant
      ]),
      
      hensatteForpligtelser: extractValue([
        'Provisions', 'HensatteForpligtelser', 'ProvisionsForLiabilities',
        'TotalProvisions'
      ]),
      
      gaeldsforpligtelser: extractValue([
        'Liabilities', 'Gældsforpligtelser', 'TotalLiabilities',
        'LiabilitiesOtherThanProvisions',
        'TotalLiabilitiesAndEquity', 'LiabilitiesAndEquity' // ESEF variants
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
      console.log(`   XML sample (first 500 chars): ${xmlContent.slice(0, 500)}`);
      
      // Detect format details
      const hasIxbrl = xmlContent.includes('ix:nonFraction') || xmlContent.includes('ix:nonNumeric');
      const hasIfrs = xmlContent.includes('ifrs-full');
      const hasFsa = xmlContent.includes('fsa:');
      
      console.log(`   Format: ${hasIxbrl ? 'iXBRL inline' : ''} ${hasIfrs ? 'ESEF/IFRS' : ''} ${hasFsa ? 'FSA' : ''}`);
      
      // Check if financial terms exist
      const revenuePos = xmlContent.search(/revenue|omsætning|omsaetning/i);
      const profitPos = xmlContent.search(/profit|resultat/i);
      const assetsPos = xmlContent.search(/assets|aktiver/i);
      
      console.log(`   Keywords: Revenue=${revenuePos > 0}, Profit=${profitPos > 0}, Assets=${assetsPos > 0}`);
      
      if (revenuePos > 0) {
        const sample = xmlContent.slice(Math.max(0, revenuePos - 150), revenuePos + 400);
        console.log(`   Sample near 'revenue':\n${sample}`);
      }
      
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
    
    // Add date range to reduce query scope (last 6 years for comprehensive data)
    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);
    
    // Progressive query strategies - simple to complex
    // We'll try each strategy until one succeeds
    const queryStrategies = [
      {
        name: 'CVR Only (Simplest)',
        query: {
          "query": {
            "term": { "cvrNummer": parseInt(cvr) }
          },
          "size": 50,
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
          "size": 50,
          "sort": [{ "offentliggoerelsesTidspunkt": { "order": "desc" }}]
        }
      },
      {
        name: 'CVR + Date Range (6 years)',
        query: {
          "query": {
            "bool": {
              "must": [
                { "term": { "cvrNummer": parseInt(cvr) }},
                { 
                  "range": { 
                    "offentliggoerelsesTidspunkt": {
                      "gte": sixYearsAgo.toISOString(),
                      "lte": new Date().toISOString()
                    }
                  }
                }
              ]
            }
          },
          "size": 50,
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
          "size": 50,
          "sort": [{ "offentliggoerelsesTidspunkt": { "order": "desc" }}]
        }
      }
    ];

    console.log(`[STEP 1] Progressive query fallback with ${queryStrategies.length} strategies`);
    console.log('[VERSION] v3.0 - 50 results per query, 30 reports processing');
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
    
    // Use all reports - filtering will happen based on XBRL document type and post-download validation
    const allHits = searchData.hits?.hits || [];
    
    console.log(`[STEP 3] Found ${allHits.length} reports total - will filter based on XBRL content`);
    
    // Sort reports by publication date descending (most recent first)
    allHits.sort((a: any, b: any) => {
      const dateA = new Date(a._source.offentliggoerelsesTidspunkt || a._source.indlaesningsTidspunkt || 0);
      const dateB = new Date(b._source.offentliggoerelsesTidspunkt || b._source.indlaesningsTidspunkt || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`[STEP 3] Sorted reports by date. Most recent: ${allHits[0]?._source.offentliggoerelsesTidspunkt}`);
    
    // Initialize year tracking
    const yearsSeen = new Set<number>();
    const yearsProcessed = new Set<number>();
    
    console.log('\n[YEAR DISCOVERY] Analyzing all fetched reports:');
    allHits.forEach((hit: any, idx: number) => {
      const source = hit._source;
      const pubDate = source.offentliggoerelsesTidspunkt || source.indlaesningsTidspunkt;
      const year = pubDate ? new Date(pubDate).getFullYear() : null;
      if (year) yearsSeen.add(year);
      
      if (idx < 10) { // Log first 10 for brevity
        console.log(`  [${idx}] Published: ${pubDate?.slice(0,10) || 'N/A'} (Year: ${year || 'Unknown'})`);
      }
    });
    console.log(`[YEAR DISCOVERY] Years found in API response: ${Array.from(yearsSeen).sort().reverse().join(', ')}`);
    
    // Process up to 15 reports to ensure we get 5 yearly ones (accounting for quarterly/half-year reports)
    const reportsToProcess = Math.min(allHits.length, 30);
    console.log(`[YEAR DISCOVERY] Will process ${reportsToProcess} reports to find 5 yearly reports\n`);

    let processedCount = 0; // Track reports we've examined
    let yearlyReportsFound = 0; // Track actual yearly reports found

    for (let i = 0; i < reportsToProcess && yearlyReportsFound < 5; i++) {
      const hit = allHits[i];
      const source = hit._source;
      const period = source.regnskabsperiode || source.periode || 'N/A';
      processedCount++;
      
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
      
      // Log all available documents for debugging
      console.log(`\n[REPORT ${processedCount}/${reportsToProcess}] Period: ${period}`);
      console.log(`[DOCUMENTS] Available documents (${source.dokumenter?.length || 0} total):`);
      source.dokumenter?.forEach((doc: any, idx: number) => {
        const docType = doc.dokumentType || 'Unknown';
        const mimeType = doc.dokumentMimeType || 'Unknown';
        const url = doc.dokumentUrl || doc.dokumentGuid || 'No URL';
        console.log(`  [${idx}] ${docType}`);
        console.log(`      MIME: ${mimeType}`);
        console.log(`      URL: ${url.toString().slice(0, 100)}${url.toString().length > 100 ? '...' : ''}`);
      });
      
      // Look for yearly report XML documents - accept ANY XML that's not explicitly quarterly/half-yearly
      // Look for yearly report XML documents
      // PRIORITY 1: Pure XBRL (application/xml) - easier to parse
      // PRIORITY 2: iXBRL (application/xhtml+xml) - requires different parsing
      const xbrlDocs = source.dokumenter?.filter((doc: any) => {
        const docType = doc.dokumentType?.toUpperCase() || '';
        const mimeType = doc.dokumentMimeType?.toLowerCase() || '';
        
        // Reject quarterly and half-year reports explicitly
        const isNonYearly = docType.includes('KVARTAL') || docType.includes('HALV');
        
        // Reject koncernregnskab (consolidated accounts) - prefer standalone
        const isKoncern = docType.includes('KONCERNREGNSKAB');
        
        // Must be XML format
        const isXMLFormat = mimeType.includes('xml') && mimeType.includes('application');
        
        return isXMLFormat && !isNonYearly && !isKoncern;
      }) || [];

      // Sort documents by priority:
      // 1. Pure XBRL (application/xml) first
      // 2. Documents with AARSRAPPORT type
      // 3. Documents with FINANSIEL in type
      const xbrlDoc = xbrlDocs.sort((a, b) => {
        const aType = a.dokumentType?.toUpperCase() || '';
        const bType = b.dokumentType?.toUpperCase() || '';
        const aMime = a.dokumentMimeType?.toLowerCase() || '';
        const bMime = b.dokumentMimeType?.toLowerCase() || '';
        
        // Pure XBRL beats iXBRL
        if (aMime === 'application/xml' && bMime !== 'application/xml') return -1;
        if (bMime === 'application/xml' && aMime !== 'application/xml') return 1;
        
        // AARSRAPPORT (not IXBRL) beats others
        if (aType === 'AARSRAPPORT' && bType !== 'AARSRAPPORT') return -1;
        if (bType === 'AARSRAPPORT' && aType !== 'AARSRAPPORT') return 1;
        
        // FINANSIEL beats non-finansiel
        if (aType.includes('FINANSIEL') && !bType.includes('FINANSIEL')) return -1;
        if (bType.includes('FINANSIEL') && !aType.includes('FINANSIEL')) return 1;
        
        return 0;
      })[0];
      
      if (xbrlDoc) {
        console.log(`[DOCUMENT SELECTION] ✅ Selected document:`);
        console.log(`  Type: ${xbrlDoc.dokumentType}`);
        console.log(`  MIME: ${xbrlDoc.dokumentMimeType}`);
        console.log(`  Reason: ${xbrlDoc.dokumentMimeType === 'application/xml' ? 'Pure XBRL' : 'iXBRL format'}`);
        console.log(`[DOC FOUND] ✅ Found Årsrapport XBRL: ${xbrlDoc.dokumentType}`);
        if (xbrlDoc.dokumentUrl) {
          documentUrl = xbrlDoc.dokumentUrl;
          reportMetadata.documentUrl = documentUrl;
        } else if (xbrlDoc.dokumentGuid || xbrlDoc.guid) {
          const guid = xbrlDoc.dokumentGuid || xbrlDoc.guid;
          documentUrl = `http://distribution.virk.dk/dokumenter/${guid}/download`;
          reportMetadata.documentGuid = guid;
          reportMetadata.documentUrl = documentUrl;
        }
      } else {
        console.log(`[DOCUMENT SELECTION] ❌ No suitable document found`);
        console.log(`  Total documents: ${source.dokumenter?.length || 0}`);
        console.log(`  After filtering: ${xbrlDocs.length}`);
        console.log(`[DOC FOUND] ❌ No Årsrapport XBRL found - skipping this report`);
        continue; // Skip to next report if we don't have the right document type
      }
      
      // Fallback: check for dokumentUrl directly in source (only reached if xbrlDoc exists)
      if (!documentUrl && source.dokumentUrl) {
        documentUrl = source.dokumentUrl;
        reportMetadata.documentUrl = documentUrl;
      }
      // Fallback: use _id from the hit itself
      else if (!documentUrl && hit._id) {
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
            
            // Extract the actual period from XBRL file with metadata fallback
            const actualPeriod = extractPeriodFromXBRL(xbrlContent, period);
            console.log(`[DEBUG] Report ${processedCount}/${reportsToProcess}: Metadata period = ${period}, Extracted XBRL period = ${actualPeriod}`);
            
            // Track which year we're looking at
            const yearMatch = actualPeriod.match(/(\d{4})/);
            const reportYear = yearMatch ? parseInt(yearMatch[1]) : null;
            if (reportYear) {
              console.log(`[YEAR TRACKING] Found report for year ${reportYear}`);
            }
            
            // VALIDATION: Check if this is actually a full year report
            if (!isFullYearPeriod(actualPeriod)) {
              console.log(`[SKIP] Skipping non-yearly report for period ${actualPeriod}`);
              continue; // Skip to next report without counting this one
            }
            
            console.log(`[STEP 3] Parsing XBRL for period ${actualPeriod}...`);
            const parsedData = parseXBRL(xbrlContent, actualPeriod);
            
            if (parsedData) {
              const yearMatch = actualPeriod.match(/(\d{4})/);
              const reportYear = yearMatch ? parseInt(yearMatch[1]) : null;
              
              console.log(`[DEBUG] ✅ Successfully parsed data with ${Object.keys(parsedData).filter(k => parsedData[k] !== null).length} fields`);
              financialData.push(parsedData);
              yearlyReportsFound++;
              
              if (reportYear) {
                yearsProcessed.add(reportYear);
                console.log(`[YEAR TRACKING] ✅ Successfully processed year ${reportYear}`);
                console.log(`[YEAR TRACKING] Years processed so far: ${Array.from(yearsProcessed).sort().reverse().join(', ')}`);
              }
              
              console.log(`✅ Found yearly report ${yearlyReportsFound}/5`);
              
              // Stop once we have 5 yearly reports
              if (yearlyReportsFound >= 5) {
                console.log(`✅ Successfully found 5 yearly reports - stopping`);
                break;
              }
            } else {
              console.log(`[DEBUG] ⚠️ No data extracted from XBRL for period ${actualPeriod}`);
              
              // Try fallback: ESEF XHTML first (iXBRL inline), then FINANSIEL XML
              console.log(`[FALLBACK] Trying alternate documents...`);
              
              // Priority 1: ESEF XHTML (iXBRL inline format - most common in 2023/2024)
              const esefDoc = source.dokumenter?.find((doc: any) => {
                const docType = (doc.dokumentType || '').toUpperCase();
                const mimeType = (doc.dokumentMimeType || '').toLowerCase();
                return docType.includes('ESEF') && mimeType === 'application/xhtml+xml';
              });
              
              let fallbackDoc = esefDoc;
              let fallbackFormat = 'ESEF XHTML (iXBRL)';
              let fallbackExtension = '.xhtml';
              
              // Priority 2: FINANSIEL XML if no ESEF XHTML
              if (!fallbackDoc) {
                const finansielDoc = source.dokumenter?.find((doc: any) => {
                  const docType = (doc.dokumentType || '').toUpperCase();
                  const mimeType = (doc.dokumentMimeType || '').toLowerCase();
                  return docType.includes('FINANSIEL') && mimeType === 'application/xml';
                });
                
                if (finansielDoc) {
                  fallbackDoc = finansielDoc;
                  fallbackFormat = 'FINANSIEL XML';
                  fallbackExtension = '.xml';
                }
              }
              
              if (fallbackDoc) {
                console.log(`[FALLBACK] Found ${fallbackFormat}, downloading...`);
                const REGNSKABER_BASE_URL = 'http://regnskaber.virk.dk/';
                const fallbackUrl = fallbackDoc.dokumentUrl || `${REGNSKABER_BASE_URL}${cvr}/${fallbackDoc.dokumentGuid}${fallbackExtension}`;
                
                try {
                  const fallbackController = new AbortController();
                  const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 8000);
                  
                  const fallbackResponse = await fetch(fallbackUrl, {
                    headers: downloadHeaders,
                    signal: fallbackController.signal
                  });
                  
                  clearTimeout(fallbackTimeoutId);
                  
                  if (fallbackResponse.ok) {
                    const fallbackXbrlText = await fallbackResponse.text();
                    console.log(`[FALLBACK] Downloaded FINANSIEL document (${fallbackXbrlText.length} bytes)`);
                    
                    const fallbackParsedData = parseXBRL(fallbackXbrlText, actualPeriod);
                    
                    if (fallbackParsedData) {
                      const yearMatch = actualPeriod.match(/(\d{4})/);
                      const reportYear = yearMatch ? parseInt(yearMatch[1]) : null;
                      
                      console.log(`[FALLBACK] ✅ Successfully parsed FINANSIEL document`);
                      financialData.push(fallbackParsedData);
                      yearlyReportsFound++;
                      
                      if (reportYear) {
                        yearsProcessed.add(reportYear);
                        console.log(`[YEAR TRACKING] ✅ Successfully processed year ${reportYear} (fallback)`);
                        console.log(`[YEAR TRACKING] Years processed so far: ${Array.from(yearsProcessed).sort().reverse().join(', ')}`);
                      }
                      
                      console.log(`✅ Found yearly report ${yearlyReportsFound}/5 (fallback)`);
                      
                      if (yearlyReportsFound >= 5) {
                        console.log(`✅ Successfully found 5 yearly reports - stopping`);
                        break;
                      }
                    }
                  }
                } catch (fallbackError) {
                  console.log(`[FALLBACK] Failed to fetch or parse FINANSIEL document:`, fallbackError.message);
                }
              } else {
                console.log(`[FALLBACK] No FINANSIEL document available`);
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

    console.log(`\n[FINAL SUMMARY]`);
    console.log(`  Years seen in API: ${Array.from(yearsSeen).sort().reverse().join(', ')}`);
    console.log(`  Years processed: ${Array.from(yearsProcessed).sort().reverse().join(', ')}`);
    const missingYears = Array.from(yearsSeen).filter(y => !yearsProcessed.has(y)).sort().reverse();
    console.log(`  Years missing: ${missingYears.length > 0 ? missingYears.join(', ') : 'None'}`);
    console.log(`  Total reports examined: ${processedCount}`);
    console.log(`  Yearly reports found: ${yearlyReportsFound}`);
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

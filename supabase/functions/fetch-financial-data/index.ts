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

// Score parsed financial data based on number of non-null key fields
const scoreFinancialData = (data: any): number => {
  if (!data) return 0;
  
  const keyFields = [
    'nettoomsaetning', 'aaretsResultat', 'statusBalance', 'egenkapital',
    'driftsresultat', 'resultatFoerSkat', 'anlaegsaktiverValue', 'omsaetningsaktiver'
  ];
  
  let score = 0;
  for (const field of keyFields) {
    if (data[field] && data[field] !== 0) {
      score++;
    }
  }
  
  return score;
};

// Helper function to parse XBRL/XML and extract financial data using regex
const parseXBRL = (xmlContent: string, period: string) => {
  try {
    console.log(`[XBRL Parser] Processing ${xmlContent.length} bytes for period ${period}`);
    
    // Extract the year from period string (e.g., "2024-01-01 - 2024-12-31" -> "2024")
    const year = period.split(' - ')[0].substring(0, 4);

    // Find context IDs for period ranges (e.g., 2024-01-01 to 2024-12-31)
    // Used for income statement items
    const periodContextPattern = new RegExp(
      `<xbrli:context id="([^"]+)">.*?<xbrli:startDate>${year}-01-01</xbrli:startDate>.*?<xbrli:endDate>${year}-12-31</xbrli:endDate>.*?</xbrli:context>`,
      'gis'
    );

    // Find context IDs for instant points (e.g., 2024-12-31)
    // Used for balance sheet items
    const instantContextPattern = new RegExp(
      `<xbrli:context id="([^"]+)">.*?<xbrli:instant>${year}-12-31</xbrli:instant>.*?</xbrli:context>`,
      'gis'
    );

    const periodMatches = Array.from(xmlContent.matchAll(periodContextPattern));
    const instantMatches = Array.from(xmlContent.matchAll(instantContextPattern));

    const periodContextIds = periodMatches.map(m => m[1]); // e.g., ["ctx-5", "ctx-16", "ctx-18"]
    const instantContextIds = instantMatches.map(m => m[1]); // e.g., ["ctx-7", "ctx-17", "ctx-19"]

    console.log(`[CONTEXT] Period contexts for ${year}: ${periodContextIds.join(', ')}`);
    console.log(`[CONTEXT] Instant contexts for ${year}: ${instantContextIds.join(', ')}`);
    
      /**
       * Parse a string value to number, handling spaces, commas, and negatives
       */
      const parseNumericValue = (valueStr: string): number | null => {
        if (!valueStr) return null;
        
        // Remove all whitespace and commas
        const cleaned = valueStr.trim().replace(/[\s,]/g, '');
        
        // Parse to number
        const num = parseFloat(cleaned);
        
        if (isNaN(num)) {
          console.log(`⚠️ [PARSE] Failed to parse: "${valueStr}" -> "${cleaned}"`);
          return null;
        }
        
        return num;
      };

      /**
       * Extract a numeric value from XBRL content by trying multiple tag patterns
       * Improved version that handles 2023/2024 IFRS-FULL format with context filtering
       */
      const extractValue = (tagNames: string[], preferredContexts?: string[]): number | null => {
        for (const tagName of tagNames) {
          // Pattern 1: NOV: custom namespace (Novo Holdings 2023/2024)
          const novPattern = new RegExp(
            `<NOV:${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</NOV:${tagName}>`,
            'gi'
          );
          let matches = Array.from(xmlContent.matchAll(novPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return false; // Exclude matches without contextRef
            });
          }
          
          if (matches.length > 0) {
            const contextInfo = matches[0][0].match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            console.log(`✅ [MATCH] Found ${tagName} using NOV: namespace (context: ${contextInfo})`);
            const value = parseNumericValue(matches[0][1]);
            if (value !== null) return value;
          }

          // Pattern 2: IFRS-FULL namespace (CRITICAL for 2023/2024)
          const ifrsPattern = new RegExp(
            `<ifrs-full:${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</ifrs-full:${tagName}>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(ifrsPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return false; // Exclude matches without contextRef
            });
          }
          
          if (matches.length > 0) {
            const contextInfo = matches[0][0].match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            console.log(`✅ [MATCH] Found ${tagName} using ifrs-full: namespace (context: ${contextInfo})`);
            const value = parseNumericValue(matches[0][1]);
            if (value !== null) return value;
          }

          // Pattern 3: iXBRL inline format
          const ixbrlPattern = new RegExp(
            `<ix:nonFraction[^>]+name="[^"]*:${tagName}"[^>]*>\\s*([-\\d.,\\s]+?)\\s*</ix:nonFraction>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(ixbrlPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return false; // Exclude matches without contextRef
            });
          }
          
          if (matches.length > 0) {
            const contextInfo = matches[0][0].match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            console.log(`✅ [MATCH] Found ${tagName} using iXBRL inline (context: ${contextInfo})`);
            const value = parseNumericValue(matches[0][1]);
            if (value !== null) return value;
          }

          // Pattern 4: FSA namespace (2018-2022 reports)
          const fsaPattern = new RegExp(
            `<fsa:${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</fsa:${tagName}>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(fsaPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return false; // Exclude matches without contextRef
            });
          }
          
          if (matches.length > 0) {
            const contextInfo = matches[0][0].match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            console.log(`✅ [MATCH] Found ${tagName} using fsa: namespace (context: ${contextInfo})`);
            const value = parseNumericValue(matches[0][1]);
            if (value !== null) return value;
          }

          // Pattern 5: Any namespace (wildcard fallback)
          const anyNsPattern = new RegExp(
            `<[^:]+:${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</[^:]+:${tagName}>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(anyNsPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return false; // Exclude matches without contextRef
            });
          }
          
          if (matches.length > 0) {
            const contextInfo = matches[0][0].match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            console.log(`✅ [MATCH] Found ${tagName} using wildcard namespace (context: ${contextInfo})`);
            const value = parseNumericValue(matches[0][1]);
            if (value !== null) return value;
          }

          // Pattern 6: No namespace
          const noNsPattern = new RegExp(
            `<${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</${tagName}>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(noNsPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return false; // Exclude matches without contextRef
            });
          }
          
          if (matches.length > 0) {
            const contextInfo = matches[0][0].match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            console.log(`✅ [MATCH] Found ${tagName} without namespace (context: ${contextInfo})`);
            const value = parseNumericValue(matches[0][1]);
            if (value !== null) return value;
          }
        }

        return null;
      };

    // Extract all financial metrics
    const financialData = {
      periode: period,
      
      // Income Statement (Resultatopgørelse) - use period contexts
      nettoomsaetning: extractValue([
        'RevenueAndOperatingIncome', // IFRS "finansiel" format - 2023/2024 ✅
        'Revenue', 'Nettoomsætning', 'NetRevenue', 'Omsætning',
        'RevenueFromContractsWithCustomers', 'Revenues', // ESEF variants
        'GrossProfitLoss', 'TotalRevenue', 'Omsaetning',
        'NetTurnover', 'Turnover', 'Sales'
      ], periodContextIds),
      
      bruttofortjeneste: extractValue([
        'GrossProfit', 'GrossResult', 'Bruttofortjeneste', 'Bruttoavance',
        'GrossProfitOrLoss', 'GrossProfitLoss', 'Bruttoavanse' // ESEF variant
      ], periodContextIds),
      
      driftsresultat: extractValue([
        'ProfitLossFromOperatingActivities', // IFRS "finansiel" format ✅
        'OperatingProfitLoss', 
        'Driftsresultat', 'EBIT', 'OperatingProfit'
      ], periodContextIds),
      
      resultatFoerSkat: extractValue([
        'ProfitLossBeforeTax', 'ResultatFørSkat', 'ProfitBeforeTax',
        'ProfitLossFromOrdinaryActivitiesBeforeTax'
      ], periodContextIds),
      
      aaretsResultat: extractValue([
        'ProfitLoss', 'NetIncome', 'ÅretsResultat', 'Resultat',
        'ProfitOrLoss', 'ProfitLossAttributableToOwnersOfParent', // ESEF variants
        'ProfitLossForYear', 'NetProfitLoss'
      ], periodContextIds),
      
      // Balance Sheet - Assets (Aktiver) - use instant contexts
      anlaegsaktiverValue: extractValue([
        'NoncurrentAssets', 'Anlægsaktiver', 'FixedAssets', 
        'LongtermAssets', 'NonCurrentAssets'
      ], instantContextIds),
      
      omsaetningsaktiver: extractValue([
        'CurrentAssets', 'Omsætningsaktiver', 'ShorttermAssets',
        'ShortTermAssets'
      ], instantContextIds),
      
      statusBalance: extractValue([
        'Assets', // IFRS "finansiel" format ✅
        'TotalAssets', 'AktiverIAlt', 'Balance',
        'SumOfAssets', 'TotalAssetsAndEquityAndLiabilities' // ESEF variant (balance sheet total)
      ], instantContextIds),
      
      // Balance Sheet - Equity & Liabilities (Passiver) - use instant contexts
      egenkapital: extractValue([
        'Equity', // IFRS "finansiel" format ✅
        'Egenkapital', 'ShareholdersEquity',
        'TotalEquity', 'EquityAttributableToOwnersOfParent',
        'EquityAttributableToEquityHoldersOfParent', 'TotalShareholdersEquity' // ESEF variant
      ], instantContextIds),
      
      hensatteForpligtelser: extractValue([
        'Provisions', 'HensatteForpligtelser', 'ProvisionsForLiabilities',
        'TotalProvisions'
      ], instantContextIds),
      
      gaeldsforpligtelser: extractValue([
        'Liabilities', 'Gældsforpligtelser', 'TotalLiabilities',
        'LiabilitiesOtherThanProvisions',
        'TotalLiabilitiesAndEquity', 'LiabilitiesAndEquity' // ESEF variants
      ], instantContextIds),
      
      kortfristetGaeld: extractValue([
        'ShorttermLiabilitiesOtherThanProvisions', 'KortfristetGæld', 
        'CurrentLiabilities', 'ShortTermLiabilities',
        'ShorttermDebt'
      ], instantContextIds)
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
      
      // Log available documents for debugging
      console.log(`[DOCUMENT ANALYSIS] Analyzing ${source.dokumenter?.length || 0} documents...`);
      source.dokumenter?.forEach((doc: any, idx: number) => {
        const docType = (doc.dokumentType || '').toUpperCase();
        const mimeType = (doc.dokumentMimeType || '').toLowerCase();
        console.log(`  [${idx}] ${doc.dokumentType} - ${mimeType}`);
      });
      
      // Collect ALL AARSRAPPORT XML documents as candidates
      const aarsrapportXMLs = source.dokumenter?.filter((doc: any) => {
        const docType = (doc.dokumentType || '').toUpperCase();
        const mimeType = (doc.dokumentMimeType || '').toLowerCase();
        
        // Accept multiple AARSRAPPORT variants for ESEF/IFRS format
        const validTypes = [
          'AARSRAPPORT',
          'AARSRAPPORT_ESEF',      // ESEF format (2023/2024)
          'AARSRAPPORT_FINANSIEL'  // Financial XBRL variant
        ];
        
        return validTypes.includes(docType) && mimeType === 'application/xml';
      }) || [];
      
      console.log(`[DOC SELECT] Found ${aarsrapportXMLs.length} AARSRAPPORT XML documents - will test all to find financial data`);
      
      if (aarsrapportXMLs.length === 0) {
        console.log(`[DOC SELECT] ❌ No AARSRAPPORT XML documents found - skipping this report`);
        continue;
      }
      
      // Step 3: Test all AARSRAPPORT XML documents and pick the one with most financial data
      console.log(`[STEP 2] Testing ${aarsrapportXMLs.length} AARSRAPPORT XML documents to find financial data...`);
      
      let bestParsedData = null;
      let bestScore = 0;
      let bestDocumentUrl = '';
      let bestPeriod = period;
      
      for (let docIdx = 0; docIdx < aarsrapportXMLs.length; docIdx++) {
        const candidateDoc = aarsrapportXMLs[docIdx];
        
        let candidateUrl = '';
        if (candidateDoc.dokumentUrl) {
          candidateUrl = candidateDoc.dokumentUrl;
        } else if (candidateDoc.dokumentGuid || candidateDoc.guid) {
          const guid = candidateDoc.dokumentGuid || candidateDoc.guid;
          candidateUrl = `http://distribution.virk.dk/dokumenter/${guid}/download`;
        }
        
        if (!candidateUrl) {
          console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] ❌ No URL for document`);
          continue;
        }
        
        console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] Trying: ${candidateUrl.slice(0, 80)}...`);
        
        try {
          const TIMEOUT_MS = 8000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
          
          const xbrlResponse = await fetch(candidateUrl, {
            headers: {
              'Accept': 'application/xml, text/xml, */*',
              'Accept-Encoding': 'gzip, deflate'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!xbrlResponse.ok) {
            console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] ❌ HTTP ${xbrlResponse.status}`);
            continue;
          }
          
          const xbrlContent = await xbrlResponse.text();
          console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] Downloaded ${xbrlContent.length} bytes`);
          
          // Extract period from this specific document
          const actualPeriod = extractPeriodFromXBRL(xbrlContent, period);
          
          // Validate it's a full year
          if (!isFullYearPeriod(actualPeriod)) {
            console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] ❌ Not a full year: ${actualPeriod}`);
            continue;
          }
          
          // Parse the XBRL
          const parsedData = parseXBRL(xbrlContent, actualPeriod);
          const score = scoreFinancialData(parsedData);
          
          console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] Score: ${score}/8 fields with data`);
          
          if (score > bestScore) {
            bestScore = score;
            bestParsedData = parsedData;
            bestDocumentUrl = candidateUrl;
            bestPeriod = actualPeriod;
            console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] ✅ New best document! (score: ${score})`);
          }
          
        } catch (err) {
          console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] ❌ Error: ${err.message}`);
        }
      }
      
      // Use the best document we found
      if (bestParsedData && bestScore >= 3) {
        console.log(`[SUCCESS] Using document with score ${bestScore}/8: ${bestDocumentUrl.slice(0, 80)}...`);
        
        reportMetadata.documentUrl = bestDocumentUrl;
        financialReports.push(reportMetadata);
        
        const yearMatch = bestPeriod.match(/(\d{4})/);
        const reportYear = yearMatch ? parseInt(yearMatch[1]) : null;
        
        console.log(`[DEBUG] ✅ Successfully parsed data with ${bestScore} key fields`);
        
        const hasRevenue = bestParsedData.nettoomsaetning !== null;
        const hasProfit = bestParsedData.aaretsResultat !== null;
        const hasAssets = bestParsedData.statusBalance !== null;
        console.log(`   Fields: Revenue=${hasRevenue}, Profit=${hasProfit}, Assets=${hasAssets}`);
        
        financialData.push(bestParsedData);
        yearlyReportsFound++;
        
        if (reportYear) {
          yearsProcessed.add(reportYear);
          console.log(`[YEAR TRACKING] ✅ Successfully processed year ${reportYear}`);
          console.log(`[YEAR TRACKING] Years processed so far: ${Array.from(yearsProcessed).sort().reverse().join(', ')}`);
        }
        
        console.log(`✅ Found yearly report ${yearlyReportsFound}/5`);
        
        if (yearlyReportsFound >= 5) {
          console.log(`✅ Successfully found 5 yearly reports - stopping`);
          break;
        }
        
      } else {
        console.log(`[FAIL] No suitable document found for this report (best score: ${bestScore}/8)`);
      }
      
    } // End of for loop processing reports

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

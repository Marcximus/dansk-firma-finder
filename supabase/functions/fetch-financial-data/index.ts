import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { parseXBRLOptimized, formatFinancialData } from './xbrl-parser-optimized.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to extract the period (with date range when possible) from XBRL context
const extractPeriodFromXBRL = (xmlContent: string, fallbackPeriod?: string): string => {
  console.log('[Period Extract] Attempting to extract period from XBRL');
  
  // Strategy 0: Try ReportingPeriod tags (GSD namespace)
  const reportingStartPattern = /<[^:]+:ReportingPeriodStartDate[^>]*>(\d{4}-\d{2}-\d{2})<\/[^:]+:ReportingPeriodStartDate>/i;
  const reportingEndPattern = /<[^:]+:ReportingPeriodEndDate[^>]*>(\d{4}-\d{2}-\d{2})<\/[^:]+:ReportingPeriodEndDate>/i;
  const reportingStartMatch = xmlContent.match(reportingStartPattern);
  const reportingEndMatch = xmlContent.match(reportingEndPattern);
  
  if (reportingStartMatch && reportingEndMatch && reportingStartMatch[1] && reportingEndMatch[1]) {
    const period = `${reportingStartMatch[1]} - ${reportingEndMatch[1]}`;
    console.log(`[Period Extract] ✅ Found ReportingPeriod tags: ${period}`);
    return period;
  }
  
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

// Helper function to discover available tags in XBRL containing a search term
const discoverAvailableTags = (xmlContent: string, searchTerm: string): string[] => {
  const tagPattern = /<([a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+)(?:\s+[^>]*)?>/gi;
  const matches = xmlContent.matchAll(tagPattern);
  
  const foundTags = new Set<string>();
  for (const match of matches) {
    const fullTag = match[1];
    const tagName = fullTag.split(':')[1];
    
    if (tagName && tagName.toLowerCase().includes(searchTerm.toLowerCase())) {
      foundTags.add(tagName);
    }
  }
  
  return Array.from(foundTags);
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
    
    // Cache unit scales per XML document to avoid re-parsing
    const unitScaleCache = new Map<string, number>();
    
    /**
     * Detect the unit scale from XBRL unit definition
     * Returns the multiplier to convert to DKK
     * Example: scale="-3" or decimals="-3" means values are in thousands, return 1000
     */
    const detectUnitScale = (unitRef: string): number => {
      // Check cache first
      if (unitScaleCache.has(unitRef)) {
        return unitScaleCache.get(unitRef)!;
      }
      
      // Try to find the unit definition
      const unitPattern = new RegExp(
        `<unit[^>]+id="${unitRef}"[^>]*>([\\s\\S]*?)</unit>`,
        'i'
      );
      const unitMatch = xmlContent.match(unitPattern);
      
      if (!unitMatch) {
        console.log(`[UNIT] No unit definition found for ${unitRef}, assuming scale=0 (DKK)`);
        unitScaleCache.set(unitRef, 1);
        return 1; // Default: no scaling
      }
      
      const unitBlock = unitMatch[1];
      
      // Look for scale attribute (most common)
      const scaleMatch = unitBlock.match(/<scale>(-?\d+)<\/scale>/i);
      if (scaleMatch) {
        const scale = parseInt(scaleMatch[1]);
        const multiplier = Math.pow(10, -scale);
        console.log(`[UNIT] Found scale=${scale} for ${unitRef} → multiplier=${multiplier}`);
        unitScaleCache.set(unitRef, multiplier);
        return multiplier;
      }
      
      // Check if unit ID itself contains scale info (e.g., "DKK_1000", "EUR_thousands")
      if (unitRef.match(/1000|thousand/i)) {
        console.log(`[UNIT] Unit ID contains 'thousand': ${unitRef} → multiplier=1000`);
        unitScaleCache.set(unitRef, 1000);
        return 1000;
      }
      
      console.log(`[UNIT] No scale found for ${unitRef}, assuming scale=0 (DKK)`);
      unitScaleCache.set(unitRef, 1);
      return 1; // Default: no scaling
    };
    
    // Extract the year from period string (e.g., "2024-01-01 - 2024-12-31" -> "2024")
    const year = period.split(' - ')[0].substring(0, 4);

    // Find ALL context IDs for periods ending in the target year
    // Capture start/end dates to filter for full-year periods only
    // Used for income statement items
    
    // PHASE 1: Universal Context Detection - Multiple patterns for different XBRL formats
    
    // Pattern 1: Standard XBRL with xbrli: namespace (IFRS 2023+)
    const xbrliPeriodPattern = new RegExp(
      `<xbrli:context id="([^"]+)">.*?<xbrli:startDate>(\\d{4})-(\\d{2})-(\\d{2})</xbrli:startDate>.*?<xbrli:endDate>${year}-(\\d{2})-(\\d{2})</xbrli:endDate>.*?</xbrli:context>`,
      'gis'
    );
    
    // Pattern 2: FSA format without namespace (Danish FSA 2018-2022)
    const fsaPeriodPattern = new RegExp(
      `<context id="([^"]+)">.*?<period>.*?<startDate>(\\d{4})-(\\d{2})-(\\d{2})</startDate>.*?<endDate>${year}-(\\d{2})-(\\d{2})</endDate>.*?</period>.*?</context>`,
      'gis'
    );
    
    // Pattern 3: Alternative FSA format with direct dates
    const altPeriodPattern = new RegExp(
      `<context[^>]+id="([^"]+)"[^>]*>.*?<startDate>(\\d{4})-(\\d{2})-(\\d{2})</startDate>.*?<endDate>${year}-(\\d{2})-(\\d{2})</endDate>.*?</context>`,
      'gis'
    );

    // Try all patterns and combine results
    let periodMatches: RegExpMatchArray[] = [];
    periodMatches.push(...Array.from(xmlContent.matchAll(xbrliPeriodPattern)));
    periodMatches.push(...Array.from(xmlContent.matchAll(fsaPeriodPattern)));
    periodMatches.push(...Array.from(xmlContent.matchAll(altPeriodPattern)));
    
    console.log(`[CONTEXT DEBUG] Total period context matches found: ${periodMatches.length}`);

    // Filter for FULL YEAR contexts only (11+ months duration)
    // This excludes quarterly/monthly data that might pollute annual figures
    const fullYearPeriodContexts = periodMatches
      .map(m => {
        const contextId = m[1];
        const startYear = parseInt(m[2]);
        const startMonth = parseInt(m[3]);
        const startDay = parseInt(m[4]);
        const endMonth = parseInt(m[5]);
        const endDay = parseInt(m[6]);
        
        // Calculate approximate duration in months
        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(parseInt(year), endMonth - 1, endDay);
        const durationMonths = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        return { contextId, durationMonths, startDate, endDate };
      })
      .filter(ctx => ctx.durationMonths >= 11) // Only full-year periods (11+ months)
      .sort((a, b) => b.durationMonths - a.durationMonths) // Prioritize longer periods
      .map(ctx => ctx.contextId);

    const periodContextIds = fullYearPeriodContexts;

    // Find context IDs for instant points (handles any date within the year)
    // Used for balance sheet items
    
    // Pattern 1: Standard XBRL with xbrli: namespace
    const xbrliInstantPattern = new RegExp(
      `<xbrli:context id="([^"]+)">.*?<xbrli:instant>${year}-\\d{2}-\\d{2}</xbrli:instant>.*?</xbrli:context>`,
      'gis'
    );
    
    // Pattern 2: FSA format without namespace
    const fsaInstantPattern = new RegExp(
      `<context id="([^"]+)">.*?<instant>${year}-\\d{2}-\\d{2}</instant>.*?</context>`,
      'gis'
    );
    
    // Pattern 3: Alternative FSA format
    const altInstantPattern = new RegExp(
      `<context[^>]+id="([^"]+)"[^>]*>.*?<instant>${year}-\\d{2}-\\d{2}</instant>.*?</context>`,
      'gis'
    );

    let instantMatches: RegExpMatchArray[] = [];
    instantMatches.push(...Array.from(xmlContent.matchAll(xbrliInstantPattern)));
    instantMatches.push(...Array.from(xmlContent.matchAll(fsaInstantPattern)));
    instantMatches.push(...Array.from(xmlContent.matchAll(altInstantPattern)));
    
    const instantContextIds = instantMatches.map(m => m[1]);
    
    console.log(`[CONTEXT DEBUG] Total instant context matches found: ${instantMatches.length}`);

    console.log(`[CONTEXT] Period contexts for ${year}: ${periodContextIds.join(', ')}`);
    console.log(`[CONTEXT] Instant contexts for ${year}: ${instantContextIds.join(', ')}`);

    // Fallback: If no contexts found, it's likely an old FSA report without context tags
    // In this case, we'll pass undefined to extractValue to skip context filtering entirely
    const usePeriodContexts = periodContextIds.length > 0 ? periodContextIds : undefined;
    const useInstantContexts = instantContextIds.length > 0 ? instantContextIds : undefined;

    if (!usePeriodContexts) {
      console.log(`[CONTEXT] No period contexts found - using fallback mode (no context filtering)`);
    }
    if (!useInstantContexts) {
      console.log(`[CONTEXT] No instant contexts found - using fallback mode (no context filtering)`);
    }
    
    // Discover available tags for commonly missed fields
    console.log('[TAG DISCOVERY] Searching for common missing fields...');
    const employeeTags = discoverAvailableTags(xmlContent, 'Employee');
    const staffTags = discoverAvailableTags(xmlContent, 'Staff');
    const personnelTags = discoverAvailableTags(xmlContent, 'Personnel');
    const depositTags = discoverAvailableTags(xmlContent, 'Deposit');
    const capitalTags = discoverAvailableTags(xmlContent, 'Capital');
    const holidayTags = discoverAvailableTags(xmlContent, 'Holiday');
    const vacationTags = discoverAvailableTags(xmlContent, 'Vacation');
    const payableTags = discoverAvailableTags(xmlContent, 'Payable');
    const receivableTags = discoverAvailableTags(xmlContent, 'Receivable');
    const tradeTags = discoverAvailableTags(xmlContent, 'Trade');
    
    if (employeeTags.length > 0) console.log(`  Found Employee tags: ${employeeTags.join(', ')}`);
    if (staffTags.length > 0) console.log(`  Found Staff tags: ${staffTags.join(', ')}`);
    if (personnelTags.length > 0) console.log(`  Found Personnel tags: ${personnelTags.join(', ')}`);
    if (depositTags.length > 0) console.log(`  Found Deposit tags: ${depositTags.join(', ')}`);
    if (capitalTags.length > 0) console.log(`  Found Capital tags: ${capitalTags.join(', ')}`);
    if (holidayTags.length > 0) console.log(`  Found Holiday tags: ${holidayTags.join(', ')}`);
    if (vacationTags.length > 0) console.log(`  Found Vacation tags: ${vacationTags.join(', ')}`);
    if (payableTags.length > 0) console.log(`  Found Payable tags: ${payableTags.join(', ')}`);
    if (receivableTags.length > 0) console.log(`  Found Receivable tags: ${receivableTags.join(', ')}`);
    if (tradeTags.length > 0) console.log(`  Found Trade tags: ${tradeTags.join(', ')}`);
    
    // Sample ALL tags in the document to understand the actual structure
    console.log('[TAG SAMPLE] Extracting sample of ALL tags in document...');
    const allTagPattern = /<([a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+)(?:\s+[^>]*)?>/g;
    const allTagMatches = xmlContent.matchAll(allTagPattern);
    const allTags = new Set<string>();
    
    for (const match of allTagMatches) {
      const fullTag = match[1]; // e.g., "fsa:Assets" or "ifrs-full:EmployeeBenefitsExpense"
      allTags.add(fullTag);
      if (allTags.size >= 200) break; // Limit to first 200 unique tags
    }
    
    const tagArray = Array.from(allTags);
    console.log(`[TAG SAMPLE] Total unique tags found: ${allTags.size}`);
    console.log(`[TAG SAMPLE] First 50 tags: ${tagArray.slice(0, 50).join(', ')}`);
    console.log(`[TAG SAMPLE] Tags 51-100: ${tagArray.slice(50, 100).join(', ')}`);
    console.log(`[TAG SAMPLE] Tags 101-150: ${tagArray.slice(100, 150).join(', ')}`);
    console.log(`[TAG SAMPLE] Tags 151-200: ${tagArray.slice(150, 200).join(', ')}`);
    
    // Targeted discovery for specific missing fields
    console.log('[FIELD DISCOVERY] Searching for specific missing fields...');
    const searchTerms = [
      { term: 'supplier', field: 'Leverandoerer' },
      { term: 'creditor', field: 'Leverandoerer' },
      { term: 'vendor', field: 'Leverandoerer' },
      { term: 'associate', field: 'GaeldTilAssocieretVirksomheder' },
      { term: 'related', field: 'GaeldTilAssocieretVirksomheder' },
      { term: 'vat', field: 'SkyldideMomsOgAfgifter' },
      { term: 'prepaid', field: 'Periodeafgrænsningsposter' },
      { term: 'accrual', field: 'Periodeafgrænsningsposter' },
      { term: 'accrued', field: 'Periodeafgrænsningsposter' },
      { term: 'deferred', field: 'Periodeafgrænsningsposter' },
      { term: 'share', field: 'Virksomhedskapital' },
      { term: 'equity', field: 'Egenkapital' },
      { term: 'retained', field: 'Overfoert' },
      { term: 'longterm', field: 'Langfristede' },
      { term: 'noncurrent', field: 'Langfristede' }
    ];
    
    for (const { term, field } of searchTerms) {
      const tags = discoverAvailableTags(xmlContent, term);
      if (tags.length > 0) {
        console.log(`  [${field}] Found tags containing "${term}": ${tags.join(', ')}`);
      }
    }
    
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
       * PHASE 4: Enhanced logging for value extraction debugging
       */
      const extractValue = (tagNames: string[], preferredContexts?: string[], logField?: string): number | null => {
        // PHASE 3: Temporary debug logging to discover actual tags in document
        if (tagNames[0] === 'Revenue' || tagNames[0] === 'Personaleomkostninger') {
          const allTags = xmlContent.match(/<[^:/>]+:[A-Z][a-zA-Z0-9]*(?:\s|>|\/)/g) || [];
          const uniqueTags = [...new Set(allTags.slice(0, 150))].slice(0, 50);
          console.log(`[TAG DISCOVERY] Sample tags in document for ${tagNames[0]}: ${uniqueTags.join(', ')}`);
        }
        
        for (const tagName of tagNames) {
          // Pattern 1: NOV: custom namespace (Novo Holdings 2023/2024)
          const novPattern = new RegExp(
            `<NOV:${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</NOV:${tagName}>`,
            'gi'
          );
          let matches = Array.from(xmlContent.matchAll(novPattern));
          
        // Filter by context if preferred contexts are provided
        if (preferredContexts !== undefined && preferredContexts.length > 0) {
          matches = matches.filter(match => {
            const fullTag = match[0];
            const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
            if (contextMatch) {
              const contextId = contextMatch[1];
              return preferredContexts.includes(contextId);
            }
            return true; // Include matches without contextRef (old FSA format)
          });
        }
          
          if (matches.length > 0) {
            const fullTag = matches[0][0];
            const contextInfo = fullTag.match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            const unitRef = fullTag.match(/unitRef="([^"]+)"/)?.[1];
            const decimals = fullTag.match(/decimals="([^"]+)"/)?.[1];
            
            let value = parseNumericValue(matches[0][1]);
            
            if (value !== null) {
              // Apply unit scaling if unitRef is present
              if (unitRef) {
                const scale = detectUnitScale(unitRef);
                const originalValue = value;
                value = value * scale;
                
                if (scale !== 1 && logField) {
                  console.log(`[UNIT CONVERSION] ${logField}: ${originalValue} × ${scale} = ${value} DKK (unit: ${unitRef})`);
                }
              }
              
              // Apply decimals scaling if present
              if (decimals) {
                const decimalScale = parseInt(decimals);
                if (decimalScale < 0) {
                  const originalValue = value;
                  value = value / Math.pow(10, -decimalScale);
                  if (logField) {
                    console.log(`[DECIMAL CONVERSION] ${logField}: ${originalValue} ÷ ${Math.pow(10, -decimalScale)} = ${value} DKK (decimals: ${decimals})`);
                  }
                }
              }
              
              if (logField) console.log(`✅ [EXTRACTED] ${logField}: ${value} DKK from tag ${tagName} (NOV:, context: ${contextInfo})`);
              return value;
            }
            
            if (value === null && logField) {
              console.log(`⚠️ [NULL VALUE] ${logField}: Found tag ${tagName} using NOV: in context ${contextInfo} but value is null/unparseable: "${matches[0][1]}"`);
            }
          }

          // Pattern 2: IFRS-FULL namespace (CRITICAL for 2023/2024)
          const ifrsPattern = new RegExp(
            `<ifrs-full:${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</ifrs-full:${tagName}>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(ifrsPattern));
          
        // Filter by context if preferred contexts are provided
        if (preferredContexts !== undefined && preferredContexts.length > 0) {
          matches = matches.filter(match => {
            const fullTag = match[0];
            const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
            if (contextMatch) {
              const contextId = contextMatch[1];
              return preferredContexts.includes(contextId);
            }
            return true; // Include matches without contextRef (old FSA format)
          });
        }

        if (matches.length > 0) {
          const fullTag = matches[0][0];
          const contextInfo = fullTag.match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
          const unitRef = fullTag.match(/unitRef="([^"]+)"/)?.[1];
          const decimals = fullTag.match(/decimals="([^"]+)"/)?.[1];
          
          let value = parseNumericValue(matches[0][1]);
          
          if (value !== null) {
            // Apply unit scaling if unitRef is present
            if (unitRef) {
              const scale = detectUnitScale(unitRef);
              const originalValue = value;
              value = value * scale;
              
              if (scale !== 1 && logField) {
                console.log(`[UNIT CONVERSION] ${logField}: ${originalValue} × ${scale} = ${value} DKK (unit: ${unitRef})`);
              }
            }
            
            // Apply decimals scaling if present
            if (decimals) {
              const decimalScale = parseInt(decimals);
              if (decimalScale < 0) {
                const originalValue = value;
                value = value / Math.pow(10, -decimalScale);
                if (logField) {
                  console.log(`[DECIMAL CONVERSION] ${logField}: ${originalValue} ÷ ${Math.pow(10, -decimalScale)} = ${value} DKK (decimals: ${decimals})`);
                }
              }
            }
            
            if (logField) console.log(`✅ [EXTRACTED] ${logField}: ${value} DKK from tag ${tagName} (ifrs-full:, context: ${contextInfo})`);
            return value;
          }
          
          if (value === null && logField) {
            console.log(`⚠️ [NULL VALUE] ${logField}: Found tag ${tagName} using ifrs-full: in context ${contextInfo} but value is null/unparseable: "${matches[0][1]}"`);
          }
        }

          // Pattern 3: iXBRL inline format
          const ixbrlPattern = new RegExp(
            `<ix:nonFraction[^>]+name="[^"]*:${tagName}"[^>]*>\\s*([-\\d.,\\s]+?)\\s*</ix:nonFraction>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(ixbrlPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts !== undefined && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return true; // Include matches without contextRef (old FSA format)
            });
          }
          
          if (matches.length > 0) {
            const fullTag = matches[0][0];
            const contextInfo = fullTag.match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            const unitRef = fullTag.match(/unitRef="([^"]+)"/)?.[1];
            const decimals = fullTag.match(/decimals="([^"]+)"/)?.[1];
            
            let value = parseNumericValue(matches[0][1]);
            
            if (value !== null) {
              // Apply unit scaling if unitRef is present
              if (unitRef) {
                const scale = detectUnitScale(unitRef);
                const originalValue = value;
                value = value * scale;
                
                if (scale !== 1 && logField) {
                  console.log(`[UNIT CONVERSION] ${logField}: ${originalValue} × ${scale} = ${value} DKK (unit: ${unitRef})`);
                }
              }
              
              // Apply decimals scaling if present
              if (decimals) {
                const decimalScale = parseInt(decimals);
                if (decimalScale < 0) {
                  const originalValue = value;
                  value = value / Math.pow(10, -decimalScale);
                  if (logField) {
                    console.log(`[DECIMAL CONVERSION] ${logField}: ${originalValue} ÷ ${Math.pow(10, -decimalScale)} = ${value} DKK (decimals: ${decimals})`);
                  }
                }
              }
              
              if (logField) console.log(`✅ [EXTRACTED] ${logField}: ${value} DKK from tag ${tagName} (iXBRL, context: ${contextInfo})`);
              return value;
            }
            
            if (value === null && logField) {
              console.log(`⚠️ [NULL VALUE] ${logField}: Found tag ${tagName} using iXBRL in context ${contextInfo} but value is null/unparseable: "${matches[0][1]}"`);
            }
          }

          // Pattern 4: FSA namespace (2018-2022 reports)
          const fsaPattern = new RegExp(
            `<fsa:${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</fsa:${tagName}>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(fsaPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts !== undefined && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return true; // Include matches without contextRef (old FSA format)
            });
          }
          
          if (matches.length > 0) {
            const fullTag = matches[0][0];
            const contextInfo = fullTag.match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            const unitRef = fullTag.match(/unitRef="([^"]+)"/)?.[1];
            const decimals = fullTag.match(/decimals="([^"]+)"/)?.[1];
            
            let value = parseNumericValue(matches[0][1]);
            
            if (value !== null) {
              // Apply unit scaling if unitRef is present
              if (unitRef) {
                const scale = detectUnitScale(unitRef);
                const originalValue = value;
                value = value * scale;
                
                if (scale !== 1 && logField) {
                  console.log(`[UNIT CONVERSION] ${logField}: ${originalValue} × ${scale} = ${value} DKK (unit: ${unitRef})`);
                }
              }
              
              // Apply decimals scaling if present
              if (decimals) {
                const decimalScale = parseInt(decimals);
                if (decimalScale < 0) {
                  const originalValue = value;
                  value = value / Math.pow(10, -decimalScale);
                  if (logField) {
                    console.log(`[DECIMAL CONVERSION] ${logField}: ${originalValue} ÷ ${Math.pow(10, -decimalScale)} = ${value} DKK (decimals: ${decimals})`);
                  }
                }
              }
              
              if (logField) console.log(`✅ [EXTRACTED] ${logField}: ${value} DKK from tag ${tagName} (fsa:, context: ${contextInfo})`);
              return value;
            }
            
            if (value === null && logField) {
              console.log(`⚠️ [NULL VALUE] ${logField}: Found tag ${tagName} using fsa: in context ${contextInfo} but value is null/unparseable: "${matches[0][1]}"`);
            }
          }

          // Pattern 5: Any namespace (wildcard fallback)
          const anyNsPattern = new RegExp(
            `<[^:]+:${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</[^:]+:${tagName}>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(anyNsPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts !== undefined && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return true; // Include matches without contextRef (old FSA format)
            });
          }
          
          if (matches.length > 0) {
            const fullTag = matches[0][0];
            const contextInfo = fullTag.match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            const unitRef = fullTag.match(/unitRef="([^"]+)"/)?.[1];
            const decimals = fullTag.match(/decimals="([^"]+)"/)?.[1];
            
            let value = parseNumericValue(matches[0][1]);
            
            if (value !== null) {
              // Apply unit scaling if unitRef is present
              if (unitRef) {
                const scale = detectUnitScale(unitRef);
                const originalValue = value;
                value = value * scale;
                
                if (scale !== 1 && logField) {
                  console.log(`[UNIT CONVERSION] ${logField}: ${originalValue} × ${scale} = ${value} DKK (unit: ${unitRef})`);
                }
              }
              
              // Apply decimals scaling if present
              if (decimals) {
                const decimalScale = parseInt(decimals);
                if (decimalScale < 0) {
                  const originalValue = value;
                  value = value / Math.pow(10, -decimalScale);
                  if (logField) {
                    console.log(`[DECIMAL CONVERSION] ${logField}: ${originalValue} ÷ ${Math.pow(10, -decimalScale)} = ${value} DKK (decimals: ${decimals})`);
                  }
                }
              }
              
              if (logField) console.log(`✅ [EXTRACTED] ${logField}: ${value} DKK from tag ${tagName} (wildcard, context: ${contextInfo})`);
              return value;
            }
            
            if (value === null && logField) {
              console.log(`⚠️ [NULL VALUE] ${logField}: Found tag ${tagName} using wildcard in context ${contextInfo} but value is null/unparseable: "${matches[0][1]}"`);
            }
          }

          // Pattern 6: No namespace
          const noNsPattern = new RegExp(
            `<${tagName}(?:\\s+[^>]*)?\\s*>\\s*([-\\d.,\\s]+?)\\s*</${tagName}>`,
            'gi'
          );
          matches = Array.from(xmlContent.matchAll(noNsPattern));
          
          // Filter by context if preferred contexts are provided
          if (preferredContexts !== undefined && preferredContexts.length > 0) {
            matches = matches.filter(match => {
              const fullTag = match[0];
              const contextMatch = fullTag.match(/contextRef="([^"]+)"/);
              if (contextMatch) {
                const contextId = contextMatch[1];
                return preferredContexts.includes(contextId);
              }
              return true; // Include matches without contextRef (old FSA format)
            });
          }
          
          if (matches.length > 0) {
            const fullTag = matches[0][0];
            const contextInfo = fullTag.match(/contextRef="([^"]+)"/)?.[1] || 'unknown';
            const unitRef = fullTag.match(/unitRef="([^"]+)"/)?.[1];
            const decimals = fullTag.match(/decimals="([^"]+)"/)?.[1];
            
            let value = parseNumericValue(matches[0][1]);
            
            if (value !== null) {
              // Apply unit scaling if unitRef is present
              if (unitRef) {
                const scale = detectUnitScale(unitRef);
                const originalValue = value;
                value = value * scale;
                
                if (scale !== 1 && logField) {
                  console.log(`[UNIT CONVERSION] ${logField}: ${originalValue} × ${scale} = ${value} DKK (unit: ${unitRef})`);
                }
              }
              
              // Apply decimals scaling if present
              if (decimals) {
                const decimalScale = parseInt(decimals);
                if (decimalScale < 0) {
                  const originalValue = value;
                  value = value / Math.pow(10, -decimalScale);
                  if (logField) {
                    console.log(`[DECIMAL CONVERSION] ${logField}: ${originalValue} ÷ ${Math.pow(10, -decimalScale)} = ${value} DKK (decimals: ${decimals})`);
                  }
                }
              }
              
              if (logField) console.log(`✅ [EXTRACTED] ${logField}: ${value} DKK from tag ${tagName} (no namespace, context: ${contextInfo})`);
              return value;
            }
            
            if (value === null && logField) {
              console.log(`⚠️ [NULL VALUE] ${logField}: Found tag ${tagName} without namespace in context ${contextInfo} but value is null/unparseable: "${matches[0][1]}"`);
            }
          }
        }

        // ❌ NO MATCH - Log all tags that were searched
        if (logField) {
          console.log(`❌ [NO MATCH] ${logField}: Failed to find any of these tags: ${tagNames.join(', ')}`);
          if (preferredContexts && preferredContexts.length > 0) {
            console.log(`   Searched in contexts: ${preferredContexts.join(', ')}`);
          }
        }

        return null;
      };

    // Extract all financial metrics
    const financialData = {
      periode: period,
      
      // Income Statement (Resultatopgørelse) - use period contexts
      // Special handling for investment companies vs operating companies
      nettoomsaetning: (() => {
        // Try to find pure operating revenue first
        const revenueValue = extractValue([
          'Revenue', // Most specific - pure operating revenue
          'Nettoomsætning', // Danish standard tag
          'Omsætning', // Danish variant
          'NetRevenue', // English variant
          'NetTurnover', // English variant
          'Turnover', // UK variant
          'Sales', // US variant
          'RevenueFromContractsWithCustomers', // IFRS 15
          'Revenues', // Plural variant
          'TotalRevenue', // Broader than Revenue
          'Omsaetning', // Danish variant (no umlaut)
          // PHASE 2: Additional Danish-specific variations
          'NettoomsaetningIAlt',
          'OmsaetningIAlt',
          'NettoOmsaetning',
          'TotalOmsaetning'
        ], usePeriodContexts);
        
        // If we found Revenue, use it
        if (revenueValue !== null) {
          return revenueValue;
        }
        
        // Try to get RevenueAndOperatingIncome separately
        const revenueAndOperatingIncome = extractValue(['RevenueAndOperatingIncome'], usePeriodContexts);
        
        // Check if this is an operating company (has GrossProfit) or investment company
        const hasOperatingRevenue = extractValue([
          'GrossProfit', 'GrossResult', 'Bruttofortjeneste', 'Bruttoavance',
          'GrossProfitOrLoss', 'GrossProfitLoss'
        ], usePeriodContexts) !== null;
        
        // If we have RevenueAndOperatingIncome but NO operating indicators, set to 0 (investment company)
        if (revenueAndOperatingIncome !== null && !hasOperatingRevenue) {
          console.log(`ℹ️ [INVESTMENT CO] No Revenue tag found, RevenueAndOperatingIncome=${revenueAndOperatingIncome}`);
          console.log(`   Has GrossProfit: ${hasOperatingRevenue} → Setting Nettoomsætning to 0`);
          return 0;
        }
        
        // Otherwise use RevenueAndOperatingIncome if available (operating company)
        return revenueAndOperatingIncome;
      })(),
      
      bruttofortjeneste: (() => {
        const value = extractValue([
          'GrossProfit', 'GrossResult', 'Bruttofortjeneste', 'Bruttoavance',
          'GrossProfitOrLoss', 'GrossProfitLoss', 'Bruttoavanse', // ESEF variant
          // PHASE 2: Additional variations
          'BruttofortjenesteIAlt',
          'BruttoResultat',
          'GrossMargin'
        ], usePeriodContexts);
        
        // If negative, return 0 (we'll show it under bruttotab instead)
        return value !== null && value < 0 ? 0 : value;
      })(),
      
      driftsresultat: extractValue([
        'ProfitLossFromOperatingActivities', // IFRS "finansiel" format ✅
        'OperatingProfitLoss', 
        'Driftsresultat', 'EBIT', 'OperatingProfit'
      ], usePeriodContexts),
      
      resultatFoerSkat: extractValue([
        'ProfitLossBeforeTax', 'ResultatFørSkat', 'ProfitBeforeTax',
        'ProfitLossFromOrdinaryActivitiesBeforeTax'
      ], usePeriodContexts),
      
      aaretsResultat: extractValue([
        'ProfitLoss', 'NetIncome', 'ÅretsResultat', 'Resultat',
        'ProfitOrLoss', 'ProfitLossAttributableToOwnersOfParent', // ESEF variants
        'ProfitLossForYear', 'NetProfitLoss'
      ], usePeriodContexts, 'aaretsResultat'),
      
      // Balance Sheet - Assets (Aktiver) - search ALL contexts (no filtering)
      anlaegsaktiverValue: extractValue([
        'NoncurrentAssets', // EXACT TAG from logs! ✅
        'PropertyPlantAndEquipment', // Also exact!
        'Anlaeggsaktiver', 'AnlaegsAktiver', 'Anlaegsaktiver', // FSA Danish variants FIRST
        'Anlægsaktiver', 'FixedAssets', 
        'LongtermAssets', 'NonCurrentAssets'
      ], undefined, 'anlaegsaktiverValue'),
      
      omsaetningsaktiver: extractValue([
        'CurrentAssets', // EXACT TAG from logs! ✅
        'OmsaetningsAktiver', 'Omsaetningsaktiver', // FSA Danish variants FIRST
        'Omsætningsaktiver', 'ShorttermAssets',
        'ShortTermAssets'
      ], undefined, 'omsaetningsaktiver'),
      
      statusBalance: extractValue([
        'Assets', // EXACT TAG from logs! ✅
        'LiabilitiesAndEquity', // Also exact!
        'AktiverIAlt', 'Aktiver', 'SumAktiver', // FSA Danish variants FIRST
        'TotalAssets', 'Balance',
        'SumOfAssets', 'TotalAssetsAndEquityAndLiabilities' // ESEF variant (balance sheet total)
      ], undefined, 'statusBalance'),
      
      // Balance Sheet - Equity & Liabilities (Passiver) - search ALL contexts (no filtering)
      egenkapital: extractValue([
        'EgenkapitalIAlt', 'Egenkapital', 'SumEgenkapital', // FSA Danish variants FIRST
        'Equity', // IFRS "finansiel" format ✅
        'ShareholdersEquity',
        'TotalEquity', 'EquityAttributableToOwnersOfParent',
        'EquityAttributableToEquityHoldersOfParent', 'TotalShareholdersEquity' // ESEF variant
      ], undefined, 'egenkapital'),
      
      hensatteForpligtelser: extractValue([
        'Provisions', 'HensatteForpligtelser', 'ProvisionsForLiabilities',
        'TotalProvisions'
      ], undefined, 'hensatteForpligtelser'),
      
      gaeldsforpligtelser: extractValue([
        'GaeldsforpligtelserIAlt', 'Gaeldsforpligtelser', 'SumGaeld', // FSA Danish variants FIRST
        'Liabilities', 'Gældsforpligtelser', 'TotalLiabilities',
        'LiabilitiesOtherThanProvisions',
        'TotalLiabilitiesAndEquity', 'LiabilitiesAndEquity' // ESEF variants
      ], undefined, 'gaeldsforpligtelser'),
      
      kortfristetGaeld: extractValue([
        'ShorttermLiabilitiesOtherThanProvisions', 'KortfristetGæld', 
        'CurrentLiabilities', 'ShortTermLiabilities',
        'ShorttermDebt'
      ], undefined, 'kortfristetGaeld'),
      
      // Additional Income Statement items
      driftsomkostninger: extractValue([
        'Driftsomkostninger', 'OmkostningerIAlt',
        'Distributionsomkostninger', 'Administrationsomkostninger',
        'OperatingExpense', 'OperatingExpenses',
        'DistributionCosts', 'AdministrativeExpenses', 'CostOfSales'
      ], usePeriodContexts, 'driftsomkostninger'),
      
      finansielleIndtaegter: extractValue([
        'FinansielleIndtaegter', 'FinansielleIndtægter',
        'Renteindtaegter', 'Udbytteindtaegter',
        'FinanceIncome', 'FinancialIncome', 'FinancialRevenue',
        'InterestIncome', 'DividendIncome', 'InvestmentIncome'
      ], usePeriodContexts, 'finansielleIndtaegter'),
      
      finansielleOmkostninger: extractValue([
        'OtherFinanceExpenses', // EXACT TAG from logs! ✅
        'FinansielleOmkostninger', 'Renteomkostninger',
        'AndreFinansielleOmkostninger',
        'FinanceCosts', 'FinanceExpense', 'FinancialExpenses',
        'InterestExpense', 'InterestExpenses'
      ], usePeriodContexts, 'finansielleOmkostninger'),
      
      skatAfAaretsResultat: extractValue([
        'TaxExpense', // EXACT TAG from logs! ✅
        'SkatAfAaretsResultat', 'SkatAfResultat',
        'AktuelleSkat', 'UdskudtSkat',
        'IncomeTaxExpenseContinuingOperations',
        'IncomeTaxExpense', 'CurrentTax', 'TaxOnProfitOrLoss'
      ], usePeriodContexts, 'skatAfAaretsResultat'),
      
      afskrivninger: extractValue([
        'DepreciationAmortisationExpenseAndImpairmentLossesOfPropertyPlantAndEquipmentAndIntangibleAssetsRecognisedInProfitOrLoss', // EXACT TAG from logs! ✅
        'AfskrivningerIAlt', 'Afskrivninger',
        'AfskrivningerPaaMaterielleAnlaegsaktiver',
        'AfskrivningerPaaImmaterielleAnlaegsaktiver',
        'DepreciationAndAmortisationExpense', 'Depreciation',
        'DepreciationAmortisationAndImpairmentLoss',
        'DepreciationAndAmortisation'
      ], usePeriodContexts, 'afskrivninger'),
      
      // Detailed Income Statement items for ApS companies
      // PHASE 2: Expanded tag coverage for Danish XBRL
      personaleomkostninger: extractValue([
        'EmployeeBenefitsExpense', // EXACT TAG from logs! ✅
        'Personaleomkostninger',
        'StaffCosts', 'PersonnelExpenses', 'EmployeeExpenses',
        'WagesAndSalaries', 'LoenningerOgVederlag',
        'PersonaleomkostningerIAlt', 'LoenOgVederlag',
        'PersonnelCosts', 'EmployeeCosts', 'StaffExpenses',
        'PersonaleOmkostninger',
        // Expanded variations for better matching
        'EmployeeBenefitsExpenses', 'WagesAndSalariesExpense',
        'EmployeeCompensation', 'PersonnelCost', 'LaborCosts',
        'PayrollExpenses', 'WagesCosts', 'SalariesAndWages',
        'EmployeeBenefitExpense', 'StaffCost', 'PersonnelExpense',
        'LoenOgGager', 'Loenomkostninger', 'PersonaleCosts'
      ], usePeriodContexts, 'personaleomkostninger'),

      bruttotab: (() => {
        const bruttofortjeneste = extractValue([
          'GrossProfit', 'GrossResult', 'Bruttofortjeneste', 'Bruttoavance',
          'GrossProfitOrLoss', 'GrossProfitLoss', 'Bruttoavanse',
          'BruttofortjenesteIAlt', 'BruttoResultat', 'GrossMargin'
        ], usePeriodContexts);
        
        // If negative, return absolute value (display as positive loss)
        return bruttofortjeneste !== null && bruttofortjeneste < 0 
          ? Math.abs(bruttofortjeneste) 
          : null;
      })(),

      resultatAfPrimaerDrift: extractValue([
        'ProfitLossFromOrdinaryOperatingActivities', // EXACT TAG from logs! ✅
        'ProfitLossFromOperatingActivities',
        'ResultatAfPrimaerDrift', 'OperatingProfitLoss',
        'Driftsresultat', 'EBIT',
        // PHASE 2: Additional variations
        'ResultatAfPrimaerDriftIAlt',
        'ResultatFoerFinansiellerPoster',
        'PrimaryOperatingProfit',
        'OperatingResult',
        'EarningsBeforeInterestAndTax',
        'ResultatAfPrimaereDrift'
      ], usePeriodContexts, 'resultatAfPrimaerDrift'),
      
      // Additional Balance Sheet - Assets breakdown - search ALL contexts
      immaterielleAnlaeggsaktiver: extractValue([
        'ImmaterielleAnlaegsaktiver', 'ImmaterielleAktiver',
        'Goodwill', 'AndenImmaterielleAnlaegsaktiver',
        'IntangibleAssetsOtherThanGoodwill', 'IntangibleAssets'
      ], undefined, 'immaterielleAnlaeggsaktiver'),
      
      materielleAnlaeggsaktiver: extractValue([
        'PropertyPlantAndEquipment', // EXACT TAG from logs! ✅
        'MaterielleAnlaegsaktiver', 'MaterielleAktiver',
        'GrundeOgBygninger', 'ProduktionsanlaegOgMaskiner',
        'TangibleAssets',
        'Property', 'LandAndBuildings'
      ], undefined, 'materielleAnlaeggsaktiver'),
      
      finansielleAnlaeggsaktiver: extractValue([
        'FinansielleAnlaegsaktiver', 'FinansielleAktiver',
        'KapitalandeleiTilknyttedeVirksomheder',
        'KapitalandeleiAssocieretVirksomheder',
        'AndreVaerdipapirerOgKapitalandele',
        'NoncurrentFinancialAssets', 'LongtermInvestments',
        'InvestmentProperty', 'FinancialAssets'
      ], undefined, 'finansielleAnlaeggsaktiver'),
      
      varebeholdninger: extractValue([
        'Varebeholdninger', 'LagerbeholdningerIAlt',
        'Inventories', 'Inventory', 'Stocks',
        'RawMaterialsAndConsumables'
      ], undefined, 'varebeholdninger'),
      
      tilgodehavender: extractValue([
        'TilgodehavenderIAlt', 'Tilgodehavender',
        'Varedebitorer', 'AndreTilgodehavender',
        'TradeAndOtherCurrentReceivables', 'CurrentReceivables',
        'TradeReceivables', 'Receivables', 'AccountsReceivable'
      ], undefined, 'tilgodehavender'),
      
      likviderMidler: extractValue([
        'LikviderMidler', 'LikvideBehoelninger',
        'CashAndCashEquivalents', 'Cash',
        'BankDeposits', 'CashAtBankAndInHand'
      ], undefined, 'likviderMidler'),
      
      // Detailed Balance Sheet - Assets
      // PHASE 2: Expanded tag coverage
      andreAnlaegDriftsmaterielOgInventar: extractValue([
        'FixturesFittingsToolsAndEquipment', // EXACT TAG from logs! ✅
        'OtherFixturesFittingsToolsAndEquipment',
        'DriftsmaterielOgInventar', 'AndreAnlaeg',
        'OtherPropertyPlantAndEquipment',
        // Additional variations
        'AndreAnlaegIAlt',
        'DriftsmaterielOgInventarIAlt',
        'FixturesAndFittings'
      ], undefined, 'andreAnlaegDriftsmaterielOgInventar'),

      deposita: extractValue([
        'DepositsLongtermInvestmentsAndReceivables', // EXACT TAG from logs! ✅
        'Deposita', 'Deposits', 'SecurityDeposits',
        'RentDeposits', 'LeaseDeposits',
        'DepositaIAlt', 'DepositAssets',
        // Expanded variations
        'LongtermDeposits', 'SecurityDeposit', 'RentalDeposits',
        'DepositReceivables', 'GuaranteeDeposits', 'CashDeposits',
        'OtherDeposits', 'Depositum'
      ], undefined, 'deposita'),

      tilgodehavenderFraSalgOgTjenesteydelser: extractValue([
        'ShorttermTradeReceivables', // EXACT TAG from logs! ✅
        'TradeReceivables', 'Varedebitorer',
        'TilgodehavenderFraSalg', 'AccountsReceivable',
        'TradeAndOtherReceivables',
        'TilgodehavenderFraSalgOgTjenesteydelserIAlt',
        'VaredebitorerIAlt', 'TilgodehavenderFraSalgIAlt',
        // Expanded variations
        'CurrentTradeReceivables',
        'TradeAndOtherCurrentReceivables', 'SalesReceivables',
        'CustomerReceivables', 'TradeDebtors', 'AccountReceivable',
        'TilgodehavenderFraKunder', 'Kundetilgodehavender'
      ], undefined, 'tilgodehavenderFraSalgOgTjenesteydelser'),

      andreTilgodehavender: extractValue([
        'OtherShorttermReceivables', // EXACT TAG from logs! ✅
        'OtherReceivables', 'AndreTilgodehavender',
        'MiscellaneousReceivables', 'OtherCurrentReceivables',
        'AndreTilgodehavenderIAlt', 'OevrigeTilgodehavender',
        // Expanded variations
        'OtherCurrentAssets',
        'MiscellaneousCurrentReceivables', 'SundryReceivables',
        'OtherDebtors', 'OtherAccountsReceivable',
        'AndreTilgodehavenderKortfristet', 'OevrigDebitorer'
      ], undefined, 'andreTilgodehavender'),

      kravPaaIndbetalingAfVirksomhedskapital: extractValue([
        'ContributedCapitalInArrears', // EXACT TAG from logs! ✅
        'ReceivablesFromShareholdersAndManagement',
        'KravPaaIndbetalingAfVirksomhedskapital',
        'CapitalCallsReceivable', 'UnpaidShareCapital',
        'KravPaaIndbetalingAfVirksomhedskapitalIAlt',
        'UdestaaendeKapitalIndskud',
        // Expanded variations
        'ShareCapitalNotPaidIn',
        'CapitalCallReceivables', 'OutstandingShareCapital',
        'UnpaidContributions', 'CapitalContributionsReceivable',
        'IkkeIndbetalteKapitalandele'
      ], undefined, 'kravPaaIndbetalingAfVirksomhedskapital'),

      periodeafgraensningsporterAktiver: extractValue([
        'DeferredIncomeAssets', // EXACT TAG from logs! ✅
        'PrepaymentsCurrent', 'Periodeafgraensningsposter',
        'DeferredExpenses', 'PrepaidExpensesAndAccruedIncome',
        'PeriodeafgraensningsporterIAlt', 'ForudbetalteOmkostninger',
        // Expanded variations
        'PrepaidExpenses', 'Prepayments',
        'AccruedIncome', 'DeferredCharges', 'PrepaidCosts',
        'PeriodeafgraensningerAktiver', 'ForudbetalteOgPeriodiseredeOmkostninger'
      ], undefined, 'periodeafgraensningsporterAktiver'),

      likvideBehoelninger: extractValue([
        'CashAndCashEquivalents', // EXACT TAG from logs! ✅
        'Cash', 'LikviderMidler',
        'LikvideBehoelninger', 'CashAtBankAndInHand',
        // Additional variations
        'LikvideBehoelningerIAlt',
        'LikviderMidlerIAlt'
      ], undefined, 'likvideBehoelninger'),
      
      // Detailed Balance Sheet - Equity & Liabilities
      // PHASE 2: Expanded tag coverage
      virksomhedskapital: extractValue([
        'ContributedCapital', // EXACT TAG from logs! ✅
        'ShareCapital', 'Virksomhedskapital', 'IssuedCapital',
        'StatedCapital',
        'VirksomhedskapitalIAlt', 'Selskabskapital', 'Aktiekapital',
        // Expanded variations
        'IssuedShareCapital', 'PaidInCapital', 'NominalCapital',
        'RegisteredCapital', 'EquityCapital', 'OrdinaryShares',
        'Anpartskapital', 'TegnetKapital', 'IndskudtKapital'
      ], undefined, 'virksomhedskapital'),

      overfoertResultat: extractValue([
        'RetainedEarnings', // EXACT TAG from logs! ✅
        'OverfoertResultat',
        'AccumulatedProfit', 'RetainedProfitLoss',
        'AccumulatedDeficit',
        // Additional variations
        'OverfoertResultatIAlt',
        'OpsparedOverskud',
        'HenlagtOverskud'
      ], undefined, 'overfoertResultat'),

      leverandoererAfVarerOgTjenesteydelser: extractValue([
        'ShorttermTradePayables', // EXACT TAG from logs! ✅
        'TradePayables', 'Leverandoerer',
        'LeverandoererAfVarer', 'AccountsPayable',
        'TradeAndOtherPayables',
        'LeverandoererAfVarerOgTjenesteydelerIAlt',
        'LeverandoererIAlt', 'Kreditorer',
        // Expanded variations
        'CurrentTradePayables',
        'SupplierPayables', 'TradeCreditors', 'VendorPayables',
        'AccountPayable', 'LeverandoerGaeld', 'Kreditorgjald'
      ], undefined, 'leverandoererAfVarerOgTjenesteydelser'),

      gaeldTilAssocieretVirksomheder: extractValue([
        'ShorttermPayablesToAssociates', // EXACT TAG from logs! ✅
        'PayablesToAssociates', 'GaeldTilAssocieretVirksomheder',
        'AmountsDueToRelatedParties', 'PayablesToRelatedCompanies',
        'GaeldTilAssocieretVirksomhederIAlt',
        'GaeldTilTilknyttedeVirksomheder',
        // Expanded variations
        'PayablesToAffiliates', 'PayablesToGroupCompanies',
        'IntercompanyPayables', 'RelatedPartyPayables',
        'PayablesToSubsidiaries', 'GaeldTilKoncernvirksomheder'
      ], undefined, 'gaeldTilAssocieretVirksomheder'),

      skyldideMomsOgAfgifter: extractValue([
        'VatAndDutiesPayables', // EXACT TAG from logs! ✅
        'VATPayable', 'SkyldideMomsOgAfgifter',
        'TaxPayable', 'VATAndDutiesPayable',
        'SkyldideMomsOgAfgifterIAlt', 'MomsGaeld', 'SkyldigeAfgifter',
        // Expanded variations
        'ValueAddedTaxPayable', 'SalesTaxPayable', 'DutiesPayable',
        'TaxesAndDutiesPayable', 'VATLiability', 'MomsGaeldsskyldig',
        'SkyldideSkatoger', 'AfgiftsGaeld'
      ], undefined, 'skyldideMomsOgAfgifter'),

      andenGaeld: extractValue([
        'OtherPayablesIncludingTaxPayablesLiabilitiesOtherThanProvisionsShortterm', // EXACT TAG from logs! ✅
        'OtherPayables', 'AndenGaeld',
        'OtherCurrentLiabilities', 'MiscellaneousPayables',
        'AndenGaeldIAlt', 'OevrigGaeld', 'AndreGaeldsforpligtelser',
        // Expanded variations
        'OtherShorttermLiabilities', 'OtherCreditors',
        'MiscellaneousCurrentLiabilities', 'SundryPayables',
        'OtherAccountsPayable', 'OevrigeKortfristeteGaeld',
        'AndenKortfristetGaeld'
      ], undefined, 'andenGaeld'),

      feriepengeforpligtelser: extractValue([
        'HolidayPayObligations', 'Feriepengeforpligtelser',
        'VacationPayLiability', 'AccruedHolidayPay',
        'FeriepengeforpligtelserIAlt', 'SkyldideFeriepenge',
        'FeriepengeGaeld',
        // Expanded variations
        'HolidayPayLiability', 'VacationPayObligations',
        'AccruedVacationPay', 'HolidayPayAccrual',
        'VacationAccrual', 'HolidayAllowanceLiability',
        'FeriepengeSkyldighed', 'OpsparedeFeriepenge'
      ], undefined, 'feriepengeforpligtelser'),

      periodeafgraensningsporterPassiver: extractValue([
        'ShorttermDeferredIncome', // EXACT TAG from logs! ✅
        'DeferredIncome', 'AccrualsAndDeferredIncome',
        'PeriodeafgraensningsporterPassiver', 'AccruedExpensesAndDeferredIncome',
        'PeriodeafgraensningsporterPassiverIAlt',
        'ForudbetalteIntaegter', 'PeriodeafgraensningerPassiver',
        // Expanded variations
        'DeferredRevenue', 'UnearnedRevenue', 'AccruedExpenses',
        'DeferredCredits', 'AdvancePaymentsFromCustomers',
        'PrepaidIncome', 'PeriodiseredePassiver',
        'ForudbetalingerFraKunder'
      ], undefined, 'periodeafgraensningsporterPassiver'),
      
      // Additional Balance Sheet - Liabilities breakdown
      langfristetGaeld: extractValue([
        'LongtermLiabilitiesOtherThanProvisions', // EXACT TAG from logs! ✅
        'LangfristetGaeld', 'LangfristedeGaeldsforpligtelser',
        'LangfristetGaeldTilKreditinstitutter',
        'NoncurrentLiabilities', 'LongtermLiabilities',
        'LongtermDebt', 'NoncurrentFinancialLiabilities'
      ], useInstantContexts, 'langfristetGaeld')
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

const FUNCTION_VERSION = "v2.1.0-EXTRACT-FIX";

serve(async (req) => {
  console.log("════════════════════════════════════════");
  console.log(`🚀 FUNCTION VERSION: ${FUNCTION_VERSION}`);
  console.log(`📅 TIMESTAMP: ${new Date().toISOString()}`);
  console.log("════════════════════════════════════════");
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
    
    // Add date range to reduce query scope (last 8 years to ensure 7 years of valid annual reports)
    const eightYearsAgo = new Date();
    eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);
    
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
        name: 'CVR + Date Range (8 years)',
        query: {
          "query": {
            "bool": {
              "must": [
                { "term": { "cvrNummer": parseInt(cvr) }},
                { 
                  "range": { 
                    "offentliggoerelsesTidspunkt": {
                      "gte": eightYearsAgo.toISOString(),
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
    console.log('[VERSION] v3.2-PRIORITY - Strict document priority: FINANSIEL → AARSRAPPORT only');
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
    
    // Process up to 20 reports to ensure we get 7 yearly ones (accounting for quarterly/half-year reports)
    // Increased from 15 to 20 to accommodate 7 years of data
    const reportsToProcess = Math.min(allHits.length, 20);
    console.log(`[YEAR DISCOVERY] Will process ${reportsToProcess} reports to find 7 yearly reports\n`);

    let processedCount = 0; // Track reports we've examined
    let yearlyReportsFound = 0; // Track actual yearly reports found

    for (let i = 0; i < reportsToProcess && yearlyReportsFound < 7; i++) {
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
      
      const rejectedTypes = ['HALVÅRSRAPPORT', 'DELÅRSRAPPORT'];
      let rejectedCount = 0;
      
      source.dokumenter?.forEach((doc: any, idx: number) => {
        const docType = (doc.dokumentType || '').toUpperCase();
        const mimeType = (doc.dokumentMimeType || '').toLowerCase();
        
        const isRejected = rejectedTypes.some(reject => docType.includes(reject));
        if (isRejected) {
          console.log(`  [${idx}] ❌ SKIPPED: ${doc.dokumentType} (interim/unwanted report)`);
          rejectedCount++;
        } else {
          console.log(`  [${idx}] ${doc.dokumentType} - ${mimeType}`);
        }
      });
      
      if (rejectedCount > 0) {
        console.log(`[DOCUMENT FILTER] Rejected ${rejectedCount} interim/unwanted reports`);
      }
      
      // STRICT PRIORITY SYSTEM FOR LISTED COMPANIES (børsnoterede):
      // Priority 1: AARSRAPPORT_ESEF (ESEF/IFRS format - smart truncated to ~800 lines, FIRST CHOICE)
      // Priority 2: AARSRAPPORT_FINANSIEL (traditional financial report for smaller companies)
      // Priority 3: AARSRAPPORT (fallback standard report)
      // NEVER: HALVÅRSRAPPORT, DELÅRSRAPPORT (interim reports)
      
      const allDocs = source.dokumenter || [];
      
      // Priority 1: AARSRAPPORT_ESEF (BEST for listed companies)
      let selectedDocument = allDocs.find((doc: any) => {
        const docType = (doc.dokumentType || '').toUpperCase();
        const mimeType = (doc.dokumentMimeType || '').toLowerCase();
        return docType === 'AARSRAPPORT_ESEF' && mimeType === 'application/xml';
      });
      
      if (selectedDocument) {
        console.log(`[DOC SELECT] ✅ Priority 1: Found AARSRAPPORT_ESEF (IFRS/ESEF format, will use smart truncation to ~800 lines)`);
      }
      
      if (!selectedDocument) {
        // Priority 2: AARSRAPPORT_FINANSIEL (for smaller companies)
        selectedDocument = allDocs.find((doc: any) => {
          const docType = (doc.dokumentType || '').toUpperCase();
          const mimeType = (doc.dokumentMimeType || '').toLowerCase();
          return docType === 'AARSRAPPORT_FINANSIEL' && mimeType === 'application/xml';
        });
        
        if (selectedDocument) {
          console.log(`[DOC SELECT] ✅ Priority 2: Found AARSRAPPORT_FINANSIEL (will use smart truncation to ~800 lines)`);
        }
      }
      
      if (!selectedDocument) {
        // Priority 3: AARSRAPPORT (fallback)
        selectedDocument = allDocs.find((doc: any) => {
          const docType = (doc.dokumentType || '').toUpperCase();
          const mimeType = (doc.dokumentMimeType || '').toLowerCase();
          return docType === 'AARSRAPPORT' && mimeType === 'application/xml';
        });
        
        if (selectedDocument) {
          console.log(`[DOC SELECT] ⚠️ Priority 3: Found AARSRAPPORT (standard XBRL fallback)`);
        }
      }
      
      if (!selectedDocument) {
        console.log(`[DOC SELECT] ❌ No valid annual report found - skipping`);
        continue;
      }
      
      // Create array with ONLY the selected document (no testing multiple docs)
      const aarsrapportXMLs = [selectedDocument];
      console.log(`[DOC SELECT] Processing ONLY: ${selectedDocument.dokumentType}`);
      
      // Step 3: Process the selected document (only 1 document now)
      console.log(`[STEP 2] Processing selected AARSRAPPORT document (priority-based selection)...`);
      
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
          // Reduced timeout from 8s to 5s to avoid CPU limit in edge functions
          const TIMEOUT_MS = 5000;
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
          
          // For AARSRAPPORT_FINANSIEL and AARSRAPPORT_ESEF, use smart truncation
          // Phase 1: Keep first 300 lines (contexts, namespaces, schema)
          // Phase 2: Extract lines with financial data tags from remaining lines
          // Result: ~800 lines total with BOTH income statement AND balance sheet data
          let processedContent = xbrlContent;
          if (candidateDoc.dokumentType === 'AARSRAPPORT_FINANSIEL' || candidateDoc.dokumentType === 'AARSRAPPORT_ESEF' || candidateDoc.dokumentType === 'AARSRAPPORT') {
            const lines = xbrlContent.split('\n');
            if (lines.length > 800) {
              // Phase 1: Always keep first 300 lines (contexts, namespaces, schema definitions)
              const structureLines = lines.slice(0, 300);
              
              // Phase 2: From remaining lines, extract only lines containing financial data tags
              // Look for XBRL tags (ifrs-full:, NOV:, fsa:, etc.) which contain the actual financial values
              const remainingLines = lines.slice(300);
              const financialDataLines = remainingLines.filter(line => {
                // Keep ONLY lines that contain specific XBRL financial tag namespaces
                // These namespaces contain the actual financial values we need
                return line.includes('ifrs-full:') || 
                       line.includes('NOV:') || 
                       line.includes('fsa:') || 
                       line.includes('gsd:') ||
                       line.includes('cmn:') ||
                       // Also keep the root XBRL closing tag for valid XML
                       line.includes('</xbrl>') ||
                       line.includes('</XBRL>');
              });
              
              // Limit financial data lines to ~500 to keep total around 800 lines
              const limitedFinancialLines = financialDataLines.slice(0, 500);
              
              // Combine both phases
              const smartTruncatedLines = [...structureLines, ...limitedFinancialLines];
              processedContent = smartTruncatedLines.join('\n');
              
              console.log(`[SMART TRUNCATE] Original: ${lines.length} lines`);
              console.log(`[SMART TRUNCATE] Phase 1 (structure): ${structureLines.length} lines`);
              console.log(`[SMART TRUNCATE] Phase 2 (financial data): ${limitedFinancialLines.length} lines (from ${financialDataLines.length} candidates)`);
              console.log(`[SMART TRUNCATE] Final: ${smartTruncatedLines.length} lines`);
              console.log(`[SMART TRUNCATE] Size reduced from ${(xbrlContent.length / 1_000_000).toFixed(1)}MB to ${(processedContent.length / 1_000).toFixed(0)}KB`);
            }
          }
          
          // Extract period from this specific document
          const actualPeriod = extractPeriodFromXBRL(processedContent, period);
          
          // Validate it's a full year
          if (!isFullYearPeriod(actualPeriod)) {
            console.log(`[TESTING ${docIdx + 1}/${aarsrapportXMLs.length}] ❌ Not a full year: ${actualPeriod}`);
            continue;
          }
          
          // Choose parser based on document type
          let parsedData;
          const documentType = candidateDoc.dokumentType || '';
          
          // Check if content contains IFRS tags (listed company format)
          // Check BOTH original and processed content to handle truncation
          const isIFRSFormat = xbrlContent.toLowerCase().includes('ifrs-full:') || 
                               xbrlContent.toLowerCase().includes('xmlns:ifrs-full') ||
                               processedContent.includes('ifrs-full:') || 
                               processedContent.includes('xmlns:ifrs-full') ||
                               documentType === 'AARSRAPPORT_ESEF' ||
                               documentType === 'AARSRAPPORT_FINANSIEL';
          
          if (isIFRSFormat) {
            // Use optimized parser for listed companies (IFRS/ESEF format)
            console.log(`[PARSER] Using optimized parser for IFRS/ESEF format (${documentType})`);
            const parsedMetrics = parseXBRLOptimized(processedContent, actualPeriod);
            parsedData = formatFinancialData(parsedMetrics, actualPeriod);
          } else {
            // Use old comprehensive parser for regular companies (FSA format)
            console.log(`[PARSER] Using comprehensive parser for FSA format (${documentType})`);
            parsedData = parseXBRL(processedContent, actualPeriod);
          }
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
      if (bestParsedData && bestScore >= 2) {
        // Extract year from the PARSED DATA, not from metadata
        // The parsed data's periode field contains the actual year from XBRL
        let reportYear: number | null = null;
        
        if (bestParsedData.periode && bestParsedData.periode !== 'N/A') {
          // Try to extract year from periode (e.g., "2021-01", "2021-01-01 - 2021-12-31")
          const yearMatch = bestParsedData.periode.match(/(\d{4})/);
          reportYear = yearMatch ? parseInt(yearMatch[1]) : null;
        }
        
        // If no year from periode, try bestPeriod as fallback
        if (!reportYear && bestPeriod) {
          const yearMatch = bestPeriod.match(/(\d{4})/);
          reportYear = yearMatch ? parseInt(yearMatch[1]) : null;
        }
        
        // Skip if we already have data for this year (prevent duplicates)
        if (reportYear && yearsProcessed.has(reportYear)) {
          console.log(`[SKIP] Year ${reportYear} already processed - skipping duplicate`);
          console.log(`   Parsed periode: ${bestParsedData.periode}`);
          console.log(`   Metadata period: ${bestPeriod}`);
          continue;
        }
        
        console.log(`[SUCCESS] Using document with score ${bestScore}/8 for year ${reportYear}: ${bestDocumentUrl.slice(0, 80)}...`);
        console.log(`   Extracted year from: ${bestParsedData.periode || bestPeriod}`);
        
        reportMetadata.documentUrl = bestDocumentUrl;
        financialReports.push(reportMetadata);
        
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
        
        console.log(`✅ Found yearly report ${yearlyReportsFound}/7`);
        
        if (yearlyReportsFound >= 7) {
          console.log(`✅ Successfully found 7 yearly reports - stopping`);
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

// Optimized XBRL Parser with Single-Pass Tag Indexing
// This approach eliminates the nested loop explosion by parsing once and using O(1) lookups

interface XBRLTag {
  value: string;
  contextRef: string;
  unitRef?: string;
  decimals?: string;
}

interface XBRLContext {
  id: string;
  startDate?: string;
  endDate?: string;
  instant?: string;
}

interface TagIndex {
  tags: Map<string, XBRLTag[]>; // tagName -> array of values (multiple contexts)
  contexts: Map<string, XBRLContext>; // contextRef -> context details
}

/**
 * Parse XBRL content once into indexed structures for O(1) lookups
 */
function buildTagIndex(xbrlContent: string): TagIndex {
  const tags = new Map<string, XBRLTag[]>();
  const contexts = new Map<string, XBRLContext>();
  
  // Parse contexts first (these define the time periods)
  const contextRegex = /<xbrli:context[^>]+id="([^"]+)"[^>]*>([\s\S]*?)<\/xbrli:context>/gi;
  let contextMatch;
  
  while ((contextMatch = contextRegex.exec(xbrlContent)) !== null) {
    const contextId = contextMatch[1];
    const contextBody = contextMatch[2];
    
    const startDateMatch = /<xbrli:startDate>([^<]+)<\/xbrli:startDate>/.exec(contextBody);
    const endDateMatch = /<xbrli:endDate>([^<]+)<\/xbrli:endDate>/.exec(contextBody);
    const instantMatch = /<xbrli:instant>([^<]+)<\/xbrli:instant>/.exec(contextBody);
    
    contexts.set(contextId, {
      id: contextId,
      startDate: startDateMatch?.[1],
      endDate: endDateMatch?.[1],
      instant: instantMatch?.[1]
    });
  }
  
  // Parse all financial tags in a single pass
  // Match patterns like: <ifrs-full:Revenue contextRef="ctx-2" decimals="-5" unitRef="eur">3833500000</ifrs-full:Revenue>
  const tagRegex = /<([\w-]+:[\w-]+)\s+contextRef="([^"]+)"[^>]*>([^<]+)<\/\1>/gi;
  let tagMatch;
  
  while ((tagMatch = tagRegex.exec(xbrlContent)) !== null) {
    const fullTagName = tagMatch[1]; // e.g., "ifrs-full:Revenue"
    const contextRef = tagMatch[2];
    const value = tagMatch[3];
    
    // Extract attributes from the opening tag
    const openingTag = xbrlContent.substring(tagMatch.index, tagMatch.index + 200);
    const unitMatch = /unitRef="([^"]+)"/.exec(openingTag);
    const decimalsMatch = /decimals="([^"]+)"/.exec(openingTag);
    
    const tagData: XBRLTag = {
      value,
      contextRef,
      unitRef: unitMatch?.[1],
      decimals: decimalsMatch?.[1]
    };
    
    // Store by tag name (normalized to lowercase for case-insensitive lookup)
    const normalizedTagName = fullTagName.toLowerCase();
    
    if (!tags.has(normalizedTagName)) {
      tags.set(normalizedTagName, []);
    }
    tags.get(normalizedTagName)!.push(tagData);
  }
  
  console.log(`[TAG INDEX] Built index with ${tags.size} unique tags and ${contexts.size} contexts`);
  
  return { tags, contexts };
}

/**
 * Find the best value for a tag matching the requested period
 */
function findTagValue(
  tagIndex: TagIndex,
  tagNames: string[], // Try multiple variations
  targetYear: number
): { value: number; currency: string } | null {
  
  for (const tagName of tagNames) {
    const normalizedTag = tagName.toLowerCase();
    const tagData = tagIndex.tags.get(normalizedTag);
    
    if (!tagData || tagData.length === 0) continue;
    
    // Find the best match for the target year
    for (const tag of tagData) {
      const context = tagIndex.contexts.get(tag.contextRef);
      if (!context) continue;
      
      // Check if this context matches the target year
      const contextYear = context.endDate 
        ? new Date(context.endDate).getFullYear()
        : context.instant 
        ? new Date(context.instant).getFullYear()
        : null;
      
      if (contextYear === targetYear) {
        // Parse the value
        const numValue = parseFloat(tag.value);
        if (!isNaN(numValue)) {
          // Note: decimals attribute indicates precision, not a scaling factor
          // Values are already in the correct scale - DO NOT multiply
          const scaledValue = numValue;
          
          return {
            value: scaledValue,
            currency: tag.unitRef?.toUpperCase() || 'EUR'
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Optimized parseXBRL function using tag indexing
 */
export function parseXBRLOptimized(xbrlContent: string, period: string) {
  const targetYear = parseInt(period);
  
  console.log(`[PARSE START] Building tag index for year ${targetYear}...`);
  const startTime = Date.now();
  
  // STEP 1: Build the index (single pass through content)
  const tagIndex = buildTagIndex(xbrlContent);
  
  console.log(`[PARSE INDEX] Index built in ${Date.now() - startTime}ms`);
  
  // STEP 2: Extract financial metrics using O(1) lookups
  const metrics = {
    // Revenue variations
    revenue: findTagValue(tagIndex, [
      'ifrs-full:revenue',
      'fsa:nettoomsaetning',
      'gsd:omsaetning'
    ], targetYear),
    
    // Profit variations
    profit: findTagValue(tagIndex, [
      'ifrs-full:profitloss',
      'ifrs-full:profitlossattributabletoownersofparent',
      'fsa:aarsresultat',
      'gsd:resultat'
    ], targetYear),
    
    // Assets variations
    assets: findTagValue(tagIndex, [
      'ifrs-full:assets',
      'fsa:aktiver',
      'gsd:aktiverialt'
    ], targetYear),
    
    // Equity variations
    equity: findTagValue(tagIndex, [
      'ifrs-full:equity',
      'ifrs-full:equityattributabletoownersofparent',
      'fsa:egenkapital',
      'gsd:egenkapital'
    ], targetYear),
    
    // EBITDA / Operating Profit
    ebitda: findTagValue(tagIndex, [
      'ifrs-full:profitlossfromoperatingactivities',
      'nov:profitlossfromoperatingactivitiesbeforespecialitems',
      'fsa:resultatfoemfinansieringsposter'
    ], targetYear),
    
    // Current Assets
    currentAssets: findTagValue(tagIndex, [
      'ifrs-full:currentassets',
      'fsa:omsaetningsaktiver'
    ], targetYear),
    
    // Non-current Assets
    noncurrentAssets: findTagValue(tagIndex, [
      'ifrs-full:noncurrentassets',
      'fsa:anlaegsaktiver'
    ], targetYear),
    
    // Current Liabilities
    currentLiabilities: findTagValue(tagIndex, [
      'ifrs-full:currentliabilities',
      'fsa:kortfristetgaeld'
    ], targetYear),
    
    // Non-current Liabilities
    noncurrentLiabilities: findTagValue(tagIndex, [
      'ifrs-full:noncurrentliabilities',
      'fsa:langfristetgaeld'
    ], targetYear)
  };
  
  console.log(`[PARSE COMPLETE] Extracted metrics in ${Date.now() - startTime}ms`);
  console.log(`[METRICS FOUND] Revenue: ${!!metrics.revenue}, Profit: ${!!metrics.profit}, Assets: ${!!metrics.assets}, Equity: ${!!metrics.equity}`);
  
  return metrics;
}

// Currency conversion rates to DKK
const CURRENCY_TO_DKK: Record<string, number> = {
  'DKK': 1,
  'EUR': 7.46,
  'USD': 6.85,
  'GBP': 8.70,
  'SEK': 0.63,
  'NOK': 0.62,
};

/**
 * Extract currency code from unitRef
 * Handles formats like: "iso4217:EUR", "EUR", "eur", "vDKK", "DKK_1000", etc.
 */
function extractCurrencyFromUnitRef(unitRef: string | undefined): string {
  if (!unitRef) return 'DKK';
  
  const upper = unitRef.toUpperCase();
  
  // Check for iso4217: prefix (e.g., "iso4217:EUR")
  if (upper.includes('ISO4217:')) {
    const match = upper.match(/ISO4217:([A-Z]{3})/);
    if (match) return match[1];
  }
  
  // Check for currency codes anywhere in the string
  for (const currency of Object.keys(CURRENCY_TO_DKK)) {
    if (upper.includes(currency)) {
      return currency;
    }
  }
  
  // Default to DKK if no known currency found
  return 'DKK';
}

/**
 * Convert a value from source currency to DKK
 */
function convertToDKK(value: number | null, currency: string): number | null {
  if (value === null) return null;
  
  const upperCurrency = currency.toUpperCase();
  const rate = CURRENCY_TO_DKK[upperCurrency];
  
  if (rate && rate !== 1) {
    const converted = value * rate;
    console.log(`[CURRENCY] Converting ${value.toLocaleString()} ${upperCurrency} → ${converted.toLocaleString()} DKK (rate: ${rate})`);
    return converted;
  }
  
  return value;
}

/**
 * Convert extracted metrics to database format
 * Automatically converts EUR and other currencies to DKK using fixed rates
 */
export function formatFinancialData(metrics: ReturnType<typeof parseXBRLOptimized>, period: string) {
  // Detect the source currency from the metrics (use extractCurrencyFromUnitRef for proper parsing)
  const rawCurrency = metrics.revenue?.currency || metrics.profit?.currency || metrics.assets?.currency || 'DKK';
  const sourceCurrency = extractCurrencyFromUnitRef(rawCurrency);
  const needsConversion = sourceCurrency !== 'DKK';
  
  if (needsConversion) {
    console.log(`[CURRENCY] Detected ${sourceCurrency} from unitRef "${rawCurrency}" - will convert all values to DKK`);
  }
  
  return {
    periode: period,
    
    // Map to field names expected by scoreFinancialData in index.ts
    // Convert all monetary values to DKK
    nettoomsaetning: convertToDKK(metrics.revenue?.value || null, sourceCurrency),
    aaretsResultat: convertToDKK(metrics.profit?.value || null, sourceCurrency),
    statusBalance: convertToDKK(metrics.assets?.value || null, sourceCurrency),
    egenkapital: convertToDKK(metrics.equity?.value || null, sourceCurrency),
    driftsresultat: convertToDKK(metrics.ebitda?.value || null, sourceCurrency),
    resultatFoerSkat: convertToDKK(metrics.profit?.value || null, sourceCurrency),
    anlaegsaktiverValue: convertToDKK(metrics.noncurrentAssets?.value || null, sourceCurrency),
    omsaetningsaktiver: convertToDKK(metrics.currentAssets?.value || null, sourceCurrency),
    
    // Additional fields for comprehensive financial data
    kortfristet_gaeld: convertToDKK(metrics.currentLiabilities?.value || null, sourceCurrency),
    langfristet_gaeld: convertToDKK(metrics.noncurrentLiabilities?.value || null, sourceCurrency),
    
    // Always store as DKK after conversion, but keep original currency info for reference
    valuta: 'DKK',
    originalValuta: sourceCurrency
  };
}

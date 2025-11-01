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
          // In XBRL, the numeric value is already the correct magnitude
          // The decimals attribute indicates precision, not a scaling factor
          // Example: decimals="-5" means "rounded to nearest 100,000" 
          // but the value 178990 already means 17,899,000 thousands DKK
          const scaledValue = numValue;
          
          // Log the raw value for debugging
          console.log(`[VALUE] ${normalizedTag}: ${numValue} (decimals=${tag.decimals || 'none'})`);
          
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

/**
 * Convert extracted metrics to database format
 */
export function formatFinancialData(metrics: ReturnType<typeof parseXBRLOptimized>, period: string) {
  return {
    periode: period,
    
    // Map to field names expected by scoreFinancialData in index.ts
    nettoomsaetning: metrics.revenue?.value || null,
    aaretsResultat: metrics.profit?.value || null,
    statusBalance: metrics.assets?.value || null,
    egenkapital: metrics.equity?.value || null,
    driftsresultat: metrics.ebitda?.value || null,
    resultatFoerSkat: metrics.profit?.value || null,
    anlaegsaktiverValue: metrics.noncurrentAssets?.value || null,
    omsaetningsaktiver: metrics.currentAssets?.value || null,
    
    // Additional fields for comprehensive financial data
    kortfristet_gaeld: metrics.currentLiabilities?.value || null,
    langfristet_gaeld: metrics.noncurrentLiabilities?.value || null,
    valuta: metrics.revenue?.currency || metrics.profit?.currency || 'DKK'
  };
}

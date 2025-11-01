// Optimized XBRL Parser with Single-Pass Tag Indexing
// This approach eliminates the nested loop explosion by parsing once and using O(1) lookups

// EUR/DKK exchange rate (Danish Krone is pegged to Euro at a stable rate)
const EUR_TO_DKK = 7.46;

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
  
  const allTags = Array.from(tags.keys()).sort();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[TAG INDEX] Built index with ${tags.size} unique tags and ${contexts.size} contexts`);
  console.log(`[TAG SAMPLE] First 100 tags found in document:`);
  allTags.slice(0, 100).forEach((tag, i) => {
    if (i % 3 === 0) console.log(''); // Add line break every 3 tags
    console.log(`  ${i + 1}. ${tag}`);
  });
  console.log(`${'='.repeat(80)}\n`);
  
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
          // Normalize value to THOUSANDS of DKK (because display expects this)
          let valueInThousands = numValue;
          
          // Check unitRef for scale information
          const unitRef = tag.unitRef?.toUpperCase() || '';
          
          if (unitRef.includes('MILLION') || unitRef.includes('1000000')) {
            // Value is in millions, convert to thousands: multiply by 1000
            valueInThousands = numValue * 1000;
            console.log(`[SCALE] ${normalizedTag}: ${numValue}M → ${valueInThousands}K (×1000 from unitRef: ${tag.unitRef})`);
            
          } else if (unitRef.includes('THOUSAND') || unitRef.includes('1000')) {
            // Value is already in thousands - perfect, no scaling needed
            valueInThousands = numValue;
            console.log(`[SCALE] ${normalizedTag}: ${numValue}K → ${valueInThousands}K (no scaling, unitRef: ${tag.unitRef})`);
            
          } else if (unitRef === 'DKK' || unitRef === 'EUR' || !unitRef) {
            // Value is in actual currency units, convert to thousands: divide by 1000
            valueInThousands = numValue / 1000;
            console.log(`[SCALE] ${normalizedTag}: ${numValue} → ${valueInThousands}K (÷1000 from unitRef: ${tag.unitRef || 'none'})`);
          }
          
          // Fallback: check decimals attribute
          // decimals="-3" means value is in thousands (round to nearest 1000)
          // decimals="-6" means value is in millions (round to nearest 1000000)
          if (valueInThousands === numValue && tag.decimals) {
            const decimals = parseInt(tag.decimals);
            if (decimals === -6) {
              // Value is in millions, convert to thousands
              valueInThousands = numValue * 1000;
              console.log(`[SCALE] ${normalizedTag}: ${numValue}M → ${valueInThousands}K (×1000 from decimals: -6)`);
            } else if (decimals === -3) {
              // Value is in thousands, already correct
              console.log(`[SCALE] ${normalizedTag}: ${numValue}K (no scaling, decimals: -3)`);
            } else if (decimals >= 0) {
              // Value is in actual units, convert to thousands
              valueInThousands = numValue / 1000;
              console.log(`[SCALE] ${normalizedTag}: ${numValue} → ${valueInThousands}K (÷1000 from decimals: ${decimals})`);
            }
          }
          
          console.log(`[FOUND] ${normalizedTag} = ${valueInThousands}K (year: ${contextYear}, unitRef: "${tag.unitRef || 'none'}", decimals: "${tag.decimals || 'none'}")`);
          
          return {
            value: valueInThousands,  // Now in thousands of DKK
            currency: 'DKK'
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
    // ============= INCOME STATEMENT (Resultatregnskab) =============
    
    // Revenue
    revenue: findTagValue(tagIndex, [
      'ifrs-full:revenue',
      'fsa:nettoomsaetning',
      'gsd:omsaetning'
    ], targetYear),
    
    // Cost of sales (Vareforbrug)
    costOfSales: findTagValue(tagIndex, [
      'ifrs-full:costofsales',
      'ifrs-full:costofgoodssold',
      'fsa:vareforbrug'
    ], targetYear),
    
    // Other costs (Øvrige omkostninger)
    otherCosts: findTagValue(tagIndex, [
      'ifrs-full:otherexpensebyfunction',
      'ifrs-full:othercostofsales',
      'fsa:ovrigeomkostninger'
    ], targetYear),
    
    // Gross profit (Bruttofortjeneste)
    grossProfit: findTagValue(tagIndex, [
      'ifrs-full:grossprofit',
      'fsa:bruttofortjeneste'
    ], targetYear),
    
    // Personnel costs (Personaleomkostninger)
    personnelCosts: findTagValue(tagIndex, [
      'ifrs-full:EmployeeBenefitsExpense',  // Standard IFRS camelCase
      'ifrs-full:employeebenefitsexpense',  // lowercase
      'ifrs-full:employeebenefitsexpenses', // plural variant
      'nov:EmployeeExpenses',
      'nov:EmployeeCosts',
      'nov:employeeexpenses',
      'nov:employeecosts',
      'fsa:personaleomkostninger'
    ], targetYear),
    
    // Depreciation and amortization (Afskrivninger)
    depreciation: findTagValue(tagIndex, [
      'ifrs-full:DepreciationAndAmortisationExpense',  // Standard IFRS camelCase
      'ifrs-full:DepreciationAmortisationAndImpairmentLossReversalOfImpairmentLossRecognisedInProfitOrLoss',
      'ifrs-full:Depreciation',
      'ifrs-full:Amortisation',
      'nov:DepreciationAmortisationAndImpairmentLosses',
      'nov:DepreciationAndAmortisation',
      'ifrs-full:depreciationandamortisationexpense',  // lowercase fallbacks
      'ifrs-full:depreciation',
      'ifrs-full:amortisation',
      'fsa:afskrivninger'
    ], targetYear),
    
    // Capacity costs (Kapacitetsomkostninger)
    capacityCosts: findTagValue(tagIndex, [
      'ifrs-full:SellingExpenses',                    // Standard IFRS camelCase
      'ifrs-full:DistributionCosts',
      'ifrs-full:AdministrativeExpenses',
      'ifrs-full:OtherAdministrativeExpense',
      'ifrs-full:ResearchAndDevelopmentExpense',
      'nov:SalesAndMarketingCosts',
      'nov:SalesAndDistributionCosts',
      'nov:ResearchAndDevelopmentCosts',
      'ifrs-full:sellingexpenses',                    // lowercase fallbacks
      'ifrs-full:administrativeexpenses',
      'ifrs-full:otheradministrativeexpense',
      'fsa:kapacitetsomkostninger'
    ], targetYear),
    
    // Operating profit / EBIT (Primært resultat)
    ebit: findTagValue(tagIndex, [
      'ifrs-full:profitlossfromoperatingactivities',
      'nov:profitlossfromoperatingactivitiesbeforespecialitems',
      'fsa:resultatfoemfinansieringsposter',
      'fsa:primaertresultat'
    ], targetYear),
    
    // Financial income (Finansielle indtægter)
    financialIncome: findTagValue(tagIndex, [
      'ifrs-full:financeincome',
      'fsa:finansielleindtaegter'
    ], targetYear),
    
    // Financial expenses (Finansielle udgifter)
    financialExpenses: findTagValue(tagIndex, [
      'ifrs-full:FinanceCosts',                       // Standard IFRS camelCase
      'ifrs-full:FinanceExpense',
      'ifrs-full:FinanceCost',
      'nov:NetFinancialExpenses',
      'nov:FinancialExpenses',
      'ifrs-full:financeexpense',                     // lowercase fallbacks
      'ifrs-full:financecosts',
      'ifrs-full:financecost',
      'fsa:finansielleudgifter'
    ], targetYear),
    
    // Other financial items net (Andre finansielle indtægter eller udgifter netto)
    otherFinancialNet: findTagValue(tagIndex, [
      'fsa:andrefinansielleposternetou',
      'ifrs-full:otherfinanceincome'
    ], targetYear),
    
    // Financial items net (Finansielle poster netto)
    financialNet: findTagValue(tagIndex, [
      'fsa:finansielleposterinetto',
      'ifrs-full:financeincomecost'
    ], targetYear),
    
    // Ordinary result (Ordinært resultat)
    ordinaryResult: findTagValue(tagIndex, [
      'fsa:ordinaertresultat',
      'ifrs-full:profitlossbeforetax'
    ], targetYear),
    
    // Extraordinary items (Ekstraordinære poster)
    extraordinaryItems: findTagValue(tagIndex, [
      'fsa:ekstraordinaereposter'
    ], targetYear),
    
    // Result before tax (Resultat før skat)
    resultBeforeTax: findTagValue(tagIndex, [
      'ifrs-full:profitlossbeforetax',
      'fsa:resultatfoerskat'
    ], targetYear),
    
    // Tax (Skat)
    tax: findTagValue(tagIndex, [
      'ifrs-full:incometaxexpensecontinuingoperations',
      'ifrs-full:taxexpense',
      'fsa:skatafaaretsresultat'
    ], targetYear),
    
    // Net result (Årets resultat)
    profit: findTagValue(tagIndex, [
      'ifrs-full:profitloss',
      'ifrs-full:profitlossattributabletoownersofparent',
      'fsa:aarsresultat',
      'gsd:resultat'
    ], targetYear),
    
    // ============= BALANCE SHEET (Balanceregnskab) =============
    
    // --- ASSETS ---
    
    // Goodwill
    goodwill: findTagValue(tagIndex, [
      'ifrs-full:goodwill',
      'fsa:goodwill'
    ], targetYear),
    
    // Other intangible assets (Øvrige immaterielle anlægsaktiver)
    otherIntangibleAssets: findTagValue(tagIndex, [
      'ifrs-full:otherintangibleassets',
      'fsa:ovrigeimmaterielleanlaegsaktiver'
    ], targetYear),
    
    // Total intangible assets (Immaterielle anlægsaktiver i alt)
    intangibleAssets: findTagValue(tagIndex, [
      'ifrs-full:intangibleassetsotherthangoodwill',
      'ifrs-full:intangibleassets',
      'fsa:immaterielleanlaegsaktiver'
    ], targetYear),
    
    // Land and buildings (Grunde og bygninger)
    landAndBuildings: findTagValue(tagIndex, [
      'ifrs-full:landdwellingsotherfixedstructures',
      'ifrs-full:landdwellingsotherfixtures',
      'fsa:grundeogbygninger'
    ], targetYear),
    
    // Other equipment (Andre anlæg og driftsmidler)
    otherEquipment: findTagValue(tagIndex, [
      'ifrs-full:machineryandequipment',
      'ifrs-full:motorvehicles',
      'fsa:andreanlaegogdriftsmidler'
    ], targetYear),
    
    // Other tangible assets (Øvrige materielle anlægsaktiver)
    otherTangibleAssets: findTagValue(tagIndex, [
      'ifrs-full:othertangibleassets',
      'fsa:ovrigematerielleanlaegsaktiver'
    ], targetYear),
    
    // Total tangible assets (Materielle anlægsaktiver i alt)
    tangibleAssets: findTagValue(tagIndex, [
      'ifrs-full:propertyplantandequipment',
      'fsa:materielleanlaegsaktiver'
    ], targetYear),
    
    // Shares / Investments (Kapitalandele)
    shares: findTagValue(tagIndex, [
      'ifrs-full:investmentsinassociates',
      'ifrs-full:noncurrentinvestments',
      'fsa:kapitalandele'
    ], targetYear),
    
    // Long-term receivables (Langfristede tilgodehavender)
    longTermReceivables: findTagValue(tagIndex, [
      'ifrs-full:noncurrentreceivables',
      'fsa:langfristetilgodehavender'
    ], targetYear),
    
    // Other long-term financial assets (Andre langfristede finansielle anlægsaktiver)
    otherLongTermFinancial: findTagValue(tagIndex, [
      'ifrs-full:othernoncurrentfinancialassets',
      'fsa:andrefinansielleanlaegsaktiver'
    ], targetYear),
    
    // Total financial assets (Finansielle anlægsaktiver i alt)
    financialAssets: findTagValue(tagIndex, [
      'ifrs-full:noncurrentfinancialassets',
      'fsa:finansielleanlaegsaktiver'
    ], targetYear),
    
    // Total non-current assets (Anlægsaktiver i alt)
    noncurrentAssets: findTagValue(tagIndex, [
      'ifrs-full:noncurrentassets',
      'fsa:anlaegsaktiver'
    ], targetYear),
    
    // Inventories (Varebeholdninger)
    inventories: findTagValue(tagIndex, [
      'ifrs-full:inventories',
      'fsa:varebeholdninger'
    ], targetYear),
    
    // Trade receivables (Tilgodehavender fra salg og tjenesteydelser)
    tradeReceivables: findTagValue(tagIndex, [
      'ifrs-full:tradereceivables',
      'ifrs-full:currenttradereceivables',
      'fsa:tilgodehavenderfrasalgogtjenesteydelser'
    ], targetYear),
    
    // Related party receivables (Tilgodehavender hos nærtstående parter)
    relatedPartyReceivables: findTagValue(tagIndex, [
      'ifrs-full:currentreceivablesfromrelatedparties',
      'fsa:tilgodehavenderhosnaertstaendeparter'
    ], targetYear),
    
    // Other receivables (Andre tilgodehavender)
    otherReceivables: findTagValue(tagIndex, [
      'ifrs-full:othercurrentreceivables',
      'fsa:andretilgodehavender'
    ], targetYear),
    
    // Securities (Værdipapirer)
    securities: findTagValue(tagIndex, [
      'ifrs-full:currentinvestments',
      'fsa:vaerdipapirer'
    ], targetYear),
    
    // Cash (Likvide midler)
    cash: findTagValue(tagIndex, [
      'ifrs-full:cashandcashequivalents',
      'fsa:likvidemidler'
    ], targetYear),
    
    // Total current assets (Omsætningsaktiver i alt)
    currentAssets: findTagValue(tagIndex, [
      'ifrs-full:currentassets',
      'fsa:omsaetningsaktiver'
    ], targetYear),
    
    // Total assets (Status balance)
    assets: findTagValue(tagIndex, [
      'ifrs-full:assets',
      'fsa:aktiver',
      'gsd:aktiverialt'
    ], targetYear),
    
    // --- EQUITY AND LIABILITIES ---
    
    // Share capital (Selskabskapital)
    shareCapital: findTagValue(tagIndex, [
      'ifrs-full:issuedcapital',
      'fsa:virksomhedskapital'
    ], targetYear),
    
    // Retained earnings (Overført resultat)
    retainedEarnings: findTagValue(tagIndex, [
      'ifrs-full:retainedearnings',
      'fsa:overfoertoverskud'
    ], targetYear),
    
    // Dividend (Udbytte)
    dividend: findTagValue(tagIndex, [
      'ifrs-full:dividendspayable',
      'fsa:foreslaaetudbyttefoerregnskabsaaret'
    ], targetYear),
    
    // Other reserves (Øvrige reserver)
    otherReserves: findTagValue(tagIndex, [
      'ifrs-full:otherreserves',
      'fsa:ovrigereserver'
    ], targetYear),
    
    // Equity before minority (Egenkapital før minoritetsinteressernes andel)
    equityBeforeMinority: findTagValue(tagIndex, [
      'ifrs-full:equityattributabletoownersofparent',
      'fsa:egenkapitalfoerminoritetsinteresser'
    ], targetYear),
    
    // Minority interests (Minoritetsinteressernes andel)
    minorityInterests: findTagValue(tagIndex, [
      'ifrs-full:noncontrollinginterests',
      'fsa:minoritetsinteresser'
    ], targetYear),
    
    // Total equity (Egenkapital i alt)
    equity: findTagValue(tagIndex, [
      'ifrs-full:equity',
      'ifrs-full:equityattributabletoownersofparent',
      'fsa:egenkapital',
      'gsd:egenkapital'
    ], targetYear),
    
    // Deferred tax (Udskudt skat)
    deferredTax: findTagValue(tagIndex, [
      'ifrs-full:deferredtaxliabilities',
      'fsa:udskudtskat'
    ], targetYear),
    
    // Provisions (Hensættelse)
    provisions: findTagValue(tagIndex, [
      'ifrs-full:provisions',
      'fsa:hensaettelser'
    ], targetYear),
    
    // Long-term debt to credit institutions (Langfristet gæld til realkreaditinstitutter)
    longTermCreditInstitutions: findTagValue(tagIndex, [
      'fsa:langfristetgaeldtilrealkreditinstitutter'
    ], targetYear),
    
    // Long-term bank debt (Langfristet gæld til banker)
    longTermBankDebt: findTagValue(tagIndex, [
      'ifrs-full:noncurrentborrowings',
      'fsa:langfristetgaeldtilbanker'
    ], targetYear),
    
    // Long-term related party debt (Langfristet gæld til nærtstående parter)
    longTermRelatedPartyDebt: findTagValue(tagIndex, [
      'fsa:langfristetgaeldtilnaertstaendeparter'
    ], targetYear),
    
    // Other long-term debt (Anden langfristet gæld)
    otherLongTermDebt: findTagValue(tagIndex, [
      'ifrs-full:othernoncurrentliabilities',
      'fsa:andenlangfristetgaeld'
    ], targetYear),
    
    // Total long-term debt (Langfristet gæld i alt)
    noncurrentLiabilities: findTagValue(tagIndex, [
      'ifrs-full:noncurrentliabilities',
      'fsa:langfristetgaeld'
    ], targetYear),
    
    // Short-term related party debt (Kortfristet gæld til nærtstående parter)
    shortTermRelatedPartyDebt: findTagValue(tagIndex, [
      'fsa:kortfristetgaeldtilnaertstaendeparter'
    ], targetYear),
    
    // Short-term credit institutions (Kortfristet gæld til realkreditinstitutter)
    shortTermCreditInstitutions: findTagValue(tagIndex, [
      'fsa:kortfristetgaeldtilrealkreditinstitutter'
    ], targetYear),
    
    // Short-term bank debt (Kortfristet gæld til banker)
    shortTermBankDebt: findTagValue(tagIndex, [
      'ifrs-full:currentborrowings',
      'fsa:kortfristetgaeldtilbanker'
    ], targetYear),
    
    // Corporate tax (Selskabsskat)
    corporateTax: findTagValue(tagIndex, [
      'ifrs-full:currenttaxpayable',
      'fsa:selskabsskat'
    ], targetYear),
    
    // Trade payables (Varekreditorer)
    tradePayables: findTagValue(tagIndex, [
      'ifrs-full:tradepayables',
      'ifrs-full:currenttradepayables',
      'fsa:leverandoererafvarer'
    ], targetYear),
    
    // Other debt (Anden gæld)
    otherDebt: findTagValue(tagIndex, [
      'ifrs-full:othercurrentliabilities',
      'fsa:andengaeld'
    ], targetYear),
    
    // Total short-term debt (Kortfristet gæld i alt)
    currentLiabilities: findTagValue(tagIndex, [
      'ifrs-full:currentliabilities',
      'fsa:kortfristetgaeld'
    ], targetYear),
    
    // Total liabilities (Passiver i alt)
    totalLiabilities: findTagValue(tagIndex, [
      'ifrs-full:equityandliabilities',
      'fsa:passiver'
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
  // Detect currency from the first available metric
  const currency = metrics.revenue?.currency || metrics.profit?.currency || 'DKK';
  
  // Convert EUR values to DKK
  const convertToDKK = (value: number | null, sourceCurrency: string): number | null => {
    if (value === null) return null;
    if (sourceCurrency === 'EUR') {
      console.log(`[CURRENCY] Converting ${value} from EUR to DKK (rate: ${EUR_TO_DKK})`);
      return Math.round(value * EUR_TO_DKK);
    }
    return value; // Already in DKK or unknown currency
  };
  
  // ============= CALCULATED FIELDS =============
  // Calculate fields that aren't directly available in XBRL but can be derived
  
  // Calculate capacity costs if not directly available
  let capacityCosts = metrics.capacityCosts?.value || null;
  if (!capacityCosts && metrics.ebit?.value && metrics.grossProfit?.value) {
    const personnelCosts = metrics.personnelCosts?.value || 0;
    const depreciation = metrics.depreciation?.value || 0;
    
    // Capacity costs = Gross Profit - EBIT - Personnel - Depreciation
    const calculated = metrics.grossProfit.value - metrics.ebit.value - personnelCosts - depreciation;
    if (calculated !== 0) {
      capacityCosts = calculated;
      console.log(`[CALCULATED] Capacity costs: ${capacityCosts} (from Gross Profit - EBIT - Personnel - Depreciation)`);
    }
  }
  
  // Calculate financial net if not directly available
  let financialNet = metrics.financialNet?.value || null;
  if (!financialNet && metrics.financialIncome?.value && metrics.financialExpenses?.value) {
    financialNet = metrics.financialIncome.value + metrics.financialExpenses.value; // expenses are negative
    console.log(`[CALCULATED] Financial net: ${financialNet} (from Financial Income + Financial Expenses)`);
  }
  
  return {
    periode: period,
    
    // ============= INCOME STATEMENT (Resultatregnskab) =============
    
    // Core fields (maintain compatibility)
    nettoomsaetning: convertToDKK(metrics.revenue?.value || null, currency),
    aaretsResultat: convertToDKK(metrics.profit?.value || null, currency),
    statusBalance: convertToDKK(metrics.assets?.value || null, currency),
    egenkapital: convertToDKK(metrics.equity?.value || null, currency),
    driftsresultat: convertToDKK(metrics.ebit?.value || null, currency),
    resultatFoerSkat: convertToDKK(metrics.resultBeforeTax?.value || null, currency),
    
    // Expanded income statement fields
    vareforbrug: convertToDKK(metrics.costOfSales?.value || null, currency),
    ovrigeomkostninger: convertToDKK(metrics.otherCosts?.value || null, currency),
    bruttofortjeneste: convertToDKK(metrics.grossProfit?.value || null, currency),
    personaleomkostninger: convertToDKK(metrics.personnelCosts?.value || null, currency),
    afskrivninger: convertToDKK(metrics.depreciation?.value || null, currency),
    kapacitetsomkostninger: convertToDKK(capacityCosts, currency), // Use calculated value
    primaertresultat: convertToDKK(metrics.ebit?.value || null, currency),
    finansielleindtaegter: convertToDKK(metrics.financialIncome?.value || null, currency),
    finansielleudgifter: convertToDKK(metrics.financialExpenses?.value || null, currency),
    andrefinansielleposter: convertToDKK(metrics.otherFinancialNet?.value || null, currency),
    finansielleposterinetto: convertToDKK(financialNet, currency), // Use calculated value
    ordinaertresultat: convertToDKK(metrics.ordinaryResult?.value || null, currency),
    ekstraordinaereposter: convertToDKK(metrics.extraordinaryItems?.value || null, currency),
    skatafaaretsresultat: convertToDKK(metrics.tax?.value || null, currency),
    
    // ============= BALANCE SHEET - ASSETS (Aktiver) =============
    
    // Intangible assets
    goodwill: convertToDKK(metrics.goodwill?.value || null, currency),
    ovrigeimmaterielleanlaegsaktiver: convertToDKK(metrics.otherIntangibleAssets?.value || null, currency),
    immaterielleanlaegsaktiver: convertToDKK(metrics.intangibleAssets?.value || null, currency),
    
    // Tangible assets
    grundeogbygninger: convertToDKK(metrics.landAndBuildings?.value || null, currency),
    andreanlaegogdriftsmidler: convertToDKK(metrics.otherEquipment?.value || null, currency),
    ovrigematerielleanlaegsaktiver: convertToDKK(metrics.otherTangibleAssets?.value || null, currency),
    materielleanlaegsaktiver: convertToDKK(metrics.tangibleAssets?.value || null, currency),
    
    // Financial assets
    kapitalandele: convertToDKK(metrics.shares?.value || null, currency),
    langfristetilgodehavender: convertToDKK(metrics.longTermReceivables?.value || null, currency),
    andrefinansielleanlaegsaktiver: convertToDKK(metrics.otherLongTermFinancial?.value || null, currency),
    finansielleanlaegsaktiver: convertToDKK(metrics.financialAssets?.value || null, currency),
    
    // Total non-current assets
    anlaegsaktiverValue: convertToDKK(metrics.noncurrentAssets?.value || null, currency),
    
    // Current assets
    varebeholdninger: convertToDKK(metrics.inventories?.value || null, currency),
    tilgodehavenderfrasalg: convertToDKK(metrics.tradeReceivables?.value || null, currency),
    tilgodehavenderhosnaertstaende: convertToDKK(metrics.relatedPartyReceivables?.value || null, currency),
    andretilgodehavender: convertToDKK(metrics.otherReceivables?.value || null, currency),
    vaerdipapirer: convertToDKK(metrics.securities?.value || null, currency),
    likvidemidler: convertToDKK(metrics.cash?.value || null, currency),
    omsaetningsaktiver: convertToDKK(metrics.currentAssets?.value || null, currency),
    
    // Total assets
    aktiverialt: convertToDKK(metrics.assets?.value || null, currency),
    
    // ============= BALANCE SHEET - EQUITY & LIABILITIES (Passiver) =============
    
    // Equity
    selskabskapital: convertToDKK(metrics.shareCapital?.value || null, currency),
    overfoertresultat: convertToDKK(metrics.retainedEarnings?.value || null, currency),
    udbytte: convertToDKK(metrics.dividend?.value || null, currency),
    ovrigereserver: convertToDKK(metrics.otherReserves?.value || null, currency),
    egenkapitalfoerminoritet: convertToDKK(metrics.equityBeforeMinority?.value || null, currency),
    minoritetsinteresser: convertToDKK(metrics.minorityInterests?.value || null, currency),
    egenkapitalialt: convertToDKK(metrics.equity?.value || null, currency),
    
    // Provisions and deferred tax
    udskudtskat: convertToDKK(metrics.deferredTax?.value || null, currency),
    hensaettelser: convertToDKK(metrics.provisions?.value || null, currency),
    
    // Long-term liabilities
    langfristetgaeldtilrealkreditinstitutter: convertToDKK(metrics.longTermCreditInstitutions?.value || null, currency),
    langfristetgaeldtilbanker: convertToDKK(metrics.longTermBankDebt?.value || null, currency),
    langfristetgaeldtilnaertstaende: convertToDKK(metrics.longTermRelatedPartyDebt?.value || null, currency),
    andenlangfristetgaeld: convertToDKK(metrics.otherLongTermDebt?.value || null, currency),
    langfristet_gaeld: convertToDKK(metrics.noncurrentLiabilities?.value || null, currency),
    
    // Short-term liabilities
    kortfristetgaeldtilnaertstaende: convertToDKK(metrics.shortTermRelatedPartyDebt?.value || null, currency),
    kortfristetgaeldtilrealkreditinstitutter: convertToDKK(metrics.shortTermCreditInstitutions?.value || null, currency),
    kortfristetgaeldtilbanker: convertToDKK(metrics.shortTermBankDebt?.value || null, currency),
    selskabsskat: convertToDKK(metrics.corporateTax?.value || null, currency),
    varekreditorer: convertToDKK(metrics.tradePayables?.value || null, currency),
    andengaeld: convertToDKK(metrics.otherDebt?.value || null, currency),
    kortfristet_gaeld: convertToDKK(metrics.currentLiabilities?.value || null, currency),
    
    // Total liabilities
    passiverialt: convertToDKK(metrics.totalLiabilities?.value || null, currency),
    
    // Always return DKK as the final currency
    valuta: 'DKK'
  };
}

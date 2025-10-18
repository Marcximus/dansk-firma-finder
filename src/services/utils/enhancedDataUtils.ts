// Enhanced data extraction utilities with intelligent field discovery
import { 
  extractDataIntelligently, 
  analyzeDataCompleteness,
  scanDataStructure,
  BUSINESS_DATA_FIELDS,
  type DataCompletenessReport
} from './dataDiscovery';
import { formatAddress, formatPeriod, getCurrentValue, getPersonName, getPersonAddress } from './formatUtils';

export interface EnhancedExtractionResult {
  basicData: any;
  extendedData: any;
  financialData: any;
  managementData: any[];
  completenessReport: DataCompletenessReport;
  rawDataSummary: {
    totalFields: number;
    mainSections: string[];
    hasFinancialData: boolean;
    hasManagementData: boolean;
    dataStructureDepth: number;
  };
}

/**
 * Comprehensive data extraction with intelligent field discovery
 */
export function extractComprehensiveData(cvrData: any): EnhancedExtractionResult | null {
  console.log('=== COMPREHENSIVE DATA EXTRACTION STARTED ===');
  
  if (!cvrData || !cvrData.Vrvirksomhed) {
    console.log('No Vrvirksomhed data found');
    return null;
  }

  const vrvirksomhed = cvrData.Vrvirksomhed;
  console.log('Processing Vrvirksomhed with keys:', Object.keys(vrvirksomhed));

  // Use intelligent extraction for automatic field discovery
  const intelligentData = extractDataIntelligently(vrvirksomhed);
  console.log('Intelligent extraction results:', intelligentData);

  // Analyze data completeness
  const completenessReport = analyzeDataCompleteness(vrvirksomhed);
  console.log('Data completeness report:', completenessReport);

  // Enhanced basic data extraction
  const basicData = extractEnhancedBasicData(vrvirksomhed, intelligentData);
  
  // Enhanced extended data extraction
  const extendedData = extractEnhancedExtendedData(vrvirksomhed, intelligentData);
  
  // Enhanced financial data extraction
  const financialData = extractEnhancedFinancialData(vrvirksomhed, intelligentData);
  
  // Enhanced management data extraction
  const managementData = extractEnhancedManagementData(vrvirksomhed);

  // Generate raw data summary
  const rawDataSummary = generateRawDataSummary(vrvirksomhed);

  const result: EnhancedExtractionResult = {
    basicData,
    extendedData,
    financialData,
    managementData,
    completenessReport,
    rawDataSummary
  };

  console.log('=== COMPREHENSIVE EXTRACTION COMPLETED ===');
  console.log('Final result summary:', {
    basicDataFields: Object.keys(basicData).length,
    extendedDataFields: Object.keys(extendedData).length,
    financialDataFields: Object.keys(financialData).length,
    managementCount: managementData.length,
    dataQuality: completenessReport.dataQuality
  });

  return result;
}

/**
 * Enhanced basic data extraction with fallbacks
 */
function extractEnhancedBasicData(vrvirksomhed: any, intelligentData: any) {
  console.log('=== ENHANCED BASIC DATA EXTRACTION ===');
  
  // Company name with multiple fallbacks
  const companyName = intelligentData.companyName ||
    getCurrentValue(vrvirksomhed.navne || [], 'navn') ||
    vrvirksomhed.navn ||
    vrvirksomhed.virksomhedsnavn ||
    'N/A';

  // CVR with validation
  const cvr = intelligentData.cvr ||
    vrvirksomhed.cvrNummer ||
    vrvirksomhed.cvr ||
    'N/A';

  // Status with comprehensive lookup
  const status = intelligentData.status ||
    getCurrentValue(vrvirksomhed.virksomhedsstatus || [], 'status') ||
    vrvirksomhed.status ||
    'Unknown';

  // Legal form with multiple sources
  const legalForm = intelligentData.legalForm ||
    getCurrentValue(vrvirksomhed.virksomhedsform || [], 'langBeskrivelse') ||
    getCurrentValue(vrvirksomhed.virksomhedsform || [], 'kortBeskrivelse') ||
    vrvirksomhed.virksomhedsform ||
    'N/A';

  // Industry with comprehensive search
  const industry = intelligentData.industry ||
    getCurrentValue(vrvirksomhed.hovedbranche || [], 'branchetekst') ||
    vrvirksomhed.branchetekst ||
    vrvirksomhed.industry ||
    'N/A';

  // Employee count with multiple sources
  const employeeCount = intelligentData.employees ||
    vrvirksomhed.aarsbeskaeftigelse?.[0]?.antalAnsatte ||
    vrvirksomhed.aarsbeskaeftigelse?.[0]?.antalAarsvaerk ||
    vrvirksomhed.antalAnsatte ||
    vrvirksomhed.employees ||
    0;

  // Historical data with enhanced processing
  const historicalNames = (vrvirksomhed.navne || []).map((navnItem: any) => ({
    period: formatPeriod(navnItem.periode),
    name: navnItem.navn,
    isCurrent: !navnItem.periode?.gyldigTil
  })).sort((a: any, b: any) => b.isCurrent - a.isCurrent);

  const historicalAddresses = (vrvirksomhed.beliggenhedsadresse || []).map((addr: any) => ({
    period: formatPeriod(addr.periode),
    address: formatAddress(addr),
    isCurrent: !addr.periode?.gyldigTil
  })).sort((a: any, b: any) => b.isCurrent - a.isCurrent);

  const result = {
    companyName,
    cvr,
    status,
    legalForm,
    industry,
    employeeCount,
    historicalNames,
    historicalAddresses,
    foundByIntelligentExtraction: {
      companyName: !!intelligentData.companyName,
      status: !!intelligentData.status,
      legalForm: !!intelligentData.legalForm,
      industry: !!intelligentData.industry,
      employees: !!intelligentData.employees
    }
  };

  console.log('Enhanced basic data result:', result);
  return result;
}

/**
 * Enhanced extended data extraction with intelligent discovery
 */
function extractEnhancedExtendedData(vrvirksomhed: any, intelligentData: any) {
  console.log('=== ENHANCED EXTENDED DATA EXTRACTION ===');

  // Purpose with comprehensive search
  const purpose = intelligentData.purpose ||
    getCurrentValue(vrvirksomhed.formaal || [], 'vaerdi') ||
    vrvirksomhed.formaal?.vaerdi ||
    vrvirksomhed.formaal ||
    vrvirksomhed.purpose ||
    vrvirksomhed.virksomhedsformaal ||
    null;

  // Phone number with multiple sources
  const phone = getCurrentValue(vrvirksomhed.telefonNummer || [], 'kontaktoplysning') ||
    vrvirksomhed.telefon ||
    vrvirksomhed.phone ||
    vrvirksomhed.kontaktoplysning ||
    null;

  // Municipality/Kommune with address parsing
  const municipality = getCurrentValue(vrvirksomhed.beliggenhedsadresse || [], 'kommune') ||
    getCurrentValue(vrvirksomhed.beliggenhedsadresse || [], 'kommuneKode') ||
    vrvirksomhed.kommune ||
    null;

  // Email with various field names
  const email = getCurrentValue(vrvirksomhed.elektroniskPost || [], 'kontaktoplysning') ||
    vrvirksomhed.email ||
    vrvirksomhed.elektroniskPost ||
    null;

  // Website with multiple sources
  const website = getCurrentValue(vrvirksomhed.hjemmeside || [], 'kontaktoplysning') ||
    vrvirksomhed.website ||
    vrvirksomhed.hjemmeside ||
    vrvirksomhed.url ||
    null;

  // Secondary industries with comprehensive extraction
  const secondaryIndustries = [
    ...(vrvirksomhed.bibranche1 || []),
    ...(vrvirksomhed.bibranche2 || []),
    ...(vrvirksomhed.bibranche3 || [])
  ].filter((branch: any) => !branch.periode?.gyldigTil)
   .map((branch: any) => ({
     code: branch.branchekode,
     text: branch.branchetekst
   }));

  // Capital information with intelligent extraction
  const registeredCapital = intelligentData.equity ||
    getCurrentValue(vrvirksomhed.kapitalforhold || [], 'kapitalbeloeb') ||
    vrvirksomhed.registreretKapital ||
    vrvirksomhed.kapital ||
    null;

  // Accounting year with enhanced detection
  const accountingYear = (() => {
    const regnskabsperiode = vrvirksomhed.regnskabsperiode || [];
    if (regnskabsperiode.length === 0) return null;
    
    const current = regnskabsperiode.find((p: any) => !p.periode?.gyldigTil) || regnskabsperiode[0];
    const from = current?.regnskabsperiodefra || current?.fra || current?.startDato;
    const to = current?.regnskabsperiodetil || current?.til || current?.slutDato;
    
    return from && to ? `${from} - ${to}` : null;
  })();

  // Aliases/Binavne
  const binavne = (vrvirksomhed.binavne || [])
    .map((navn: any) => navn.navn || navn)
    .filter(Boolean);

  const result = {
    purpose,
    phone,
    email,
    website,
    municipality,
    secondaryIndustries,
    registeredCapital,
    accountingYear,
    binavne,
    isListed: vrvirksomhed.boersnoteret || false,
    latestStatuteDate: (() => {
      const vedtaegter = vrvirksomhed.vedtaegter || [];
      const latest = vedtaegter.find((v: any) => !v.periode?.gyldigTil) || vedtaegter[vedtaegter.length - 1];
      return latest?.dato || null;
    })(),
    foundByIntelligentExtraction: {
      purpose: !!intelligentData.purpose,
      equity: !!intelligentData.equity
    }
  };

  console.log('Enhanced extended data result:', result);
  return result;
}

/**
 * Enhanced financial data extraction with intelligent discovery
 */
function extractEnhancedFinancialData(vrvirksomhed: any, intelligentData: any) {
  console.log('=== ENHANCED FINANCIAL DATA EXTRACTION ===');

  // Try multiple sources for financial data
  const regnskabstal = vrvirksomhed.regnskabstal || [];
  const finansielleNoegletal = vrvirksomhed.finansielleNoegletal || [];
  const aarsbeskaeftigelse = vrvirksomhed.aarsbeskaeftigelse || [];

  // Use intelligent extraction results with fallbacks
  const financialKPIs = {
    revenue: intelligentData.revenue || 
      getCurrentValue(regnskabstal, 'nettoomsaetning') ||
      getCurrentValue(finansielleNoegletal, 'omsaetning') ||
      null,
    
    profit: intelligentData.profit ||
      getCurrentValue(regnskabstal, 'aaretsResultat') ||
      getCurrentValue(finansielleNoegletal, 'resultat') ||
      null,
    
    equity: intelligentData.equity ||
      getCurrentValue(regnskabstal, 'egenkapital') ||
      getCurrentValue(finansielleNoegletal, 'egenkapital') ||
      null,
    
    assets: intelligentData.assets ||
      getCurrentValue(regnskabstal, 'statusBalance') ||
      getCurrentValue(finansielleNoegletal, 'aktivSum') ||
      null,
    
    employees: intelligentData.employees ||
      aarsbeskaeftigelse[0]?.antalAnsatte ||
      aarsbeskaeftigelse[0]?.antalAarsvaerk ||
      null,
    
    period: regnskabstal[0]?.periode || finansielleNoegletal[0]?.periode || null
  };

  const result = {
    financialKPIs,
    yearlyEmployment: aarsbeskaeftigelse,
    quarterlyEmployment: vrvirksomhed.kvartalsbeskaeftigelse || [],
    kapitalforhold: vrvirksomhed.kapitalforhold || [],
    regnskabsperiode: vrvirksomhed.regnskabsperiode || [],
    hasFinancialData: !!(financialKPIs.revenue || financialKPIs.profit || financialKPIs.equity),
    foundByIntelligentExtraction: {
      revenue: !!intelligentData.revenue,
      profit: !!intelligentData.profit,
      equity: !!intelligentData.equity,
      assets: !!intelligentData.assets,
      employees: !!intelligentData.employees
    }
  };

  console.log('Enhanced financial data result:', result);
  return result;
}

/**
 * Enhanced management data extraction
 */
function extractEnhancedManagementData(vrvirksomhed: any) {
  console.log('=== ENHANCED MANAGEMENT DATA EXTRACTION ===');

  // Map hovedtype to Danish terms
  const roleMapping = {
    'DIREKTION': 'Direktør',
    'BESTYRELSE': 'Bestyrelse',
    'FULDT_ANSVARLIG_DELTAGERE': 'Interessent',
    'KOMPLEMENTAR': 'Komplementar',
    'KOMMANDITIST': 'Kommanditist',
    'REVISION': 'Revisor',
    'REGISTER': 'Register'
  };

  const management: any[] = [];

  (vrvirksomhed.deltagerRelation || []).forEach((relation: any) => {
    const deltager = relation.deltager;
    if (!deltager) return;

    const name = getPersonName(deltager);
    const address = getPersonAddress(deltager);

    // Process ALL organizations for this person (not just the first one)
    if (relation.organisationer && relation.organisationer.length > 0) {
      relation.organisationer.forEach((org: any) => {
        let role = roleMapping[org?.hovedtype as keyof typeof roleMapping] || org?.hovedtype || 'Deltager';
        let roleDetails = {};

        // Extract additional role details
        if (org.medlemsData && org.medlemsData.length > 0) {
          const memberData = org.medlemsData[0];
          
          roleDetails = {
            startDate: memberData.periode?.gyldigFra,
            endDate: memberData.periode?.gyldigTil,
            isActive: !memberData.periode?.gyldigTil
          };

          // Get specific function/role from FUNKTION attribute
          if (memberData.attributter) {
            const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
            if (funkAttribute?.vaerdier?.[0]?.vaerdi) {
              const specificRole = funkAttribute.vaerdier[0].vaerdi;
              // Only override if it's more specific than the hoofdtype mapping
              if (specificRole !== org.hovedtype) {
                role = specificRole;
              }
            }
          }
        }

        // Add each role as a separate entry
        management.push({
          role,
          name,
          address,
          hoofdtype: org.hovedtype, // Keep original for filtering
          ...roleDetails
        });
      });
    } else {
      // No organization info, add as generic participant
      management.push({
        role: 'Deltager',
        name,
        address
      });
    }
  });

  console.log('Enhanced management data result:', management);
  return management;
}

/**
 * Generate comprehensive raw data summary
 */
function generateRawDataSummary(vrvirksomhed: any) {
  console.log('=== GENERATING RAW DATA SUMMARY ===');

  const allPaths = scanDataStructure(vrvirksomhed);
  const mainSections = Object.keys(vrvirksomhed);
  
  const summary = {
    totalFields: allPaths.length,
    mainSections,
    hasFinancialData: !!(vrvirksomhed.regnskabstal || vrvirksomhed.finansielleNoegletal),
    hasManagementData: !!(vrvirksomhed.deltagerRelation?.length),
    dataStructureDepth: calculateMaxDepth(vrvirksomhed),
    availableDataTypes: {
      arrays: allPaths.filter(path => path.includes(':array')).length,
      objects: allPaths.filter(path => path.includes(':object')).length,
      strings: allPaths.filter(path => path.includes(':string')).length,
      numbers: allPaths.filter(path => path.includes(':number')).length
    }
  };

  console.log('Raw data summary:', summary);
  return summary;
}

/**
 * Calculate maximum depth of nested object structure
 */
function calculateMaxDepth(obj: any, depth: number = 0): number {
  if (typeof obj !== 'object' || obj === null) return depth;
  
  let maxDepth = depth;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const currentDepth = calculateMaxDepth(obj[key], depth + 1);
      maxDepth = Math.max(maxDepth, currentDepth);
    }
  }
  
  return maxDepth;
}

// Main export file for CVR utility functions
export { extractCvrDetails } from './utils/basicDataUtils';
export { extractExtendedInfo } from './utils/extendedDataUtils';
export { extractSigningRulesData } from './utils/signingRulesUtils';
export { extractOwnershipData } from './utils/ownershipUtils';
export { extractFinancialData } from './utils/financialUtils';
export { formatAddress, formatPeriod, getCurrentValue, getPersonName, getPersonAddress } from './utils/formatUtils';

// Enhanced extraction with intelligent field discovery
export { extractComprehensiveData } from './utils/enhancedDataUtils';
export type { EnhancedExtractionResult } from './utils/enhancedDataUtils';
export { 
  extractDataIntelligently, 
  analyzeDataCompleteness,
  scanDataStructure,
  type DataCompletenessReport 
} from './utils/dataDiscovery';

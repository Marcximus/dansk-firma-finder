// Intelligent data discovery and field mapping utilities
// This module provides advanced data extraction capabilities for variable API structures

export interface FieldMapping {
  fieldName: string;
  possiblePaths: string[];
  fuzzyMatches: string[];
  dataType: 'string' | 'number' | 'array' | 'object' | 'boolean' | 'date';
  priority: number;
}

export interface DataCompletenessReport {
  totalFields: number;
  foundFields: number;
  missingFields: string[];
  availableFields: string[];
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  suggestions: string[];
}

// Comprehensive field mapping for Danish business data
export const BUSINESS_DATA_FIELDS: FieldMapping[] = [
  // Company identification
  {
    fieldName: 'companyName',
    possiblePaths: ['navn', 'virksomhedsnavn', 'companyName', 'name', 'navne[].navn'],
    fuzzyMatches: ['navn', 'name', 'company', 'virksomhed', 'firm'],
    dataType: 'string',
    priority: 1
  },
  {
    fieldName: 'cvr',
    possiblePaths: ['cvrNummer', 'cvr', 'registrationNumber', 'regNummer'],
    fuzzyMatches: ['cvr', 'nummer', 'registration', 'reg'],
    dataType: 'string',
    priority: 1
  },
  
  // Financial information
  {
    fieldName: 'revenue',
    possiblePaths: ['nettoomsaetning', 'revenue', 'turnover', 'omsaetning', 'bruttoResults', 'salgsindt'],
    fuzzyMatches: ['omsaet', 'revenue', 'turnover', 'sales', 'salg', 'brutto', 'indkomst'],
    dataType: 'number',
    priority: 2
  },
  {
    fieldName: 'profit',
    possiblePaths: ['aaretsResultat', 'netIncome', 'netResult', 'resultat', 'profit', 'overskud'],
    fuzzyMatches: ['resultat', 'profit', 'income', 'overskud', 'aaret'],
    dataType: 'number',
    priority: 2
  },
  {
    fieldName: 'equity',
    possiblePaths: ['egenkapital', 'equity', 'equity_capital', 'kapital'],
    fuzzyMatches: ['kapital', 'equity', 'egen'],
    dataType: 'number',
    priority: 2
  },
  {
    fieldName: 'assets',
    possiblePaths: ['statusBalance', 'totalAssets', 'balance', 'aktiver', 'aktivSum'],
    fuzzyMatches: ['balance', 'assets', 'aktiv', 'status'],
    dataType: 'number',
    priority: 2
  },
  
  // Employment data
  {
    fieldName: 'employees',
    possiblePaths: ['antalAnsatte', 'employees', 'antalAarsvaerk', 'ansatte', 'medarbejdere'],
    fuzzyMatches: ['ansatte', 'employees', 'antal', 'medarbejder', 'aarsvaerk'],
    dataType: 'number',
    priority: 2
  },
  
  // Company details
  {
    fieldName: 'purpose',
    possiblePaths: ['formaal', 'purpose', 'virksomhedsformaal', 'beskrivelse', 'formaal[].vaerdi'],
    fuzzyMatches: ['formaal', 'purpose', 'beskrivelse', 'activity', 'virksomhed'],
    dataType: 'string',
    priority: 3
  },
  {
    fieldName: 'industry',
    possiblePaths: ['hovedbranche[].branchetekst', 'branchetekst', 'industry', 'branche'],
    fuzzyMatches: ['branche', 'industry', 'hovedbranche', 'tekst'],
    dataType: 'string',
    priority: 2
  },
  {
    fieldName: 'address',
    possiblePaths: ['beliggenhedsadresse[].vejnavn', 'adresse', 'address', 'vejnavn'],
    fuzzyMatches: ['adresse', 'address', 'vej', 'gade'],
    dataType: 'string',
    priority: 2
  },
  
  // Status information
  {
    fieldName: 'status',
    possiblePaths: ['virksomhedsstatus[].status', 'status', 'tilstand'],
    fuzzyMatches: ['status', 'tilstand', 'state'],
    dataType: 'string',
    priority: 2
  },
  {
    fieldName: 'legalForm',
    possiblePaths: ['virksomhedsform[].langBeskrivelse', 'virksomhedsform[].kortBeskrivelse', 'legalForm'],
    fuzzyMatches: ['form', 'type', 'beskrivelse', 'legal'],
    dataType: 'string',
    priority: 2
  }
];

/**
 * Recursively scan data structure to find all available fields and their paths
 */
export function scanDataStructure(data: any, path: string = '', maxDepth: number = 10): string[] {
  if (maxDepth <= 0 || data === null || data === undefined) {
    return [];
  }

  const paths: string[] = [];

  if (Array.isArray(data)) {
    // For arrays, scan first few items to understand structure
    data.slice(0, 3).forEach((item, index) => {
      const arrayPath = path ? `${path}[${index}]` : `[${index}]`;
      paths.push(arrayPath);
      paths.push(...scanDataStructure(item, arrayPath, maxDepth - 1));
    });
    
    // Also add generic array notation
    if (data.length > 0) {
      const genericPath = path ? `${path}[]` : '[]';
      paths.push(...scanDataStructure(data[0], genericPath, maxDepth - 1));
    }
  } else if (typeof data === 'object') {
    Object.keys(data).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      paths.push(currentPath);
      
      // Add the current field with its value type
      const value = data[key];
      const valueType = Array.isArray(value) ? 'array' : typeof value;
      paths.push(`${currentPath}:${valueType}`);
      
      // Recursively scan nested objects
      if (typeof value === 'object' && value !== null) {
        paths.push(...scanDataStructure(value, currentPath, maxDepth - 1));
      }
    });
  }

  return paths;
}

/**
 * Find the best matching field path using fuzzy matching
 */
export function findBestFieldPath(fieldMapping: FieldMapping, availablePaths: string[]): string | null {
  // First try exact matches in possiblePaths
  for (const possiblePath of fieldMapping.possiblePaths) {
    const exactMatch = availablePaths.find(path => 
      path.toLowerCase() === possiblePath.toLowerCase() || 
      path.toLowerCase().includes(possiblePath.toLowerCase())
    );
    if (exactMatch) {
      return exactMatch.split(':')[0]; // Remove type annotation
    }
  }

  // Then try fuzzy matching
  for (const fuzzyMatch of fieldMapping.fuzzyMatches) {
    const fuzzyMatched = availablePaths.find(path => 
      path.toLowerCase().includes(fuzzyMatch.toLowerCase())
    );
    if (fuzzyMatched) {
      return fuzzyMatched.split(':')[0]; // Remove type annotation
    }
  }

  return null;
}

/**
 * Extract value from object using dot notation path (including array notation)
 */
export function getValueByPath(obj: any, path: string): any {
  if (!path || !obj) return null;

  try {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return null;

      // Handle array notation like "items[]" or "items[0]"
      if (part.includes('[') && part.includes(']')) {
        const arrayField = part.substring(0, part.indexOf('['));
        const indexPart = part.substring(part.indexOf('[') + 1, part.indexOf(']'));
        
        if (arrayField && current[arrayField]) {
          current = current[arrayField];
          
          if (Array.isArray(current)) {
            if (indexPart === '') {
              // Generic array notation [] - return the array or first item
              return current;
            } else if (!isNaN(parseInt(indexPart))) {
              // Specific index
              const index = parseInt(indexPart);
              current = current[index];
            }
          }
        } else {
          return null;
        }
      } else {
        current = current[part];
      }
    }

    return current;
  } catch (error) {
    console.error('Error extracting value by path:', path, error);
    return null;
  }
}

/**
 * Get the current value from an array of historical data (prioritizes items with no end date)
 */
export function getCurrentValueFromArray(array: any[], valueField: string): any {
  if (!Array.isArray(array) || array.length === 0) return null;

  // First try to find current item (where gyldigTil/periode.gyldigTil is null)
  const current = array.find(item => {
    return item?.periode?.gyldigTil === null || 
           item?.periode?.gyldigTil === undefined ||
           item?.gyldigTil === null ||
           item?.gyldigTil === undefined;
  });

  if (current && current[valueField] !== undefined) {
    return current[valueField];
  }

  // Fallback to the last item in the array
  const latest = array[array.length - 1];
  return latest?.[valueField] || null;
}

/**
 * Analyze data completeness and quality
 */
export function analyzeDataCompleteness(data: any, fieldMappings: FieldMapping[] = BUSINESS_DATA_FIELDS): DataCompletenessReport {
  const availablePaths = scanDataStructure(data);
  const foundFields: string[] = [];
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  fieldMappings.forEach(mapping => {
    const foundPath = findBestFieldPath(mapping, availablePaths);
    if (foundPath) {
      foundFields.push(mapping.fieldName);
    } else {
      missingFields.push(mapping.fieldName);
      
      // Generate suggestions for missing fields
      const similarPaths = availablePaths.filter(path => 
        mapping.fuzzyMatches.some(fuzzy => 
          path.toLowerCase().includes(fuzzy.toLowerCase())
        )
      );
      
      if (similarPaths.length > 0) {
        suggestions.push(`${mapping.fieldName}: Consider checking ${similarPaths.slice(0, 3).join(', ')}`);
      }
    }
  });

  const completeness = foundFields.length / fieldMappings.length;
  let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  
  if (completeness >= 0.9) dataQuality = 'excellent';
  else if (completeness >= 0.7) dataQuality = 'good';
  else if (completeness >= 0.5) dataQuality = 'fair';
  else dataQuality = 'poor';

  return {
    totalFields: fieldMappings.length,
    foundFields: foundFields.length,
    missingFields,
    availableFields: foundFields,
    dataQuality,
    suggestions
  };
}

/**
 * Smart data extraction using intelligent field discovery
 */
export function extractDataIntelligently(data: any, fieldMappings: FieldMapping[] = BUSINESS_DATA_FIELDS): Record<string, any> {
  const availablePaths = scanDataStructure(data);
  const result: Record<string, any> = {};

  console.log('=== INTELLIGENT DATA EXTRACTION ===');
  console.log('Available paths found:', availablePaths.length);
  console.log('Available paths:', availablePaths.slice(0, 20)); // Log first 20 for debugging

  fieldMappings.forEach(mapping => {
    const foundPath = findBestFieldPath(mapping, availablePaths);
    if (foundPath) {
      const extractedValue = getValueByPath(data, foundPath);
      
      // Special handling for arrays with current/historical data
      if (Array.isArray(extractedValue)) {
        const currentValue = getCurrentValueFromArray(extractedValue, 
          mapping.fieldName === 'companyName' ? 'navn' :
          mapping.fieldName === 'industry' ? 'branchetekst' :
          mapping.fieldName === 'status' ? 'status' :
          mapping.fieldName === 'legalForm' ? 'langBeskrivelse' :
          mapping.fieldName === 'purpose' ? 'vaerdi' : 'value');
        
        result[mapping.fieldName] = currentValue || extractedValue[0];
      } else {
        result[mapping.fieldName] = extractedValue;
      }
      
      console.log(`✓ Found ${mapping.fieldName}: ${foundPath} = ${JSON.stringify(result[mapping.fieldName])?.substring(0, 100)}`);
    } else {
      console.log(`✗ Missing ${mapping.fieldName}: No matching path found`);
    }
  });

  return result;
}
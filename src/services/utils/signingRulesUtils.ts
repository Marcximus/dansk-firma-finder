
// Enhanced helper functions for extracting signing rules and management data with intelligent field discovery
import { extractDataIntelligently, scanDataStructure, getValueByPath } from './dataDiscovery';

export const extractSigningRulesData = (cvrData: any) => {
  console.log('extractSigningRulesData - Input data:', cvrData);
  
  if (!cvrData?.Vrvirksomhed) {
    console.log('extractSigningRulesData - No Vrvirksomhed data found');
    return null;
  }
  
  const vrvirksomhed = cvrData.Vrvirksomhed;
  const relations = vrvirksomhed.deltagerRelation || [];
  console.log('extractSigningRulesData - Processing relations:', relations);
  
  // Intelligent field discovery for signing rules
  const availablePaths = scanDataStructure(vrvirksomhed);
  const signingRulePaths = availablePaths.filter(path => 
    path.toLowerCase().includes('tegning') || 
    path.toLowerCase().includes('binding') || 
    path.toLowerCase().includes('regel') ||
    path.toLowerCase().includes('sign') ||
    path.toLowerCase().includes('authority')
  );
  console.log('Signing rules - Available field paths:', signingRulePaths);

  const getSigningRules = () => {
    let signingRules: string[] = [];
    
    // Try multiple possible field locations for signing rules
    const possibleRulePaths = [
      'tegningsregler',
      'bindingsregler', 
      'signingRules',
      'attributter',
      'virksomhedsrelation.*.tegningsregler',
      'deltagerRelation.*.tegningsregler',
      'reguleringAttributter'
    ];
    
    possibleRulePaths.forEach(path => {
      try {
        const value = getValueByPath(vrvirksomhed, path);
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((item: any) => {
              const rule = item.regel || item.beskrivelse || item.tekst || item.vaerdi || item;
              if (typeof rule === 'string' && rule.trim()) {
                signingRules.push(rule.trim());
              }
            });
          }
        }
      } catch (e) {
        // Silent fail for each path attempt
      }
    });
    
    // Enhanced attribute scanning
    const attributter = vrvirksomhed.attributter || [];
    const signingAttributes = attributter.filter((attr: any) => 
      attr.type?.includes('TEGNING') || 
      attr.type?.includes('BINDING') || 
      attr.type?.includes('SIGN') ||
      attr.type?.includes('REGEL') ||
      attr.type?.includes('AUTHORITY')
    );
    
    signingAttributes.forEach((attr: any) => {
      if (attr.vaerdier) {
        attr.vaerdier.forEach((value: any) => {
          const rule = value.vaerdi || value.regel || value.tekst;
          if (rule && typeof rule === 'string' && rule.trim()) {
            signingRules.push(rule.trim());
          }
        });
      }
    });
    
    // Check relations for signing rules
    relations.forEach((relation: any) => {
      relation.organisationer?.forEach((org: any) => {
        org.medlemsData?.forEach((medlem: any) => {
          medlem.attributter?.forEach((attr: any) => {
            if (attr.type?.includes('TEGNING') || attr.type?.includes('SIGN')) {
              attr.vaerdier?.forEach((value: any) => {
                const rule = value.vaerdi || value.regel;
                if (rule && typeof rule === 'string' && rule.trim()) {
                  signingRules.push(rule.trim());
                }
              });
            }
          });
        });
      });
    });
    
    // Remove duplicates and empty rules
    signingRules = [...new Set(signingRules.filter(rule => rule && rule.length > 0))];
    
    console.log('Enhanced signing rules extraction:', signingRules);
    return signingRules;
  };

  const result = {
    signingRules: getSigningRules(),
    management: relations.filter((relation: any) => 
      relation.organisationer?.some((org: any) => org.hovedtype === 'DIREKTION')
    ),
    board: relations.filter((relation: any) => 
      relation.organisationer?.some((org: any) => org.hovedtype === 'BESTYRELSE')
    ),
    auditors: relations.filter((relation: any) => 
      relation.organisationer?.some((org: any) => org.hovedtype === 'REVISION')
    )
  };

  console.log('extractSigningRulesData - Final result:', result);
  return result;
};

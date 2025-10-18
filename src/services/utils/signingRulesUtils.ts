
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

  // Helper to check if a membership is currently active
  const isActiveMembership = (org: any) => {
    if (!org.medlemsData || org.medlemsData.length === 0) return false;
    
    return org.medlemsData.some((medlem: any) => {
      const isActive = !medlem.periode?.gyldigTil || medlem.periode.gyldigTil === null;
      console.log('Checking membership active status:', {
        isActive,
        periode: medlem.periode,
        attributter: medlem.attributter?.map((a: any) => ({ type: a.type, vaerdier: a.vaerdier }))
      });
      return isActive;
    });
  };

  // Filter and enrich relations with only active roles
  const filterActiveRelations = (roleCheck: (org: any, medlem: any) => boolean) => {
    return relations
      .filter((relation: any) => {
        // Check if this person has any active organizations matching the role
        const hasActiveRole = relation.organisationer?.some((org: any) => {
          if (!isActiveMembership(org)) return false;
          
          // Check each active member's role
          return org.medlemsData?.some((medlem: any) => {
            // Skip inactive - check for any value in gyldigTil (including empty strings)
            if (medlem.periode?.gyldigTil !== null && medlem.periode?.gyldigTil !== undefined) return false;
            return roleCheck(org, medlem);
          });
        });
        
        if (hasActiveRole) {
          console.log('Found active member:', {
            name: relation.deltager?.navne?.[0]?.navn,
            organisations: relation.organisationer?.map((o: any) => ({
              hovedtype: o.hovedtype,
              active: isActiveMembership(o),
              functions: o.medlemsData?.map((m: any) => 
                m.attributter?.find((a: any) => a.type === 'FUNKTION')?.vaerdier?.[0]?.vaerdi
              )
            }))
          });
        }
        
        return hasActiveRole;
      })
      .map((relation: any) => ({
        ...relation,
        organisationer: relation.organisationer
          ?.filter((org: any) => {
            // Only include orgs that match the role check AND have active members
            const hasActiveMatchingRole = org.medlemsData?.some((medlem: any) => {
              // Skip inactive - check for any value in gyldigTil (including empty strings)
              if (medlem.periode?.gyldigTil !== null && medlem.periode?.gyldigTil !== undefined) return false;
              return roleCheck(org, medlem);
            });
            return hasActiveMatchingRole;
          })
          ?.map((org: any) => ({
            ...org,
            // Filter to only include active memberships
            medlemsData: org.medlemsData?.filter((medlem: any) => 
              medlem.periode?.gyldigTil === null || medlem.periode?.gyldigTil === undefined
            )
          }))
      }));
  };

  const result = {
    signingRules: getSigningRules(),
    management: filterActiveRelations((org, medlem) => {
      if (org.hovedtype === 'DIREKTION') return true;
      if (org.hovedtype === 'LEDELSESORGAN') {
        return medlem.attributter?.some((attr: any) => 
          attr.type === 'FUNKTION' && 
          attr.vaerdier?.some((v: any) => v.vaerdi?.includes('DIREKTØR'))
        );
      }
      return false;
    }),
    board: filterActiveRelations((org, medlem) => {
      if (org.hovedtype === 'BESTYRELSE') return true;
      if (org.hovedtype === 'LEDELSESORGAN') {
        return medlem.attributter?.some((attr: any) => 
          attr.type === 'FUNKTION' && 
          attr.vaerdier?.some((v: any) => 
            v.vaerdi?.includes('BESTYRELSESMEDLEM') || 
            v.vaerdi?.includes('BESTYRELSESFORMAND')
          )
        );
      }
      return false;
    }),
    auditors: filterActiveRelations((org, medlem) => {
      return org.hovedtype === 'REVISION';
    })
  };

  console.log('extractSigningRulesData - Final result:', result);
  return result;
};


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
  
  console.log('=== FULL DELTAGER RELATION JSON STRUCTURE ===');
  console.log('Total relations found:', relations.length);
  relations.forEach((relation: any, index: number) => {
    console.log(`\n--- RELATION ${index + 1} ---`);
    console.log('Person name:', relation.deltager?.navne?.[0]?.navn || 'Unknown');
    console.log('Full deltager object:', JSON.stringify(relation.deltager, null, 2));
    console.log('Number of organisationer:', relation.organisationer?.length || 0);
    
    relation.organisationer?.forEach((org: any, orgIndex: number) => {
      console.log(`\n  ORGANISATION ${orgIndex + 1}:`);
      console.log('  hovedtype:', org.hovedtype);
      console.log('  Number of medlemsData:', org.medlemsData?.length || 0);
      console.log('  Full organisation object:', JSON.stringify(org, null, 2));
      
      org.medlemsData?.forEach((medlem: any, medlemIndex: number) => {
        console.log(`\n    MEDLEM ${medlemIndex + 1}:`);
        console.log('    Full medlemsData:', JSON.stringify(medlem, null, 2));
        console.log('    Number of attributter:', medlem.attributter?.length || 0);
        
        medlem.attributter?.forEach((attr: any, attrIndex: number) => {
          console.log(`\n      ATTRIBUTE ${attrIndex + 1}:`);
          console.log('      type:', attr.type);
          console.log('      Full attribute:', JSON.stringify(attr, null, 2));
        });
      });
    });
  });
  console.log('\n=== END OF JSON STRUCTURE ===\n');
  
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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    let signingRules: string[] = [];
    
    // Helper function to check if a period is currently active
    const isActivePeriod = (periode: any) => {
      if (!periode) return true; // If no period info, assume active
      const gyldigTil = periode.gyldigTil;
      return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
    };
    
    console.log('=== SIGNING RULES EXTRACTION - FILTERING BY ACTIVE PERIOD ===');
    
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
              // Check if this item has an active period
              if (item.periode && !isActivePeriod(item.periode)) {
                console.log(`  ✗ SKIPPED expired rule from ${path}:`, item.regel || item.vaerdi);
                return;
              }
              
              const rule = item.regel || item.beskrivelse || item.tekst || item.vaerdi || item;
              if (typeof rule === 'string' && rule.trim()) {
                console.log(`  ✓ ACTIVE rule from ${path}:`, rule.trim());
                signingRules.push(rule.trim());
              }
            });
          }
        }
      } catch (e) {
        // Silent fail for each path attempt
      }
    });
    
    // Enhanced attribute scanning with period validation
    const attributter = vrvirksomhed.attributter || [];
    const signingAttributes = attributter.filter((attr: any) => 
      attr.type?.includes('TEGNING') || 
      attr.type?.includes('BINDING') || 
      attr.type?.includes('SIGN') ||
      attr.type?.includes('REGEL') ||
      attr.type?.includes('AUTHORITY')
    );
    
    console.log(`Found ${signingAttributes.length} signing-related attributes, filtering by active period...`);
    
    signingAttributes.forEach((attr: any) => {
      if (attr.vaerdier) {
        attr.vaerdier.forEach((value: any) => {
          // Only include rules with active periods
          if (!isActivePeriod(value.periode)) {
            console.log(`  ✗ SKIPPED expired rule from attributter:`, value.vaerdi || value.regel, `(expired: ${value.periode?.gyldigTil})`);
            return;
          }
          
          const rule = value.vaerdi || value.regel || value.tekst;
          if (rule && typeof rule === 'string' && rule.trim()) {
            console.log(`  ✓ ACTIVE rule from attributter:`, rule.trim());
            signingRules.push(rule.trim());
          }
        });
      }
    });
    
    // Check relations for signing rules with period validation
    relations.forEach((relation: any) => {
      const personName = relation.deltager?.navne?.[0]?.navn || 'Unknown';
      relation.organisationer?.forEach((org: any) => {
        org.medlemsData?.forEach((medlem: any) => {
          medlem.attributter?.forEach((attr: any) => {
            if (attr.type?.includes('TEGNING') || attr.type?.includes('SIGN')) {
              attr.vaerdier?.forEach((value: any) => {
                // Only include rules with active periods
                if (!isActivePeriod(value.periode)) {
                  console.log(`  ✗ SKIPPED expired rule for ${personName}:`, value.vaerdi || value.regel, `(expired: ${value.periode?.gyldigTil})`);
                  return;
                }
                
                const rule = value.vaerdi || value.regel;
                if (rule && typeof rule === 'string' && rule.trim()) {
                  console.log(`  ✓ ACTIVE rule for ${personName}:`, rule.trim());
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
    
    console.log(`\n=== FINAL ACTIVE SIGNING RULES (${signingRules.length}) ===`);
    signingRules.forEach(rule => console.log(`  - ${rule}`));
    console.log('=== END SIGNING RULES EXTRACTION ===\n');
    
    return signingRules;
  };

  // Helper to check if a membership is currently active  
  const isActiveMembership = (org: any) => {
    if (!org.medlemsData || org.medlemsData.length === 0) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const orgName = org.organisationsNavn?.[0]?.navn;
    
    // For Bestyrelse, check if the most recent FUNKTION has an active period
    if (orgName === 'Bestyrelse') {
      console.log('Checking Bestyrelse membership - validating most recent FUNKTION');
      return org.medlemsData.some((medlem: any) => {
        const funktionAttr = medlem.attributter?.find((attr: any) => attr.type === 'FUNKTION');
        if (!funktionAttr || !funktionAttr.vaerdier || funktionAttr.vaerdier.length === 0) {
          return false;
        }
        
        // Find the most recent FUNKTION by gyldigFra date
        const mostRecentFunktion = funktionAttr.vaerdier.reduce((latest: any, current: any) => {
          const latestDate = latest.periode?.gyldigFra || '';
          const currentDate = current.periode?.gyldigFra || '';
          return currentDate > latestDate ? current : latest;
        });
        
        // Check if this most recent FUNKTION has an active period
        const gyldigTil = mostRecentFunktion.periode?.gyldigTil;
        const isActive = gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
        console.log(`  Most recent FUNKTION for member: gyldigTil=${gyldigTil}, isActive=${isActive}`);
        return isActive;
      });
    }
    
    // For other organizations, require active FUNKTION with null or future end date
    return org.medlemsData.some((medlem: any) => {
      return medlem.attributter?.some((attr: any) => {
        if (attr.type !== 'FUNKTION') return false;
        return attr.vaerdier?.some((v: any) => {
          const gyldigTil = v.periode?.gyldigTil;
          return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
        });
      });
    });
  };

  // Filter and enrich relations with only active roles
  const filterActiveRelations = (roleCheck: (org: any, medlem: any) => boolean) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log('=== filterActiveRelations - Starting with', relations.length, 'relations ===');
    
    return relations
      .filter((relation: any) => {
        const personName = relation.deltager?.navne?.[0]?.navn || 'Unknown';
        console.log(`\n--- Checking relation for: ${personName} ---`);
        
        // Check if this person has any active organizations matching the role
        const hasActiveRole = relation.organisationer?.some((org: any) => {
          console.log(`  Checking org: ${org.hovedtype}`);
          
          if (!isActiveMembership(org)) {
            console.log(`  ✗ REJECTED: No active membership for ${org.hovedtype}`);
            return false;
          }
          
          console.log(`  ✓ Has active membership for ${org.hovedtype}`);
          
          // All orgs must have active FUNKTION members that pass roleCheck
          return org.medlemsData?.some((medlem: any) => {
            // Check if the FUNKTION attribute has an active value (null OR future end date)
            const hasActiveFunktion = medlem.attributter?.some((attr: any) => {
              if (attr.type !== 'FUNKTION') return false;
              return attr.vaerdier?.some((v: any) => {
                const gyldigTil = v.periode?.gyldigTil;
                return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
              });
            });
            
            if (!hasActiveFunktion) {
              console.log(`    ✗ No active FUNKTION for ${org.hovedtype} member`);
              return false;
            }
            
            const passed = roleCheck(org, medlem);
            console.log(`    ✓ Active FUNKTION found, roleCheck ${passed ? 'PASSED' : 'FAILED'}`);
            return passed;
          });
        });
        
        if (hasActiveRole) {
          console.log(`✓✓✓ ${personName} INCLUDED in results`);
        } else {
          console.log(`✗✗✗ ${personName} EXCLUDED from results`);
        }
        
        return hasActiveRole;
      })
      .map((relation: any) => ({
        ...relation,
        organisationer: relation.organisationer
          ?.filter((org: any) => {
            // Only include orgs with active FUNKTION members that pass roleCheck
            const hasActiveMatchingRole = org.medlemsData?.some((medlem: any) => {
              const hasActiveFunktion = medlem.attributter?.some((attr: any) => {
                if (attr.type !== 'FUNKTION') return false;
                return attr.vaerdier?.some((v: any) => {
                  const gyldigTil = v.periode?.gyldigTil;
                  return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
                });
              });
              
              if (!hasActiveFunktion) return false;
              return roleCheck(org, medlem);
            });
            return hasActiveMatchingRole;
          })
          ?.map((org: any) => ({
            ...org,
            // Filter to only include members with active FUNKTION values
            medlemsData: org.medlemsData?.filter((medlem: any) => 
              medlem.attributter?.some((attr: any) => {
                if (attr.type !== 'FUNKTION') return false;
                return attr.vaerdier?.some((v: any) => {
                  const gyldigTil = v.periode?.gyldigTil;
                  return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
                });
              })
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
      const today = new Date().toISOString().split('T')[0];
      const orgName = org.organisationsNavn?.[0]?.navn;
      
      if (orgName === 'Bestyrelse') {
        // Check if member has board role in an active FUNKTION value
        return medlem.attributter?.some((attr: any) => {
          if (attr.type !== 'FUNKTION') return false;
          
          return attr.vaerdier?.some((v: any) => {
            const hasRole = v.vaerdi?.includes('BESTYRELSESMEDLEM') || 
                          v.vaerdi?.includes('BESTYRELSESFORMAND') ||
                          v.vaerdi?.includes('FORMAND') ||
                          v.vaerdi === 'SUPPLEANT';
            
            if (!hasRole) return false;
            
            // Check if this FUNKTION value has an active period
            const gyldigTil = v.periode?.gyldigTil;
            return gyldigTil === null || gyldigTil === undefined || gyldigTil >= today;
          });
        });
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

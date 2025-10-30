
import { formatAddress, formatPeriod } from './formatUtils';

// Enhanced helper functions for extracting ownership data with intelligent field discovery
import { extractDataIntelligently, scanDataStructure } from './dataDiscovery';

// Map ownership interval codes to percentage ranges
// Based on Danish Business Authority's ownership reporting intervals
const mapOwnershipToRange = (value: number): string => {
  // The value is typically between 0 and 1 (e.g., 0.15 = 15%)
  const percentage = value * 100;
  
  // Map to the official CVR ownership intervals
  if (percentage < 5) return '0-5%';
  if (percentage < 10) return '5-10%';
  if (percentage < 15) return '10-15%';
  if (percentage < 20) return '15-20%';
  if (percentage < 25) return '20-25%';
  if (percentage < 33.33) return '25-33%';
  if (percentage < 50) return '33-50%';
  if (percentage < 66.67) return '50-67%';
  if (percentage < 90) return '67-90%';
  return '90-100%';
};

// Parse ownership percentage range to get min, max, and midpoint
const parseOwnershipRange = (rangeStr: string): { min: number; max: number; midpoint: number } => {
  if (!rangeStr || rangeStr === 'Ikke oplyst') return { min: 0, max: 0, midpoint: 0 };
  
  const match = rangeStr.match(/(\d+)(?:-(\d+))?%?/);
  if (!match) return { min: 0, max: 0, midpoint: 0 };
  
  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;
  const midpoint = (min + max) / 2;
  
  return { min, max, midpoint };
};

// Extract ticker symbol from CVR data
const extractTickerSymbol = (vrvirksomhed: any): string | undefined => {
  // Look for ticker in various places in the CVR data
  const attributter = vrvirksomhed?.attributter || [];
  
  const tickerAttr = attributter.find((attr: any) => 
    attr.type?.toUpperCase().includes('TICKER') ||
    attr.type?.toUpperCase().includes('SYMBOL') ||
    attr.type?.toUpperCase().includes('BØRSKODE')
  );
  
  if (tickerAttr?.vaerdier) {
    const currentValue = tickerAttr.vaerdier.find((v: any) => !v.periode?.gyldigTil);
    const value = currentValue || tickerAttr.vaerdier[tickerAttr.vaerdier.length - 1];
    if (value?.vaerdi) return value.vaerdi;
  }
  
  // Hardcoded mapping for known Danish companies
  const cvrToTicker: Record<string, string> = {
    '10007127': 'NZYM-B.CO', // Novozymes
    '24257630': 'NOVO-B.CO', // Novo Nordisk
    '26736426': 'MAERSK-B.CO', // A.P. Møller-Mærsk
    '36213728': 'DANSKE.CO', // Danske Bank
  };
  
  const cvrNummer = vrvirksomhed.cvrNummer?.toString();
  return cvrToTicker[cvrNummer];
};

export const extractOwnershipData = (cvrData: any) => {
  // Handle both wrapped and unwrapped Vrvirksomhed data structures
  const vrvirksomhed = cvrData?.Vrvirksomhed || cvrData;
  
  // Check if the company is publicly traded (børsnoteret)
  const checkIfListed = (): boolean => {
    const attributter = vrvirksomhed?.attributter || [];
    const boersAttr = attributter.find((attr: any) => 
      attr.type === 'BØRSNOTERET' || 
      attr.type === 'BOERSNOTERET' ||
      attr.type?.toUpperCase().includes('BØRS')
    );
    
    if (boersAttr?.vaerdier) {
      const currentValue = boersAttr.vaerdier.find((v: any) => v.periode?.gyldigTil === null);
      const value = currentValue || boersAttr.vaerdier[boersAttr.vaerdier.length - 1];
      return value?.vaerdi === 'true' || value?.vaerdi === true || value?.vaerdi === 'Ja';
    }
    
    const directValue = vrvirksomhed?.boersnoteret;
    return directValue === true || directValue === 'true' || directValue === 'Ja';
  };
  
  const isListed = checkIfListed();
  
  if (!vrvirksomhed || !vrvirksomhed.deltagerRelation) {
    console.log('[ownershipUtils] No valid data structure found:', {
      hasCvrData: !!cvrData,
      hasVrvirksomhed: !!cvrData?.Vrvirksomhed,
      isUnwrapped: !!cvrData?.deltagerRelation,
      structure: cvrData ? Object.keys(cvrData).slice(0, 5) : [],
      isListed
    });
    
    // If company is listed but no ownership data, return special entry
    if (isListed) {
      return {
        currentOwners: [{
          navn: 'Børsnoteret - offentligt handlet',
          adresse: '',
          ejerandel: '100%',
          stemmerettigheder: '100%',
          periode: { gyldigFra: '', gyldigTil: '' },
          type: 'LISTED' as const,
          identifier: '',
          cvr: undefined,
          _hasEnrichedData: false,
          _isListedCompany: true
        }],
        subsidiaries: []
      };
    }
    
    return { currentOwners: [], subsidiaries: [] };
  }

  console.log('[ownershipUtils] ✓ Data structure detected:', {
    isWrapped: !!cvrData?.Vrvirksomhed,
    hasRelations: !!vrvirksomhed.deltagerRelation,
    relationCount: vrvirksomhed.deltagerRelation?.length || 0,
    isListed
  });

  // Helper function to check if an organization has actual ownership percentage data
  const hasOwnershipPercentage = (org: any): boolean => {
    const medlemsData = org.medlemsData || [];
    return medlemsData.some((m: any) => {
      const attributter = m.attributter || [];
      return attributter.some((attr: any) => 
        attr.type === 'EJERANDEL_PROCENT' || attr.type === 'EJERANDEL_STEMMERET_PROCENT'
      );
    });
  };

  const getOwnershipFromRelations = () => {
    const relations = vrvirksomhed.deltagerRelation || [];
    
    return relations
      .filter((rel: any) => {
        // Don't check rel.periode - a person can have other active relations (board member, etc.)
        // Instead, check if they have ACTIVE ownership data in EJERREGISTER
        
        const ejerRegisterOrg = rel.organisationer?.find((org: any) => 
          org.hovedtype === 'REGISTER' && 
          org.organisationsNavn?.some((n: any) => n.navn === 'EJERREGISTER')
        );
        
        if (!ejerRegisterOrg) return false;
        
        // Check if there's an ACTIVE membership with ownership data > 0
        const medlemsData = ejerRegisterOrg.medlemsData || [];
        const hasActiveOwnership = medlemsData.some((member: any) => {
          // Membership must be currently active
          const isMembershipActive = !member.periode?.gyldigTil;
          if (!isMembershipActive) return false;
          
          // Membership must have ownership percentage > 0
          const hasValidOwnership = member.attributter?.some((attr: any) => {
            if (attr.type !== 'EJERANDEL_PROCENT' && attr.type !== 'EJERANDEL_STEMMERET_PROCENT') {
              return false;
            }
            
            // Check if there's an ACTIVE value that is > 0
            const vaerdier = attr.vaerdier || [];
            const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil);
            
            // Only count as ownership if active value exists AND is greater than 0
            if (!activeValue || !activeValue.vaerdi) return false;
            
            const ownershipValue = parseFloat(activeValue.vaerdi);
            return ownershipValue > 0;
          });
          
          return hasValidOwnership;
        });
        
        return hasActiveOwnership;
      })
      .map((rel: any) => {
        let name = 'Ukendt';
        let addressString = '';
        let ownershipPercentage: number | undefined;
        let votingRights: number | undefined;
        let validFrom: string | undefined;
        
        // FIRST: Try to extract ownership data directly from rel.organisationer (primary source)
        const ejerRegisterOrg = rel.organisationer?.find((org: any) => 
          org.hovedtype === 'REGISTER' && 
          org.organisationsNavn?.some((n: any) => n.navn === 'EJERREGISTER')
        );

        if (ejerRegisterOrg) {
          const medlemsData = ejerRegisterOrg.medlemsData || [];
          // Only use memberships that are currently active AND have ownership data
          const activeMember = medlemsData.find((m: any) => {
            const isActive = !m.periode?.gyldigTil;
            const hasOwnershipAttr = m.attributter?.some((attr: any) => 
              attr.type === 'EJERANDEL_PROCENT' || attr.type === 'EJERANDEL_STEMMERET_PROCENT'
            );
            return isActive && hasOwnershipAttr;
          });
          
          if (activeMember) {
            const attributter = activeMember.attributter || [];
            
            // Extract ownership percentage
            const ejerandelAttr = attributter.find((attr: any) => attr.type === 'EJERANDEL_PROCENT');
            if (ejerandelAttr) {
              const vaerdier = ejerandelAttr.vaerdier || [];
              const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil);
              if (activeValue?.vaerdi) {
                ownershipPercentage = parseFloat(activeValue.vaerdi);
              }
            }

            // Extract voting rights
            const stemmeretAttr = attributter.find((attr: any) => attr.type === 'EJERANDEL_STEMMERET_PROCENT');
            if (stemmeretAttr) {
              const vaerdier = stemmeretAttr.vaerdier || [];
              const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil);
              if (activeValue?.vaerdi) {
                votingRights = parseFloat(activeValue.vaerdi);
              }
            }

            // Extract notification date
            const meddelelseAttr = attributter.find((attr: any) => attr.type === 'EJERANDEL_MEDDELELSE_DATO');
            if (meddelelseAttr) {
              const vaerdier = meddelelseAttr.vaerdier || [];
              const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil) || vaerdier[0];
              if (activeValue?.vaerdi) {
                validFrom = activeValue.vaerdi;
              }
            }
          }
        }

        // Extract name and address from deltager
        const deltager = rel.deltager;
        if (deltager) {
          const navne = deltager.navne || [];
          const currentName = navne.find((n: any) => !n.periode?.gyldigTil) || navne[navne.length - 1];
          if (currentName) {
            name = currentName.navn || 'Ukendt';
          }
          
          const beliggenhedsadresse = deltager.beliggenhedsadresse || [];
          const currentAddress = beliggenhedsadresse.find((a: any) => !a.periode?.gyldigTil) || beliggenhedsadresse[beliggenhedsadresse.length - 1];
          
          if (currentAddress) {
            const parts = [];
            if (currentAddress.vejnavn) parts.push(currentAddress.vejnavn);
            if (currentAddress.husnummerFra) parts.push(currentAddress.husnummerFra);
            if (currentAddress.postnummer && currentAddress.postdistrikt) {
              parts.push(`${currentAddress.postnummer} ${currentAddress.postdistrikt}`);
            }
            addressString = parts.join(', ');
          }
        }

        // SECOND: Try enriched data as fallback for name/address if not found
        const enrichedData = rel._enrichedDeltagerData;
        if (enrichedData && name === 'Ukendt') {
          const navne = enrichedData.navne || [];
          const currentName = navne.find((n: any) => !n.periode?.gyldigTil) || navne[0];
          if (currentName) {
            name = currentName.navn || name;
          }
          
          if (!addressString) {
            const beliggenhedsadresse = enrichedData.beliggenhedsadresse || [];
            const currentAddress = beliggenhedsadresse.find((a: any) => !a.periode?.gyldigTil) || beliggenhedsadresse[0];
            
            if (currentAddress) {
              const parts = [];
              if (currentAddress.vejnavn) parts.push(currentAddress.vejnavn);
              if (currentAddress.husnummerFra) parts.push(currentAddress.husnummerFra);
              if (currentAddress.postnummer && currentAddress.postdistrikt) {
                parts.push(`${currentAddress.postnummer} ${currentAddress.postdistrikt}`);
              }
              addressString = parts.join(', ');
            }
          }
        }

        if (!validFrom) {
          validFrom = rel.periode?.gyldigFra;
        }

        // Detect if owner is a person or company
        const enhedstype = rel.deltager?.enhedstype || 'UNKNOWN';
        const isPerson = enhedstype === 'PERSON';
        const isCompany = enhedstype === 'VIRKSOMHED';
        
        // Extract identifier based on type - check enriched data first
        let identifier = '';
        let cvr = undefined;
        
        // DEBUG: Log complete enriched data structure if available
        if (rel._enrichedDeltagerData) {
          console.log('[ownershipUtils] 🔍 COMPLETE ENRICHED DATA STRUCTURE for', name, ':', {
            topLevelKeys: Object.keys(rel._enrichedDeltagerData),
            enhedsNummer: rel._enrichedDeltagerData.enhedsNummer,
            forretningsnoegle: rel._enrichedDeltagerData.forretningsnoegle,
            cvrNummer: rel._enrichedDeltagerData.cvrNummer,
            enhedstype: rel._enrichedDeltagerData.enhedstype,
            fullData: JSON.stringify(rel._enrichedDeltagerData, null, 2).substring(0, 500) + '...'
          });
        }
        
        // Try enriched data first, then fallback to original deltager data
        const enhedsNummer = rel._enrichedDeltagerData?.enhedsNummer || rel.deltager?.enhedsNummer;
        const forretningsnoegle = rel._enrichedDeltagerData?.forretningsnoegle || rel.deltager?.forretningsnoegle;
        
        console.log('[ownershipUtils] Processing deltager:', {
          navn: name,
          enhedstype,
          isPerson,
          isCompany,
          hasEnrichedData: !!rel._enrichedDeltagerData,
          enhedsNummer,
          forretningsnoegle,
          source: rel._enrichedDeltagerData?.enhedsNummer ? 'enriched' : (rel.deltager?.enhedsNummer ? 'deltager' : 'none')
        });
        
        if (isPerson && enhedsNummer) {
          identifier = enhedsNummer.toString();
          console.log('[ownershipUtils] ✓ Extracted person identifier:', identifier);
        } else if (isCompany && forretningsnoegle) {
          identifier = forretningsnoegle.toString();
          cvr = identifier;
          console.log('[ownershipUtils] ✓ Extracted company identifier/CVR:', identifier);
        } else {
          console.warn('[ownershipUtils] ✗ No identifier found for:', {
            enhedstype,
            hasEnrichedData: !!rel._enrichedDeltagerData,
            enrichedKeys: rel._enrichedDeltagerData ? Object.keys(rel._enrichedDeltagerData) : [],
            deltagerKeys: rel.deltager ? Object.keys(rel.deltager) : []
          });
        }

        return {
          navn: name,
          adresse: addressString,
          ejerandel: ownershipPercentage 
            ? mapOwnershipToRange(ownershipPercentage)
            : 'Ikke oplyst',
          stemmerettigheder: votingRights 
            ? mapOwnershipToRange(votingRights)
            : 'Ikke oplyst',
          periode: {
            gyldigFra: validFrom || rel.periode?.gyldigFra,
            gyldigTil: rel.periode?.gyldigTil
          },
          type: enhedstype as 'PERSON' | 'VIRKSOMHED' | 'UNKNOWN',
          identifier: identifier,
          cvr: cvr,
          _hasEnrichedData: !!enrichedData
        };
      });
  };

  const getSubsidiariesFromRelations = () => {
    const relations = vrvirksomhed.virksomhedsRelation || [];
    
    console.log('[ownershipUtils] Extracting subsidiaries from virksomhedsRelation:', {
      hasVirksomhedsRelation: !!vrvirksomhed.virksomhedsRelation,
      relationCount: relations.length
    });
    
    return relations
      .filter((rel: any) => {
        const isActive = !rel.periode?.gyldigTil;
        
        // Check if this is a subsidiary relationship (DATTERSELSKAB, MODERSELSKAB relations)
        const hasSubsidiaryType = rel.organisationer?.some((org: any) => 
          org.hovedtype === 'REGISTER' && (
            org.organisationsNavn?.some((n: any) => 
              n.navn?.includes('DATTERSELSKAB') || 
              n.navn?.includes('SØSTERSELSKAB') ||
              n.navn?.includes('MODERSELSKAB')
            ) ||
            org.medlemsData?.some((m: any) =>
              m.attributter?.some((attr: any) =>
                attr.type === 'EJERANDEL_PROCENT' || 
                attr.type === 'EJERANDEL_STEMMERET_PROCENT'
              )
            )
          )
        );
        
        return isActive && hasSubsidiaryType;
      })
      .map((rel: any) => {
        let name = 'Ukendt';
        let cvr = '';
        let addressString = '';
        let ownershipPercentage: number | undefined;
        let status = '';
        
        // Extract company details from virksomhed
        const virksomhed = rel.virksomhed;
        if (virksomhed) {
          // Get name
          const navne = virksomhed.navne || [];
          const currentName = navne.find((n: any) => !n.periode?.gyldigTil) || navne[navne.length - 1];
          if (currentName) {
            name = currentName.navn || 'Ukendt';
          }
          
          // Get CVR
          cvr = virksomhed.cvrNummer?.toString() || '';
          
          // Get address
          const beliggenhedsadresse = virksomhed.beliggenhedsadresse || [];
          const currentAddress = beliggenhedsadresse.find((a: any) => !a.periode?.gyldigTil) || beliggenhedsadresse[beliggenhedsadresse.length - 1];
          
          if (currentAddress) {
            const parts = [];
            if (currentAddress.vejnavn) parts.push(currentAddress.vejnavn);
            if (currentAddress.husnummerFra) parts.push(currentAddress.husnummerFra);
            if (currentAddress.postnummer && currentAddress.postdistrikt) {
              parts.push(`${currentAddress.postnummer} ${currentAddress.postdistrikt}`);
            }
            addressString = parts.join(', ');
          }
          
          // Get status
          const statuser = virksomhed.virksomhedsstatus || [];
          const currentStatus = statuser.find((s: any) => !s.periode?.gyldigTil) || statuser[statuser.length - 1];
          if (currentStatus) {
            status = currentStatus.status || '';
          }
        }
        
        // Extract ownership percentage from organisationer
        const org = rel.organisationer?.find((o: any) => o.hovedtype === 'REGISTER');
        if (org) {
          const medlemsData = org.medlemsData || [];
          const activeMember = medlemsData.find((m: any) => !m.periode?.gyldigTil) || medlemsData[0];
          
          if (activeMember) {
            const attributter = activeMember.attributter || [];
            const ejerandelAttr = attributter.find((attr: any) => attr.type === 'EJERANDEL_PROCENT');
            if (ejerandelAttr) {
              const vaerdier = ejerandelAttr.vaerdier || [];
              const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil) || vaerdier[0];
              if (activeValue?.vaerdi) {
                ownershipPercentage = parseFloat(activeValue.vaerdi);
              }
            }
          }
        }
        
        console.log('[ownershipUtils] ✓ Extracted subsidiary:', {
          name,
          cvr,
          ownershipPercentage: ownershipPercentage ? `${(ownershipPercentage * 100).toFixed(2)}%` : 'N/A'
        });
        
        return {
          navn: name,
          cvr: cvr,
          adresse: addressString,
          status: status,
          ejerandel: ownershipPercentage 
            ? mapOwnershipToRange(ownershipPercentage)
            : 'Ikke oplyst',
          periode: {
            gyldigFra: rel.periode?.gyldigFra,
            gyldigTil: rel.periode?.gyldigTil
          }
        };
      });
  };

  let ownershipFromRelations = getOwnershipFromRelations();
  const subsidiariesFromRelations = getSubsidiariesFromRelations();

  // If company is listed AND has some legal owners, add public ownership entry
  if (isListed && ownershipFromRelations.length > 0) {
    // Calculate total declared ownership
    let totalOwnership = 0;
    let totalVoting = 0;
    
    ownershipFromRelations.forEach(owner => {
      const ownershipRange = parseOwnershipRange(owner.ejerandel);
      const votingRange = parseOwnershipRange(owner.stemmerettigheder);
      
      totalOwnership += ownershipRange.midpoint || 0;
      totalVoting += votingRange.midpoint || 0;
    });
    
    // Calculate remaining percentage for public shareholders
    const remainingOwnership = 100 - totalOwnership;
    const remainingVoting = 100 - totalVoting;
    
    // Only add if there's significant remaining ownership (>5%)
    if (remainingOwnership > 5) {
      const tickerSymbol = extractTickerSymbol(vrvirksomhed);
      
      ownershipFromRelations.push({
        navn: 'Børsnoteret - offentligt handlet',
        adresse: '',
        ejerandel: `${Math.round(remainingOwnership)}%`,
        stemmerettigheder: `${Math.round(remainingVoting)}%`,
        periode: { gyldigFra: '', gyldigTil: '' },
        type: 'LISTED' as const,
        identifier: '',
        cvr: undefined,
        _hasEnrichedData: false,
        _isListedCompany: true,
        _tickerSymbol: tickerSymbol,
        _yahooFinanceUrl: tickerSymbol ? `https://finance.yahoo.com/quote/${tickerSymbol}` : undefined
      });
    }
  }

  // If company is listed and no specific owners found, return special entry
  if (isListed && ownershipFromRelations.length === 0) {
    return {
      currentOwners: [{
        navn: 'Børsnoteret - offentligt handlet',
        adresse: '',
        ejerandel: '100%',
        stemmerettigheder: '100%',
        periode: { gyldigFra: '', gyldigTil: '' },
        type: 'LISTED' as const,
        identifier: '',
        cvr: undefined,
        _hasEnrichedData: false,
        _isListedCompany: true
      }],
      subsidiaries: subsidiariesFromRelations
    };
  }

  return {
    currentOwners: ownershipFromRelations,
    subsidiaries: subsidiariesFromRelations
  };
};

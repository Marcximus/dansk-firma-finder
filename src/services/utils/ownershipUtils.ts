
import { formatAddress, formatPeriod } from './formatUtils';

// Enhanced helper functions for extracting ownership data with intelligent field discovery
import { extractDataIntelligently, scanDataStructure } from './dataDiscovery';

export const extractOwnershipData = (cvrData: any) => {
  if (!cvrData?.Vrvirksomhed) {
    return { currentOwners: [], subsidiaries: [] };
  }

  const getOwnershipFromRelations = () => {
    const relations = cvrData.Vrvirksomhed.deltagerRelation || [];
    
    return relations
      .filter((rel: any) => {
        const isActive = !rel.periode?.gyldigTil;
        
        // Check if this relation has ownership info in EJERREGISTER (directly in rel.organisationer)
        const hasOwnershipData = rel.organisationer?.some((org: any) => 
          org.hovedtype === 'REGISTER' && 
          org.organisationsNavn?.some((n: any) => n.navn === 'EJERREGISTER')
        );
        
        // Also check enriched data as fallback
        const hasEnrichedOwnershipData = rel._enrichedDeltagerData?.virksomhedSummariskRelation?.some((vrel: any) => {
          return vrel.organisationer?.some((org: any) => 
            org.hovedtype === 'REGISTER' && 
            org.organisationsNavn?.some((n: any) => n.navn === 'EJERREGISTER')
          );
        });
        
        return isActive && (hasOwnershipData || hasEnrichedOwnershipData);
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
          const activeMember = medlemsData.find((m: any) => !m.periode?.gyldigTil) || medlemsData[0];
          
          if (activeMember) {
            const attributter = activeMember.attributter || [];
            
            // Extract ownership percentage
            const ejerandelAttr = attributter.find((attr: any) => attr.type === 'EJERANDEL_PROCENT');
            if (ejerandelAttr) {
              const vaerdier = ejerandelAttr.vaerdier || [];
              const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil) || vaerdier[0];
              if (activeValue?.vaerdi) {
                ownershipPercentage = parseFloat(activeValue.vaerdi);
              }
            }

            // Extract voting rights
            const stemmeretAttr = attributter.find((attr: any) => attr.type === 'EJERANDEL_STEMMERET_PROCENT');
            if (stemmeretAttr) {
              const vaerdier = stemmeretAttr.vaerdier || [];
              const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil) || vaerdier[0];
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

        return {
          navn: name,
          adresse: addressString,
          ejerandel: ownershipPercentage 
            ? `${(ownershipPercentage * 100).toFixed(2)}%` 
            : 'Ikke oplyst',
          stemmerettigheder: votingRights 
            ? `${(votingRights * 100).toFixed(2)}%` 
            : 'Ikke oplyst',
          periode: {
            gyldigFra: validFrom || rel.periode?.gyldigFra,
            gyldigTil: rel.periode?.gyldigTil
          },
          _hasEnrichedData: !!enrichedData
        };
      });
  };

  const getSubsidiaries = () => {
    const virksomhedsRelation = cvrData.Vrvirksomhed.virksomhedsRelation || [];
    
    return virksomhedsRelation
      .filter((relation: any) => {
        // Filter for active subsidiary relationships
        const isActive = !relation.periode?.gyldigTil;
        const isSubsidiary = relation.relationtype?.includes('DATTER') || 
                           relation.relationtype?.includes('HELEJEDE') ||
                           relation.relationtype === 'MAJORITETSEJET_AF';
        return isActive && isSubsidiary;
      })
      .map((relation: any) => {
        const relatedCompany = relation.relation;
        const navn = relatedCompany?.navne?.find((n: any) => !n.periode?.gyldigTil)?.navn || 
                    relatedCompany?.navne?.[relatedCompany.navne.length - 1]?.navn || 
                    'Ukendt virksomhed';
        
        const address = relatedCompany?.beliggenhedsadresse?.find((addr: any) => !addr.periode?.gyldigTil) ||
                       relatedCompany?.beliggenhedsadresse?.[0];
        
        return {
          navn,
          cvr: relatedCompany?.cvrNummer || null,
          adresse: formatAddress(address),
          relationtype: relation.relationtype || 'Datterselskab',
          periode: relation.periode
        };
      });
  };

  const ownershipFromRelations = getOwnershipFromRelations();
  const subsidiaries = getSubsidiaries();

  return {
    currentOwners: ownershipFromRelations,
    subsidiaries
  };
};


import { formatAddress, formatPeriod } from './formatUtils';

// Enhanced helper functions for extracting ownership data with intelligent field discovery
import { extractDataIntelligently, scanDataStructure } from './dataDiscovery';

export const extractOwnershipData = (cvrData: any) => {
  if (!cvrData?.Vrvirksomhed) {
    return { currentOwners: [], subsidiaries: [] };
  }

  const getOwnershipFromRelations = () => {
    const relations = cvrData.Vrvirksomhed.deltagerRelation || [];
    const currentCvrNumber = cvrData.Vrvirksomhed.cvrNummer;
    
    return relations
      .filter((rel: any) => {
        const isOwner = rel.organisationer?.some((org: any) => 
          org.hovedtype === 'EJER'
        );
        const isActive = !rel.periode?.gyldigTil;
        return isOwner && isActive;
      })
      .map((rel: any) => {
        // Check if we have enriched participant data
        const enrichedData = rel._enrichedDeltagerData;
        
        let name = 'Ukendt';
        let addressString = '';
        let ownershipPercentage: number | undefined;
        let votingRights: number | undefined;
        let validFrom: string | undefined;
        
        if (enrichedData) {
          // Use enriched data from Vrdeltagerperson endpoint
          const navne = enrichedData.navne || [];
          const currentName = navne.find((n: any) => !n.periode?.gyldigTil) || navne[0];
          name = currentName?.navn || 'Ukendt';
          
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

          // Extract ownership data from virksomhedSummariskRelation
          const virksomhedRelations = enrichedData.virksomhedSummariskRelation || [];
          const relevantRelation = virksomhedRelations.find((vrel: any) => 
            vrel.virksomhed?.cvrNummer === currentCvrNumber
          );

          if (relevantRelation) {
            const organisationer = relevantRelation.organisationer || [];
            const ejerRegister = organisationer.find((org: any) => 
              org.hovedtype === 'REGISTER' && 
              org.organisationsNavn?.some((n: any) => n.navn === 'EJERREGISTER')
            );

            if (ejerRegister) {
              const medlemsData = ejerRegister.medlemsData || [];
              const activeMember = medlemsData.find((m: any) => !m.periode?.gyldigTil) || medlemsData[0];
              
              if (activeMember) {
                const attributter = activeMember.attributter || [];
                
                const ejerandelAttr = attributter.find((attr: any) => 
                  attr.type === 'EJERANDEL_PROCENT'
                );
                if (ejerandelAttr) {
                  const vaerdier = ejerandelAttr.vaerdier || [];
                  const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil) || vaerdier[0];
                  if (activeValue?.vaerdi) {
                    ownershipPercentage = parseFloat(activeValue.vaerdi);
                  }
                }

                const stemmeretAttr = attributter.find((attr: any) => 
                  attr.type === 'EJERANDEL_STEMMERET_PROCENT'
                );
                if (stemmeretAttr) {
                  const vaerdier = stemmeretAttr.vaerdier || [];
                  const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil) || vaerdier[0];
                  if (activeValue?.vaerdi) {
                    votingRights = parseFloat(activeValue.vaerdi);
                  }
                }

                const meddelelseAttr = attributter.find((attr: any) => 
                  attr.type === 'EJERANDEL_MEDDELELSE_DATO'
                );
                if (meddelelseAttr) {
                  const vaerdier = meddelelseAttr.vaerdier || [];
                  const activeValue = vaerdier.find((v: any) => !v.periode?.gyldigTil) || vaerdier[0];
                  if (activeValue?.vaerdi) {
                    validFrom = activeValue.vaerdi;
                  }
                }
              }
            }
          }
        } else {
          // Fallback to basic relation data
          const deltager = rel.deltager;
          const navne = deltager?.navne || [];
          const currentName = navne.find((n: any) => !n.periode?.gyldigTil);
          name = currentName?.navn || 'Ukendt';
          
          const beliggenhedsadresse = deltager?.beliggenhedsadresse || [];
          const currentAddress = beliggenhedsadresse.find((a: any) => !a.periode?.gyldigTil);
          
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

        // Fallback: Try to get ownership from the relation's organisationer if not found in enriched data
        if (!ownershipPercentage && !votingRights) {
          const ownershipOrgs = rel.organisationer?.filter((org: any) => org.hovedtype === 'EJER') || [];
          const ownershipAttr = ownershipOrgs[0]?.attributter?.find((attr: any) => 
            attr.type === 'EJERANDEL_PROCENT'
          )?.vaerdier?.[0]?.vaerdi;

          const votingAttr = ownershipOrgs[0]?.attributter?.find((attr: any) => 
            attr.type === 'EJERANDEL_STEMMERET_PROCENT'
          )?.vaerdier?.[0]?.vaerdi;

          if (ownershipAttr) ownershipPercentage = parseFloat(ownershipAttr);
          if (votingAttr) votingRights = parseFloat(votingAttr);
        }

        if (!validFrom) {
          validFrom = rel.periode?.gyldigFra;
        }

        return {
          name,
          address: addressString,
          ownershipPercentage,
          votingRights,
          validFrom,
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


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

        const ownershipOrgs = rel.organisationer?.filter((org: any) => org.hovedtype === 'EJER') || [];
        const ownershipPercentage = ownershipOrgs[0]?.attributter?.find((attr: any) => 
          attr.type === 'EJERANDEL_PROCENT'
        )?.vaerdier?.[0]?.vaerdi;

        const votingRights = ownershipOrgs[0]?.attributter?.find((attr: any) => 
          attr.type === 'EJERANDEL_STEMMERET_PROCENT'
        )?.vaerdier?.[0]?.vaerdi;

        return {
          name,
          address: addressString,
          ownershipPercentage: ownershipPercentage ? parseFloat(ownershipPercentage) : undefined,
          votingRights: votingRights ? parseFloat(votingRights) : undefined,
          validFrom: rel.periode?.gyldigFra,
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

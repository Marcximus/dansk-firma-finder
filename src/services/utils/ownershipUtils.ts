
import { formatAddress, formatPeriod } from './formatUtils';

// Enhanced helper functions for extracting ownership data with intelligent field discovery
import { extractDataIntelligently, scanDataStructure } from './dataDiscovery';

export const extractOwnershipData = (cvrData: any) => {
  console.log('extractOwnershipData - Input data:', cvrData);
  
  if (!cvrData?.Vrvirksomhed) {
    console.log('extractOwnershipData - No Vrvirksomhed data found');
    return null;
  }
  
  const vrvirksomhed = cvrData.Vrvirksomhed;
  console.log('extractOwnershipData - Processing Vrvirksomhed:', vrvirksomhed);
  
  // Intelligent field discovery for ownership data
  const availablePaths = scanDataStructure(vrvirksomhed);
  console.log('Ownership data - Available field paths:', availablePaths.filter(path => 
    path.toLowerCase().includes('ejer') || 
    path.toLowerCase().includes('owner') || 
    path.toLowerCase().includes('andel') ||
    path.toLowerCase().includes('stemme') ||
    path.toLowerCase().includes('virksomhedsrelation')
  ));

  const getOwnershipFromRelations = () => {
    const relations = vrvirksomhed.deltagerRelation || [];
    console.log('Ownership relations:', relations);
    
    return relations.filter((relation: any) => 
      relation.organisationer?.some((org: any) => 
        org.hovedtype === 'EJER' || 
        org.hovedtype === 'FULDT_ANSVARLIG_DELTAGERE' ||
        org.medlemsData?.some((medlem: any) => 
          medlem.attributter?.some((attr: any) => 
            attr.type === 'EJERANDEL' || attr.type === 'STEMMERETTIGHEDER'
          )
        )
      )
    ).map((relation: any) => {
      const deltager = relation.deltager;
      const personName = deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null)?.navn || 
                       deltager?.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
      
      const address = deltager?.adresser?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                     deltager?.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                     deltager?.adresser?.[0] ||
                     deltager?.beliggenhedsadresse?.[0];

      let ejerandel = null;
      let stemmerettigheder = null;
      let periode = null;

      relation.organisationer?.forEach((org: any) => {
        org.medlemsData?.forEach((medlem: any) => {
          periode = periode || medlem.periode;
          medlem.attributter?.forEach((attr: any) => {
            if (attr.type === 'EJERANDEL' && attr.vaerdier?.[0]?.vaerdi) {
              ejerandel = attr.vaerdier[0].vaerdi;
            }
            if (attr.type === 'STEMMERETTIGHEDER' && attr.vaerdier?.[0]?.vaerdi) {
              stemmerettigheder = attr.vaerdier[0].vaerdi;
            }
          });
        });
      });

      return {
        navn: personName,
        adresse: formatAddress(address),
        ejerandel: ejerandel || 'Ikke oplyst',
        stemmerettigheder: stemmerettigheder || 'Ikke oplyst',
        periode: periode,
        isActive: !periode?.gyldigTil
      };
    });
  };

  const getSubsidiaries = () => {
    const virksomhedsRelation = vrvirksomhed.virksomhedsRelation || [];
    console.log('Subsidiary relations (virksomhedsRelation):', virksomhedsRelation);
    
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

  console.log('Ownership data - ownershipFromRelations:', ownershipFromRelations);
  console.log('Ownership data - subsidiaries:', subsidiaries);

  const result = {
    currentOwners: ownershipFromRelations.filter((owner: any) => owner.isActive),
    subsidiaries
  };

  console.log('extractOwnershipData - Final result:', result);
  return result;
};

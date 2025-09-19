
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
    path.toLowerCase().includes('stemme')
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

  const legaleEjere = vrvirksomhed.legaleEjere || [];
  const ownershipFromRelations = getOwnershipFromRelations();
  
  // Try multiple sources for beneficial owners
  let rielleEjere = vrvirksomhed.rielleEjere || vrvirksomhed.beneficialOwners || [];
  
  // If no direct beneficial owners, check if any relations have ownership attributes
  if (rielleEjere.length === 0) {
    const ownershipRelations = vrvirksomhed.deltagerRelation?.filter((relation: any) => {
      return relation.organisationer?.some((org: any) => 
        org.medlemsData?.some((medlem: any) => 
          medlem.attributter?.some((attr: any) => 
            attr.type === 'REEL_EJER' || attr.type === 'BENEFICIAL_OWNER' ||
            (attr.type === 'EJERANDEL' && parseFloat(attr.vaerdier?.[0]?.vaerdi?.replace('%', '') || '0') >= 25)
          )
        )
      );
    }) || [];
    
    rielleEjere = ownershipRelations.map((relation: any) => {
      const deltager = relation.deltager;
      const navn = deltager?.navne?.find((n: any) => !n.periode?.gyldigTil)?.navn || 
                   deltager?.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
      
      const address = deltager?.adresser?.find((addr: any) => !addr.periode?.gyldigTil) ||
                     deltager?.beliggenhedsadresse?.find((addr: any) => !addr.periode?.gyldigTil) ||
                     deltager?.adresser?.[0] || deltager?.beliggenhedsadresse?.[0];
                     
      let kontrolform = 'Direkte ejerskab';
      relation.organisationer?.forEach((org: any) => {
        org.medlemsData?.forEach((medlem: any) => {
          medlem.attributter?.forEach((attr: any) => {
            if (attr.type === 'KONTROLFORM' && attr.vaerdier?.[0]?.vaerdi) {
              kontrolform = attr.vaerdier[0].vaerdi;
            }
          });
        });
      });
      
      return {
        navn,
        adresse: formatAddress(address),
        kontrolform,
        periode: relation.organisationer?.[0]?.medlemsData?.[0]?.periode
      };
    });
  }

  console.log('Ownership data - legaleEjere:', legaleEjere);
  console.log('Ownership data - ownershipFromRelations:', ownershipFromRelations);
  console.log('Ownership data - rielleEjere:', rielleEjere);

  const result = {
    currentOwners: [
      ...legaleEjere.filter((ejer: any) => !ejer.periode?.gyldigTil),
      ...ownershipFromRelations.filter((owner: any) => owner.isActive)
    ],
    formerOwners: [
      ...legaleEjere.filter((ejer: any) => ejer.periode?.gyldigTil),
      ...ownershipFromRelations.filter((owner: any) => !owner.isActive)
    ],
    rielleEjere
  };

  console.log('extractOwnershipData - Final result:', result);
  return result;
};


// Helper function to extract real CVR data for company details
export const extractCvrDetails = (cvrData: any) => {
  if (!cvrData || !cvrData.Vrvirksomhed) {
    return null;
  }

  const vrvirksomhed = cvrData.Vrvirksomhed;
  
  // Extract management and board information
  const management = vrvirksomhed.deltagerRelation?.map((relation: any) => {
    const deltager = relation.deltager;
    if (!deltager) return null;
    
    const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
    const name = currentName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || 'Unknown';
    
    const currentAddress = deltager.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
    const address = currentAddress || deltager.beliggenhedsadresse?.[deltager.beliggenhedsadresse.length - 1];
    
    let addressString = 'N/A';
    if (address) {
      const street = address.vejnavn || '';
      const houseNumber = address.husnummerFra || '';
      const floor = address.etage ? `, ${address.etage}` : '';
      const door = address.sidedoer ? ` ${address.sidedoer}` : '';
      const city = address.postdistrikt || '';
      const postalCode = address.postnummer ? address.postnummer.toString() : '';
      addressString = `${street} ${houseNumber}${floor}${door}, ${postalCode} ${city}`.trim();
    }
    
    // Determine role based on attributes or organization type
    let role = 'Deltager';
    if (relation.organisationer && relation.organisationer.length > 0) {
      const org = relation.organisationer[0];
      if (org?.hovedtype) {
        role = org.hovedtype === 'DIREKTION' ? 'Direktør' : 
               org.hovedtype === 'BESTYRELSE' ? 'Bestyrelse' : 
               org.hovedtype === 'FULDT_ANSVARLIG_DELTAGERE' ? 'Interessenter' :
               org.hovedtype;
      }
      
      // Get more specific role from member data
      if (org.medlemsData && org.medlemsData.length > 0) {
        const memberData = org.medlemsData[0];
        if (memberData.attributter) {
          const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
          if (funkAttribute && funkAttribute.vaerdier && funkAttribute.vaerdier.length > 0) {
            role = funkAttribute.vaerdier[0].vaerdi || role;
          }
        }
      }
    }
    
    return {
      role: role,
      name: name,
      address: addressString
    };
  }).filter(Boolean) || [];

  // Extract historical information - sort by date to show most recent first
  const historicalNames = vrvirksomhed.navne?.map((navnItem: any) => ({
    period: `${navnItem.periode?.gyldigFra || 'Unknown'} - ${navnItem.periode?.gyldigTil || 'Present'}`,
    name: navnItem.navn
  })).sort((a: any, b: any) => {
    // Sort so current names (with 'Present') come first
    if (a.period.includes('Present') && !b.period.includes('Present')) return -1;
    if (b.period.includes('Present') && !a.period.includes('Present')) return 1;
    return b.period.localeCompare(a.period);
  }) || [];

  const historicalAddresses = vrvirksomhed.beliggenhedsadresse?.map((addr: any) => {
    let addressString = '';
    if (addr.vejnavn || addr.husnummerFra) {
      const street = addr.vejnavn || '';
      const houseNumber = addr.husnummerFra || '';
      const floor = addr.etage ? `, ${addr.etage}` : '';
      const door = addr.sidedoer ? ` ${addr.sidedoer}` : '';
      const city = addr.postdistrikt || '';
      const postalCode = addr.postnummer ? addr.postnummer.toString() : '';
      addressString = `${street} ${houseNumber}${floor}${door}\n${postalCode} ${city}`;
    }
    
    return {
      period: `${addr.periode?.gyldigFra || 'Unknown'} - ${addr.periode?.gyldigTil || 'Present'}`,
      address: addressString
    };
  }).sort((a: any, b: any) => {
    // Sort so current addresses (with 'Present') come first
    if (a.period.includes('Present') && !b.period.includes('Present')) return -1;
    if (b.period.includes('Present') && !a.period.includes('Present')) return 1;
    return b.period.localeCompare(a.period);
  }) || [];

  // Extract company form information - get current form
  const currentForm = vrvirksomhed.virksomhedsform?.find((form: any) => form.periode?.gyldigTil === null);
  const legalForm = currentForm?.langBeskrivelse || currentForm?.kortBeskrivelse || 
                   vrvirksomhed.virksomhedsform?.[vrvirksomhed.virksomhedsform.length - 1]?.langBeskrivelse || 'N/A';

  // Extract status - get current status
  const currentStatus = vrvirksomhed.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
  const status = currentStatus?.status || vrvirksomhed.virksomhedsstatus?.[vrvirksomhed.virksomhedsstatus.length - 1]?.status || 'N/A';

  // Extract employment data
  const latestEmployment = vrvirksomhed.aarsbeskaeftigelse?.[0];
  const employeeCount = latestEmployment?.antalAnsatte || latestEmployment?.antalAarsvaerk || 0;

  // Enhanced purpose text from various sources
  let purposeText = "Company information from Danish Business Authority.";
  
  // Try to extract more meaningful purpose information
  if (vrvirksomhed.hovedbranche && vrvirksomhed.hovedbranche.length > 0) {
    const currentIndustry = vrvirksomhed.hovedbranche.find((branch: any) => branch.periode?.gyldigTil === null);
    const industry = currentIndustry || vrvirksomhed.hovedbranche[vrvirksomhed.hovedbranche.length - 1];
    purposeText = `Primary business activity: ${industry.branchetekst} (Code: ${industry.branchekode}). `;
    
    // Add secondary industries if available
    const secondaryIndustries = [
      ...(vrvirksomhed.bibranche1 || []),
      ...(vrvirksomhed.bibranche2 || []),
      ...(vrvirksomhed.bibranche3 || [])
    ];
    
    if (secondaryIndustries.length > 0) {
      const currentSecondary = secondaryIndustries.filter((branch: any) => !branch.periode?.gyldigTil);
      if (currentSecondary.length > 0) {
        purposeText += `Secondary activities include: ${currentSecondary.map((branch: any) => branch.branchetekst).join(', ')}.`;
      }
    }
  }

  return {
    management,
    historicalNames,
    historicalAddresses,
    legalForm,
    status,
    employeeCount,
    purposeText,
    fullData: vrvirksomhed
  };
};

// Helper functions for extracting specific data sections
export const extractExtendedInfo = (cvrData: any) => {
  if (!cvrData?.Vrvirksomhed) return null;
  
  const vrvirksomhed = cvrData.Vrvirksomhed;
  
  const getCurrentValue = (array: any[], fieldName: string) => {
    if (!array || array.length === 0) return null;
    const current = array.find((item: any) => item.periode?.gyldigTil === null);
    return current?.[fieldName] || array[array.length - 1]?.[fieldName] || null;
  };

  return {
    phone: getCurrentValue(vrvirksomhed.telefonNummer, 'kontaktoplysning'),
    municipality: getCurrentValue(vrvirksomhed.beliggenhedsadresse, 'kommune'),
    purpose: vrvirksomhed.formaal,
    binavne: (vrvirksomhed.binavne || []).map((navn: any) => navn.navn).filter(Boolean),
    secondaryIndustries: [
      ...(vrvirksomhed.bibranche1 || []),
      ...(vrvirksomhed.bibranche2 || []),
      ...(vrvirksomhed.bibranche3 || [])
    ].filter((branch: any) => !branch.periode?.gyldigTil),
    isListed: vrvirksomhed.boersnoteret || false,
    accountingYear: (() => {
      const regnskabsperiode = vrvirksomhed.regnskabsperiode || [];
      const current = regnskabsperiode.find((periode: any) => periode.periode?.gyldigTil === null) || regnskabsperiode[regnskabsperiode.length - 1];
      return current ? `${current.regnskabsperiodefra} - ${current.regnskabsperiodetil}` : null;
    })(),
    latestStatuteDate: (() => {
      const vedtaegter = vrvirksomhed.vedtaegter || [];
      const latest = vedtaegter.find((v: any) => v.periode?.gyldigTil === null) || vedtaegter[vedtaegter.length - 1];
      return latest?.dato || null;
    })(),
    capitalClasses: (vrvirksomhed.kapitalforhold || []).filter((k: any) => !k.periode?.gyldigTil),
    registeredCapital: (() => {
      const kapitalforhold = vrvirksomhed.kapitalforhold || [];
      const current = kapitalforhold.find((k: any) => !k.periode?.gyldigTil && k.kapitalbeloeb);
      return current?.kapitalbeloeb || vrvirksomhed.registreretKapital || null;
    })()
  };
};

export const extractSigningRulesData = (cvrData: any) => {
  if (!cvrData?.Vrvirksomhed) return null;
  
  const vrvirksomhed = cvrData.Vrvirksomhed;
  const relations = vrvirksomhed.deltagerRelation || [];

  const getSigningRules = () => {
    const tegningsregler = vrvirksomhed.tegningsregler || [];
    let signingRules = tegningsregler.map((regel: any) => regel.regel || regel.beskrivelse || regel.tekst).filter(Boolean);
    
    const attributter = vrvirksomhed.attributter || [];
    const signingAttributes = attributter.filter((attr: any) => 
      attr.type === 'TEGNINGSREGEL' || attr.type === 'BINDING_RULE'
    );
    
    signingAttributes.forEach((attr: any) => {
      if (attr.vaerdier) {
        attr.vaerdier.forEach((value: any) => {
          if (value.vaerdi) {
            signingRules.push(value.vaerdi);
          }
        });
      }
    });
    
    return signingRules;
  };

  return {
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
};

export const extractOwnershipData = (cvrData: any) => {
  if (!cvrData?.Vrvirksomhed) return null;
  
  const vrvirksomhed = cvrData.Vrvirksomhed;

  const formatAddress = (addr: any) => {
    if (!addr) return 'Adresse ikke tilgængelig';
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage}. sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return streetAddress && postalInfo ? `${streetAddress}, ${postalInfo}` : 'Adresse ikke tilgængelig';
  };

  const getOwnershipFromRelations = () => {
    const relations = vrvirksomhed.deltagerRelation || [];
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
  const rielleEjere = vrvirksomhed.rielleEjere || vrvirksomhed.beneficialOwners || [];

  return {
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
};

export const extractFinancialData = (cvrData: any) => {
  if (!cvrData?.Vrvirksomhed) return null;
  
  const vrvirksomhed = cvrData.Vrvirksomhed;

  const getFinancialKPIs = () => {
    const regnskabstal = vrvirksomhed.regnskabstal || [];
    const finansielleNoegletal = vrvirksomhed.finansielleNoegletal || [];
    
    let financialKPIs: any = {};
    
    if (regnskabstal.length > 0) {
      const latest = regnskabstal[regnskabstal.length - 1];
      financialKPIs = {
        nettoomsaetning: latest.nettoomsaetning || latest.revenue || null,
        bruttofortjeneste: latest.bruttofortjeneste || latest.grossProfit || null,
        aaretsResultat: latest.aaretsResultat || latest.netIncome || null,
        egenkapital: latest.egenkapital || latest.equity || null,
        statusBalance: latest.statusBalance || latest.totalAssets || null,
        periode: latest.periode || latest.year || null
      };
    }
    
    if (finansielleNoegletal.length > 0) {
      const latest = finansielleNoegletal[finansielleNoegletal.length - 1];
      financialKPIs = {
        ...financialKPIs,
        nettoomsaetning: financialKPIs.nettoomsaetning || latest.revenue || latest.turnover,
        bruttofortjeneste: financialKPIs.bruttofortjeneste || latest.grossProfit,
        aaretsResultat: financialKPIs.aaretsResultat || latest.netResult || latest.profit,
        egenkapital: financialKPIs.egenkapital || latest.equity,
        statusBalance: financialKPIs.statusBalance || latest.balance || latest.totalAssets,
        periode: financialKPIs.periode || latest.year || latest.periode
      };
    }
    
    return financialKPIs;
  };

  return {
    financialKPIs: getFinancialKPIs(),
    yearlyEmployment: vrvirksomhed.aarsbeskaeftigelse || [],
    quarterlyEmployment: vrvirksomhed.kvartalsbeskaeftigelse || [],
    kapitalforhold: vrvirksomhed.kapitalforhold || [],
    regnskabsperiode: vrvirksomhed.regnskabsperiode || []
  };
};

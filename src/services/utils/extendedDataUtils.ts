
import { getCurrentValue } from './formatUtils';

// Helper functions for extracting extended company information
export const extractExtendedInfo = (cvrData: any) => {
  console.log('extractExtendedInfo - Input data:', cvrData);
  
  if (!cvrData?.Vrvirksomhed) {
    console.log('extractExtendedInfo - No Vrvirksomhed data found');
    return null;
  }
  
  const vrvirksomhed = cvrData.Vrvirksomhed;
  console.log('extractExtendedInfo - Processing Vrvirksomhed:', vrvirksomhed);

  // Enhanced phone extraction
  const getPhone = () => {
    const telefonNummer = vrvirksomhed.telefonNummer || [];
    if (telefonNummer.length === 0) return null;
    
    // Try current value first, then fall back to latest
    const current = telefonNummer.find((t: any) => !t.periode?.gyldigTil);
    const phone = current?.kontaktoplysning || telefonNummer[telefonNummer.length - 1]?.kontaktoplysning;
    console.log('Phone extraction - telefonNummer:', telefonNummer, 'phone:', phone);
    return phone;
  };

  // Enhanced municipality extraction
  const getMunicipality = () => {
    const beliggenhedsadresse = vrvirksomhed.beliggenhedsadresse || [];
    if (beliggenhedsadresse.length === 0) return null;
    
    // Try current address first, then fall back to latest
    const current = beliggenhedsadresse.find((addr: any) => !addr.periode?.gyldigTil);
    const addr = current || beliggenhedsadresse[beliggenhedsadresse.length - 1];
    const municipality = addr?.kommune || addr?.kommuneKode;
    console.log('Municipality extraction - beliggenhedsadresse:', beliggenhedsadresse, 'municipality:', municipality);
    return municipality;
  };

  // Fixed purpose extraction with detailed logging
  const getPurpose = () => {
    console.log('=== PURPOSE EXTRACTION DEBUG ===');
    console.log('vrvirksomhed keys:', Object.keys(vrvirksomhed));
    
    // Check all possible locations for formaal
    const formaal = vrvirksomhed.formaal;
    const virksomhedsform = vrvirksomhed.virksomhedsform;
    const hovedbranche = vrvirksomhed.hovedbranche;
    
    console.log('Direct formaal:', formaal);
    console.log('virksomhedsform:', virksomhedsform);
    console.log('hovedbranche:', hovedbranche);
    
    // Look for formaal in nested structures
    if (vrvirksomhed.virksomhedMetadata) {
      console.log('virksomhedMetadata:', vrvirksomhed.virksomhedMetadata);
    }
    
    // Check if formaal is nested under another property
    Object.keys(vrvirksomhed).forEach(key => {
      if (typeof vrvirksomhed[key] === 'object' && vrvirksomhed[key] !== null) {
        if (Array.isArray(vrvirksomhed[key])) {
          vrvirksomhed[key].forEach((item: any, index: number) => {
            if (item && typeof item === 'object' && item.vaerdi && typeof item.vaerdi === 'string' && item.vaerdi.toLowerCase().includes('formål')) {
              console.log(`Found potential formaal in ${key}[${index}]:`, item);
            }
          });
        } else if (vrvirksomhed[key].formaal) {
          console.log(`Found formaal in ${key}:`, vrvirksomhed[key].formaal);
        }
      }
    });
    
    // Handle array structure with vaerdi field
    if (Array.isArray(formaal) && formaal.length > 0) {
      console.log('Processing formaal as array:', formaal);
      // Find current purpose (where gyldigTil is null) or use the last one
      const currentPurpose = formaal.find((f: any) => f.periode?.gyldigTil === null) || formaal[formaal.length - 1];
      console.log('Selected purpose:', currentPurpose);
      const result = currentPurpose?.vaerdi || null;
      console.log('Final purpose result:', result);
      return result;
    }
    // Handle direct string
    else if (typeof formaal === 'string') {
      console.log('Processing formaal as string:', formaal);
      return formaal;
    }
    // Handle object with value property
    else if (formaal && typeof formaal === 'object') {
      console.log('Processing formaal as object:', formaal);
      const result = formaal.vaerdi || formaal.value || formaal.tekst || formaal.beskrivelse || null;
      console.log('Object purpose result:', result);
      return result;
    }
    
    console.log('No formaal found, returning null');
    return null;
  };

  // Enhanced secondary industries extraction
  const getSecondaryIndustries = () => {
    const secondaryIndustries = [
      ...(vrvirksomhed.bibranche1 || []),
      ...(vrvirksomhed.bibranche2 || []),
      ...(vrvirksomhed.bibranche3 || [])
    ].filter((branch: any) => !branch.periode?.gyldigTil);
    console.log('Secondary industries extraction:', secondaryIndustries);
    return secondaryIndustries;
  };

  // Enhanced capital classes extraction
  const getCapitalClasses = () => {
    const kapitalforhold = (vrvirksomhed.kapitalforhold || []).filter((k: any) => !k.periode?.gyldigTil);
    console.log('Capital classes extraction:', kapitalforhold);
    return kapitalforhold;
  };

  // Enhanced registered capital extraction
  const getRegisteredCapital = () => {
    // Try multiple sources for capital information
    const kapitalforhold = vrvirksomhed.kapitalforhold || [];
    const current = kapitalforhold.find((k: any) => !k.periode?.gyldigTil && k.kapitalbeloeb);
    let registeredCapital = current?.kapitalbeloeb || vrvirksomhed.registreretKapital;
    
    // Try alternative field names
    if (!registeredCapital && kapitalforhold.length > 0) {
      const latest = kapitalforhold[kapitalforhold.length - 1];
      registeredCapital = latest?.kapitalbeloeb || latest?.amount || latest?.beloeb;
    }
    
    // Try virksomhedsform for capital info
    if (!registeredCapital && vrvirksomhed.virksomhedsform) {
      const currentForm = vrvirksomhed.virksomhedsform.find((f: any) => !f.periode?.gyldigTil);
      registeredCapital = currentForm?.kapital || vrvirksomhed.virksomhedsform[vrvirksomhed.virksomhedsform.length - 1]?.kapital;
    }
    
    console.log('Registered capital extraction - kapitalforhold:', kapitalforhold, 'registeredCapital:', registeredCapital);
    return registeredCapital;
  };

  // Fixed accounting year extraction with detailed logging
  const getAccountingYear = () => {
    console.log('=== ACCOUNTING YEAR EXTRACTION DEBUG ===');
    const regnskabsperiode = vrvirksomhed.regnskabsperiode || [];
    console.log('Accounting year extraction - regnskabsperiode:', regnskabsperiode);
    
    if (regnskabsperiode.length === 0) {
      console.log('No regnskabsperiode found');
      return null;
    }
    
    // Find current period (where gyldigTil is null) or use the most recent one
    const current = regnskabsperiode.find((periode: any) => periode.periode?.gyldigTil === null) || regnskabsperiode[regnskabsperiode.length - 1];
    console.log('Selected periode:', current);
    
    if (current) {
      // Try different possible field names
      const from = current.regnskabsperiodefra || current.regnskabsPeriodeFra || current.fra || current.startDato;
      const to = current.regnskabsperiodetil || current.regnskabsPeriodeTil || current.til || current.slutDato;
      console.log('From field:', from, 'To field:', to);
      
      const result = from && to ? `${from} - ${to}` : null;
      console.log('Accounting year result:', result);
      return result;
    }
    
    console.log('No valid accounting period found');
    return null;
  };

  const result = {
    phone: getPhone(),
    municipality: getMunicipality(),
    purpose: getPurpose(),
    binavne: (vrvirksomhed.binavne || []).map((navn: any) => navn.navn).filter(Boolean),
    secondaryIndustries: getSecondaryIndustries(),
    isListed: vrvirksomhed.boersnoteret || false,
    accountingYear: getAccountingYear(),
    latestStatuteDate: (() => {
      const vedtaegter = vrvirksomhed.vedtaegter || [];
      const latest = vedtaegter.find((v: any) => v.periode?.gyldigTil === null) || vedtaegter[vedtaegter.length - 1];
      return latest?.dato || null;
    })(),
    capitalClasses: getCapitalClasses(),
    registeredCapital: getRegisteredCapital()
  };

  console.log('extractExtendedInfo - Final result:', result);
  return result;
};

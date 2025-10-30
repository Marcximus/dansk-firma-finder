
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

  // Fixed purpose extraction - checking attributter and formaal
  const getPurpose = () => {
    console.log('=== PURPOSE EXTRACTION DEBUG ===');
    
    // First check attributter for FORMÅL
    const attributter = vrvirksomhed.attributter || [];
    console.log('Checking attributter array:', attributter.length, 'items');
    
    const formaalAttribute = attributter.find((attr: any) => 
      attr.type === 'FORMÅL' || 
      attr.type === 'FORMAL' ||
      attr.type?.toUpperCase().includes('FORMÅL')
    );
    
    if (formaalAttribute) {
      console.log('Found formaal in attributter:', formaalAttribute);
      const currentValue = formaalAttribute.vaerdier?.find((v: any) => !v.periode?.gyldigTil);
      const value = currentValue?.vaerdi || formaalAttribute.vaerdier?.[formaalAttribute.vaerdier.length - 1]?.vaerdi;
      console.log('Extracted formaal value from attributter:', value);
      if (value) return value;
    }
    
    // Then check direct formaal field
    const formaal = vrvirksomhed.formaal;
    console.log('Direct formaal field:', formaal);
    
    // Handle array structure with vaerdi field
    if (Array.isArray(formaal) && formaal.length > 0) {
      console.log('Processing formaal as array:', formaal);
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
    
    console.log('No formaal found anywhere, returning null');
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

  // Enhanced registered capital extraction with partial payment status
  const getRegisteredCapital = () => {
    const attributter = vrvirksomhed.attributter || [];
    
    // Get capital amount
    const kapitalAttr = attributter.find((attr: any) => attr.type === 'KAPITAL');
    let capitalAmount = null;
    
    if (kapitalAttr?.vaerdier) {
      const currentValue = kapitalAttr.vaerdier.find((v: any) => v.periode?.gyldigTil === null);
      const latestValue = currentValue || kapitalAttr.vaerdier[kapitalAttr.vaerdier.length - 1];
      if (latestValue?.vaerdi) {
        capitalAmount = parseFloat(latestValue.vaerdi);
      }
    }
    
    // Fallback to kapitalforhold
    if (!capitalAmount) {
      const kapitalforhold = vrvirksomhed.kapitalforhold || [];
      const current = kapitalforhold.find((k: any) => !k.periode?.gyldigTil && k.kapitalbeloeb);
      capitalAmount = current?.kapitalbeloeb || vrvirksomhed.registreretKapital;
      
      if (!capitalAmount && kapitalforhold.length > 0) {
        const latest = kapitalforhold[kapitalforhold.length - 1];
        capitalAmount = latest?.kapitalbeloeb || latest?.amount || latest?.beloeb;
      }
    }
    
    if (!capitalAmount) return null;
    
    // Check if partially paid
    const partialAttr = attributter.find((attr: any) => attr.type === 'KAPITAL_DELVIST');
    let isPartiallyPaid = false;
    
    if (partialAttr?.vaerdier) {
      const currentValue = partialAttr.vaerdier.find((v: any) => v.periode?.gyldigTil === null);
      const value = currentValue || partialAttr.vaerdier[partialAttr.vaerdier.length - 1];
      isPartiallyPaid = value?.vaerdi === 'true' || value?.vaerdi === true;
    }
    
    // Format the capital string
    const formatted = capitalAmount.toLocaleString('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    const result = isPartiallyPaid 
      ? `${formatted} DKK (delvist indbetalt)` 
      : `${formatted} DKK`;
    
    console.log('Registered capital:', result);
    return result;
  };

  // Extract accounting year from attributter
  const getAccountingYear = () => {
    const attributter = vrvirksomhed.attributter || [];
    const startAttr = attributter.find((attr: any) => attr.type === 'REGNSKABSÅR_START');
    const endAttr = attributter.find((attr: any) => attr.type === 'REGNSKABSÅR_SLUT');
    
    if (startAttr?.vaerdier && endAttr?.vaerdier) {
      const startValue = startAttr.vaerdier.find((v: any) => v.periode?.gyldigTil === null);
      const endValue = endAttr.vaerdier.find((v: any) => v.periode?.gyldigTil === null);
      
      const start = (startValue || startAttr.vaerdier[startAttr.vaerdier.length - 1])?.vaerdi;
      const end = (endValue || endAttr.vaerdier[endAttr.vaerdier.length - 1])?.vaerdi;
      
      if (start && end) {
        // Convert --06-01 to 01/06 format
        const startFormatted = start.replace('--', '').split('-').reverse().join('/');
        const endFormatted = end.replace('--', '').split('-').reverse().join('/');
        return `${startFormatted} - ${endFormatted}`;
      }
    }
    
    return null;
  };

  // Extract first accounting period
  const getFirstAccountingPeriod = () => {
    const attributter = vrvirksomhed.attributter || [];
    const firstPeriodAttr = attributter.find((attr: any) => attr.type === 'FØRSTE_REGNSKABSPERIODE_START');
    if (firstPeriodAttr?.vaerdier) {
      const value = firstPeriodAttr.vaerdier.find((v: any) => v.periode?.gyldigTil === null);
      const latestValue = value || firstPeriodAttr.vaerdier[firstPeriodAttr.vaerdier.length - 1];
      return latestValue?.vaerdi || null;
    }
    return null;
  };

  // Extract primary industry with code
  const getPrimaryIndustry = () => {
    const hovedbranche = vrvirksomhed.hovedbranche || [];
    const current = hovedbranche.find((b: any) => !b.periode?.gyldigTil) || hovedbranche[hovedbranche.length - 1];
    if (current?.branchekode && current?.branchetekst) {
      return `${current.branchekode} ${current.branchetekst}`;
    }
    return null;
  };

  // Extract børsnoteret status from attributter
  const getIsListed = () => {
    const attributter = vrvirksomhed.attributter || [];
    const boersAttr = attributter.find((attr: any) => 
      attr.type === 'BØRSNOTERET' || 
      attr.type === 'BOERSNOTERET' ||
      attr.type?.toUpperCase().includes('BØRS')
    );
    
    if (boersAttr?.vaerdier) {
      const currentValue = boersAttr.vaerdier.find((v: any) => v.periode?.gyldigTil === null);
      const value = currentValue || boersAttr.vaerdier[boersAttr.vaerdier.length - 1];
      console.log('Børsnoteret extraction - found attribute:', boersAttr, 'value:', value);
      return value?.vaerdi === 'true' || value?.vaerdi === true || value?.vaerdi === 'Ja';
    }
    
    // Fallback to direct field
    const directValue = vrvirksomhed.boersnoteret;
    console.log('Børsnoteret extraction - direct field:', directValue);
    return directValue === true || directValue === 'true' || directValue === 'Ja';
  };

  // Extract ticker symbol from attributter or fallback to known mappings
  const getTicker = () => {
    const attributter = vrvirksomhed.attributter || [];
    const tickerAttr = attributter.find((attr: any) => 
      attr.type === 'TICKER' || 
      attr.type === 'BØRS_TICKER' ||
      attr.type?.toUpperCase().includes('TICKER')
    );
    
    if (tickerAttr?.vaerdier) {
      const currentValue = tickerAttr.vaerdier.find((v: any) => v.periode?.gyldigTil === null);
      const value = currentValue || tickerAttr.vaerdier[tickerAttr.vaerdier.length - 1];
      console.log('Ticker extraction - found attribute:', tickerAttr, 'value:', value?.vaerdi);
      if (value?.vaerdi) return value.vaerdi;
    }
    
    // Fallback to manual mapping for major Danish publicly traded companies
    const cvrNumber = vrvirksomhed.cvrNummer?.toString();
    const tickerMappings: { [key: string]: string } = {
      '10007127': 'NZYM-B',   // Novozymes
      '24256790': 'NOVO-B',  // Novo Nordisk
      '10103940': 'MAERSK-B', // A.P. Møller - Mærsk
      '36213728': 'DSV',      // DSV
      '61056416': 'ORSTED',   // Ørsted
      '30799101': 'CARLB',    // Carlsberg
      '10529638': 'DEMANT',   // Demant
      '56828119': 'COLO-B',   // Coloplast
      '69749917': 'TRYG',     // Tryg
      '41578702': 'PNDORA',   // Pandora
      '47458714': 'VWS',      // Vestas Wind Systems
    };
    
    const ticker = tickerMappings[cvrNumber || ''];
    console.log('Ticker extraction - CVR mapping result:', cvrNumber, '->', ticker);
    return ticker || null;
  };

  const result = {
    phone: getPhone(),
    municipality: getMunicipality(),
    purpose: getPurpose(),
    binavne: (vrvirksomhed.binavne || []).map((navn: any) => navn.navn).filter(Boolean),
    secondaryIndustries: getSecondaryIndustries(),
    primaryIndustry: getPrimaryIndustry(),
    isListed: getIsListed(),
    ticker: getTicker(),
    accountingYear: getAccountingYear(),
    firstAccountingPeriod: getFirstAccountingPeriod(),
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

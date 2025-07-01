
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
    const phone = getCurrentValue(telefonNummer, 'kontaktoplysning');
    console.log('Phone extraction - telefonNummer:', telefonNummer, 'phone:', phone);
    return phone;
  };

  // Enhanced municipality extraction
  const getMunicipality = () => {
    const beliggenhedsadresse = vrvirksomhed.beliggenhedsadresse || [];
    const municipality = getCurrentValue(beliggenhedsadresse, 'kommune');
    console.log('Municipality extraction - beliggenhedsadresse:', beliggenhedsadresse, 'municipality:', municipality);
    return municipality;
  };

  // Enhanced purpose extraction
  const getPurpose = () => {
    const formaal = vrvirksomhed.formaal;
    console.log('Purpose extraction - formaal:', formaal);
    
    // Handle different data structures
    if (typeof formaal === 'string') {
      return formaal;
    } else if (formaal && typeof formaal === 'object') {
      return formaal.value || formaal.tekst || formaal.beskrivelse || null;
    }
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
    const kapitalforhold = vrvirksomhed.kapitalforhold || [];
    const current = kapitalforhold.find((k: any) => !k.periode?.gyldigTil && k.kapitalbeloeb);
    const registeredCapital = current?.kapitalbeloeb || vrvirksomhed.registreretKapital || null;
    console.log('Registered capital extraction - kapitalforhold:', kapitalforhold, 'registeredCapital:', registeredCapital);
    return registeredCapital;
  };

  const result = {
    phone: getPhone(),
    municipality: getMunicipality(),
    purpose: getPurpose(),
    binavne: (vrvirksomhed.binavne || []).map((navn: any) => navn.navn).filter(Boolean),
    secondaryIndustries: getSecondaryIndustries(),
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
    capitalClasses: getCapitalClasses(),
    registeredCapital: getRegisteredCapital()
  };

  console.log('extractExtendedInfo - Final result:', result);
  return result;
};

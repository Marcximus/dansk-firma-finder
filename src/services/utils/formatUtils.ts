
// Common formatting utilities used across CVR data extraction

export const formatAddress = (addr: any): string => {
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

export const formatPeriod = (periode: any): string => {
  if (!periode) return 'Ukendt periode';
  const from = periode.gyldigFra || 'Ukendt';
  const to = periode.gyldigTil || 'Nuværende';
  return `${from} - ${to}`;
};

export const getCurrentValue = (array: any[], fieldName: string) => {
  if (!array || array.length === 0) return null;
  const current = array.find((item: any) => item.periode?.gyldigTil === null);
  return current?.[fieldName] || array[array.length - 1]?.[fieldName] || null;
};

export const getPersonName = (deltager: any): string => {
  if (!deltager) return 'Ukendt';
  const currentName = deltager.navne?.find((n: any) => n.periode?.gyldigTil === null);
  return currentName?.navn || deltager.navne?.[deltager.navne.length - 1]?.navn || 'Ukendt';
};

export const getPersonAddress = (deltager: any): string => {
  if (!deltager) return 'Adresse ikke tilgængelig';
  
  const currentAddress = deltager.adresser?.find((addr: any) => addr.periode?.gyldigTil === null) ||
                        deltager.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
  
  const addr = currentAddress || 
              deltager.adresser?.[deltager.adresser.length - 1] ||
              deltager.beliggenhedsadresse?.[deltager.beliggenhedsadresse.length - 1];
  
  return formatAddress(addr);
};

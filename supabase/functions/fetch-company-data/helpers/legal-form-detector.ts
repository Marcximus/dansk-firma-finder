
// Helper function to determine legal form
export const determineLegalForm = (vrvirksomhed: any): string => {
  // First try the standard virksomhedsform field
  const currentForm = vrvirksomhed.virksomhedsform?.find((form: any) => form.periode?.gyldigTil === null);
  if (currentForm?.langBeskrivelse || currentForm?.kortBeskrivelse) {
    return currentForm.langBeskrivelse || currentForm.kortBeskrivelse;
  }
  
  // If no current form, try to find any virksomhedsform entry
  if (vrvirksomhed.virksomhedsform && vrvirksomhed.virksomhedsform.length > 0) {
    const anyForm = vrvirksomhed.virksomhedsform[0];
    if (anyForm?.langBeskrivelse || anyForm?.kortBeskrivelse) {
      return anyForm.langBeskrivelse || anyForm.kortBeskrivelse;
    }
  }
  
  // Try to extract legal form from company name as fallback
  const companyName = vrvirksomhed.navne?.find((n: any) => n.periode?.gyldigTil === null)?.navn || 
                     vrvirksomhed.navne?.[0]?.navn || '';
  
  if (companyName) {
    // Check for common Danish legal forms in company name
    if (companyName.includes(' A/S') || companyName.endsWith(' A/S')) {
      return 'Aktieselskab';
    }
    if (companyName.includes(' ApS') || companyName.endsWith(' ApS')) {
      return 'Anpartsselskab';
    }
    if (companyName.includes(' I/S') || companyName.endsWith(' I/S')) {
      return 'Interessentskab';
    }
    if (companyName.includes(' K/S') || companyName.endsWith(' K/S')) {
      return 'Kommanditselskab';
    }
    if (companyName.includes(' A.M.B.A') || companyName.endsWith(' A.M.B.A')) {
      return 'Andelsselskab med begrænset ansvar';
    }
    if (companyName.includes(' F.M.B.A') || companyName.endsWith(' F.M.B.A')) {
      return 'Forening med begrænset ansvar';
    }
    if (companyName.includes(' SMV') || companyName.endsWith(' SMV')) {
      return 'Personligt ejet Mindre Virksomhed';
    }
  }
  
  // If no standard form, check deltagerRelation for business structure clues
  if (vrvirksomhed.deltagerRelation) {
    for (const relation of vrvirksomhed.deltagerRelation) {
      if (relation.organisationer) {
        for (const org of relation.organisationer) {
          // Check for sole proprietorship indicators
          if (org.hovedtype === 'FULDT_ANSVARLIG_DELTAGERE') {
            return 'Enkeltmandsvirksomhed';
          }
          // Check for corporate structure indicators
          if (org.hovedtype === 'DIREKTION') {
            // If there's a director, it's likely a corporate entity
            // Try to determine if it's A/S or ApS based on other indicators
            return 'Aktieselskab'; // Default assumption for companies with directors
          }
          if (org.hovedtype === 'BESTYRELSE') {
            // If there's a board, it's likely an A/S
            return 'Aktieselskab';
          }
        }
      }
    }
  }
  
  return 'N/A';
};

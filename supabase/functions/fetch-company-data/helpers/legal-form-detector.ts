// Helper function to determine legal form
export const determineLegalForm = (vrvirksomhed: any): string => {
  // First try the standard virksomhedsform field
  const currentForm = vrvirksomhed.virksomhedsform?.find((form: any) => form.periode?.gyldigTil === null);
  if (currentForm?.langBeskrivelse || currentForm?.kortBeskrivelse) {
    return currentForm.langBeskrivelse || currentForm.kortBeskrivelse;
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
          // Other business structure mappings can be added here
          if (org.hovedtype === 'DIREKTION') {
            // Could indicate various corporate forms, but we'd need more info
            continue;
          }
        }
      }
    }
  }
  
  return 'N/A';
};

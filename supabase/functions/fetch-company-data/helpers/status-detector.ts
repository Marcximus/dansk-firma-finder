
// Helper function to determine company status
export const determineStatus = (vrvirksomhed: any): string => {
  // Try to get the current status from virksomhedsstatus
  const currentStatus = vrvirksomhed.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
  if (currentStatus?.status) {
    return currentStatus.status === 'NORMAL' ? 'Aktiv' : currentStatus.status;
  }
  
  // Check if company has active lifecycle (livsforloeb)
  if (vrvirksomhed.livsforloeb && vrvirksomhed.livsforloeb.length > 0) {
    const currentLifecycle = vrvirksomhed.livsforloeb.find((life: any) => life.periode?.gyldigTil === null);
    if (currentLifecycle) {
      return 'Aktiv';
    } else {
      // If all lifecycle entries have end dates, company is dissolved
      return 'Ophørt';
    }
  }
  
  // Check if company has current name (active period)
  const currentName = vrvirksomhed.navne?.find((n: any) => n.periode?.gyldigTil === null);
  if (currentName) {
    return 'Aktiv';
  }
  
  // Check if company has current address (active period)
  const currentAddress = vrvirksomhed.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
  if (currentAddress) {
    return 'Aktiv';
  }
  
  // Check if company has current industry registration
  const currentIndustry = vrvirksomhed.hovedbranche?.find((branch: any) => branch.periode?.gyldigTil === null);
  if (currentIndustry) {
    return 'Aktiv';
  }
  
  // Check if company has current participants (board members, directors, etc.)
  if (vrvirksomhed.deltagerRelation && vrvirksomhed.deltagerRelation.length > 0) {
    const hasActiveParticipants = vrvirksomhed.deltagerRelation.some((relation: any) => {
      return relation.organisationer?.some((org: any) => {
        return org.medlemsData?.some((medlem: any) => {
          return medlem.attributter?.some((attr: any) => {
            if (attr.type === 'FUNKTION' && attr.vaerdier) {
              return attr.vaerdier.some((vaerdi: any) => !vaerdi.periode?.gyldigTil);
            }
            return false;
          });
        });
      });
    });
    
    if (hasActiveParticipants) {
      return 'Aktiv';
    }
  }
  
  // If we have any data but no active periods, assume dissolved
  if (vrvirksomhed.navne?.length > 0 || vrvirksomhed.beliggenhedsadresse?.length > 0) {
    return 'Ophørt';
  }
  
  return 'Ukendt';
};

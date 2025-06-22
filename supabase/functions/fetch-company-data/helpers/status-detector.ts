
// Helper function to determine company status
export const determineStatus = (vrvirksomhed: any): string => {
  // Try to get the most recent status from virksomhedsstatus
  if (vrvirksomhed.virksomhedsstatus && vrvirksomhed.virksomhedsstatus.length > 0) {
    // Sort by gyldigFra date to get the most recent status
    const sortedStatuses = vrvirksomhed.virksomhedsstatus.sort((a: any, b: any) => {
      const dateA = new Date(a.periode?.gyldigFra || '1900-01-01');
      const dateB = new Date(b.periode?.gyldigFra || '1900-01-01');
      return dateB.getTime() - dateA.getTime();
    });
    
    const latestStatus = sortedStatuses[0];
    if (latestStatus?.status) {
      // Return the actual Danish status as it appears in CVR
      return latestStatus.status;
    }
  }
  
  // Check if company has active lifecycle (livsforloeb)
  if (vrvirksomhed.livsforloeb && vrvirksomhed.livsforloeb.length > 0) {
    const currentLifecycle = vrvirksomhed.livsforloeb.find((life: any) => life.periode?.gyldigTil === null);
    if (currentLifecycle) {
      return 'NORMAL';
    } else {
      // If all lifecycle entries have end dates, company is dissolved
      return 'OPHØRT';
    }
  }
  
  // Check if company has current name (active period)
  const currentName = vrvirksomhed.navne?.find((n: any) => n.periode?.gyldigTil === null);
  if (currentName) {
    return 'NORMAL';
  }
  
  // Check if company has current address (active period)
  const currentAddress = vrvirksomhed.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
  if (currentAddress) {
    return 'NORMAL';
  }
  
  // Check if company has current industry registration
  const currentIndustry = vrvirksomhed.hovedbranche?.find((branch: any) => branch.periode?.gyldigTil === null);
  if (currentIndustry) {
    return 'NORMAL';
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
      return 'NORMAL';
    }
  }
  
  // If we have any data but no active periods, assume dissolved
  if (vrvirksomhed.navne?.length > 0 || vrvirksomhed.beliggenhedsadresse?.length > 0) {
    return 'OPHØRT';
  }
  
  return 'UKENDT';
};

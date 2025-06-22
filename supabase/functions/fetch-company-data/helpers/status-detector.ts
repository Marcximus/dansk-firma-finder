
// Helper function to determine company status
export const determineStatus = (vrvirksomhed: any): string => {
  // Try to get the current status from virksomhedsstatus
  const currentStatus = vrvirksomhed.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
  if (currentStatus?.status) {
    return currentStatus.status;
  }
  
  // If no explicit status but company has active lifecycle, assume NORMAL
  if (vrvirksomhed.livsforloeb && vrvirksomhed.livsforloeb.length > 0) {
    const currentLifecycle = vrvirksomhed.livsforloeb.find((life: any) => life.periode?.gyldigTil === null);
    if (currentLifecycle) {
      return 'NORMAL';
    }
  }
  
  // If company has current name, address, or other active data, assume NORMAL
  if (vrvirksomhed.navne?.some((n: any) => n.periode?.gyldigTil === null) ||
      vrvirksomhed.beliggenhedsadresse?.some((addr: any) => addr.periode?.gyldigTil === null)) {
    return 'NORMAL';
  }
  
  return 'N/A';
};

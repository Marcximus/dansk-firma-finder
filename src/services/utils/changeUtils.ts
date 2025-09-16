export interface CompanyChange {
  type: 'management' | 'status' | 'address' | 'financial';
  description: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
}

// Function to get recent changes for a company
export const getRecentChanges = (companyData: any): CompanyChange[] => {
  if (!companyData) return [];
  
  const changes: CompanyChange[] = [];
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Check for recent management changes
  if (companyData.management?.length > 0) {
    companyData.management.forEach((manager: any) => {
      if (manager.start_date) {
        const startDate = new Date(manager.start_date);
        if (startDate > sevenDaysAgo) {
          changes.push({
            type: 'management',
            description: `Ny ledelse: ${manager.name}`,
            date: manager.start_date,
            severity: 'high'
          });
        }
      }
    });
  }
  
  // Check for recent status changes
  if (companyData.status_history?.length > 0) {
    companyData.status_history.forEach((status: any) => {
      if (status.date) {
        const statusDate = new Date(status.date);
        if (statusDate > sevenDaysAgo) {
          changes.push({
            type: 'status',
            description: `Status ændring: ${status.status}`,
            date: status.date,
            severity: 'medium'
          });
        }
      }
    });
  }

  // Check for recent address changes
  if (companyData.address_history?.length > 0) {
    companyData.address_history.forEach((address: any) => {
      if (address.change_date) {
        const changeDate = new Date(address.change_date);
        if (changeDate > sevenDaysAgo) {
          changes.push({
            type: 'address',
            description: `Adresse ændring: ${address.address}`,
            date: address.change_date,
            severity: 'low'
          });
        }
      }
    });
  }

  // Sort changes by date (newest first)
  changes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return changes;
};

// Function to count total changes across all followed companies
export const getTotalChangeCount = (followedCompanies: any[]): number => {
  return followedCompanies.reduce((total, company) => {
    return total + getRecentChanges(company.company_data).length;
  }, 0);
};
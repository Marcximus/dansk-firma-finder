
// Helper functions for extracting financial data
export const extractFinancialData = (cvrData: any) => {
  console.log('extractFinancialData - Input data:', cvrData);
  
  if (!cvrData?.Vrvirksomhed) {
    console.log('extractFinancialData - No Vrvirksomhed data found');
    return null;
  }
  
  const vrvirksomhed = cvrData.Vrvirksomhed;
  console.log('extractFinancialData - Processing Vrvirksomhed:', vrvirksomhed);

  const getFinancialKPIs = () => {
    const regnskabstal = vrvirksomhed.regnskabstal || [];
    const finansielleNoegletal = vrvirksomhed.finansielleNoegletal || [];
    
    console.log('Financial KPIs - regnskabstal:', regnskabstal);
    console.log('Financial KPIs - finansielleNoegletal:', finansielleNoegletal);
    
    let financialKPIs: any = {};
    
    // Try to get any financial data from multiple sources
    if (regnskabstal.length > 0) {
      const latest = regnskabstal[regnskabstal.length - 1];
      console.log('Latest regnskabstal:', latest);
      
      // Check all possible field names
      financialKPIs = {
        nettoomsaetning: latest.nettoomsaetning || latest.revenue || latest.turnover || latest.omsaetning,
        bruttofortjeneste: latest.bruttofortjeneste || latest.grossProfit || latest.bruttoResults,
        aaretsResultat: latest.aaretsResultat || latest.netIncome || latest.netResult || latest.resultat,
        egenkapital: latest.egenkapital || latest.equity || latest.equity_capital,
        statusBalance: latest.statusBalance || latest.totalAssets || latest.balance || latest.aktiver,
        periode: latest.periode || latest.year || latest.aar
      };
    }
    
    if (finansielleNoegletal.length > 0) {
      const latest = finansielleNoegletal[finansielleNoegletal.length - 1];
      console.log('Latest finansielleNoegletal:', latest);
      
      financialKPIs = {
        ...financialKPIs,
        nettoomsaetning: financialKPIs.nettoomsaetning || latest.revenue || latest.turnover || latest.omsaetning,
        bruttofortjeneste: financialKPIs.bruttofortjeneste || latest.grossProfit || latest.bruttoResults,
        aaretsResultat: financialKPIs.aaretsResultat || latest.netResult || latest.profit || latest.resultat,
        egenkapital: financialKPIs.egenkapital || latest.equity || latest.equity_capital,
        statusBalance: financialKPIs.statusBalance || latest.balance || latest.totalAssets || latest.aktiver,
        periode: financialKPIs.periode || latest.year || latest.periode || latest.aar
      };
    }
    
    // Try getting data from employment records if no financial data
    if (Object.keys(financialKPIs).length === 0 && vrvirksomhed.aarsbeskaeftigelse?.length > 0) {
      const employment = vrvirksomhed.aarsbeskaeftigelse[0];
      financialKPIs.beskæftigelse = {
        år: employment.aar,
        ansatte: employment.antalAnsatte,
        årsværk: employment.antalAarsvaerk
      };
    }
    
    console.log('Financial KPIs result:', financialKPIs);
    return financialKPIs;
  };

  const result = {
    financialKPIs: getFinancialKPIs(),
    yearlyEmployment: vrvirksomhed.aarsbeskaeftigelse || [],
    quarterlyEmployment: vrvirksomhed.kvartalsbeskaeftigelse || [],
    kapitalforhold: vrvirksomhed.kapitalforhold || [],
    regnskabsperiode: vrvirksomhed.regnskabsperiode || []
  };

  console.log('extractFinancialData - Final result:', result);
  return result;
};

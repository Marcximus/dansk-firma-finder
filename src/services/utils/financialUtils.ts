
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
    
    if (regnskabstal.length > 0) {
      const latest = regnskabstal[regnskabstal.length - 1];
      financialKPIs = {
        nettoomsaetning: latest.nettoomsaetning || latest.revenue || null,
        bruttofortjeneste: latest.bruttofortjeneste || latest.grossProfit || null,
        aaretsResultat: latest.aaretsResultat || latest.netIncome || null,
        egenkapital: latest.egenkapital || latest.equity || null,
        statusBalance: latest.statusBalance || latest.totalAssets || null,
        periode: latest.periode || latest.year || null
      };
    }
    
    if (finansielleNoegletal.length > 0) {
      const latest = finansielleNoegletal[finansielleNoegletal.length - 1];
      financialKPIs = {
        ...financialKPIs,
        nettoomsaetning: financialKPIs.nettoomsaetning || latest.revenue || latest.turnover,
        bruttofortjeneste: financialKPIs.bruttofortjeneste || latest.grossProfit,
        aaretsResultat: financialKPIs.aaretsResultat || latest.netResult || latest.profit,
        egenkapital: financialKPIs.egenkapital || latest.equity,
        statusBalance: financialKPIs.statusBalance || latest.balance || latest.totalAssets,
        periode: financialKPIs.periode || latest.year || latest.periode
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

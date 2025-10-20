
// Helper functions for extracting financial data from parsed XBRL
export const extractFinancialData = (cvrData: any, parsedFinancialData?: any) => {
  console.log('extractFinancialData - Input:', { cvrData, parsedFinancialData });
  
  // If we have parsed XBRL financial data, use that
  if (parsedFinancialData?.financialData && parsedFinancialData.financialData.length > 0) {
    console.log('extractFinancialData - Using parsed XBRL data');
    const latestData = parsedFinancialData.financialData[0]; // Most recent report
    
    return {
      financialKPIs: {
        ...latestData,
        periode: latestData.periode
      },
      historicalData: parsedFinancialData.financialData, // All parsed periods
      yearlyEmployment: cvrData?.Vrvirksomhed?.aarsbeskaeftigelse || [],
      quarterlyEmployment: cvrData?.Vrvirksomhed?.kvartalsbeskaeftigelse || [],
      kapitalforhold: cvrData?.Vrvirksomhed?.kapitalforhold || [],
      regnskabsperiode: cvrData?.Vrvirksomhed?.regnskabsperiode || [],
      hasRealData: true,
      dataSource: 'XBRL'
    };
  }
  
  // If no parsed data and no CVR data, return null
  if (!cvrData?.Vrvirksomhed) {
    console.log('extractFinancialData - No financial data available');
    return {
      financialKPIs: null,
      historicalData: [],
      yearlyEmployment: [],
      quarterlyEmployment: [],
      kapitalforhold: [],
      regnskabsperiode: [],
      hasRealData: false,
      dataSource: 'none'
    };
  }
  
  const vrvirksomhed = cvrData.Vrvirksomhed;
  console.log('extractFinancialData - Using CVR Vrvirksomhed data (fallback)');

  const getFinancialKPIs = () => {
    const regnskabstal = vrvirksomhed.regnskabstal || [];
    const finansielleNoegletal = vrvirksomhed.finansielleNoegletal || [];
    
    let financialKPIs: any = {};
    
    if (regnskabstal.length > 0) {
      const latest = regnskabstal[regnskabstal.length - 1];
      financialKPIs = {
        nettoomsaetning: latest.nettoomsaetning || latest.revenue || latest.turnover,
        bruttofortjeneste: latest.bruttofortjeneste || latest.grossProfit,
        aaretsResultat: latest.aaretsResultat || latest.netIncome || latest.netResult,
        egenkapital: latest.egenkapital || latest.equity,
        statusBalance: latest.statusBalance || latest.totalAssets || latest.balance,
        periode: latest.periode || latest.year
      };
    }
    
    if (finansielleNoegletal.length > 0) {
      const latest = finansielleNoegletal[finansielleNoegletal.length - 1];
      financialKPIs = {
        ...financialKPIs,
        nettoomsaetning: financialKPIs.nettoomsaetning || latest.revenue,
        bruttofortjeneste: financialKPIs.bruttofortjeneste || latest.grossProfit,
        aaretsResultat: financialKPIs.aaretsResultat || latest.netResult,
        egenkapital: financialKPIs.egenkapital || latest.equity,
        statusBalance: financialKPIs.statusBalance || latest.balance,
        periode: financialKPIs.periode || latest.year
      };
    }
    
    return Object.keys(financialKPIs).length > 0 ? financialKPIs : null;
  };

  const result = {
    financialKPIs: getFinancialKPIs(),
    historicalData: [],
    yearlyEmployment: vrvirksomhed.aarsbeskaeftigelse || [],
    quarterlyEmployment: vrvirksomhed.kvartalsbeskaeftigelse || [],
    kapitalforhold: vrvirksomhed.kapitalforhold || [],
    regnskabsperiode: vrvirksomhed.regnskabsperiode || [],
    hasRealData: false,
    dataSource: 'CVR'
  };

  console.log('extractFinancialData - Final result:', result);
  return result;
};

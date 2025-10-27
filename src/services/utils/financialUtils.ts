
// Helper function to calculate financial ratios
export const calculateFinancialRatios = (data: any) => {
  const ratios: any = {};
  
  // Soliditetsgrad (Equity Ratio): Egenkapital / Aktiver * 100
  if (data.egenkapital && data.statusBalance && data.statusBalance !== 0) {
    ratios.soliditetsgrad = (data.egenkapital / data.statusBalance) * 100;
  }
  
  // Likviditetsgrad (Liquidity Ratio): Omsætningsaktiver / Kortfristet gæld * 100
  if (data.omsaetningsaktiver && data.kortfristetGaeld && data.kortfristetGaeld !== 0) {
    ratios.likviditetsgrad = (data.omsaetningsaktiver / data.kortfristetGaeld) * 100;
  }
  
  // Afkastningsgrad (Return on Assets): Årets resultat / Aktiver * 100
  if (data.aaretsResultat && data.statusBalance && data.statusBalance !== 0) {
    ratios.afkastningsgrad = (data.aaretsResultat / data.statusBalance) * 100;
  }
  
  // Overskudsgrad (Profit Margin): Årets resultat / Omsætning * 100
  if (data.aaretsResultat && data.nettoomsaetning && data.nettoomsaetning !== 0) {
    ratios.overskudsgrad = (data.aaretsResultat / data.nettoomsaetning) * 100;
  }
  
  return ratios;
};

// Helper functions for extracting financial data from parsed XBRL
export const extractFinancialData = (cvrData: any, parsedFinancialData?: any) => {
  console.log('extractFinancialData - Input:', { cvrData, parsedFinancialData });
  
  // If we have parsed XBRL financial data, use that
  if (parsedFinancialData?.financialData && parsedFinancialData.financialData.length > 0) {
    console.log('extractFinancialData - Using parsed XBRL data');
    
    // Transform and enrich XBRL data to match FinancialYearData interface
    const enrichedData = parsedFinancialData.financialData.map((periodData: any) => {
      // Extract year from periode (format: "2024-12" or "2024-01-01")
      let year = new Date().getFullYear();
      if (periodData.periode) {
        const yearMatch = periodData.periode.match(/(\d{4})/);
        if (yearMatch) {
          year = parseInt(yearMatch[1]);
        }
      }
      
      const ratios = calculateFinancialRatios(periodData);
      
      // Transform XBRL data structure to match FinancialYearData interface
      return {
        year, // Add year field
        periode: periodData.periode,
        nettoomsaetning: periodData.nettoomsaetning || 0,
        bruttofortjeneste: periodData.bruttofortjeneste || 0,
        driftsresultat: periodData.driftsresultat || 0,
        resultatFoerSkat: periodData.resultatFoerSkat || 0,
        aaretsResultat: periodData.aaretsResultat || 0,
        anlaegsaktiverValue: periodData.anlaegsaktiverValue || 0,
        omsaetningsaktiver: periodData.omsaetningsaktiver || 0,
        statusBalance: periodData.statusBalance || 0,
        egenkapital: periodData.egenkapital || 0,
        hensatteForpligtelser: periodData.hensatteForpligtelser || 0,
        gaeldsforpligtelser: periodData.gaeldsforpligtelser || 0,
        kortfristetGaeld: periodData.kortfristetGaeld || 0,
        antalAnsatte: periodData.antalAnsatte || 0,
        antalAarsvaerk: periodData.antalAarsvaerk || 0,
        ...ratios // Add calculated ratios
      };
    });
    
    // Sort by year descending (most recent first)
    enrichedData.sort((a, b) => b.year - a.year);
    
    const latestData = enrichedData[0]; // Most recent report
    
    return {
      financialKPIs: {
        ...latestData,
        periode: latestData.periode
      },
      historicalData: enrichedData, // All parsed periods with ratios, properly structured
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
    const regnskabsperiode = vrvirksomhed.regnskabsperiode || [];
    
    let financialKPIs: any = {};
    
    // Get the latest period from regnskabsperiode
    let latestPeriod = null;
    if (regnskabsperiode.length > 0) {
      const sorted = [...regnskabsperiode].sort((a, b) => {
        const dateA = new Date(a.periode?.gyldigTil || a.slutDato || 0);
        const dateB = new Date(b.periode?.gyldigTil || b.slutDato || 0);
        return dateB.getTime() - dateA.getTime();
      });
      latestPeriod = sorted[0];
    }
    
    if (regnskabstal.length > 0) {
      const latest = regnskabstal[regnskabstal.length - 1];
      financialKPIs = {
        nettoomsaetning: latest.nettoomsaetning || latest.revenue || latest.turnover,
        bruttofortjeneste: latest.bruttofortjeneste || latest.grossProfit,
        aaretsResultat: latest.aaretsResultat || latest.netIncome || latest.netResult,
        egenkapital: latest.egenkapital || latest.equity,
        statusBalance: latest.statusBalance || latest.totalAssets || latest.balance,
        periode: latest.periode || latest.year || 
                 (latestPeriod ? `${latestPeriod.periode?.gyldigFra || latestPeriod.startDato} - ${latestPeriod.periode?.gyldigTil || latestPeriod.slutDato}` : null)
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
        periode: financialKPIs.periode || latest.year || 
                (latestPeriod ? `${latestPeriod.periode?.gyldigFra || latestPeriod.startDato} - ${latestPeriod.periode?.gyldigTil || latestPeriod.slutDato}` : null)
      };
    }
    
    console.log('CVR fallback - extracted financialKPIs:', financialKPIs);
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

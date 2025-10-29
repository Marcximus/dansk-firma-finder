
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

// Helper function to extract employment data from company or production units
const getEmploymentData = (cvrData: any, fieldName: string) => {
  // Try company level first
  if (cvrData?.Vrvirksomhed?.[fieldName]?.length > 0) {
    return cvrData.Vrvirksomhed[fieldName];
  }
  
  // Fallback to production unit level (aggregate from all units)
  const productionUnits = cvrData?.productionUnits || [];
  const allEmploymentData: any[] = [];
  
  for (const unit of productionUnits) {
    if (unit.VrproduktionsEnhed?.[fieldName]?.length > 0) {
      allEmploymentData.push(...unit.VrproduktionsEnhed[fieldName]);
    }
  }
  
  // If we found production unit data, aggregate by period
  if (allEmploymentData.length > 0) {
    // Group by period (year/month/quarter) and sum employees
    const aggregated = new Map();
    
    for (const item of allEmploymentData) {
      // Create unique key based on period
      const key = fieldName.includes('maaned') || fieldName.includes('erstMaaned')
        ? `${item.aar}-${item.maaned}`
        : fieldName.includes('kvartal')
        ? `${item.aar}-Q${item.kvartal}`
        : `${item.aar}`;
      
      if (!aggregated.has(key)) {
        aggregated.set(key, { ...item });
      } else {
        // Sum up employees from multiple units
        const existing = aggregated.get(key);
        existing.antalAnsatte = (existing.antalAnsatte || 0) + (item.antalAnsatte || 0);
        existing.antalAarsvaerk = (existing.antalAarsvaerk || 0) + (item.antalAarsvaerk || 0);
        if (item.antalInklusivEjere) {
          existing.antalInklusivEjere = (existing.antalInklusivEjere || 0) + (item.antalInklusivEjere || 0);
        }
      }
    }
    
    return Array.from(aggregated.values()).sort((a, b) => {
      // Sort by year, then month/quarter
      if (a.aar !== b.aar) return a.aar - b.aar;
      if (a.maaned && b.maaned) return a.maaned - b.maaned;
      if (a.kvartal && b.kvartal) return a.kvartal - b.kvartal;
      return 0;
    });
  }
  
  return [];
};

// Helper functions for extracting financial data from parsed XBRL
export const extractFinancialData = (cvrData: any, parsedFinancialData?: any) => {
  console.log('extractFinancialData - Input:', { cvrData, parsedFinancialData });
  
  // If we have parsed XBRL financial data, use that
  if (parsedFinancialData?.financialData && parsedFinancialData.financialData.length > 0) {
    console.log('extractFinancialData - Using parsed XBRL data');
    
    // Transform and enrich XBRL data to match FinancialYearData interface
    const enrichedData = parsedFinancialData.financialData.map((periodData: any) => {
      // Extract year from periode - handle multiple formats
      let year = new Date().getFullYear();
      if (periodData.periode) {
        // Handle full date range: "2023-01-01 - 2023-12-31" (extract end year)
        const rangeMatch = periodData.periode.match(/(\d{4})-\d{2}-\d{2}\s*-\s*(\d{4})-\d{2}-\d{2}/);
        if (rangeMatch && rangeMatch[2]) {
          year = parseInt(rangeMatch[2]);
        } else {
          // Handle simple format: "2024-12" or just "2024"
          const yearMatch = periodData.periode.match(/(\d{4})/);
          if (yearMatch) {
            year = parseInt(yearMatch[1]);
          }
        }
      }
      
      const ratios = calculateFinancialRatios(periodData);
      
      // Transform XBRL data structure to match FinancialYearData interface
      return {
        year, // Add year field
        periode: periodData.periode,
        
        // Income Statement (Resultatopgørelse)
        nettoomsaetning: periodData.nettoomsaetning || 0,
        bruttofortjeneste: periodData.bruttofortjeneste || 0,
        bruttotab: periodData.bruttotab || 0,
        personaleomkostninger: periodData.personaleomkostninger || 0,
        resultatAfPrimaerDrift: periodData.resultatAfPrimaerDrift || 0,
        afskrivninger: periodData.afskrivninger || 0,
        driftsresultat: periodData.driftsresultat || 0,
        driftsomkostninger: periodData.driftsomkostninger || 0,
        finansielleIndtaegter: periodData.finansielleIndtaegter || 0,
        finansielleOmkostninger: periodData.finansielleOmkostninger || 0,
        resultatFoerSkat: periodData.resultatFoerSkat || 0,
        skatAfAaretsResultat: periodData.skatAfAaretsResultat || 0,
        aaretsResultat: periodData.aaretsResultat || 0,
        
        // Balance Sheet - Assets (Aktiver)
        anlaegsaktiverValue: periodData.anlaegsaktiverValue || 0,
        immaterielleAnlaeggsaktiver: periodData.immaterielleAnlaeggsaktiver || 0,
        materielleAnlaeggsaktiver: periodData.materielleAnlaeggsaktiver || 0,
        andreAnlaegDriftsmaterielOgInventar: periodData.andreAnlaegDriftsmaterielOgInventar || 0,
        finansielleAnlaeggsaktiver: periodData.finansielleAnlaeggsaktiver || 0,
        deposita: periodData.deposita || 0,
        omsaetningsaktiver: periodData.omsaetningsaktiver || 0,
        varebeholdninger: periodData.varebeholdninger || 0,
        tilgodehavender: periodData.tilgodehavender || 0,
        tilgodehavenderFraSalg: periodData.tilgodehavenderFraSalg || 0,
        andreTilgodehavender: periodData.andreTilgodehavender || 0,
        kravPaaIndbetalingAfVirksomhedskapital: periodData.kravPaaIndbetalingAfVirksomhedskapital || 0,
        periodeafgraensningsporterAktiver: periodData.periodeafgraensningsporterAktiver || 0,
        likviderMidler: periodData.likviderMidler || 0,
        statusBalance: periodData.statusBalance || 0,
        
        // Balance Sheet - Equity & Liabilities (Passiver)
        egenkapital: periodData.egenkapital || 0,
        virksomhedskapital: periodData.virksomhedskapital || 0,
        overfoertResultat: periodData.overfoertResultat || 0,
        hensatteForpligtelser: periodData.hensatteForpligtelser || 0,
        gaeldsforpligtelser: periodData.gaeldsforpligtelser || 0,
        langfristetGaeld: periodData.langfristetGaeld || 0,
        kortfristetGaeld: periodData.kortfristetGaeld || 0,
        leverandoererAfVarerOgTjenesteydelser: periodData.leverandoererAfVarerOgTjenesteydelser || 0,
        gaeldTilAssocieretVirksomheder: periodData.gaeldTilAssocieretVirksomheder || 0,
        skyldigeMomsOgAfgifter: periodData.skyldigeMomsOgAfgifter || 0,
        andenGaeld: periodData.andenGaeld || 0,
        feriepengeforpligtelser: periodData.feriepengeforpligtelser || 0,
        periodeafgraensningsporterPassiver: periodData.periodeafgraensningsporterPassiver || 0,
        
        // Employment
        antalAnsatte: periodData.antalAnsatte || 0,
        antalAarsvaerk: periodData.antalAarsvaerk || 0,
        
        ...ratios // Add calculated ratios
      };
    });
    
    // Data is already sorted by edge function, no need to sort again
    console.log('[financialUtils] Processing financial data:', {
      periods: enrichedData.length,
      years: enrichedData.map(d => d.year),
      firstPeriod: enrichedData[0]?.periode,
      lastPeriod: enrichedData[enrichedData.length - 1]?.periode
    });
    
    const latestData = enrichedData[0]; // Most recent report
    
    return {
      financialKPIs: {
        ...latestData,
        periode: latestData.periode
      },
      historicalData: enrichedData, // All parsed periods with ratios, properly structured
      monthlyEmployment: getEmploymentData(cvrData, 'maanedsbeskaeftigelse').length > 0 
        ? getEmploymentData(cvrData, 'maanedsbeskaeftigelse')
        : getEmploymentData(cvrData, 'erstMaanedsbeskaeftigelse'),
      yearlyEmployment: getEmploymentData(cvrData, 'aarsbeskaeftigelse'),
      quarterlyEmployment: getEmploymentData(cvrData, 'kvartalsbeskaeftigelse'),
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
      monthlyEmployment: [],
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
    monthlyEmployment: getEmploymentData(cvrData, 'maanedsbeskaeftigelse').length > 0 
      ? getEmploymentData(cvrData, 'maanedsbeskaeftigelse')
      : getEmploymentData(cvrData, 'erstMaanedsbeskaeftigelse'),
    yearlyEmployment: getEmploymentData(cvrData, 'aarsbeskaeftigelse'),
    quarterlyEmployment: getEmploymentData(cvrData, 'kvartalsbeskaeftigelse'),
    kapitalforhold: vrvirksomhed.kapitalforhold || [],
    regnskabsperiode: vrvirksomhed.regnskabsperiode || [],
    hasRealData: false,
    dataSource: 'CVR'
  };

  console.log('extractFinancialData - Final result:', result);
  return result;
};

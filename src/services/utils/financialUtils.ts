
// Helper function to calculate financial ratios
export const calculateFinancialRatios = (data: any, useBruttofortjeneste: boolean = false) => {
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
  // If Nettoomsætning has been 0 for last 7 years, use Bruttofortjeneste instead
  if (data.aaretsResultat) {
    if (useBruttofortjeneste) {
      // Use bruttofortjeneste (or bruttotab if negative)
      const bruttoValue = data.bruttofortjeneste || data.bruttotab || 0;
      if (bruttoValue !== 0) {
        ratios.overskudsgrad = (data.aaretsResultat / bruttoValue) * 100;
      }
    } else if (data.nettoomsaetning && data.nettoomsaetning !== 0) {
      ratios.overskudsgrad = (data.aaretsResultat / data.nettoomsaetning) * 100;
    }
  }
  
  return ratios;
};

// Helper function to aggregate monthly employment data into quarterly
const aggregateMonthlyToQuarterly = (monthlyData: any[]) => {
  if (!monthlyData || monthlyData.length === 0) return [];
  
  const quarterlyMap = new Map<string, any>();
  
  monthlyData.forEach(item => {
    const quarter = Math.ceil((item.maaned + 1) / 3); // month 0-11 -> Q1-Q4
    const key = `${item.aar}-Q${quarter}`;
    
    if (!quarterlyMap.has(key)) {
      quarterlyMap.set(key, {
        aar: item.aar,
        kvartal: quarter,
        antalAnsatte: [],
        antalAarsvaerk: [],
        antalInklusivEjere: []
      });
    }
    
    const q = quarterlyMap.get(key)!;
    if (item.antalAnsatte !== undefined) q.antalAnsatte.push(item.antalAnsatte);
    if (item.antalAarsvaerk !== undefined) q.antalAarsvaerk.push(item.antalAarsvaerk);
    if (item.antalInklusivEjere !== undefined) q.antalInklusivEjere.push(item.antalInklusivEjere);
  });
  
  // Calculate averages for each quarter
  const result = Array.from(quarterlyMap.values()).map(q => ({
    aar: q.aar,
    kvartal: q.kvartal,
    antalAnsatte: q.antalAnsatte.length > 0 
      ? Math.round(q.antalAnsatte.reduce((sum: number, val: number) => sum + val, 0) / q.antalAnsatte.length)
      : 0,
    antalAarsvaerk: q.antalAarsvaerk.length > 0
      ? Math.round(q.antalAarsvaerk.reduce((sum: number, val: number) => sum + val, 0) / q.antalAarsvaerk.length)
      : 0,
    antalInklusivEjere: q.antalInklusivEjere.length > 0
      ? Math.round(q.antalInklusivEjere.reduce((sum: number, val: number) => sum + val, 0) / q.antalInklusivEjere.length)
      : undefined
  }));
  
  // Sort newest first
  return result.sort((a, b) => {
    if (a.aar !== b.aar) return b.aar - a.aar;
    return b.kvartal - a.kvartal;
  });
};

// Helper function to extract employment data from company or production units
const getEmploymentData = (cvrData: any, fieldName: string) => {
  // Helper function to sort employment data consistently (NEWEST FIRST)
  const sortEmploymentData = (data: any[]) => {
    return data.sort((a, b) => {
      // Sort by year first (descending - newest to oldest)
      if (a.aar !== b.aar) return b.aar - a.aar;
      
      // Then by month if both have it (handles maaned=0 for January)
      if (a.maaned !== undefined && a.maaned !== null && 
          b.maaned !== undefined && b.maaned !== null) {
        return b.maaned - a.maaned;
      }
      
      // Then by quarter if both have it
      if (a.kvartal !== undefined && a.kvartal !== null && 
          b.kvartal !== undefined && b.kvartal !== null) {
        return b.kvartal - a.kvartal;
      }
      
      return 0;
    });
  };

  // Try company level first
  if (cvrData?.Vrvirksomhed?.[fieldName]?.length > 0) {
    const companyData = cvrData.Vrvirksomhed[fieldName];
    console.log(`[EMPLOYMENT DATA] ${fieldName}:`, {
      count: companyData.length,
      years: companyData.map((d: any) => d.aar).sort((a: number, b: number) => a - b),
      first: companyData[0],
      last: companyData[companyData.length - 1]
    });
    // Sort company-level data before returning
    return sortEmploymentData([...companyData]);
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
    
    return sortEmploymentData(Array.from(aggregated.values()));
  }
  
  return [];
};

// Helper functions for extracting financial data from parsed XBRL
export const extractFinancialData = (cvrData: any, parsedFinancialData?: any) => {
  console.log('extractFinancialData - Input:', { cvrData, parsedFinancialData });
  
  // If we have parsed XBRL financial data, use that
  if (parsedFinancialData?.financialData && parsedFinancialData.financialData.length > 0) {
    console.log('extractFinancialData - Using parsed XBRL data');
    
    // Check if Nettoomsætning has been 0 for all periods (last 7 years)
    const allRevenueZero = parsedFinancialData.financialData.every((pd: any) => !pd.nettoomsaetning || pd.nettoomsaetning === 0);
    console.log('extractFinancialData - All revenue zero:', allRevenueZero);
    
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
      
      const ratios = calculateFinancialRatios(periodData, allRevenueZero);
      
      // Find matching report metadata for this period to get documentUrl
      const matchingReport = parsedFinancialData.financialReports?.find((report: any) => {
        // Extract year from report period
        const reportYearMatch = report.period?.match(/(\d{4})/);
        const reportYear = reportYearMatch ? parseInt(reportYearMatch[1]) : null;
        return reportYear === year;
      });
      
      // Transform XBRL data structure to match FinancialYearData interface
      return {
        year, // Add year field
        periode: periodData.periode,
        documentUrl: matchingReport?.documentUrl || null,
        
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
        overkursVedEmission: periodData.overkursVedEmission || 0,
        
        // Equity Statement Movements (if provided from XBRL)
        kapitalforhoejelseVirksomhed: periodData.increaseInShareCapital || 0,
        kapitalforhoejelseOverkurs: periodData.increaseInSharePremium || 0,
        overfoertFraOverkurs: Math.abs(periodData.transferFromSharePremium || 0),
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
    
    // Enrich financial data with employment statistics from CVR
    const yearlyEmployment = getEmploymentData(cvrData, 'aarsbeskaeftigelse');
    const monthlyEmployment = getEmploymentData(cvrData, 'erstMaanedsbeskaeftigelse');
    const quarterlyEmployment = getEmploymentData(cvrData, 'kvartalsbeskaeftigelse');

    // Build employment map: first try yearly, then calculate from monthly/quarterly
    const employmentByYear = new Map();

    // Add yearly data
    yearlyEmployment.forEach(emp => {
      employmentByYear.set(emp.aar, {
        antalAnsatte: emp.antalAnsatte || 0,
        antalAarsvaerk: emp.antalAarsvaerk || 0,
        source: 'yearly'
      });
    });

    // Calculate yearly averages from monthly data where yearly data is missing
    const monthlyByYear = new Map();
    monthlyEmployment.forEach(emp => {
      const year = emp.aar;
      if (!monthlyByYear.has(year)) {
        monthlyByYear.set(year, []);
      }
      monthlyByYear.get(year).push({
        antalAnsatte: emp.antalAnsatte || 0,
        antalAarsvaerk: emp.antalAarsvaerk || 0
      });
    });

    // Fill in missing years with monthly averages
    monthlyByYear.forEach((months, year) => {
      if (!employmentByYear.has(year)) {
        const avgAnsatte = Math.round(
          months.reduce((sum, m) => sum + m.antalAnsatte, 0) / months.length
        );
        const avgAarsvaerk = Math.round(
          months.reduce((sum, m) => sum + m.antalAarsvaerk, 0) / months.length
        );
        employmentByYear.set(year, {
          antalAnsatte: avgAnsatte,
          antalAarsvaerk: avgAarsvaerk,
          source: 'monthly-avg'
        });
      }
    });

    // Calculate yearly averages from quarterly data where other data is missing
    const quarterlyByYear = new Map();
    quarterlyEmployment.forEach(emp => {
      const year = emp.aar;
      if (!quarterlyByYear.has(year)) {
        quarterlyByYear.set(year, []);
      }
      quarterlyByYear.get(year).push({
        antalAnsatte: emp.antalAnsatte || 0,
        antalAarsvaerk: emp.antalAarsvaerk || 0
      });
    });

    quarterlyByYear.forEach((quarters, year) => {
      if (!employmentByYear.has(year)) {
        const avgAnsatte = Math.round(
          quarters.reduce((sum, q) => sum + q.antalAnsatte, 0) / quarters.length
        );
        const avgAarsvaerk = Math.round(
          quarters.reduce((sum, q) => sum + q.antalAarsvaerk, 0) / quarters.length
        );
        employmentByYear.set(year, {
          antalAnsatte: avgAnsatte,
          antalAarsvaerk: avgAarsvaerk,
          source: 'quarterly-avg'
        });
      }
    });

    console.log('[financialUtils] Employment data by year:', 
      Array.from(employmentByYear.entries()).map(([year, data]) => ({
        year,
        antalAnsatte: data.antalAnsatte,
        antalAarsvaerk: data.antalAarsvaerk,
        source: data.source
      }))
    );

    const enrichedDataWithEmployment = enrichedData.map(period => {
      const employment = employmentByYear.get(period.year) || { antalAnsatte: 0, antalAarsvaerk: 0 };
      return {
        ...period,
        antalAnsatte: employment.antalAnsatte,
        antalAarsvaerk: employment.antalAarsvaerk
      };
    });
    
    // Data is already sorted by edge function, no need to sort again
    console.log('[financialUtils] Processing financial data:', {
      periods: enrichedDataWithEmployment.length,
      years: enrichedDataWithEmployment.map(d => d.year),
      firstPeriod: enrichedDataWithEmployment[0]?.periode,
      lastPeriod: enrichedDataWithEmployment[enrichedDataWithEmployment.length - 1]?.periode,
      employmentYears: yearlyEmployment.length,
      matchedYears: enrichedDataWithEmployment.filter(d => d.antalAnsatte > 0).length
    });
    
    const latestData = enrichedDataWithEmployment[0]; // Most recent report
    
    return {
      financialKPIs: {
        ...latestData,
        periode: latestData.periode
      },
      historicalData: enrichedDataWithEmployment, // All parsed periods with ratios and employment data
      monthlyEmployment: (() => {
        const regular = getEmploymentData(cvrData, 'maanedsbeskaeftigelse');
        const substitute = getEmploymentData(cvrData, 'erstMaanedsbeskaeftigelse');
        
        // Merge both sources - getEmploymentData already sorts newest first
        const combined = [...regular, ...substitute];
        
        if (combined.length === 0) return [];
        
        // Re-sort merged data to ensure newest first
        return combined.sort((a, b) => {
          if (a.aar !== b.aar) return b.aar - a.aar;
          if (a.maaned !== undefined && b.maaned !== undefined) {
            return b.maaned - a.maaned;
          }
          return 0;
        });
      })(),
      yearlyEmployment: getEmploymentData(cvrData, 'aarsbeskaeftigelse'), // Already sorted newest first
      quarterlyEmployment: (() => {
        // First check if we have newer monthly data to aggregate
        const regular = getEmploymentData(cvrData, 'maanedsbeskaeftigelse');
        const substitute = getEmploymentData(cvrData, 'erstMaanedsbeskaeftigelse');
        const combined = [...substitute, ...regular]; // Prioritize erstMaanedsbeskaeftigelse
        
        const existingQuarterly = getEmploymentData(cvrData, 'kvartalsbeskaeftigelse');
        
        // Check if quarterly data is outdated (older than 1 year or empty)
        const now = new Date();
        const currentYear = now.getFullYear();
        const latestQuarterlyYear = existingQuarterly.length > 0 ? existingQuarterly[0].aar : 0;
        const isQuarterlyOutdated = latestQuarterlyYear < currentYear - 1;
        
        // If we have monthly data and quarterly is outdated/missing, aggregate it
        if (combined.length > 0 && (existingQuarterly.length === 0 || isQuarterlyOutdated)) {
          console.log('[EMPLOYMENT] Aggregating monthly to quarterly. Latest quarterly year:', latestQuarterlyYear, 'vs current:', currentYear);
          return aggregateMonthlyToQuarterly(combined);
        }
        
        return existingQuarterly;
      })(),
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
    monthlyEmployment: (() => {
      const regular = getEmploymentData(cvrData, 'maanedsbeskaeftigelse');
      const substitute = getEmploymentData(cvrData, 'erstMaanedsbeskaeftigelse');
      
      // Merge both sources - getEmploymentData already sorts newest first
      const combined = [...regular, ...substitute];
      
      if (combined.length === 0) return [];
      
      // Re-sort merged data to ensure newest first
      return combined.sort((a, b) => {
        if (a.aar !== b.aar) return b.aar - a.aar;
        if (a.maaned !== undefined && b.maaned !== undefined) {
          return b.maaned - a.maaned;
        }
        return 0;
      });
    })(),
    yearlyEmployment: getEmploymentData(cvrData, 'aarsbeskaeftigelse'), // Already sorted newest first
    quarterlyEmployment: (() => {
      // First check if we have newer monthly data to aggregate
      const regular = getEmploymentData(cvrData, 'maanedsbeskaeftigelse');
      const substitute = getEmploymentData(cvrData, 'erstMaanedsbeskaeftigelse');
      const combined = [...substitute, ...regular]; // Prioritize erstMaanedsbeskaeftigelse
      
      const existingQuarterly = getEmploymentData(cvrData, 'kvartalsbeskaeftigelse');
      
      // Check if quarterly data is outdated (older than 1 year or empty)
      const now = new Date();
      const currentYear = now.getFullYear();
      const latestQuarterlyYear = existingQuarterly.length > 0 ? existingQuarterly[0].aar : 0;
      const isQuarterlyOutdated = latestQuarterlyYear < currentYear - 1;
      
      // If we have monthly data and quarterly is outdated/missing, aggregate it
      if (combined.length > 0 && (existingQuarterly.length === 0 || isQuarterlyOutdated)) {
        console.log('[EMPLOYMENT] Aggregating monthly to quarterly (CVR fallback). Latest quarterly year:', latestQuarterlyYear, 'vs current:', currentYear);
        return aggregateMonthlyToQuarterly(combined);
      }
      
      return existingQuarterly;
    })(),
    kapitalforhold: vrvirksomhed.kapitalforhold || [],
    regnskabsperiode: vrvirksomhed.regnskabsperiode || [],
    hasRealData: false,
    dataSource: 'CVR'
  };

  console.log('extractFinancialData - Final result:', result);
  return result;
};

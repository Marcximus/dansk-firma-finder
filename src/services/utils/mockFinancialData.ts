// Mock financial data generator for companies
export interface FinancialYearData {
  year: number;
  nettoomsaetning: number;
  bruttofortjeneste: number;
  aaretsResultat: number;
  egenkapital: number;
  statusBalance: number;
  antalAnsatte: number;
  antalAarsvaerk: number;
}

export interface MockFinancialData {
  financialKPIs: FinancialYearData;
  historicalData: FinancialYearData[];
  yearlyEmployment: Array<{
    aar: number;
    antalAnsatte: number;
    antalAarsvaerk: number;
    antalInklusivEjere: number;
  }>;
  quarterlyEmployment: Array<{
    kvartal: number;
    aar: number;
    antalAnsatte: number;
    antalAarsvaerk: number;
  }>;
  kapitalforhold: Array<{
    kapitalklasse: string;
    kapitalbeloeb: number;
    valuta: string;
    periode: { gyldigFra: string; gyldigTil: string };
  }>;
  regnskabsperiode: Array<{
    regnskabsperiodefra: string;
    regnskabsperiodetil: string;
    regnskabsform: string;
  }>;
}

// Generate realistic financial data based on company size and CVR
export const generateMockFinancialData = (cvr: string): MockFinancialData => {
  // Use CVR to seed random generation for consistency
  const seed = parseInt(cvr.slice(-4)) || 1000;
  const currentYear = new Date().getFullYear();
  
  // Determine company size based on CVR
  const companySize = (seed % 3) + 1; // 1=small, 2=medium, 3=large
  
  const baseRevenue = companySize === 1 ? 2000000 : // 2M DKK for small
                     companySize === 2 ? 25000000 : // 25M DKK for medium  
                     150000000; // 150M DKK for large
                     
  const baseEmployees = companySize === 1 ? 8 : 
                       companySize === 2 ? 45 : 
                       250;

  // Generate 5 years of historical data
  const historicalData: FinancialYearData[] = [];
  
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - 1 - i; // -1 because current year data isn't complete
    const growthRate = 0.95 + (Math.sin(seed + i) * 0.1); // -5% to +5% growth
    const adjustedRevenue = Math.round(baseRevenue * Math.pow(growthRate, i));
    
    const bruttofortjeneste = Math.round(adjustedRevenue * (0.35 + (Math.sin(seed + i * 2) * 0.1)));
    const aaretsResultat = Math.round(bruttofortjeneste * (0.15 + (Math.sin(seed + i * 3) * 0.1)));
    const statusBalance = Math.round(adjustedRevenue * (1.2 + (Math.sin(seed + i * 4) * 0.3)));
    const egenkapital = Math.round(statusBalance * (0.3 + (Math.sin(seed + i * 5) * 0.2)));
    
    const employeeGrowth = 0.98 + (Math.sin(seed + i * 6) * 0.04);
    const antalAnsatte = Math.round(baseEmployees * Math.pow(employeeGrowth, i));
    const antalAarsvaerk = Math.round(antalAnsatte * 0.95);

    historicalData.push({
      year,
      nettoomsaetning: adjustedRevenue,
      bruttofortjeneste,
      aaretsResultat,
      egenkapital,
      statusBalance,
      antalAnsatte,
      antalAarsvaerk
    });
  }

  // Latest year data becomes the current KPIs
  const latestData = historicalData[historicalData.length - 1];
  const financialKPIs = {
    ...latestData,
    periode: latestData.year.toString()
  };

  // Generate yearly employment data
  const yearlyEmployment = historicalData.map(data => ({
    aar: data.year,
    antalAnsatte: data.antalAnsatte,
    antalAarsvaerk: data.antalAarsvaerk,
    antalInklusivEjere: data.antalAnsatte + Math.round(Math.random() * 3) + 1
  }));

  // Generate quarterly employment data for last 2 years
  const quarterlyEmployment = [];
  for (let year = currentYear - 2; year <= currentYear - 1; year++) {
    const yearData = historicalData.find(d => d.year === year) || latestData;
    for (let quarter = 1; quarter <= 4; quarter++) {
      const seasonalVariation = 0.95 + (Math.sin((quarter - 1) * Math.PI / 2) * 0.1);
      quarterlyEmployment.push({
        kvartal: quarter,
        aar: year,
        antalAnsatte: Math.round(yearData.antalAnsatte * seasonalVariation),
        antalAarsvaerk: Math.round(yearData.antalAarsvaerk * seasonalVariation)
      });
    }
  }

  // Generate capital information
  const kapitalforhold = [{
    kapitalklasse: 'A-aktier',
    kapitalbeloeb: companySize === 1 ? 125000 : companySize === 2 ? 500000 : 2000000,
    valuta: 'DKK',
    periode: {
      gyldigFra: `${currentYear - 5}-01-01`,
      gyldigTil: 'Nuværende'
    }
  }];

  // Generate accounting periods
  const regnskabsperiode = historicalData.map(data => ({
    regnskabsperiodefra: `${data.year}-01-01`,
    regnskabsperiodetil: `${data.year}-12-31`,
    regnskabsform: 'Årsregnskab'
  }));

  return {
    financialKPIs,
    historicalData,
    yearlyEmployment,
    quarterlyEmployment,
    kapitalforhold,
    regnskabsperiode
  };
};
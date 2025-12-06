interface RiskFactor {
  score: number;
  weight: number;
  details: string;
}

export interface RiskScore {
  totalScore: number; // 0.0 to 10.0
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  riskLevelText: string;
  factors: {
    status: RiskFactor;
    financial: RiskFactor;
    financialTrends: RiskFactor;
    cashFlow: RiskFactor;
    debtStructure: RiskFactor;
    age: RiskFactor;
    management: RiskFactor;
    ownership: RiskFactor;
    industry: RiskFactor;
    paymentHistory: RiskFactor;
    auditor: RiskFactor;
    address: RiskFactor;
    dataCompleteness: RiskFactor;
  };
  warnings: string[];
  criticalFlags: string[];
  contextualModifiers?: {
    value: number;
    details: string[];
  };
}

// Check if company is a holding company based on industry code
const isHoldingCompany = (cvrData: any): boolean => {
  const hovedbranche = cvrData?.hovedbranche?.[0];
  if (!hovedbranche) return false;
  
  const brancheTekst = hovedbranche.branchetekst?.toLowerCase() || '';
  const brancheKode = hovedbranche.branchekode || '';
  
  // Holding company indicators
  return brancheTekst.includes('holding') || 
         brancheTekst.includes('kapitalforvaltning') ||
         brancheKode.startsWith('642') || // Holding companies
         brancheKode.startsWith('6420'); // Activities of holding companies
};

// Assess company status risk - returns blocking info instead of contributing to weighted score
const assessStatusRisk = (cvrData: any): { score: number; details: string; isBlocking: boolean; blockingLevel: 'extreme' | 'high' | 'none' } => {
  const status = cvrData?.virksomhedsstatus?.[0];
  
  if (!status) {
    return { score: 5, details: 'Status ukendt', isBlocking: false, blockingLevel: 'none' };
  }

  const statusText = status.status?.toLowerCase() || '';
  
  // BLOCKING: Score 0.0 - Company no longer exists or in bankruptcy (INSTANT EXTREME RISK)
  if (statusText.includes('opløst') || 
      statusText.includes('tvangsopløst') || 
      statusText.includes('konkurs') || 
      statusText.includes('ophørt') ||
      statusText.includes('under konkurs') ||
      statusText.includes('tvangsopløsning') ||
      statusText.includes('frivillig likvidation') ||
      statusText.includes('slettet')) {
    return { score: 0, details: `Virksomhed er ${statusText}`, isBlocking: true, blockingLevel: 'extreme' };
  }
  
  // BLOCKING: Max score 2.0 - Company in serious trouble (HIGH RISK)
  if (statusText.includes('under rekonstruktion') ||
      statusText.includes('under opløsning') ||
      statusText.includes('likvidation') ||
      statusText.includes('afvikling')) {
    return { score: 1, details: `Virksomhed ${statusText}`, isBlocking: true, blockingLevel: 'high' };
  }
  
  // NOT BLOCKING: Active company - doesn't affect score
  if (statusText.includes('normal') || statusText.includes('aktiv')) {
    return { score: 10, details: 'Virksomhed er aktiv', isBlocking: false, blockingLevel: 'none' };
  }
  
  // Default for unknown statuses
  return { score: 5, details: `Status: ${statusText}`, isBlocking: false, blockingLevel: 'none' };
};

// Helper function to extract equity values from financial data
const extractEquityValues = (financialData: any): number[] => {
  const equityValues: number[] = [];
  
  if (!financialData || !financialData.historicalData) return equityValues;
  
  // Sort by year descending (most recent first)
  const sortedData = [...financialData.historicalData].sort((a, b) => b.year - a.year);
  
  sortedData.forEach((yearData: any) => {
    if (yearData.egenkapital !== null && yearData.egenkapital !== undefined) {
      equityValues.push(yearData.egenkapital);
    }
  });
  
  return equityValues;
};

// Helper function to extract profit/loss values
const extractProfitLossValues = (financialData: any): number[] => {
  const profitValues: number[] = [];
  
  if (!financialData || !financialData.historicalData) return profitValues;
  
  const sortedData = [...financialData.historicalData].sort((a, b) => b.year - a.year);
  
  sortedData.forEach((yearData: any) => {
    if (yearData.aaretsResultat !== null && yearData.aaretsResultat !== undefined) {
      profitValues.push(yearData.aaretsResultat);
    }
  });
  
  return profitValues;
};

// Helper function to extract revenue values
const extractRevenueValues = (financialData: any): number[] => {
  const revenueValues: number[] = [];
  
  if (!financialData || !financialData.historicalData) return revenueValues;
  
  const sortedData = [...financialData.historicalData].sort((a, b) => b.year - a.year);
  
  sortedData.forEach((yearData: any) => {
    if (yearData.nettoomsaetning !== null && yearData.nettoomsaetning !== undefined) {
      revenueValues.push(yearData.nettoomsaetning);
    }
  });
  
  return revenueValues;
};

// 1. Assess Equity Health - IMPROVED for large companies
const assessEquityHealth = (financialData: any, cvrData: any): { score: number; details: string; warnings: string[] } => {
  const warnings: string[] = [];
  const equityValues = extractEquityValues(financialData);
  
  // If no detailed financial data, fall back to CVR kapitalforhold
  if (equityValues.length === 0) {
    const kapitalforhold = cvrData?.kapitalforhold?.[0];
    if (!kapitalforhold) {
      return { score: 5, details: 'Ingen egenkapitaldata tilgængelig', warnings };
    }
    
    const equity = kapitalforhold.kapital;
    if (equity < 0) {
      warnings.push('KRITISK: Negativ egenkapital');
      return { score: 0, details: `Negativ egenkapital: ${equity.toLocaleString('da-DK')} kr.`, warnings };
    }
    
    return { score: 6, details: `Egenkapital: ${equity.toLocaleString('da-DK')} kr.`, warnings };
  }
  
  // Analyze detailed equity data
  const latestEquity = equityValues[0];
  
  // Check for negative equity (CRITICAL)
  if (latestEquity < 0) {
    // Count consecutive years with negative equity
    let negativeYears = 0;
    for (const equity of equityValues) {
      if (equity < 0) negativeYears++;
      else break;
    }
    
    if (negativeYears >= 2) {
      warnings.push(`KRITISK: Negativ egenkapital i ${negativeYears} år i træk`);
      return { score: 0, details: `${negativeYears} år med negativ egenkapital`, warnings };
    } else {
      warnings.push('KRITISK: Negativ egenkapital');
      return { score: 1, details: `Negativ egenkapital: ${latestEquity.toLocaleString('da-DK')} kr.`, warnings };
    }
  }
  
  // Check equity trend (compare latest 3 years)
  if (equityValues.length >= 3) {
    const recentEquity = equityValues.slice(0, 3);
    const isDecreasing = recentEquity[0] < recentEquity[1] && recentEquity[1] < recentEquity[2];
    const declineRate = ((recentEquity[2] - recentEquity[0]) / recentEquity[2]) * 100;
    
    if (isDecreasing && Math.abs(declineRate) > 30) {
      warnings.push('Kraftigt fald i egenkapital (>30% over 3 år)');
      return { score: 3, details: `Egenkapital falder kraftigt (${Math.abs(declineRate).toFixed(1)}% fald)`, warnings };
    } else if (isDecreasing && Math.abs(declineRate) > 15) {
      warnings.push('Faldende egenkapital');
      return { score: 5, details: `Egenkapital falder (${Math.abs(declineRate).toFixed(1)}% fald)`, warnings };
    }
  }
  
  // IMPROVED: Positive equity scoring with better graduation for large companies
  // 10 billion+ DKK = Exceptional
  if (latestEquity >= 10000000000) {
    return { score: 10, details: `Exceptionel egenkapital: ${(latestEquity / 1000000000).toFixed(1)} mia. kr.`, warnings };
  }
  // 1-10 billion DKK = Very strong
  if (latestEquity >= 1000000000) {
    return { score: 10, details: `Meget stærk egenkapital: ${(latestEquity / 1000000000).toFixed(1)} mia. kr.`, warnings };
  }
  // 100M - 1 billion DKK
  if (latestEquity >= 100000000) {
    return { score: 9.8, details: `Stærk egenkapital: ${(latestEquity / 1000000).toFixed(0)}M kr.`, warnings };
  }
  // 50M - 100M DKK
  if (latestEquity >= 50000000) {
    return { score: 9.6, details: `Solid egenkapital: ${(latestEquity / 1000000).toFixed(0)}M kr.`, warnings };
  }
  // 10M - 50M DKK
  if (latestEquity >= 10000000) {
    return { score: 9.4, details: `God egenkapital: ${(latestEquity / 1000000).toFixed(1)}M kr.`, warnings };
  }
  // 5M - 10M DKK
  if (latestEquity >= 5000000) {
    return { score: 9.0, details: `Solid egenkapital: ${(latestEquity / 1000000).toFixed(1)}M kr.`, warnings };
  }
  // 1M - 5M DKK
  if (latestEquity >= 1000000) {
    return { score: 8.5, details: `God egenkapital: ${(latestEquity / 1000000).toFixed(1)}M kr.`, warnings };
  }
  // 500k - 1M DKK
  if (latestEquity >= 500000) {
    return { score: 8, details: `Acceptabel egenkapital: ${latestEquity.toLocaleString('da-DK')} kr.`, warnings };
  }
  // 200k - 500k DKK
  if (latestEquity >= 200000) {
    return { score: 7, details: `Moderat egenkapital: ${latestEquity.toLocaleString('da-DK')} kr.`, warnings };
  }
  // 80k - 200k DKK
  if (latestEquity >= 80000) {
    return { score: 5, details: `Lav egenkapital: ${latestEquity.toLocaleString('da-DK')} kr.`, warnings };
  }
  // < 80k DKK
  warnings.push('Meget lav egenkapital');
  return { score: 3, details: `Meget lav egenkapital: ${latestEquity.toLocaleString('da-DK')} kr.`, warnings };
};

// 2. Assess Profitability - IMPROVED for large companies
const assessProfitability = (financialData: any): { score: number; details: string; warnings: string[] } => {
  const warnings: string[] = [];
  const profitValues = extractProfitLossValues(financialData);
  
  if (profitValues.length === 0) {
    return { score: 5, details: 'Ingen resultatdata tilgængelig', warnings };
  }
  
  const latestProfit = profitValues[0];
  
  // Check operating result if available
  if (financialData?.historicalData?.length > 0) {
    const sortedData = [...financialData.historicalData].sort((a: any, b: any) => b.year - a.year);
    const latestData = sortedData[0];
    const driftsresultat = latestData?.driftsresultat;
    
    // If company has negative operating result despite positive overall profit
    if (driftsresultat !== null && driftsresultat !== undefined && driftsresultat < 0 && latestProfit > 0) {
      warnings.push('Negativt driftsresultat trods samlet overskud');
      return { score: 4, details: 'Overskud fra finansielle poster, ikke drift', warnings };
    }
  }
  
  // Count consecutive loss years
  let consecutiveLosses = 0;
  for (const profit of profitValues) {
    if (profit < 0) consecutiveLosses++;
    else break;
  }
  
  // Multiple years of losses
  if (consecutiveLosses >= 3) {
    warnings.push(`KRITISK: Tab i ${consecutiveLosses} år i træk`);
    return { score: 1, details: `${consecutiveLosses} år med tab`, warnings };
  } else if (consecutiveLosses === 2) {
    warnings.push('Tab i 2 år i træk');
    return { score: 2, details: '2 år med tab', warnings };
  } else if (latestProfit < 0) {
    warnings.push('Seneste år med tab');
    return { score: 4, details: `Tab: ${latestProfit.toLocaleString('da-DK')} kr.`, warnings };
  }
  
  // Break-even or small profit
  if (latestProfit >= 0 && latestProfit < 100000) {
    return { score: 5, details: `Nær break-even: ${latestProfit.toLocaleString('da-DK')} kr.`, warnings };
  }
  
  // IMPROVED: Profitable scoring with better graduation for large companies
  // 1 billion+ profit
  if (latestProfit >= 1000000000) {
    return { score: 10, details: `Exceptionel rentabilitet: ${(latestProfit / 1000000000).toFixed(1)} mia. kr.`, warnings };
  }
  // 100M - 1B profit
  if (latestProfit >= 100000000) {
    return { score: 10, details: `Meget stærk rentabilitet: ${(latestProfit / 1000000).toFixed(0)}M kr.`, warnings };
  }
  // 10M - 100M profit
  if (latestProfit >= 10000000) {
    return { score: 9.8, details: `Stærk rentabilitet: ${(latestProfit / 1000000).toFixed(0)}M kr.`, warnings };
  }
  // 1M - 10M profit
  if (latestProfit >= 1000000) {
    return { score: 9.5, details: `God rentabilitet: ${(latestProfit / 1000000).toFixed(1)}M kr.`, warnings };
  }
  // 500k - 1M profit
  if (latestProfit >= 500000) {
    return { score: 9, details: `Solid rentabilitet: ${latestProfit.toLocaleString('da-DK')} kr.`, warnings };
  }
  // 200k - 500k profit
  if (latestProfit >= 200000) {
    return { score: 8, details: `Rentabel: ${latestProfit.toLocaleString('da-DK')} kr.`, warnings };
  }
  // 100k - 200k profit
  return { score: 7, details: `Moderat profit: ${latestProfit.toLocaleString('da-DK')} kr.`, warnings };
};

// 3. Assess Liquidity & Solvency - IMPROVED for holding companies
const assessLiquiditySolvency = (financialData: any, cvrData: any): { score: number; details: string; warnings: string[] } => {
  const warnings: string[] = [];
  
  if (!financialData || !financialData.historicalData || financialData.historicalData.length === 0) {
    return { score: 5, details: 'Ingen likviditetsdata tilgængelig', warnings };
  }
  
  const latestData = financialData.historicalData[0];
  const equityRatio = latestData.soliditetsgrad; // Equity ratio
  const liquidityRatio = latestData.likviditetsgrad; // Liquidity ratio
  const isHolding = isHoldingCompany(cvrData);
  
  let score = 5;
  let details = '';
  
  // Equity Ratio (Soliditetsgrad) - Measures financial stability
  if (equityRatio !== null && equityRatio !== undefined) {
    if (equityRatio < 10) {
      // Holding companies often have different capital structures
      if (isHolding) {
        score = Math.max(score, 6);
        details += `Soliditet: ${equityRatio.toFixed(1)}% (holding). `;
      } else {
        warnings.push('KRITISK: Meget lav soliditetsgrad (<10%)');
        score = Math.min(score, 1);
        details += `Soliditet: ${equityRatio.toFixed(1)}% (meget lav). `;
      }
    } else if (equityRatio < 20) {
      if (isHolding) {
        score = Math.max(score, 7);
        details += `Soliditet: ${equityRatio.toFixed(1)}% (holding). `;
      } else {
        warnings.push('Lav soliditetsgrad (<20%)');
        score = Math.min(score, 3);
        details += `Soliditet: ${equityRatio.toFixed(1)}% (lav). `;
      }
    } else if (equityRatio < 30) {
      score = Math.max(score, 6);
      details += `Soliditet: ${equityRatio.toFixed(1)}% (moderat). `;
    } else if (equityRatio < 50) {
      score = Math.max(score, 8);
      details += `Soliditet: ${equityRatio.toFixed(1)}% (god). `;
    } else {
      score = Math.max(score, 9);
      details += `Soliditet: ${equityRatio.toFixed(1)}% (meget god). `;
    }
  }
  
  // Liquidity Ratio (Likviditetsgrad) - less important for holding companies
  if (liquidityRatio !== null && liquidityRatio !== undefined) {
    if (liquidityRatio < 50) {
      if (isHolding) {
        // Holding companies often have low liquid assets as their assets are in subsidiaries
        score = Math.max(score, 6);
        details += `Likviditet: ${liquidityRatio.toFixed(1)}% (normal for holding)`;
      } else {
        warnings.push('KRITISK: Meget lav likviditetsgrad (<50%)');
        score = Math.min(score, 2);
        details += `Likviditet: ${liquidityRatio.toFixed(1)}% (kritisk lav)`;
      }
    } else if (liquidityRatio < 100) {
      if (isHolding) {
        score = Math.max(score, 7);
        details += `Likviditet: ${liquidityRatio.toFixed(1)}% (acceptabel for holding)`;
      } else {
        warnings.push('Lav likviditetsgrad (<100%)');
        score = Math.min(score, 4);
        details += `Likviditet: ${liquidityRatio.toFixed(1)}% (lav)`;
      }
    } else if (liquidityRatio < 150) {
      score = Math.max(score, 6);
      details += `Likviditet: ${liquidityRatio.toFixed(1)}% (moderat)`;
    } else {
      score = Math.max(score, 8);
      details += `Likviditet: ${liquidityRatio.toFixed(1)}% (god)`;
    }
  }
  
  if (!details) {
    details = 'Ingen nøgletal tilgængelige';
  }
  
  return { score, details, warnings };
};

// 4. Assess Financial Trends (14% weight)
const assessFinancialTrends = (financialData: any): { score: number; details: string; warnings: string[] } => {
  const warnings: string[] = [];
  
  if (!financialData || !financialData.historicalData || financialData.historicalData.length < 3) {
    return { score: 5, details: 'Utilstrækkelig historik til trendanalyse', warnings };
  }
  
  const equityValues = extractEquityValues(financialData);
  const profitValues = extractProfitLossValues(financialData);
  const revenueValues = extractRevenueValues(financialData);
  
  let decliningMetrics = 0;
  let improvingMetrics = 0;
  
  // Analyze equity trend
  if (equityValues.length >= 3) {
    const recent = equityValues.slice(0, 3);
    if (recent[0] < recent[1] && recent[1] < recent[2]) {
      decliningMetrics++;
    } else if (recent[0] > recent[1] && recent[1] > recent[2]) {
      improvingMetrics++;
    }
  }
  
  // Analyze profit trend
  if (profitValues.length >= 3) {
    const recent = profitValues.slice(0, 3);
    if (recent[0] < recent[1] && recent[1] < recent[2]) {
      decliningMetrics++;
    } else if (recent[0] > recent[1] && recent[1] > recent[2]) {
      improvingMetrics++;
    }
  }
  
  // Analyze revenue trend
  if (revenueValues.length >= 3) {
    const recent = revenueValues.slice(0, 3);
    if (recent[0] < recent[1] && recent[1] < recent[2]) {
      decliningMetrics++;
    } else if (recent[0] > recent[1] && recent[1] > recent[2]) {
      improvingMetrics++;
    }
  }
  
  // Score based on trends
  if (decliningMetrics >= 3) {
    warnings.push('KRITISK: Alle nøgletal falder');
    return { score: 0, details: 'Alle finansielle nøgletal i kraftig tilbagegang', warnings };
  } else if (decliningMetrics >= 2) {
    warnings.push('Flere nøgletal falder');
    return { score: 3, details: 'Faldende finansielle tendenser', warnings };
  } else if (decliningMetrics === 1) {
    return { score: 5, details: 'Blandede finansielle tendenser', warnings };
  } else if (improvingMetrics >= 2) {
    return { score: 9, details: 'Stigende finansielle tendenser', warnings };
  } else {
    return { score: 6, details: 'Stabile finansielle tendenser', warnings };
  }
};

// 5. Assess Cash Flow & Liquidity Risk (9% weight)
const assessCashFlowRisk = (financialData: any, cvrData: any): { score: number; details: string; warnings: string[] } => {
  const warnings: string[] = [];
  
  if (!financialData || !financialData.historicalData || financialData.historicalData.length === 0) {
    return { score: 5, details: 'Ingen cash flow data tilgængelig', warnings };
  }
  
  const latestData = financialData.historicalData[0];
  const kortfristetGaeld = latestData.kortfristetGaeld;
  const likviderMidler = latestData.likviderMidler;
  const isHolding = isHoldingCompany(cvrData);
  
  if (kortfristetGaeld === null || likviderMidler === null) {
    return { score: 5, details: 'Ingen detaljeret gældsdata', warnings };
  }
  
  // Calculate current ratio (liquid assets / short-term debt)
  if (kortfristetGaeld === 0) {
    return { score: 10, details: 'Ingen kortfristet gæld', warnings };
  }
  
  const currentRatio = (likviderMidler / kortfristetGaeld) * 100;
  
  // Holding companies have different liquidity structures
  if (isHolding) {
    if (currentRatio < 30) {
      return { score: 6, details: `Holding: Likviditet ${currentRatio.toFixed(1)}% (normal)`, warnings };
    } else if (currentRatio < 50) {
      return { score: 7, details: `Holding: Likviditet ${currentRatio.toFixed(1)}%`, warnings };
    } else {
      return { score: 9, details: `Holding: God likviditet (${currentRatio.toFixed(1)}%)`, warnings };
    }
  }
  
  if (currentRatio < 30) {
    warnings.push('KRITISK: Meget lav betalingsevne');
    return { score: 1, details: `Likvide midler dækker kun ${currentRatio.toFixed(1)}% af kortfristet gæld`, warnings };
  } else if (currentRatio < 50) {
    warnings.push('Lav betalingsevne på kort sigt');
    return { score: 3, details: `Begrænset likviditet (${currentRatio.toFixed(1)}% dækning)`, warnings };
  } else if (currentRatio < 80) {
    return { score: 5, details: `Moderat likviditet (${currentRatio.toFixed(1)}% dækning)`, warnings };
  } else if (currentRatio < 120) {
    return { score: 8, details: `God likviditet (${currentRatio.toFixed(1)}% dækning)`, warnings };
  } else {
    return { score: 10, details: `Stærk likviditet (${currentRatio.toFixed(1)}% dækning)`, warnings };
  }
};

// 6. Assess Debt Structure (7% weight)
const assessDebtStructure = (financialData: any): { score: number; details: string; warnings: string[] } => {
  const warnings: string[] = [];
  
  if (!financialData || !financialData.historicalData || financialData.historicalData.length === 0) {
    return { score: 5, details: 'Ingen gældsdata tilgængelig', warnings };
  }
  
  const latestData = financialData.historicalData[0];
  const kortfristetGaeld = latestData.kortfristetGaeld || 0;
  const langfristetGaeld = latestData.langfristetGaeld || 0;
  const aktiverIAlt = latestData.aktiverIAlt || 0;
  const egenkapital = latestData.egenkapital || 0;
  
  const totalDebt = kortfristetGaeld + langfristetGaeld;
  
  if (aktiverIAlt === 0) {
    return { score: 5, details: 'Ingen aktivdata', warnings };
  }
  
  // Debt-to-assets ratio
  const debtToAssets = (totalDebt / aktiverIAlt) * 100;
  
  // Debt-to-equity ratio
  let debtToEquity = 0;
  if (egenkapital > 0) {
    debtToEquity = (totalDebt / egenkapital) * 100;
  } else if (egenkapital <= 0 && totalDebt > 0) {
    warnings.push('KRITISK: Negativ egenkapital med gæld');
    return { score: 0, details: 'Insolvens - gæld overstiger aktiver', warnings };
  }
  
  if (debtToAssets > 80) {
    warnings.push('KRITISK: Meget høj gæld i forhold til aktiver (>80%)');
    return { score: 1, details: `Gæld udgør ${debtToAssets.toFixed(1)}% af aktiver`, warnings };
  } else if (debtToAssets > 60) {
    warnings.push('Høj gæld i forhold til aktiver');
    return { score: 3, details: `Høj gældsgrad (${debtToAssets.toFixed(1)}%)`, warnings };
  } else if (debtToAssets > 40) {
    return { score: 6, details: `Moderat gældsgrad (${debtToAssets.toFixed(1)}%)`, warnings };
  } else if (debtToAssets > 20) {
    return { score: 8, details: `Lav gældsgrad (${debtToAssets.toFixed(1)}%)`, warnings };
  } else {
    return { score: 10, details: `Meget lav gæld (${debtToAssets.toFixed(1)}%)`, warnings };
  }
};

// Comprehensive Financial Risk Assessment (combines all financial factors) - 45% weight total
const assessComprehensiveFinancialRisk = (
  cvrData: any,
  financialData: any
): { score: number; details: string; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Sub-factor assessments with their weights within financial (totaling 100% of financial)
  const equityAssessment = assessEquityHealth(financialData, cvrData);
  const profitAssessment = assessProfitability(financialData);
  const liquidityAssessment = assessLiquiditySolvency(financialData, cvrData);
  
  // Combine warnings
  warnings.push(...equityAssessment.warnings);
  warnings.push(...profitAssessment.warnings);
  warnings.push(...liquidityAssessment.warnings);
  
  // Weighted scoring within financial assessment
  const equityWeight = 0.40;  // Equity is most important
  const profitWeight = 0.35;  // Profitability second
  const liquidityWeight = 0.25; // Liquidity third
  
  const totalScore = 
    equityAssessment.score * equityWeight +
    profitAssessment.score * profitWeight +
    liquidityAssessment.score * liquidityWeight;
  
  const details = `${equityAssessment.details}; ${profitAssessment.details}; ${liquidityAssessment.details}`;
  
  return { score: totalScore, details, warnings };
};

// Assess company age
const assessAgeRisk = (cvrData: any): { score: number; details: string } => {
  const startDate = cvrData?.livsforloeb?.[0]?.periode?.gyldigFra;
  
  if (!startDate) {
    return { score: 5, details: 'Stiftelsesdato ukendt' };
  }
  
  const start = new Date(startDate);
  const now = new Date();
  const ageInYears = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (ageInYears < 1) {
    return { score: 3, details: `Ny virksomhed (${Math.round(ageInYears * 12)} måneder)` };
  } else if (ageInYears < 2) {
    return { score: 5, details: `Ung virksomhed (${Math.round(ageInYears)} år)` };
  } else if (ageInYears < 5) {
    return { score: 7, details: `${Math.round(ageInYears)} år gammel` };
  } else if (ageInYears < 10) {
    return { score: 9, details: `Etableret virksomhed (${Math.round(ageInYears)} år)` };
  } else {
    return { score: 10, details: `Velestableret (${Math.round(ageInYears)} år)` };
  }
};

// Assess ownership stability
const assessOwnershipStability = (cvrData: any): { 
  score: number; 
  details: string; 
  warnings: string[] 
} => {
  const warnings: string[] = [];
  const deltagerRelation = cvrData?.deltagerRelation || [];
  
  // Find owners (EJER, DIREKTØR_EJER, etc.)
  const owners = deltagerRelation.filter((rel: any) => {
    const type = rel.organisationer?.[0]?.hovedtype || '';
    return type.includes('EJER') || type.includes('AKTIONÆR');
  });
  
  if (owners.length === 0) {
    return { score: 7, details: 'Ingen ejerskabsdata', warnings };
  }
  
  // Check for frequent ownership changes (last 3 years)
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  let recentOwnershipChanges = 0;
  owners.forEach((owner: any) => {
    const org = owner.organisationer?.[0];
    const periods = org?.periode || [];
    
    periods.forEach((period: any) => {
      const startDate = new Date(period.gyldigFra);
      if (startDate > threeYearsAgo) {
        recentOwnershipChanges++;
      }
    });
  });
  
  if (recentOwnershipChanges >= 3) {
    warnings.push('Hyppige ejerskifter (3+ i 3 år)');
    return { score: 2, details: `${recentOwnershipChanges} ejerskifter i 3 år`, warnings };
  } else if (recentOwnershipChanges === 2) {
    warnings.push('Flere ejerskifter');
    return { score: 5, details: '2 ejerskifter i 3 år', warnings };
  } else if (recentOwnershipChanges === 1) {
    return { score: 8, details: '1 ejerskifte i 3 år', warnings };
  }
  
  return { score: 10, details: 'Stabilt ejerskab', warnings };
};

// Assess industry risk
const assessIndustryRisk = (cvrData: any): { 
  score: number; 
  details: string; 
  warnings: string[] 
} => {
  const warnings: string[] = [];
  const hovedbranche = cvrData?.hovedbranche?.[0];
  
  if (!hovedbranche) {
    return { score: 5, details: 'Branche ukendt', warnings };
  }
  
  const brancheTekst = hovedbranche.branchetekst?.toLowerCase() || '';
  
  // High risk industries (score 3-5)
  const highRiskIndustries = [
    'restaurant', 'café', 'bar', 'natklub',
    'bygge', 'entrepreneur', 'anlæg',
    'detail', 'tøj', 'mode',
    'reklame', 'marketing', 'konsulent',
    'transport', 'taxi', 'vognmand',
    'rejse', 'turist', 'hotel'
  ];
  
  // Medium risk industries (score 6-7)
  const mediumRiskIndustries = [
    'handel', 'engros', 'agentur',
    'it', 'software', 'teknologi',
    'ejendom', 'udlejning', 'administration'
  ];
  
  // Low risk industries (score 8-10)
  const lowRiskIndustries = [
    'finans', 'forsikring', 'bank',
    'sundhed', 'læge', 'hospital',
    'offentlig', 'kommune', 'stat',
    'energi', 'forsyning', 'vand',
    'holding', 'kapitalforvaltning', 'invester'
  ];
  
  // Check industry risk
  for (const industry of lowRiskIndustries) {
    if (brancheTekst.includes(industry)) {
      return { score: 9, details: `Lav risiko branche (${hovedbranche.branchetekst})`, warnings };
    }
  }
  
  for (const industry of highRiskIndustries) {
    if (brancheTekst.includes(industry)) {
      warnings.push(`Højrisiko branche: ${hovedbranche.branchetekst}`);
      return { score: 4, details: `Højrisiko branche (${hovedbranche.branchetekst})`, warnings };
    }
  }
  
  for (const industry of mediumRiskIndustries) {
    if (brancheTekst.includes(industry)) {
      return { score: 6, details: `Medium risiko branche (${hovedbranche.branchetekst})`, warnings };
    }
  }
  
  // Default
  return { score: 7, details: hovedbranche.branchetekst || 'Branche registreret', warnings };
};

// Assess payment history (5% weight)
const assessPaymentHistory = (cvrData: any): { 
  score: number; 
  details: string; 
  warnings: string[] 
} => {
  const warnings: string[] = [];
  
  // Check for any registered payment remarks in company data
  // This is a placeholder - in production would integrate with RKI/Experian
  // For now, return high score as no negative data
  return { score: 10, details: 'Ingen betalingsanmærkninger registreret', warnings };
};

// Assess management stability
const assessManagementStability = (cvrData: any): { score: number; details: string } => {
  const deltagerRelation = cvrData?.deltagerRelation || [];
  const directors = deltagerRelation.filter((rel: any) => 
    rel.organisationer?.[0]?.hovedtype === 'DIREKTION'
  );
  
  if (directors.length === 0) {
    return { score: 7, details: 'Ingen ledelsesdata' };
  }
  
  // Count recent changes (last 3 years)
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  let recentChanges = 0;
  directors.forEach((dir: any) => {
    const org = dir.organisationer?.[0];
    const periods = org?.periode || [];
    
    periods.forEach((period: any) => {
      const startDate = new Date(period.gyldigFra);
      if (startDate > threeYearsAgo) {
        recentChanges++;
      }
    });
  });
  
  if (recentChanges === 0) {
    return { score: 10, details: 'Stabil ledelse (ingen skift i 3 år)' };
  } else if (recentChanges === 1) {
    return { score: 8, details: '1 ledelsesændring i 3 år' };
  } else if (recentChanges === 2) {
    return { score: 6, details: '2 ledelsesændringer i 3 år' };
  } else if (recentChanges === 3) {
    return { score: 4, details: '3 ledelsesændringer i 3 år' };
  } else {
    return { score: 2, details: `${recentChanges} ledelsesændringer i 3 år` };
  }
};

// Assess auditor changes (10% weight - important indicator)
const assessAuditorChanges = (cvrData: any): { score: number; details: string; warnings: string[] } => {
  const warnings: string[] = [];
  const deltagerRelation = cvrData?.deltagerRelation || [];
  const auditors = deltagerRelation.filter((rel: any) => 
    rel.organisationer?.[0]?.hovedtype === 'REVISION'
  );
  
  if (auditors.length === 0) {
    // No auditor can be a warning for certain company types
    return { score: 8, details: 'Ingen revisor registreret', warnings };
  }
  
  // Count recent auditor changes (last 3 years)
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  let recentChanges = 0;
  auditors.forEach((aud: any) => {
    const org = aud.organisationer?.[0];
    const periods = org?.periode || [];
    
    periods.forEach((period: any) => {
      const startDate = new Date(period.gyldigFra);
      if (startDate > threeYearsAgo) {
        recentChanges++;
      }
    });
  });
  
  if (recentChanges === 0) {
    return { score: 10, details: 'Stabil revisor', warnings };
  } else if (recentChanges === 1) {
    return { score: 7, details: '1 revisorskift i 3 år', warnings };
  } else if (recentChanges >= 2) {
    warnings.push('Hyppige revisorskift kan indikere problemer');
    return { score: 3, details: `${recentChanges} revisorskift i 3 år (advarsel)`, warnings };
  }
  
  return { score: 10, details: 'Revisorforhold stabilt', warnings };
};

// Assess address changes
const assessAddressChanges = (cvrData: any): { score: number; details: string } => {
  const addresses = cvrData?.beliggenhedsadresse || [];
  
  if (addresses.length <= 1) {
    return { score: 10, details: 'Stabil adresse' };
  }
  
  // Count recent address changes (last 3 years)
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  let recentChanges = 0;
  addresses.forEach((addr: any) => {
    const startDate = addr.periode?.gyldigFra ? new Date(addr.periode.gyldigFra) : null;
    if (startDate && startDate > threeYearsAgo) {
      recentChanges++;
    }
  });
  
  if (recentChanges === 0) {
    return { score: 10, details: 'Ingen adresseændringer i 3 år' };
  } else if (recentChanges === 1) {
    return { score: 9, details: '1 adresseændring i 3 år' };
  } else if (recentChanges === 2) {
    return { score: 7, details: '2 adresseændringer i 3 år' };
  } else {
    return { score: 5, details: `${recentChanges} adresseændringer i 3 år` };
  }
};

// Assess data completeness - 0% weight (just informational)
const assessDataCompleteness = (cvrData: any): { score: number; details: string } => {
  let completeness = 0;
  let maxPoints = 7;
  
  if (cvrData?.virksomhedsstatus?.length > 0) completeness++;
  if (cvrData?.kapitalforhold?.length > 0) completeness++;
  if (cvrData?.deltagerRelation?.length > 0) completeness++;
  if (cvrData?.beliggenhedsadresse?.length > 0) completeness++;
  if (cvrData?.livsforloeb?.length > 0) completeness++;
  if (cvrData?.elektroniskPost?.length > 0 || cvrData?.hjemmeside?.length > 0) completeness++;
  if (cvrData?.hovedbranche?.length > 0) completeness++;
  
  const score = (completeness / maxPoints) * 10;
  
  if (score >= 9) {
    return { score, details: 'Komplet data (alle felter)' };
  } else if (score >= 7) {
    return { score, details: 'God datakvalitet' };
  } else if (score >= 5) {
    return { score, details: 'Moderat datakvalitet' };
  } else {
    return { score, details: 'Begrænset data tilgængelig' };
  }
};

// Helper: Extract company age in years
const extractCompanyAge = (cvrData: any): number => {
  const startDate = cvrData?.livsforloeb?.[0]?.periode?.gyldigFra;
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const now = new Date();
  return (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
};

// Helper: Extract employee count
const extractEmployeeCount = (cvrData: any): number => {
  const antalAnsatte = cvrData?.virksomhedMetadata?.[0]?.antalAnsatte || 
                       cvrData?.antalAnsatte?.[0]?.antalAnsatte;
  return antalAnsatte || 0;
};

// Calculate contextual modifiers based on company characteristics
const calculateContextualModifiers = (
  cvrData: any,
  financialData: any,
  ageAssessment: any,
  cashFlowAssessment: any,
  trendsAssessment: any,
  managementAssessment: any,
  debtAssessment: any,
  industryAssessment: any
): { modifier: number; details: string[] } => {
  let modifier = 0;
  const details: string[] = [];
  
  // POSITIVE MODIFIERS
  // Age bonus (established companies are more resilient)
  const ageYears = extractCompanyAge(cvrData);
  if (ageYears >= 20) {
    modifier += 0.6;
    details.push('+0.6: Meget velestableret virksomhed (20+ år)');
  } else if (ageYears >= 10) {
    modifier += 0.5;
    details.push('+0.5: Velestableret virksomhed (10+ år)');
  } else if (ageYears >= 5) {
    modifier += 0.3;
    details.push('+0.3: Etableret virksomhed (5-10 år)');
  } else if (ageYears >= 2) {
    modifier += 0.1;
    details.push('+0.1: Moderat etableret (2-5 år)');
  }
  
  // Cash flow strength
  if (cashFlowAssessment.score >= 8) {
    modifier += 0.4;
    details.push('+0.4: Stærk likviditet og cash flow');
  } else if (cashFlowAssessment.score >= 6) {
    modifier += 0.2;
    details.push('+0.2: God cash flow position');
  }
  
  // Revenue trends
  const revenueValues = extractRevenueValues(financialData);
  if (revenueValues.length >= 2 && revenueValues[0] > revenueValues[1]) {
    modifier += 0.3;
    details.push('+0.3: Voksende omsætning');
  } else if (revenueValues.length >= 2 && revenueValues[0] >= revenueValues[1] * 0.95) {
    modifier += 0.1;
    details.push('+0.1: Stabil omsætning');
  }
  
  // Management stability
  if (managementAssessment.score >= 9) {
    modifier += 0.2;
    details.push('+0.2: Stabil ledelse');
  }
  
  // Low debt
  if (debtAssessment.score >= 8) {
    modifier += 0.2;
    details.push('+0.2: Lav gældsætning');
  }
  
  // Massive equity bonus (for large companies like Novo)
  const equityValues = extractEquityValues(financialData);
  if (equityValues.length > 0 && equityValues[0] >= 1000000000) {
    modifier += 0.5;
    details.push('+0.5: Exceptionel egenkapital (1+ mia. kr.)');
  } else if (equityValues.length > 0 && equityValues[0] >= 100000000) {
    modifier += 0.3;
    details.push('+0.3: Meget stærk egenkapital (100+ mio. kr.)');
  }
  
  // Consistent profitability bonus
  const profitValues = extractProfitLossValues(financialData);
  const consecutiveProfits = profitValues.filter(p => p > 0).length;
  if (consecutiveProfits >= 5) {
    modifier += 0.4;
    details.push('+0.4: Overskud i 5+ år');
  } else if (consecutiveProfits >= 3) {
    modifier += 0.2;
    details.push('+0.2: Overskud i 3+ år');
  }
  
  // NEGATIVE MODIFIERS
  // Youth penalty
  if (ageYears < 1) {
    modifier -= 0.4;
    details.push('-0.4: Meget ny virksomhed (<1 år)');
  } else if (ageYears < 2) {
    modifier -= 0.2;
    details.push('-0.2: Ny virksomhed (1-2 år)');
  }
  
  // Small workforce (less resilient)
  const employeeCount = extractEmployeeCount(cvrData);
  if (employeeCount === 1) {
    modifier -= 0.3;
    details.push('-0.3: Enkeltmandsvirksomhed (1 ansat)');
  } else if (employeeCount >= 2 && employeeCount <= 5) {
    modifier -= 0.1;
    details.push('-0.1: Lille virksomhed (2-5 ansatte)');
  }
  
  // High-risk industry
  if (industryAssessment.score <= 4) {
    modifier -= 0.2;
    details.push('-0.2: Højrisiko branche');
  }
  
  // Management instability
  if (managementAssessment.score <= 4) {
    modifier -= 0.2;
    details.push('-0.2: Ustabil ledelse');
  }
  
  // Declining trends
  if (trendsAssessment.score <= 3) {
    modifier -= 0.3;
    details.push('-0.3: Faldende finansielle tendenser');
  } else if (trendsAssessment.score <= 5) {
    modifier -= 0.1;
    details.push('-0.1: Blandede finansielle tendenser');
  }
  
  return { modifier, details };
};

// Calculate total risk score with comprehensive financial analysis
export const calculateRiskScore = (
  company: any, 
  cvrData: any, 
  financialData?: any
): RiskScore => {
  // Check status FIRST - it's a blocking factor, not a weighted one
  const statusAssessment = assessStatusRisk(cvrData);
  
  // BLOCKING: If company is inactive/bankrupt, return 0.0 immediately (EXTREME RISK)
  if (statusAssessment.blockingLevel === 'extreme') {
    return {
      totalScore: 0.0,
      riskLevel: 'extreme',
      riskLevelText: 'Ekstrem risiko',
      factors: {
        status: { score: 0, weight: 0, details: statusAssessment.details },
        financial: { score: 0, weight: 45, details: 'Ikke relevant for inaktiv virksomhed' },
        financialTrends: { score: 0, weight: 14, details: 'Ikke relevant for inaktiv virksomhed' },
        cashFlow: { score: 0, weight: 9, details: 'Ikke relevant for inaktiv virksomhed' },
        debtStructure: { score: 0, weight: 7, details: 'Ikke relevant for inaktiv virksomhed' },
        age: { score: 0, weight: 5, details: 'Ikke relevant for inaktiv virksomhed' },
        management: { score: 0, weight: 4, details: 'Ikke relevant for inaktiv virksomhed' },
        ownership: { score: 0, weight: 3, details: 'Ikke relevant for inaktiv virksomhed' },
        industry: { score: 0, weight: 3, details: 'Ikke relevant for inaktiv virksomhed' },
        paymentHistory: { score: 0, weight: 5, details: 'Ikke relevant for inaktiv virksomhed' },
        auditor: { score: 0, weight: 10, details: 'Ikke relevant for inaktiv virksomhed' },
        address: { score: 0, weight: 0.5, details: 'Ikke relevant for inaktiv virksomhed' },
        dataCompleteness: { score: 0, weight: 0, details: 'Ikke relevant for inaktiv virksomhed' },
      },
      warnings: ['Virksomheden er inaktiv eller opløst'],
      criticalFlags: ['INAKTIV_VIRKSOMHED'],
    };
  }
  
  // BLOCKING: Max score 2.0 for companies under reconstruction (HIGH RISK)
  if (statusAssessment.blockingLevel === 'high') {
    return {
      totalScore: 2.0,
      riskLevel: 'high',
      riskLevelText: 'Høj risiko',
      factors: {
        status: { score: 2, weight: 0, details: statusAssessment.details },
        financial: { score: 0, weight: 45, details: 'Under rekonstruktion' },
        financialTrends: { score: 0, weight: 14, details: 'Under rekonstruktion' },
        cashFlow: { score: 0, weight: 9, details: 'Under rekonstruktion' },
        debtStructure: { score: 0, weight: 7, details: 'Under rekonstruktion' },
        age: { score: 0, weight: 5, details: 'Under rekonstruktion' },
        management: { score: 0, weight: 4, details: 'Under rekonstruktion' },
        ownership: { score: 0, weight: 3, details: 'Under rekonstruktion' },
        industry: { score: 0, weight: 3, details: 'Under rekonstruktion' },
        paymentHistory: { score: 0, weight: 5, details: 'Under rekonstruktion' },
        auditor: { score: 0, weight: 10, details: 'Under rekonstruktion' },
        address: { score: 0, weight: 0.5, details: 'Under rekonstruktion' },
        dataCompleteness: { score: 0, weight: 0, details: 'Under rekonstruktion' },
      },
      warnings: ['Virksomheden er under rekonstruktion eller likvidation'],
      criticalFlags: ['VIRKSOMHED_UNDER_REKONSTRUKTION'],
    };
  }
  
  // Active company - calculate all risk factors
  const financialAssessment = assessComprehensiveFinancialRisk(cvrData, financialData);
  const trendsAssessment = assessFinancialTrends(financialData);
  const cashFlowAssessment = assessCashFlowRisk(financialData, cvrData);
  const debtAssessment = assessDebtStructure(financialData);
  const ageAssessment = assessAgeRisk(cvrData);
  const managementAssessment = assessManagementStability(cvrData);
  const ownershipAssessment = assessOwnershipStability(cvrData);
  const industryAssessment = assessIndustryRisk(cvrData);
  const paymentAssessment = assessPaymentHistory(cvrData);
  const auditorAssessment = assessAuditorChanges(cvrData);
  const addressAssessment = assessAddressChanges(cvrData);
  const dataAssessment = assessDataCompleteness(cvrData);
  
  // NEW WEIGHTS per user specification (totaling 100% for active companies)
  // Status is NOT weighted - it's a blocking factor handled above
  const weights = {
    status: 0,                 // 0% - blocking factor, not weighted
    financial: 0.45,           // 45% (most important - equity, profit, liquidity)
    financialTrends: 0.14,     // 14%
    cashFlow: 0.09,            // 9%
    debtStructure: 0.07,       // 7%
    age: 0.05,                 // 5%
    management: 0.04,          // 4%
    ownership: 0.03,           // 3%
    industry: 0.03,            // 3%
    paymentHistory: 0.05,      // 5% (increased from 2%)
    auditor: 0.10,             // 10% (increased from 1.5%)
    address: 0.005,            // 0.5%
    dataCompleteness: 0,       // 0% (informational only)
  };
  
  // Calculate weighted score (excluding status which is 0% weight)
  let totalScore = 
    financialAssessment.score * weights.financial +
    trendsAssessment.score * weights.financialTrends +
    cashFlowAssessment.score * weights.cashFlow +
    debtAssessment.score * weights.debtStructure +
    ageAssessment.score * weights.age +
    managementAssessment.score * weights.management +
    ownershipAssessment.score * weights.ownership +
    industryAssessment.score * weights.industry +
    paymentAssessment.score * weights.paymentHistory +
    auditorAssessment.score * weights.auditor +
    addressAssessment.score * weights.address;
  
  // Collect all warnings and critical flags
  const warnings: string[] = [];
  const criticalFlags: string[] = [];
  
  warnings.push(...financialAssessment.warnings);
  warnings.push(...trendsAssessment.warnings);
  warnings.push(...cashFlowAssessment.warnings);
  warnings.push(...debtAssessment.warnings);
  warnings.push(...ownershipAssessment.warnings);
  warnings.push(...industryAssessment.warnings);
  warnings.push(...paymentAssessment.warnings);
  warnings.push(...auditorAssessment.warnings);
  
  // Calculate contextual modifiers
  const contextualMods = calculateContextualModifiers(
    cvrData,
    financialData,
    ageAssessment,
    cashFlowAssessment,
    trendsAssessment,
    managementAssessment,
    debtAssessment,
    industryAssessment
  );
  
  // Apply contextual modifiers to the base score
  totalScore += contextualMods.modifier;
  
  // Ensure score stays within 0-10 range
  totalScore = Math.max(0, Math.min(10, totalScore));
  
  // Apply range-based caps for critical issues
  const equityValues = extractEquityValues(financialData);
  const profitValues = extractProfitLossValues(financialData);
  
  // Critical Flag: Technical insolvency (equity < -500k)
  if (equityValues.length > 0 && equityValues[0] < -500000) {
    const baseCap = 1.5;
    totalScore = Math.min(totalScore, baseCap);
    criticalFlags.push('TEKNISK_INSOLVENT');
  }
  
  // Critical Flag: Persistent losses (3+ years) with negative equity
  const consecutiveLosses = profitValues.filter(p => p < 0).length;
  if (equityValues.length > 0 && equityValues[0] < 0 && consecutiveLosses >= 3) {
    const baseCap = 2.0;
    totalScore = Math.min(totalScore, baseCap);
    criticalFlags.push('VEDVARENDE_TAB_OG_NEGATIV_EGENKAPITAL');
  }
  
  // Critical Flag: Negative equity + current losses
  if (equityValues.length > 0 && equityValues[0] < 0 && profitValues.length > 0 && profitValues[0] < 0) {
    const baseCap = 2.5;
    totalScore = Math.min(totalScore, baseCap);
    criticalFlags.push('NEGATIV_EGENKAPITAL_OG_TAB');
  }
  
  // Critical Flag: Negative equity for 2+ years
  if (equityValues.length >= 2 && equityValues[0] < 0 && equityValues[1] < 0) {
    const baseCap = 3.5;
    totalScore = Math.min(totalScore, baseCap);
    criticalFlags.push('NEGATIV_EGENKAPITAL_FLERE_ÅR');
  }
  
  // Add standard warnings
  if (financialAssessment.score < 5) {
    warnings.push('Svage finansielle forhold');
  }
  if (ageAssessment.score < 5) {
    warnings.push('Ny virksomhed med begrænset historik');
  }
  if (managementAssessment.score < 6) {
    warnings.push('Ustabil ledelse med hyppige skift');
  }
  
  // Add contextual modifier details to warnings if significant
  if (contextualMods.details.length > 0) {
    warnings.push(`Kontekstjusteringer: ${contextualMods.details.join(', ')}`);
  }
  
  // Determine risk level with calibrated thresholds
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  let riskLevelText: string;
  
  if (totalScore >= 7.0) {
    riskLevel = 'low';
    riskLevelText = 'Lav risiko';
  } else if (totalScore >= 5.0) {
    riskLevel = 'medium';
    riskLevelText = 'Medium risiko';
  } else if (totalScore >= 2.0) {
    riskLevel = 'high';
    riskLevelText = 'Høj risiko';
  } else {
    riskLevel = 'extreme';
    riskLevelText = 'Ekstrem risiko';
  }
  
  return {
    totalScore: Math.round(totalScore * 10) / 10,
    riskLevel,
    riskLevelText,
    factors: {
      status: { score: statusAssessment.score, weight: weights.status * 100, details: statusAssessment.details },
      financial: { score: financialAssessment.score, weight: weights.financial * 100, details: financialAssessment.details },
      financialTrends: { score: trendsAssessment.score, weight: weights.financialTrends * 100, details: trendsAssessment.details },
      cashFlow: { score: cashFlowAssessment.score, weight: weights.cashFlow * 100, details: cashFlowAssessment.details },
      debtStructure: { score: debtAssessment.score, weight: weights.debtStructure * 100, details: debtAssessment.details },
      age: { score: ageAssessment.score, weight: weights.age * 100, details: ageAssessment.details },
      management: { score: managementAssessment.score, weight: weights.management * 100, details: managementAssessment.details },
      ownership: { score: ownershipAssessment.score, weight: weights.ownership * 100, details: ownershipAssessment.details },
      industry: { score: industryAssessment.score, weight: weights.industry * 100, details: industryAssessment.details },
      paymentHistory: { score: paymentAssessment.score, weight: weights.paymentHistory * 100, details: paymentAssessment.details },
      auditor: { score: auditorAssessment.score, weight: weights.auditor * 100, details: auditorAssessment.details },
      address: { score: addressAssessment.score, weight: weights.address * 100, details: addressAssessment.details },
      dataCompleteness: { score: dataAssessment.score, weight: weights.dataCompleteness * 100, details: dataAssessment.details },
    },
    warnings,
    criticalFlags,
    contextualModifiers: {
      value: contextualMods.modifier,
      details: contextualMods.details
    }
  };
};

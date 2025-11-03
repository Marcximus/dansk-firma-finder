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
    age: RiskFactor;
    management: RiskFactor;
    auditor: RiskFactor;
    address: RiskFactor;
    dataCompleteness: RiskFactor;
  };
  warnings: string[];
}

// Assess company status risk
const assessStatusRisk = (cvrData: any): { score: number; details: string } => {
  const status = cvrData?.virksomhedsstatus?.[0];
  
  if (!status) {
    return { score: 5, details: 'Status ukendt' };
  }

  const statusText = status.status?.toLowerCase() || '';
  
  // Inactive companies get 0
  if (statusText.includes('opløst') || statusText.includes('tvangsopløst') || 
      statusText.includes('konkurs') || statusText.includes('ophørt')) {
    return { score: 0, details: `Virksomhed er ${statusText}` };
  }
  
  // Active companies
  if (statusText.includes('normal') || statusText.includes('aktiv')) {
    return { score: 10, details: 'Virksomhed er aktiv' };
  }
  
  // Under dissolution or other statuses
  if (statusText.includes('under') || statusText.includes('frivillig')) {
    return { score: 3, details: 'Virksomhed under afvikling' };
  }
  
  return { score: 7, details: `Status: ${statusText}` };
};

// Assess financial health
const assessFinancialRisk = (cvrData: any): { score: number; details: string } => {
  const kapitalforhold = cvrData?.kapitalforhold?.[0];
  
  if (!kapitalforhold) {
    return { score: 5, details: 'Ingen finansielle data tilgængelig' };
  }

  const equity = kapitalforhold.kapital;
  const interval = kapitalforhold.kapitalinterval?.toLowerCase() || '';
  
  // Negative equity is a major red flag
  if (equity < 0) {
    return { score: 1, details: `Negativ egenkapital: ${equity.toLocaleString('da-DK')} kr.` };
  }
  
  // Score based on capital intervals
  if (interval.includes('500.000')) {
    return { score: 9, details: 'Solid egenkapital (500.000+ kr.)' };
  } else if (interval.includes('200.000')) {
    return { score: 8, details: 'God egenkapital (200.000-499.999 kr.)' };
  } else if (interval.includes('125.000')) {
    return { score: 7, details: 'Moderat egenkapital (125.000-199.999 kr.)' };
  } else if (interval.includes('80.000')) {
    return { score: 6, details: 'Begrænset egenkapital (80.000-124.999 kr.)' };
  } else if (interval.includes('50.000')) {
    return { score: 5, details: 'Lav egenkapital (50.000-79.999 kr.)' };
  } else if (interval.includes('40.000')) {
    return { score: 4, details: 'Meget lav egenkapital (40.000-49.999 kr.)' };
  }
  
  return { score: 6, details: `Egenkapital: ${equity.toLocaleString('da-DK')} kr.` };
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

// Assess auditor changes
const assessAuditorChanges = (cvrData: any): { score: number; details: string } => {
  const deltagerRelation = cvrData?.deltagerRelation || [];
  const auditors = deltagerRelation.filter((rel: any) => 
    rel.organisationer?.[0]?.hovedtype === 'REVISION'
  );
  
  if (auditors.length === 0) {
    return { score: 10, details: 'Ingen revisor registreret' };
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
    return { score: 10, details: 'Stabil revisor' };
  } else if (recentChanges === 1) {
    return { score: 7, details: '1 revisorskift i 3 år' };
  } else if (recentChanges >= 2) {
    return { score: 3, details: `${recentChanges} revisorskift i 3 år (advarsel)` };
  }
  
  return { score: 10, details: 'Revisorforhold stabilt' };
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

// Assess data completeness
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

// Calculate total risk score
export const calculateRiskScore = (company: any, cvrData: any): RiskScore => {
  // If company is inactive, return 0.0 immediately
  const statusAssessment = assessStatusRisk(cvrData);
  if (statusAssessment.score === 0) {
    return {
      totalScore: 0.0,
      riskLevel: 'extreme',
      riskLevelText: 'Ekstrem risiko',
      factors: {
        status: { score: 0, weight: 30, details: statusAssessment.details },
        financial: { score: 0, weight: 25, details: 'Ikke relevant for inaktiv virksomhed' },
        age: { score: 0, weight: 15, details: 'Ikke relevant for inaktiv virksomhed' },
        management: { score: 0, weight: 15, details: 'Ikke relevant for inaktiv virksomhed' },
        auditor: { score: 0, weight: 10, details: 'Ikke relevant for inaktiv virksomhed' },
        address: { score: 0, weight: 5, details: 'Ikke relevant for inaktiv virksomhed' },
        dataCompleteness: { score: 0, weight: 5, details: 'Ikke relevant for inaktiv virksomhed' },
      },
      warnings: ['Virksomheden er inaktiv eller opløst'],
    };
  }
  
  // Calculate all risk factors
  const financialAssessment = assessFinancialRisk(cvrData);
  const ageAssessment = assessAgeRisk(cvrData);
  const managementAssessment = assessManagementStability(cvrData);
  const auditorAssessment = assessAuditorChanges(cvrData);
  const addressAssessment = assessAddressChanges(cvrData);
  const dataAssessment = assessDataCompleteness(cvrData);
  
  // Define weights
  const weights = {
    status: 0.30,
    financial: 0.25,
    age: 0.15,
    management: 0.15,
    auditor: 0.10,
    address: 0.05,
    dataCompleteness: 0.05,
  };
  
  // Calculate weighted score
  const totalScore = 
    statusAssessment.score * weights.status +
    financialAssessment.score * weights.financial +
    ageAssessment.score * weights.age +
    managementAssessment.score * weights.management +
    auditorAssessment.score * weights.auditor +
    addressAssessment.score * weights.address +
    dataAssessment.score * weights.dataCompleteness;
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  let riskLevelText: string;
  
  if (totalScore >= 8.0) {
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
  
  // Generate warnings
  const warnings: string[] = [];
  
  if (financialAssessment.score < 5) {
    warnings.push('Svage finansielle forhold');
  }
  if (ageAssessment.score < 5) {
    warnings.push('Ny virksomhed med begrænset historik');
  }
  if (managementAssessment.score < 6) {
    warnings.push('Ustabil ledelse med hyppige skift');
  }
  if (auditorAssessment.score < 7) {
    warnings.push('Hyppige revisorskift kan indikere problemer');
  }
  if (dataAssessment.score < 7) {
    warnings.push('Begrænset offentligt tilgængelig data');
  }
  
  return {
    totalScore: Math.round(totalScore * 10) / 10,
    riskLevel,
    riskLevelText,
    factors: {
      status: { score: statusAssessment.score, weight: weights.status * 100, details: statusAssessment.details },
      financial: { score: financialAssessment.score, weight: weights.financial * 100, details: financialAssessment.details },
      age: { score: ageAssessment.score, weight: weights.age * 100, details: ageAssessment.details },
      management: { score: managementAssessment.score, weight: weights.management * 100, details: managementAssessment.details },
      auditor: { score: auditorAssessment.score, weight: weights.auditor * 100, details: auditorAssessment.details },
      address: { score: addressAssessment.score, weight: weights.address * 100, details: addressAssessment.details },
      dataCompleteness: { score: dataAssessment.score, weight: weights.dataCompleteness * 100, details: dataAssessment.details },
    },
    warnings,
  };
};

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { calculateRiskScore, RiskScore } from '@/services/utils/riskAssessment';
import { cn } from '@/lib/utils';

interface RiskAssessmentCardProps {
  company: any;
  cvrData: any;
  className?: string;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ company, cvrData, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const riskScore: RiskScore = calculateRiskScore(company, cvrData);
  
  // Get color classes based on risk level
  const getRiskColorClasses = (score: number) => {
    if (score >= 8.0) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30';
    if (score >= 5.0) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30';
    if (score >= 2.0) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30';
  };
  
  const getScoreIcon = (score: number) => {
    if (score >= 8.0) return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (score >= 5.0) return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    if (score >= 3.0) return <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 8.0) return 'bg-green-500';
    if (score >= 5.0) return 'bg-yellow-500';
    if (score >= 2.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className={cn("mt-4", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Virksomheds Vurdering</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription className="text-xs">
          Algoritmisk risikovurdering baseret på offentlige data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-lg",
              getRiskColorClasses(riskScore.totalScore)
            )}>
              <span className="text-2xl font-bold">{riskScore.totalScore.toFixed(1)}</span>
              <span className="text-sm font-normal">/ 10.0</span>
            </div>
            <p className={cn(
              "mt-2 text-sm font-medium",
              riskScore.totalScore >= 8.0 ? "text-green-600 dark:text-green-400" :
              riskScore.totalScore >= 5.0 ? "text-yellow-600 dark:text-yellow-400" :
              riskScore.totalScore >= 2.0 ? "text-orange-600 dark:text-orange-400" :
              "text-red-600 dark:text-red-400"
            )}>
              {riskScore.riskLevelText}
            </p>
          </div>
          <div className="text-right">
            <Progress 
              value={riskScore.totalScore * 10} 
              className="w-32 h-3"
            />
          </div>
        </div>

        {/* Warnings */}
        {riskScore.warnings.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-medium text-orange-900 dark:text-orange-200">Advarsler:</p>
                {riskScore.warnings.map((warning, idx) => (
                  <p key={idx} className="text-orange-700 dark:text-orange-300">• {warning}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown (Expandable) */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground">Risiko Faktorer:</p>
            
            {Object.entries(riskScore.factors).map(([key, factor]) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                {getScoreIcon(factor.score)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium capitalize">
                      {key === 'status' ? 'Status' :
                       key === 'financial' ? 'Økonomi' :
                       key === 'age' ? 'Alder' :
                       key === 'management' ? 'Ledelse' :
                       key === 'auditor' ? 'Revisor' :
                       key === 'address' ? 'Adresse' :
                       'Data'}:
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {factor.score.toFixed(1)}/10 ({factor.weight}%)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{factor.details}</p>
                  <Progress 
                    value={factor.score * 10} 
                    className={cn("h-1 mt-1", getProgressColor(factor.score))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground flex gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Denne vurdering er baseret på en algoritmisk analyse af offentligt tilgængelige data fra 
            Erhvervsstyrelsen. Den skal ikke bruges som eneste grundlag for forretningsbeslutninger. 
            For en komplet kreditvurdering, kontakt professionelle kreditvurderingstjenester.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentCard;

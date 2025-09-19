import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

interface DataQualityIndicatorProps {
  completenessReport?: any;
  extractionResults?: any;
  cvrData?: any;
}

const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({ 
  completenessReport, 
  extractionResults,
  cvrData 
}) => {
  if (!completenessReport) return null;

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (score >= 40) return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const completenessScore = Math.round((completenessReport.foundFields / completenessReport.totalFields) * 100);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5" />
          Data Quality Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {getQualityIcon(completenessScore)}
            </div>
            <div className="text-2xl font-bold">{completenessScore}%</div>
            <div className="text-sm text-muted-foreground">Completeness</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {completenessReport.foundFields}
            </div>
            <div className="text-sm text-muted-foreground">Fields Found</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {completenessReport.missingFields}
            </div>
            <div className="text-sm text-muted-foreground">Missing Fields</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {completenessReport.suggestions?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Suggestions</div>
          </div>
        </div>

        {extractionResults && (
          <div className="space-y-2">
            <h4 className="font-medium">Extraction Results:</h4>
            <div className="flex flex-wrap gap-2">
              {extractionResults.basicData && Object.keys(extractionResults.basicData).length > 0 && (
                <Badge variant="outline" className={getQualityColor(85)}>
                  Basic Data: {Object.keys(extractionResults.basicData).length} fields
                </Badge>
              )}
              {extractionResults.extendedData && Object.keys(extractionResults.extendedData).length > 0 && (
                <Badge variant="outline" className={getQualityColor(75)}>
                  Extended: {Object.keys(extractionResults.extendedData).length} fields
                </Badge>
              )}
              {extractionResults.managementData && Object.keys(extractionResults.managementData).length > 0 && (
                <Badge variant="outline" className={getQualityColor(70)}>
                  Management: {Object.keys(extractionResults.managementData).length} fields
                </Badge>
              )}
              {extractionResults.financialData && Object.keys(extractionResults.financialData).length > 0 && (
                <Badge variant="outline" className={getQualityColor(65)}>
                  Financial: {Object.keys(extractionResults.financialData).length} fields
                </Badge>
              )}
            </div>
          </div>
        )}

        {completenessReport.suggestions && completenessReport.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Missing Data Suggestions:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {completenessReport.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span>{suggestion}</span>
                </div>
              ))}
              {completenessReport.suggestions.length > 3 && (
                <div className="text-xs italic">+ {completenessReport.suggestions.length - 3} more suggestions...</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataQualityIndicator;
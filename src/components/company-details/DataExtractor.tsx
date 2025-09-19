import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { extractSigningRulesData } from '@/services/utils/signingRulesUtils';
import { extractOwnershipData } from '@/services/utils/ownershipUtils';
import { extractFinancialData } from '@/services/utils/financialUtils';
import { scanDataStructure } from '@/services/utils/dataDiscovery';
import { CheckCircle, XCircle, AlertTriangle, Search } from 'lucide-react';

interface DataExtractorProps {
  cvrData: any;
  title: string;
  extractorType: 'signing' | 'ownership' | 'financial';
}

const DataExtractor: React.FC<DataExtractorProps> = ({ cvrData, title, extractorType }) => {
  const extractionResult = useMemo(() => {
    if (!cvrData) return null;
    
    try {
      switch (extractorType) {
        case 'signing':
          return extractSigningRulesData(cvrData);
        case 'ownership':
          return extractOwnershipData(cvrData);
        case 'financial':
          return extractFinancialData(cvrData);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error extracting ${extractorType} data:`, error);
      return null;
    }
  }, [cvrData, extractorType]);

  const availableFields = useMemo(() => {
    if (!cvrData?.Vrvirksomhed) return [];
    
    const allPaths = scanDataStructure(cvrData.Vrvirksomhed);
    
    const relevantPaths = allPaths.filter(path => {
      const lowercasePath = path.toLowerCase();
      switch (extractorType) {
        case 'signing':
          return lowercasePath.includes('tegning') || 
                 lowercasePath.includes('binding') || 
                 lowercasePath.includes('regel') ||
                 lowercasePath.includes('sign');
        case 'ownership':
          return lowercasePath.includes('ejer') || 
                 lowercasePath.includes('owner') || 
                 lowercasePath.includes('andel') ||
                 lowercasePath.includes('stemme');
        case 'financial':
          return lowercasePath.includes('regnskab') || 
                 lowercasePath.includes('financial') || 
                 lowercasePath.includes('kapital') ||
                 lowercasePath.includes('omsaetning');
        default:
          return false;
      }
    });
    
    return relevantPaths;
  }, [cvrData, extractorType]);

  const getStatusIcon = (hasData: boolean, hasAvailableFields: boolean) => {
    if (hasData) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (hasAvailableFields) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (hasData: boolean, hasAvailableFields: boolean) => {
    if (hasData) return 'Data ekstraheret';
    if (hasAvailableFields) return 'Tilgængelige felter fundet';
    return 'Ingen data fundet';
  };

  const hasExtractedData = extractionResult && Object.keys(extractionResult).some(key => {
    const value = extractionResult[key];
    return Array.isArray(value) ? value.length > 0 : value;
  });

  const hasAvailableFields = availableFields.length > 0;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {title}
          </span>
          <div className="flex items-center gap-2">
            {getStatusIcon(hasExtractedData, hasAvailableFields)}
            <Badge variant={hasExtractedData ? 'default' : hasAvailableFields ? 'secondary' : 'destructive'}>
              {getStatusText(hasExtractedData, hasAvailableFields)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasExtractedData && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">✅ Ekstraheret data:</h4>
            <div className="bg-green-50 p-3 rounded">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(extractionResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {hasAvailableFields && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700">🔍 Tilgængelige felter i rådata:</h4>
            <div className="bg-blue-50 p-3 rounded">
              <div className="flex flex-wrap gap-1">
                {availableFields.slice(0, 10).map((path, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {path}
                  </Badge>
                ))}
                {availableFields.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{availableFields.length - 10} flere...
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!hasExtractedData && !hasAvailableFields && (
          <div className="text-center text-muted-foreground">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-300" />
            <p>Ingen relevante data fundet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataExtractor;
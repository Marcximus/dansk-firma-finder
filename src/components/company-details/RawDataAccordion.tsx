import React, { useState, useMemo } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Database, CheckCircle, AlertTriangle, Info, TrendingUp, Code, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import { 
  analyzeDataCompleteness, 
  scanDataStructure, 
  extractComprehensiveData,
  type DataCompletenessReport 
} from '@/services/cvrUtils';
import DataQualityIndicator from './DataQualityIndicator';
import DataExtractor from './DataExtractor';

interface RawDataAccordionProps {
  cvrData: any;
}

const RawDataAccordion: React.FC<RawDataAccordionProps> = ({ cvrData }) => {
  const [showRawData, setShowRawData] = useState(false);
  const [copied, setCopied] = useState(false);

  // Enhanced analysis using the new intelligent extraction
  const analysis = useMemo(() => {
    if (!cvrData?.Vrvirksomhed) return null;
    
    const completenessReport = analyzeDataCompleteness(cvrData.Vrvirksomhed);
    const availablePaths = scanDataStructure(cvrData.Vrvirksomhed);
    const comprehensiveData = extractComprehensiveData(cvrData);
    
    return {
      completenessReport,
      availablePaths,
      comprehensiveData,
      totalDataPoints: availablePaths.length,
      mainSections: Object.keys(cvrData.Vrvirksomhed).length
    };
  }, [cvrData]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(cvrData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Raw data copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy data to clipboard');
    }
  };

  const getDataSummary = () => {
    if (!cvrData || !cvrData.Vrvirksomhed) return [];
    
    const vrvirksomhed = cvrData.Vrvirksomhed;
    return Object.keys(vrvirksomhed).map(key => {
      const value = vrvirksomhed[key];
      const type = Array.isArray(value) ? `Array (${value.length} items)` : typeof value;
      return { key, type, hasValue: value !== null && value !== undefined };
    });
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!analysis) {
    return (
      <AccordionItem value="raw-data" className="border rounded-lg">
        <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Code className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
            <span className="text-sm sm:text-base md:text-lg font-semibold">Tekniske data & fejlfinding</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
          <div className="text-center py-4 sm:py-6 md:py-8 text-muted-foreground text-xs sm:text-sm">
            No data available for analysis
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  const { completenessReport, comprehensiveData } = analysis;

  return (
    <AccordionItem value="raw-data" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Code className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Tekniske data & fejlfinding</span>
          <Badge variant="outline" className="ml-auto text-[10px] sm:text-xs">
            {analysis.totalDataPoints} datapunkter
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Dette afsnit viser avanceret analyse af CVR-data med intelligent feltopdagelse og datakvalitetsvurdering.
          </div>

          {/* Data Quality Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Datakvalitetsanalyse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Samlet kvalitet:</span>
                <Badge className={getQualityBadgeColor(completenessReport.dataQuality)}>
                  {completenessReport.dataQuality.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {completenessReport.foundFields}
                  </div>
                  <div className="text-xs text-muted-foreground">Felter fundet</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {completenessReport.missingFields.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Felter mangler</div>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${(completenessReport.foundFields / completenessReport.totalFields) * 100}%` 
                  }}
                />
              </div>
              <div className="text-xs text-center text-muted-foreground">
                {Math.round((completenessReport.foundFields / completenessReport.totalFields) * 100)}% 
                data fuldstændighed
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Extraction Results */}
          {comprehensiveData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Forbedret dataekstraktion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{Object.keys(comprehensiveData.basicData).length}</div>
                    <div className="text-xs text-muted-foreground">Grundfelter</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{Object.keys(comprehensiveData.extendedData).length}</div>
                    <div className="text-xs text-muted-foreground">Udvidede felter</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{comprehensiveData.managementData.length}</div>
                    <div className="text-xs text-muted-foreground">Ledelse</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {comprehensiveData.financialData.hasFinancialData ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-muted-foreground">Økonomidata</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Datastruktur oversigt:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Dybde: {comprehensiveData.rawDataSummary.dataStructureDepth} niveauer</div>
                    <div>Sektioner: {comprehensiveData.rawDataSummary.mainSections.length}</div>
                    <div>Arrays: {comprehensiveData.rawDataSummary.mainSections.filter((s: string) => 
                      Array.isArray((cvrData.Vrvirksomhed as any)[s])).length}</div>
                    <div>Objekter: {comprehensiveData.rawDataSummary.mainSections.filter((s: string) => 
                      typeof (cvrData.Vrvirksomhed as any)[s] === 'object' && 
                      !Array.isArray((cvrData.Vrvirksomhed as any)[s])).length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions for Missing Data */}
          {completenessReport.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Forslag til dataopdagelse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {completenessReport.suggestions.slice(0, 5).map((suggestion, index) => (
                    <div key={index} className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
                      {suggestion}
                    </div>
            ))}
            
            {/* Individual Data Extractors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Individual Data Extraction Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DataExtractor 
                  cvrData={cvrData} 
                  title="Tegningsregel og personkreds" 
                  extractorType="signing" 
                />
                <DataExtractor 
                  cvrData={cvrData} 
                  title="Ejerforhold & Datterselskaber" 
                  extractorType="ownership" 
                />
                <DataExtractor 
                  cvrData={cvrData} 
                  title="Financial Data" 
                  extractorType="financial" 
                />
              </div>
            </div>
            
            {/* Missing Data Suggestions */}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Original Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                Tilgængelige datasektioner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {getDataSummary().map(({ key, type, hasValue }) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <div className={`w-2 h-2 rounded-full ${hasValue ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{key}</div>
                      <div className="text-xs text-muted-foreground">{type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CVR API Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                CVR API Datakilder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Virksomhedssøgning */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">1. Virksomhedssøgning</h4>
                  <Badge variant="outline">virksomhed/_search</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div><strong>URL:</strong> http://distribution.virk.dk/cvr-permanent/virksomhed/_search</div>
                  <div><strong>Query:</strong> Vrvirksomhed.cvrNummer = {cvrData?.Vrvirksomhed?.cvrNummer || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted p-2 rounded">
                    <div className="font-medium">Hovedsektioner:</div>
                    <div className="text-muted-foreground">
                      {cvrData?.Vrvirksomhed ? Object.keys(cvrData.Vrvirksomhed).length : 0} felter
                    </div>
                  </div>
                  <div className="bg-muted p-2 rounded">
                    <div className="font-medium">Deltager relationer:</div>
                    <div className="text-muted-foreground">
                      {cvrData?.Vrvirksomhed?.deltagerRelation?.length || 0} personer
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    const virksomhedData = {
                      source: "virksomhed/_search",
                      url: "http://distribution.virk.dk/cvr-permanent/virksomhed/_search",
                      query: {
                        query: {
                          bool: {
                            must: [{
                              term: { "Vrvirksomhed.cvrNummer": cvrData?.Vrvirksomhed?.cvrNummer }
                            }]
                          }
                        }
                      },
                      data: cvrData?.Vrvirksomhed
                    };
                    navigator.clipboard.writeText(JSON.stringify(virksomhedData, null, 2));
                    toast.success('Virksomhedsdata kopieret');
                  }}
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Kopier virksomhedsdata
                </Button>
              </div>

              {/* Deltagersøgning */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">2. Deltagersøgning</h4>
                  <Badge variant="outline">deltager/_search</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div><strong>URL:</strong> http://distribution.virk.dk/cvr-permanent/deltager/_search</div>
                  <div><strong>Query:</strong> Vrdeltagerperson.enhedsNummer for hver deltager</div>
                </div>
                <div className="space-y-2">
                  {cvrData?.Vrvirksomhed?.deltagerRelation?.map((rel: any, index: number) => (
                    <div key={index} className="bg-muted p-3 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">
                          {rel.deltager?.navne?.[0]?.navn || `Deltager ${index + 1}`}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {rel.deltager?.enhedsNummer}
                        </Badge>
                      </div>
                      {rel._enrichedDeltagerData && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-background p-2 rounded">
                            <div className="text-muted-foreground">Virksomheder:</div>
                            <div className="font-medium">
                              {rel._enrichedDeltagerData.virksomhedSummariskRelation?.length || 0}
                            </div>
                          </div>
                          <div className="bg-background p-2 rounded">
                            <div className="text-muted-foreground">Adresser:</div>
                            <div className="font-medium">
                              {rel._enrichedDeltagerData.beliggenhedsadresse?.length || 0}
                            </div>
                          </div>
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8"
                        onClick={() => {
                          const deltagerData = {
                            source: "deltager/_search",
                            url: "http://distribution.virk.dk/cvr-permanent/deltager/_search",
                            query: {
                              query: {
                                bool: {
                                  must: [{
                                    term: { "Vrdeltagerperson.enhedsNummer": rel.deltager?.enhedsNummer }
                                  }]
                                }
                              }
                            },
                            basicData: rel.deltager,
                            enrichedData: rel._enrichedDeltagerData
                          };
                          navigator.clipboard.writeText(JSON.stringify(deltagerData, null, 2));
                          toast.success(`Data for ${rel.deltager?.navne?.[0]?.navn || 'deltager'} kopieret`);
                        }}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Kopier deltagerdata
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combined Data */}
              <div className="border rounded-lg p-4 space-y-3 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Samlet CVR data
                </h4>
                <div className="text-xs text-muted-foreground">
                  Komplet datasæt fra både virksomheds- og deltagersøgning inkl. alle relationer og historik
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    const completeData = {
                      virksomhedssøgning: {
                        url: "http://distribution.virk.dk/cvr-permanent/virksomhed/_search",
                        data: cvrData?.Vrvirksomhed
                      },
                      deltagersøgning: cvrData?.Vrvirksomhed?.deltagerRelation?.map((rel: any) => ({
                        url: "http://distribution.virk.dk/cvr-permanent/deltager/_search",
                        enhedsNummer: rel.deltager?.enhedsNummer,
                        basicData: rel.deltager,
                        enrichedData: rel._enrichedDeltagerData
                      }))
                    };
                    navigator.clipboard.writeText(JSON.stringify(completeData, null, 2));
                    toast.success('Komplet CVR datasæt kopieret');
                  }}
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Kopier alt data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Raw JSON Data Viewer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Rå JSON-data visning
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowRawData(!showRawData)}
                  className="flex items-center gap-2"
                >
                  {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showRawData ? 'Skjul' : 'Vis'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showRawData && (
              <CardContent>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-md overflow-auto max-h-96 font-mono">
                  {JSON.stringify(cvrData, null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>

          <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded">
            <strong>Bemærk:</strong> Disse tekniske data bruger intelligent feltopdagelse til at finde alle tilgængelige oplysninger. 
            Kontakt support hvis vigtige oplysninger stadig mangler.
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default RawDataAccordion;
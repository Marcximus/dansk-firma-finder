
import React, { useState } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Code, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface RawDataAccordionProps {
  cvrData: any;
}

const RawDataAccordion: React.FC<RawDataAccordionProps> = ({ cvrData }) => {
  const [showRawData, setShowRawData] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!cvrData) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(cvrData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getDataSummary = () => {
    const summary: any = {};
    
    Object.keys(cvrData).forEach(key => {
      const value = cvrData[key];
      if (Array.isArray(value)) {
        summary[key] = `Array (${value.length} items)`;
      } else if (typeof value === 'object' && value !== null) {
        summary[key] = `Object (${Object.keys(value).length} properties)`;
      } else {
        summary[key] = typeof value;
      }
    });

    return summary;
  };

  return (
    <AccordionItem value="raw-data" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <span className="text-lg font-semibold">Tekniske data & fejlfinding</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Dette afsnit viser de tekniske data der er tilgængelige fra CVR-registeret. 
            Brug det til at identificere hvilke felter der er tilgængelige for denne virksomhed.
          </div>
          
          {/* Data Structure Summary */}
          <div>
            <h4 className="font-semibold mb-3">Tilgængelige datafelter</h4>
            <div className="bg-gray-50 p-4 rounded border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                {Object.entries(getDataSummary()).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-mono text-blue-600">{key}:</span>
                    <span className="text-muted-foreground">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Data Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center gap-2"
            >
              {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showRawData ? 'Skjul' : 'Vis'} rådata
            </Button>
            
            {showRawData && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Kopieret!' : 'Kopier JSON'}
              </Button>
            )}
          </div>

          {/* Raw JSON Data */}
          {showRawData && (
            <div>
              <h4 className="font-semibold mb-3">Komplet CVR-data (JSON)</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {JSON.stringify(cvrData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded">
            <strong>Bemærk:</strong> Disse tekniske data er beregnet til fejlfinding og udvikling. 
            Kontakt support hvis vigtige oplysninger mangler i de øvrige faner.
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default RawDataAccordion;

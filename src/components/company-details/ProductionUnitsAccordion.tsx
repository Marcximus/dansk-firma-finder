import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Users, Activity } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductionUnitsAccordionProps {
  productionUnits: any[];
}

export const ProductionUnitsAccordion = ({ productionUnits }: ProductionUnitsAccordionProps) => {
  if (!productionUnits || productionUnits.length === 0) {
    return null;
  }

  const formatAddress = (adresse: any) => {
    if (!adresse || adresse.length === 0) return 'Ingen adresse';
    
    const current = adresse.find((a: any) => !a.periode?.gyldigTil) || adresse[0];
    const parts = [];
    
    if (current.vejnavn) parts.push(current.vejnavn);
    if (current.husnummerFra) parts.push(current.husnummerFra);
    if (current.postnummer && current.postdistrikt) {
      parts.push(`${current.postnummer} ${current.postdistrikt}`);
    }
    
    return parts.join(', ') || 'Ingen adresse';
  };

  const getCurrentName = (navne: any[]) => {
    if (!navne || navne.length === 0) return 'Unavngivet';
    const current = navne.find((n: any) => !n.periode?.gyldigTil) || navne[0];
    return current.navn || 'Unavngivet';
  };

  const getMainBranch = (hovedbranche: any[]) => {
    if (!hovedbranche || hovedbranche.length === 0) return null;
    const current = hovedbranche.find((h: any) => !h.periode?.gyldigTil) || hovedbranche[0];
    return current?.branchetekst;
  };

  const getEmployeeCount = (attributter: any[]) => {
    if (!attributter) return null;
    
    const employeeAttr = attributter.find((attr: any) => 
      attr.type === 'ANTAL_ANSATTE' && !attr.periode?.gyldigTil
    );
    
    return employeeAttr?.vaerdier?.[0]?.vaerdi;
  };

  return (
    <AccordionItem value="production-units">
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Produktionsenheder ({productionUnits.length})
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {productionUnits.map((unit, index) => {
            const pNummer = unit.pNummer;
            const name = getCurrentName(unit.navne);
            const address = formatAddress(unit.beliggenhedsadresse);
            const branch = getMainBranch(unit.hovedbranche);
            const employees = getEmployeeCount(unit.attributter);

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {name}
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      P-nr: {pNummer}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{address}</span>
                  </div>
                  
                  {branch && (
                    <div className="flex items-start gap-2 text-sm">
                      <Activity className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{branch}</span>
                    </div>
                  )}
                  
                  {employees && (
                    <div className="flex items-start gap-2 text-sm">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span>{employees} ansatte</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/services/companyAPI';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  // Extract CEO from CVR data if available
  const getCEO = () => {
    if (company.realCvrData?.deltagerRelation) {
      const ceo = company.realCvrData.deltagerRelation.find((relation: any) => {
        const org = relation.organisationer?.[0];
        if (org?.hovedtype === 'DIREKTION') {
          return true;
        }
        // Also check for specific CEO role in member data
        if (org?.medlemsData) {
          const memberData = org.medlemsData[0];
          if (memberData?.attributter) {
            const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
            if (funkAttribute?.vaerdier?.[0]?.vaerdi?.toLowerCase().includes('administrerende')) {
              return true;
            }
          }
        }
        return false;
      });
      
      if (ceo) {
        const currentName = ceo.deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
        return currentName?.navn || ceo.deltager?.navne?.[0]?.navn || 'N/A';
      }
    }
    return 'N/A';
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow fadeIn">
      <CardHeader className="pb-2">
        <div className="flex flex-col items-center gap-3">
          <CardTitle className="text-xl font-bold leading-tight text-center">
            {company.name}
          </CardTitle>
          {company.logo && (
            <img 
              src={company.logo} 
              alt={`${company.name} logo`} 
              className="company-logo"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">CVR</p>
            <p>{company.cvr}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Administrerende direktør</p>
            <p>{getCEO()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Adresse</p>
            <p>{company.address}, {company.postalCode} {company.city}</p>
          </div>
          <div className="pt-2">
            <Button asChild className="w-full">
              <Link to={`/company/${company.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;

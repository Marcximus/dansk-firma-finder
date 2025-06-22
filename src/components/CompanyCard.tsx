
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/services/companyAPI';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  // Extract only the director from CVR data
  const getDirector = () => {
    if (company.realCvrData?.deltagerRelation) {
      for (const relation of company.realCvrData.deltagerRelation) {
        // Get person name
        const currentName = relation.deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
        const personName = currentName?.navn || relation.deltager?.navne?.[0]?.navn;
        
        if (personName && relation.organisationer) {
          for (const org of relation.organisationer) {
            // Only look for DIREKTION
            if (org.hovedtype === 'DIREKTION') {
              return personName;
            }
          }
        }
      }
    }
    return null;
  };

  const director = getDirector();

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
          
          {/* Show director if found */}
          {director ? (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Direktør</p>
              <p>{director}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Direktør</p>
              <p>N/A</p>
            </div>
          )}
          
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


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/services/companyAPI';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  // Extract management roles from CVR data if available
  const getManagementRoles = () => {
    const roles: { type: string; name: string }[] = [];
    
    if (company.realCvrData?.deltagerRelation) {
      company.realCvrData.deltagerRelation.forEach((relation: any) => {
        const org = relation.organisationer?.[0];
        if (org) {
          let roleType = '';
          let personName = '';
          
          // Get person name
          const currentName = relation.deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
          personName = currentName?.navn || relation.deltager?.navne?.[0]?.navn || 'N/A';
          
          // Determine role type
          if (org.hovedtype === 'DIREKTION') {
            // Check if it's specifically Administrerende direktør
            if (org.medlemsData) {
              const memberData = org.medlemsData[0];
              if (memberData?.attributter) {
                const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
                const funkValue = funkAttribute?.vaerdier?.[0]?.vaerdi?.toLowerCase();
                if (funkValue && funkValue.includes('administrerende')) {
                  roleType = 'DIREKTION';
                }
              }
            } else {
              roleType = 'DIREKTION';
            }
          } else if (org.hovedtype === 'BESTYRELSE') {
            // Check if it's specifically Bestyrelsesformand
            if (org.medlemsData) {
              const memberData = org.medlemsData[0];
              if (memberData?.attributter) {
                const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
                const funkValue = funkAttribute?.vaerdier?.[0]?.vaerdi?.toLowerCase();
                if (funkValue && funkValue.includes('formand')) {
                  roleType = 'BESTYRELSE';
                }
              }
            }
          }
          
          if (roleType && personName !== 'N/A') {
            roles.push({ type: roleType, name: personName });
          }
        }
      });
    }
    
    return roles;
  };

  const managementRoles = getManagementRoles();

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
          
          {/* Display management roles */}
          {managementRoles.map((role, index) => (
            <div key={index}>
              <p className="text-sm font-medium text-muted-foreground">
                {role.type === 'DIREKTION' ? 'DIREKTION: Administrerende direktør' : 'BESTYRELSE: Bestyrelsesformand'}
              </p>
              <p>{role.name}</p>
            </div>
          ))}
          
          {/* Show fallback if no management roles found */}
          {managementRoles.length === 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Administrerende direktør</p>
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

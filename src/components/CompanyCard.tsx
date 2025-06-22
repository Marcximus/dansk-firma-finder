
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/services/companyAPI';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  // Extract all management roles from CVR data if available
  const getAllManagementRoles = () => {
    const roles: { type: string; name: string }[] = [];
    
    if (company.realCvrData?.deltagerRelation) {
      company.realCvrData.deltagerRelation.forEach((relation: any) => {
        // Get person name
        const currentName = relation.deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
        const personName = currentName?.navn || relation.deltager?.navne?.[0]?.navn || 'N/A';
        
        if (personName !== 'N/A' && relation.organisationer) {
          relation.organisationer.forEach((org: any) => {
            let roleDescription = '';
            
            // Get the role type from hovedtype
            const hovedtype = org.hovedtype;
            
            // Get more specific role from member data if available
            if (org.medlemsData && org.medlemsData.length > 0) {
              const memberData = org.medlemsData[0];
              if (memberData.attributter) {
                const funkAttribute = memberData.attributter.find((attr: any) => attr.type === 'FUNKTION');
                if (funkAttribute && funkAttribute.vaerdier && funkAttribute.vaerdier.length > 0) {
                  roleDescription = funkAttribute.vaerdier[0].vaerdi;
                }
              }
            }
            
            // Fall back to hovedtype if no specific function found
            if (!roleDescription && hovedtype) {
              switch (hovedtype) {
                case 'DIREKTION':
                  roleDescription = 'Direktion';
                  break;
                case 'BESTYRELSE':
                  roleDescription = 'Bestyrelse';
                  break;
                case 'FULDT_ANSVARLIG_DELTAGERE':
                  roleDescription = 'Interessenter';
                  break;
                default:
                  roleDescription = hovedtype;
              }
            }
            
            if (roleDescription) {
              roles.push({ type: roleDescription, name: personName });
            }
          });
        }
      });
    }
    
    return roles;
  };

  const managementRoles = getAllManagementRoles();

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
          
          {/* Display all management roles */}
          {managementRoles.map((role, index) => (
            <div key={index}>
              <p className="text-sm font-medium text-muted-foreground">
                {role.type}
              </p>
              <p>{role.name}</p>
            </div>
          ))}
          
          {/* Show fallback if no management roles found */}
          {managementRoles.length === 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Management</p>
              <p>Information not available</p>
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

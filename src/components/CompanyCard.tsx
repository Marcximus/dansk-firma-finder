
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/services/companyAPI';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  // Extract the first director or owner from CVR data
  const getDirectorOrOwner = () => {
    console.log('Company data:', company);
    console.log('Real CVR data:', company.realCvrData);
    
    if (!company.realCvrData?.deltagerRelation) {
      console.log('No deltagerRelation found');
      return { name: null, role: null };
    }

    console.log('DeltagerRelation:', company.realCvrData.deltagerRelation);

    // First pass: Look for directors
    for (const relation of company.realCvrData.deltagerRelation) {
      console.log('Processing relation for director:', relation);
      
      // Get person name
      const currentName = relation.deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
      const personName = currentName?.navn || relation.deltager?.navne?.[0]?.navn;
      
      console.log('Person name:', personName);
      
      if (personName && relation.organisationer) {
        console.log('Organisationer:', relation.organisationer);
        
        for (const org of relation.organisationer) {
          console.log('Checking org for director:', org);
          console.log('Hovedtype:', org.hovedtype);
          
          // Check for director role - try multiple variations
          if (org.hovedtype === 'DIREKTION' || org.hovedtype === 'DIREKTØR') {
            console.log('Found director:', personName);
            return { name: personName, role: 'Direktør' };
          }
          
          // Also check medlemsData for more specific role information
          if (org.medlemsData) {
            for (const medlem of org.medlemsData) {
              if (medlem.attributter) {
                for (const attr of medlem.attributter) {
                  if (attr.type === 'FUNKTION' && attr.vaerdier) {
                    for (const vaerdi of attr.vaerdier) {
                      console.log('Found role:', vaerdi.vaerdi);
                      if (vaerdi.vaerdi === 'DIREKTØR' || vaerdi.vaerdi.includes('DIREKTØR')) {
                        console.log('Found director via medlemsData:', personName);
                        return { name: personName, role: 'Direktør' };
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    console.log('No director found, looking for liable partner');
    
    // Second pass: Look for liable partners (owners) if no director found
    for (const relation of company.realCvrData.deltagerRelation) {
      console.log('Processing relation for owner:', relation);
      
      // Get person name
      const currentName = relation.deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null);
      const personName = currentName?.navn || relation.deltager?.navne?.[0]?.navn;
      
      if (personName && relation.organisationer) {
        for (const org of relation.organisationer) {
          console.log('Checking org for owner:', org);
          console.log('Hovedtype:', org.hovedtype);
          
          // Check for liable partner role
          if (org.hovedtype === 'FULDT_ANSVARLIG_DELTAGERE') {
            console.log('Found liable partner (owner):', personName);
            return { name: personName, role: 'Ejer' };
          }
        }
      }
    }
    
    console.log('No director or owner found');
    return { name: null, role: null };
  };

  const { name: personName, role: personRole } = getDirectorOrOwner();

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
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <span className="font-medium w-20">CVR</span>
            <span>{company.cvr}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium w-20">{personRole || 'Direktør'}</span>
            <span>{personName || 'N/A'}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium w-20">Type</span>
            <span>{company.legalForm || 'N/A'}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium w-20">Status</span>
            <span>{company.status || 'Aktiv'}</span>
          </div>
          
          <div className="flex items-start">
            <span className="font-medium w-20">Adresse</span>
            <div>
              <div>{company.address}</div>
              <div>{company.postalCode} {company.city}</div>
            </div>
          </div>
          
          <div className="pt-4">
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

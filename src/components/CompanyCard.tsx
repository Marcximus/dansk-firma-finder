
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/services/companyAPI';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  // Transform legal form text to clean up specific cases for search results
  const cleanLegalForm = (legalForm: string) => {
    // First handle the foreign company simplification
    if (legalForm === 'Anden udenlandsk virksomhed' || 
        legalForm === 'Filial af udenlandsk aktieselskab, kommanditakties etc') {
      return 'Udenlandsk Virksomhed';
    }
    
    // Then handle the personal company simplification
    if (legalForm === 'Personligt ejet Mindre Virksomhed') {
      return 'Personligt Ejet Virksomhed';
    }
    
    return legalForm;
  };

  // Transform status to simplify dissolved statuses for search results
  const cleanStatus = (status: string) => {
    if (status?.includes('OPLØST')) {
      return 'OPLØST';
    }
    return status;
  };

  // Get status color based on status value
  const getStatusColor = (status: string) => {
    if (status === 'NORMAL') {
      return 'bg-green-500 text-white hover:bg-green-600';
    }
    return 'bg-red-500 text-white hover:bg-red-600';
  };

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
  const statusText = cleanStatus(company.status || 'Aktiv');

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow fadeIn">
      <CardHeader className="pb-2 pt-3">
        <div className="flex flex-col items-center gap-3">
          <CardTitle className="text-lg font-bold leading-tight text-center min-h-[2rem] flex items-center justify-center px-1">
            {company.name}
          </CardTitle>
          {company.logo && (
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-2">
        <div className="space-y-4 text-sm flex-1">
          <div className="grid grid-cols-3 gap-2">
            <span className="font-medium text-muted-foreground">CVR</span>
            <span className="col-span-2">{company.cvr}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="font-medium text-muted-foreground">{personRole || 'Direktør'}</span>
            <span className="col-span-2">{personName || 'Ikke tilgængelig'}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="font-medium text-muted-foreground">Type</span>
            <span className="col-span-2">{cleanLegalForm(company.legalForm || 'Ikke tilgængelig')}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="font-medium text-muted-foreground">Status</span>
            <div className="col-span-2">
              <Badge className={getStatusColor(company.status || 'NORMAL')}>
                {statusText}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <span className="font-medium text-muted-foreground">Adresse</span>
            <div className="col-span-2">
              <div>{company.address}</div>
              <div>{company.postalCode} {company.city}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Button asChild className="w-full">
            <Link to={`/company/${company.id}`}>Se Detaljer</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;

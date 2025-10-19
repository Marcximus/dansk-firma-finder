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
    // Handle filial simplification
    if (legalForm?.toLowerCase().includes('filial')) {
      return 'Filial';
    }
    
    // Handle foreign company simplification
    if (legalForm === 'Anden udenlandsk virksomhed') {
      return 'Udenlandsk Virksomhed';
    }
    
    // Handle the personal company simplification
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

  // Extract the most recent change from CVR data
  const getLastChange = () => {
    if (!company.realCvrData) return null;
    
    // Look for recent changes in various parts of the CVR data
    let latestDate = null;
    let changeType = '';
    
    // Check lifecycle changes
    if (company.realCvrData.livsforloeb) {
      for (const change of company.realCvrData.livsforloeb) {
        if (change.periode?.gyldigFra) {
          const changeDate = new Date(change.periode.gyldigFra);
          if (!latestDate || changeDate > latestDate) {
            latestDate = changeDate;
            changeType = 'Status ændring';
          }
        }
      }
    }
    
    // Check address changes
    if (company.realCvrData.beliggenhedsadresse) {
      for (const addr of company.realCvrData.beliggenhedsadresse) {
        if (addr.periode?.gyldigFra) {
          const changeDate = new Date(addr.periode.gyldigFra);
          if (!latestDate || changeDate > latestDate) {
            latestDate = changeDate;
            changeType = 'Adresse ændring';
          }
        }
      }
    }
    
    // Check name changes
    if (company.realCvrData.navne) {
      for (const nameChange of company.realCvrData.navne) {
        if (nameChange.periode?.gyldigFra) {
          const changeDate = new Date(nameChange.periode.gyldigFra);
          if (!latestDate || changeDate > latestDate) {
            latestDate = changeDate;
            changeType = 'Navn ændring';
          }
        }
      }
    }
    
    if (latestDate) {
      return {
        date: latestDate.toLocaleDateString('da-DK'),
        type: changeType
      };
    }
    
    return null;
  };

  const { name: personName, role: personRole } = getDirectorOrOwner();
  const statusText = cleanStatus(company.status || 'Aktiv');
  const lastChange = getLastChange();

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-1.5 pt-2 sm:pb-2 sm:pt-3">
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <CardTitle className="text-sm sm:text-base lg:text-lg font-bold leading-tight text-center min-h-[1.5rem] sm:min-h-[2rem] flex items-center justify-center px-1">
            <Link 
              to={`/company/${company.id}`}
              className="hover:text-primary transition-colors underline-offset-4 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {company.name}
            </Link>
          </CardTitle>
          {company.logo && (
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center">
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-1.5 sm:pt-2 px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm flex-1">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <span className="font-medium text-muted-foreground">CVR</span>
            <span className="col-span-2">
              <Link 
                to={`/company/${company.id}`}
                className="hover:text-primary transition-colors underline-offset-4 hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {company.cvr}
              </Link>
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <span className="font-medium text-muted-foreground">{personRole || 'Direktør'}</span>
            <span className="col-span-2">{personName || 'Ikke tilgængelig'}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <span className="font-medium text-muted-foreground">Type</span>
            <span className="col-span-2">{cleanLegalForm(company.legalForm || 'Ikke tilgængelig')}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <span className="font-medium text-muted-foreground">Status</span>
            <div className="col-span-2">
              <Badge className={`text-xs ${getStatusColor(company.status || 'NORMAL')}`}>
                {statusText}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <span className="font-medium text-muted-foreground">Adresse</span>
            <div className="col-span-2">
              <div>{company.address}</div>
              <div>{company.postalCode} {company.city}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 lg:mt-6 pt-2 sm:pt-3 lg:pt-4 border-t">
          <Button asChild size="sm" className="w-full text-xs sm:text-sm">
            <Link to={`/company/${company.id}`}>
              Se Detaljer
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;

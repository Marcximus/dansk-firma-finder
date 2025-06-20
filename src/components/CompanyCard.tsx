
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/services/companyAPI';
import { Building } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow fadeIn">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-xl font-bold leading-tight">
            {company.name}
          </CardTitle>
          {company.logo ? (
            <img 
              src={company.logo} 
              alt={`${company.name} logo`} 
              className="company-logo flex-shrink-0"
            />
          ) : (
            <div className="company-logo flex items-center justify-center bg-secondary flex-shrink-0">
              <Building size={32} className="text-primary" />
            </div>
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
            <p className="text-sm font-medium text-muted-foreground">Industry</p>
            <p>{company.industry}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Location</p>
            <p>{company.city}, {company.postalCode}</p>
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


import React from 'react';
import { Company } from '@/services/companyAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompanyDetailsProps {
  company: Company;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  return (
    <Card className="w-full max-w-4xl mx-auto fadeIn">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Company Profile</p>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              {company.name}
            </CardTitle>
            <p className="text-muted-foreground mt-1">CVR: {company.cvr}</p>
          </div>
          <div className="flex items-center">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="company-logo h-20 w-20"
              />
            ) : (
              <div className="company-logo h-20 w-20 flex items-center justify-center bg-secondary">
                <Building size={40} className="text-primary" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="font-medium">{company.industry}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Year Founded</p>
                <p className="font-medium">{company.yearFounded}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employee Count</p>
                <p className="font-medium">{company.employeeCount.toLocaleString()}</p>
              </div>
              
              {company.revenue && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="font-medium">{company.revenue}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="font-medium">
                  {company.address}
                  <br />
                  {company.postalCode} {company.city}
                </p>
              </div>
              
              {company.website && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {company.description && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{company.description}</p>
          </div>
        )}
        
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">Back to search</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyDetails;

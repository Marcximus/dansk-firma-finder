
import React from 'react';
import { Company } from '@/services/companyAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Map, ArrowLeft, Download, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

interface CompanyDetailsProps {
  company: Company;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  return (
    <div className="py-6">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{company.name}</h1>
        <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Established: {company.yearFounded}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>CVR: {company.cvr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Map className="h-4 w-4" />
            <span>{company.city}</span>
          </div>
          <Badge className="bg-success text-white">Active</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex gap-1">
            <Download size={16} />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" className="flex gap-1">
            <Share2 size={16} />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Information Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Key Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Company Type</span>
                <span className="font-medium">Company</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Address</span>
                <span className="font-medium">{company.address}<br/>{company.postalCode} {company.city}</span>
              </div>
              {company.website && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Website</span>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Industry</span>
                <span className="font-medium">{company.industry}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Employees</span>
                <span className="font-medium">{company.employeeCount.toLocaleString()}</span>
              </div>
              {company.revenue && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Annual Revenue</span>
                  <span className="font-medium">{company.revenue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Card */}
          {company.description && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">About</h3>
              <p className="text-muted-foreground">{company.description}</p>
            </div>
          )}
          
          {/* Financial Reports Card - Placeholder */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Financial Reports</h3>
            <ul className="space-y-4">
              {[2024, 2023, 2022].map(year => (
                <li key={year} className="pb-4 border-b last:border-0">
                  <div className="font-medium">Annual Report 01.01.{year} - 31.12.{year}</div>
                  <div className="text-muted-foreground text-sm">
                    Published: {10 + year % 10}.07.{year+1} | Approved: {8 + year % 5}.07.{year+1}
                    <div className="mt-1.5">
                      <a href="#" className="text-primary hover:underline mr-2">Download PDF</a> | 
                      <a href="#" className="text-primary hover:underline ml-2">Download XBRL</a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Additional Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Additional Info</h3>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Year Founded</span>
                <span className="font-medium">{company.yearFounded}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Industry Code</span>
                <span className="font-medium">{Math.floor(Math.random() * 900000) + 100000}</span>
              </div>
            </div>
          </div>
          
          {/* Recent Changes Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Recent Changes</h3>
            <ul className="space-y-4">
              <li className="pb-4 border-b last:border-0">
                <div className="font-medium">06.02.2025 - New Office Location</div>
                <div className="text-muted-foreground text-sm">
                  The company moved to a new headquarters.
                </div>
              </li>
              <li className="pb-4 border-b last:border-0">
                <div className="font-medium">12.11.2024 - Management Change</div>
                <div className="text-muted-foreground text-sm">
                  New CEO appointed.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline" className="flex gap-1.5">
          <Link to="/">
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CompanyDetails;

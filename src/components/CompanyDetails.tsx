
import React from 'react';
import { Company, extractCvrDetails } from '@/services/companyAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Map, ArrowLeft, Download, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompanyDetailsProps {
  company: Company;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  // Extract real CVR data if available
  const cvrDetails = company.realCvrData ? extractCvrDetails(company.realCvrData) : null;
  
  // Use real data when available, fall back to mock data
  const companyData = {
    ...company,
    email: company.email || "contact@" + company.name.toLowerCase().replace(/\s+/g, '') + ".dk",
    legalForm: company.legalForm || "Anpartsselskab",
    registeredCapital: "N/A", // This would need to be extracted from CVR data
    fiscalYear: "01.01 - 31.12",
    lastStatuteDate: "N/A",
    purposeText: "Company information from Danish Business Authority. Full purpose description not available in current data structure.",
    signingRule: "Information not available in current data structure",
    management: cvrDetails?.management || [
      { role: "Information not available", name: "Data not accessible through current API", address: "N/A" }
    ],
    legalOwners: [
      { name: "Information not available", address: "N/A", ownership: "N/A", votingRights: "N/A", date: "N/A" }
    ],
    realOwners: [
      { name: "Information not available", address: "N/A", ownership: "N/A", votingRights: "N/A", date: "N/A" }
    ],
    financialReports: [
      { period: "Information not available", publishDate: "N/A", approvalDate: "N/A" }
    ],
    additionalInfo: {
      subsidiaryName: company.name + " (Subsidiary info not available)",
      pNumber: "N/A",
      adProtection: company.realCvrData?.reklamebeskyttet ? "Yes" : "No",
      auditor: "Information not available"
    },
    recentChanges: [
      { date: "N/A", type: "Information not available", description: "Recent changes data not accessible through current API structure" }
    ],
    historicalNames: cvrDetails?.historicalNames || [
      { period: "Current", name: company.name }
    ],
    historicalAddresses: cvrDetails?.historicalAddresses || [
      { period: "Current", address: `${company.address}\n${company.postalCode} ${company.city}` }
    ]
  };

  const statusColor = company.status === 'NORMAL' ? 'bg-green-500' : 'bg-gray-500';

  return (
    <div className="py-6">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{company.name}</h1>
        <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
          {company.yearFounded && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Established: {company.yearFounded}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>CVR: {company.cvr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Map className="h-4 w-4" />
            <span>{company.city}</span>
          </div>
          <Badge className={`${statusColor} text-white`}>
            {company.status === 'NORMAL' ? 'Active' : company.status || 'Unknown'}
          </Badge>
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
                <span className="font-medium">{companyData.legalForm}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Address</span>
                <span className="font-medium">{company.address}<br/>{company.postalCode} {company.city}</span>
              </div>
              {company.email && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <a href={`mailto:${company.email}`} className="font-medium text-primary hover:underline">
                    {company.email}
                  </a>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Industry</span>
                <span className="font-medium">{company.industry}</span>
              </div>
              {company.employeeCount > 0 && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Employees</span>
                  <span className="font-medium">{company.employeeCount.toLocaleString()}</span>
                </div>
              )}
              {company.website && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Website</span>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Purpose Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Company Information</h3>
            <p className="text-muted-foreground">{companyData.purposeText}</p>
          </div>
          
          {/* Management & Board Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4 pb-2 border-b">
              <h3 className="text-lg font-semibold">Management & Board</h3>
              <span className="text-sm text-muted-foreground">Information from CVR Registry</span>
            </div>
            <ul className="space-y-4">
              {companyData.management.map((person, index) => (
                <li key={index} className="pb-4 border-b last:border-0">
                  <div className="text-sm font-medium text-muted-foreground">{person.role}</div>
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-muted-foreground">{person.address}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Historical Names */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Historical Names</h3>
            <ul className="space-y-4">
              {companyData.historicalNames.map((item, index) => (
                <li key={index} className="pb-4 border-b last:border-0">
                  <div className="font-medium">{item.period}</div>
                  <div className="text-muted-foreground text-sm">
                    {item.name}
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
                <span className="text-sm font-medium text-muted-foreground">CVR Number</span>
                <span className="font-medium">{company.cvr}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <span className="font-medium">{company.status || 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Protection against advertisement</span>
                <span className="font-medium">{companyData.additionalInfo.adProtection}</span>
              </div>
              {company.yearFounded && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">Founded</span>
                  <span className="font-medium">{company.yearFounded}</span>
                </div>
              )}
            </div>
          </div>

          {/* Historical Addresses Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Historical Addresses</h3>
            <ul className="space-y-4">
              {companyData.historicalAddresses.map((item, index) => (
                <li key={index} className="pb-4 border-b last:border-0">
                  <div className="font-medium">{item.period}</div>
                  <div className="text-muted-foreground text-sm whitespace-pre-line">
                    {item.address}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Source Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Data Source</h4>
            <p className="text-sm text-blue-700">
              This information is sourced from the Danish Business Authority (Erhvervsstyrelsen) CVR registry. 
              Some detailed information may require additional API access or manual lookup.
            </p>
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


import React from 'react';
import { Company } from '@/services/companyAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Map, ArrowLeft, Download, Share2, Users, Mail, Building2, CreditCard, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

interface CompanyDetailsProps {
  company: Company;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  // Enhanced fake data for demonstration
  const companyData = {
    ...company,
    email: "contact@" + company.name.toLowerCase().replace(/\s+/g, '') + ".dk",
    legalForm: "Anpartsselskab",
    registeredCapital: "961.323,00 DKK",
    fiscalYear: "01.01 - 31.12",
    lastStatuteDate: "05.02.2025",
    purposeText: "Selskabets formål er softwareudvikling, produktion, salg og marketing samt anden software til brug på Sociale Medier og Web samt i sin virksomhed og drift at have en væsentlig positiv indvirkning på samfundet og miljøet som helhed samt al virksomhed, som efter ledelsens skøn har forbindelse hermed.",
    signingRule: "Selskabet tegnes af en direktør",
    management: [
      { role: "Direktør", name: "Michael Andersen", address: "Frederiksborggade 36, 3. th, 1360 København K" },
      { role: "Bestyrelse", name: "Jakob Algreen", address: "Adelgade 113, 4., 1304 København K", electionType: "Generalforsamling" },
      { role: "Bestyrelse", name: "Christina Nielsen", address: "Østergade 24, 2. tv, 1100 København K", electionType: "Generalforsamling" }
    ],
    legalOwners: [
      { name: "Nordisk Ventures ApS", address: "Adelgade 113, 4., 1304 København K", ownership: "33,33-49,99%", votingRights: "33,33-49,99%", date: "11.11.2024 - " },
      { name: "Copenhagen Invest ApS", address: "Frederiksborggade 36, 3. th, 1360 København K", ownership: "33,33-49,99%", votingRights: "33,33-49,99%", date: "05.07.2023 - " }
    ],
    realOwners: [
      { name: "Jakob Algreen", address: "Adelgade 113, 4., 1304 København K", ownership: "41,78%", votingRights: "41,78%", date: "29.11.2023 - ", specialInfo: "Has indirect possessions" },
      { name: "Michael Andersen", address: "Frederiksborggade 36, 3. th, 1360 København K", ownership: "41,78%", votingRights: "41,78%", date: "29.11.2023 - ", specialInfo: "Has indirect possessions" }
    ],
    financialReports: [
      { period: "01.01.2023 - 31.12.2023", publishDate: "10.07.2024", approvalDate: "08.07.2024" },
      { period: "01.01.2022 - 31.12.2022", publishDate: "18.07.2023", approvalDate: "17.07.2023" },
      { period: "01.01.2021 - 31.12.2021", publishDate: "12.07.2022", approvalDate: "05.07.2022" }
    ],
    additionalInfo: {
      subsidiaryName: company.name + " Subsidiary ApS",
      pNumber: "1023" + Math.floor(Math.random() * 900000 + 100000),
      adProtection: "Yes",
      auditor: "REVISIONSFIRMAET STATSAUTORISERET REVISIONSAKTIESELSKAB"
    },
    recentChanges: [
      { date: "06.02.2025", type: "Capital Change", description: "Increased by DKK 13.538,00, paid in cash. Total capital now DKK 961.323,00." },
      { date: "09.12.2024", type: "Capital Change", description: "Increased by DKK 69.176,00. Total capital now DKK 947.785,00." },
      { date: "03.07.2024", type: "Name Change", description: "Changed name from \"" + company.name + " Technologies ApS\" to \"" + company.name + " ApS\"" }
    ],
    historicalNames: [
      { period: "03.05.2019 - 25.06.2024", name: company.name + " Technologies ApS" },
      { period: "15.05.2018 - 02.05.2019", name: company.name + " Digital ApS" }
    ],
    historicalAddresses: [
      { period: "02.11.2021 - 18.01.2022", address: "Store Kongensgade 62A, 3.\n1264 København K" },
      { period: "10.12.2020 - 01.11.2021", address: "Havnegade 39\n1058 København K" },
      { period: "29.09.2020 - 09.12.2020", address: "Højbro Plads 10\n1200 København K" }
    ]
  };

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
                <span className="font-medium">{companyData.legalForm}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Address</span>
                <span className="font-medium">{company.address}<br/>{company.postalCode} {company.city}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <a href={`mailto:${companyData.email}`} className="font-medium text-primary hover:underline">
                  {companyData.email}
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Industry</span>
                <span className="font-medium">{company.industry}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Employees</span>
                <span className="font-medium">{company.employeeCount.toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Registered Capital</span>
                <span className="font-medium">{companyData.registeredCapital}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Fiscal Year</span>
                <span className="font-medium">{companyData.fiscalYear}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Last Statute Date</span>
                <span className="font-medium">{companyData.lastStatuteDate}</span>
              </div>
            </div>
          </div>

          {/* Purpose Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Purpose</h3>
            <p className="text-muted-foreground">{companyData.purposeText}</p>
          </div>
          
          {/* Management & Board Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4 pb-2 border-b">
              <h3 className="text-lg font-semibold">Management & Board</h3>
              <span className="text-sm text-muted-foreground">Signing Rule: {companyData.signingRule}</span>
            </div>
            <ul className="space-y-4">
              {companyData.management.map((person, index) => (
                <li key={index} className="pb-4 border-b last:border-0">
                  <div className="text-sm font-medium text-muted-foreground">{person.role}</div>
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-muted-foreground">{person.address}</div>
                  {person.electionType && (
                    <div className="text-sm text-muted-foreground">Valgform: {person.electionType}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Ownership Structure */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Ownership Structure</h3>
            
            <h4 className="font-medium mt-2 mb-3">Legal Owners</h4>
            <ul className="space-y-4 mb-6">
              {companyData.legalOwners.map((owner, index) => (
                <li key={index} className="pb-4 border-b last:border-0">
                  <div className="font-medium">{owner.name}</div>
                  <div className="text-sm text-muted-foreground">{owner.address}</div>
                  <div className="text-sm text-muted-foreground">Ownership: {owner.ownership} ({owner.date})</div>
                  <div className="text-sm text-muted-foreground">Voting rights: {owner.votingRights} ({owner.date})</div>
                </li>
              ))}
            </ul>
            
            <h4 className="font-medium mt-6 mb-3">Real Owners</h4>
            <ul className="space-y-4">
              {companyData.realOwners.map((owner, index) => (
                <li key={index} className="pb-4 border-b last:border-0">
                  <div className="font-medium">{owner.name}</div>
                  <div className="text-sm text-muted-foreground">{owner.address}</div>
                  <div className="text-sm text-muted-foreground">Ownership: {owner.ownership} ({owner.date})</div>
                  <div className="text-sm text-muted-foreground">Voting rights: {owner.votingRights} ({owner.date})</div>
                  {owner.specialInfo && (
                    <div className="text-sm text-muted-foreground">Special ownership: {owner.specialInfo}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Financial Reports Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Financial Reports</h3>
            <ul className="space-y-4">
              {companyData.financialReports.map((report, index) => (
                <li key={index} className="pb-4 border-b last:border-0">
                  <div className="font-medium">Annual Report {report.period}</div>
                  <div className="text-muted-foreground text-sm">
                    Published: {report.publishDate} | Approved: {report.approvalDate}
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
                <span className="text-sm font-medium text-muted-foreground">Subsidiary Name</span>
                <span className="font-medium">{companyData.additionalInfo.subsidiaryName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">P-Number</span>
                <span className="font-medium">{companyData.additionalInfo.pNumber}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Protection against advertisement</span>
                <span className="font-medium">{companyData.additionalInfo.adProtection}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Auditor</span>
                <span className="font-medium">{companyData.additionalInfo.auditor}</span>
              </div>
            </div>
          </div>
          
          {/* Recent Changes Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Recent Changes</h3>
            <ul className="space-y-4">
              {companyData.recentChanges.map((change, index) => (
                <li key={index} className="pb-4 border-b last:border-0">
                  <div className="font-medium">{change.date} - {change.type}</div>
                  <div className="text-muted-foreground text-sm">
                    {change.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Historical Names Card */}
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


import React from 'react';
import { Company, extractCvrDetails } from '@/services/companyAPI';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyHeader from './company-details/CompanyHeader';
import BasicInformationSection from './company-details/BasicInformationSection';
import ManagementSection from './company-details/ManagementSection';
import FinancialSection from './company-details/FinancialSection';
import HistorySection from './company-details/HistorySection';
import ContactSection from './company-details/ContactSection';
import LegalSection from './company-details/LegalSection';
import DataSourceInfo from './company-details/DataSourceInfo';

interface CompanyDetailsProps {
  company: Company;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company }) => {
  // Extract real CVR data if available
  const cvrDetails = company.realCvrData ? extractCvrDetails(company.realCvrData) : null;
  
  return (
    <div className="py-6 max-w-7xl mx-auto px-4">
      <CompanyHeader company={company} />

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="basic">Grundoplysninger</TabsTrigger>
          <TabsTrigger value="management">Ledelse & Ejerskab</TabsTrigger>
          <TabsTrigger value="financial">Økonomi</TabsTrigger>
          <TabsTrigger value="history">Historik</TabsTrigger>
          <TabsTrigger value="contact">Kontakt</TabsTrigger>
          <TabsTrigger value="legal">Juridisk</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <BasicInformationSection company={company} cvrData={company.realCvrData} />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <ManagementSection cvrData={company.realCvrData} />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialSection cvr={company.cvr} cvrData={company.realCvrData} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistorySection cvrData={company.realCvrData} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <ContactSection company={company} cvrData={company.realCvrData} />
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <LegalSection company={company} cvrData={company.realCvrData} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 space-y-4">
        <DataSourceInfo />
        <div className="flex justify-center">
          <Button asChild variant="outline" className="flex gap-1.5">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Tilbage til søgning
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;

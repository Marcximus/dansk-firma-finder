
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Company } from '@/services/companyAPI';
import { FileText, MapPin, Calendar, Building, Mail, Phone, AlertCircle } from 'lucide-react';

interface BasicInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const BasicInfoAccordion: React.FC<BasicInfoAccordionProps> = ({ company, cvrData }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Ikke oplyst';
    try {
      return new Date(dateString).toLocaleDateString('da-DK');
    } catch {
      return dateString;
    }
  };

  const getContactInfo = () => {
    if (!cvrData) return {};
    
    const currentEmail = cvrData.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
    const currentPhone = cvrData.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
    
    return {
      email: currentEmail?.kontaktoplysning || null,
      phone: currentPhone?.kontaktoplysning || null
    };
  };

  const contactInfo = getContactInfo();

  return (
    <AccordionItem value="basic" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="text-lg font-semibold">Grundoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">CVR-nummer</div>
                    <div className="font-semibold text-lg">{company.cvr}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Adresse</div>
                    <div className="font-semibold">
                      {company.address}<br />
                      {company.postalCode} {company.city}
                    </div>
                  </div>
                </div>

                {company.yearFounded && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium text-sm text-muted-foreground">Startdato</div>
                      <div className="font-semibold">{cvrData?.stiftelsesDato ? formatDate(cvrData.stiftelsesDato) : company.yearFounded}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Virksomhedsform</div>
                    <div className="font-semibold">{company.legalForm}</div>
                  </div>
                </div>

                {(contactInfo.email || contactInfo.phone) && (
                  <div className="space-y-3">
                    <div className="font-medium text-sm text-muted-foreground">Kontaktoplysninger</div>
                    {contactInfo.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${contactInfo.email}`} className="font-medium text-primary hover:underline">
                          {contactInfo.email}
                        </a>
                      </div>
                    )}
                    {contactInfo.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{contactInfo.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <div className="font-medium text-sm text-muted-foreground">Status</div>
                    <div className="font-semibold">{company.status}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BasicInfoAccordion;

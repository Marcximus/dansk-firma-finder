
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
            <div className="space-y-6">
              {/* CVR-nummer */}
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium text-sm text-muted-foreground">CVR-nummer</div>
                  <div className="font-semibold text-lg">{company.cvr}</div>
                </div>
              </div>

              {/* Adresse */}
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

              {/* Startdato */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium text-sm text-muted-foreground">Startdato</div>
                  <div className="font-semibold">
                    {cvrData?.stiftelsesDato ? formatDate(cvrData.stiftelsesDato) : (company.yearFounded || 'Ikke oplyst')}
                  </div>
                </div>
              </div>

              {/* Virksomhedsform */}
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium text-sm text-muted-foreground">Virksomhedsform</div>
                  <div className="font-semibold">{company.legalForm}</div>
                </div>
              </div>

              {/* Kontaktoplysninger */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 mt-1">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium text-sm text-muted-foreground">Kontaktoplysninger</div>
                  <div className="space-y-2">
                    {contactInfo.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${contactInfo.email}`} className="font-medium text-primary hover:underline">
                          {contactInfo.email}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Ikke oplyst</span>
                      </div>
                    )}
                    {contactInfo.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{contactInfo.phone}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">Ikke oplyst</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <div className="font-medium text-sm text-muted-foreground">Status</div>
                  <div className="font-semibold">{company.status}</div>
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

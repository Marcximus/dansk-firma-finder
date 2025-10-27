
import React from 'react';
import { Company } from '@/services/companyAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Calendar, Users, Globe, Mail, Phone } from 'lucide-react';
import { formatPhoneNumber } from '@/services/utils/formatUtils';

interface BasicInformationSectionProps {
  company: Company;
  cvrData: any;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({ company, cvrData }) => {
  const currentAddress = cvrData?.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
  const currentEmail = cvrData?.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
  const currentPhone = cvrData?.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
  const currentWebsite = cvrData?.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null);

  const formatAddress = (addr: any) => {
    if (!addr) return `${company.address}, ${company.postalCode} ${company.city}`;
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage} sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return `${streetAddress}\n${postalInfo}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Virksomhedsinfo
          </CardTitle>
          <CardDescription>Grundlæggende oplysninger om virksomheden</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">CVR-nummer</span>
              <div className="font-medium">{company.cvr}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Virksomhedsform</span>
              <div className="font-medium">{company.legalForm || 'Ikke specificeret'}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <div className="font-medium">{company.status}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Branche</span>
              <div className="font-medium">{company.industry}</div>
            </div>
          </div>
          
          {company.yearFounded && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Etableret: {company.yearFounded}</span>
            </div>
          )}
          
          {company.employeeCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Medarbejdere: {company.employeeCount.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Adresse & Kontakt
          </CardTitle>
          <CardDescription>Kontaktoplysninger og adresse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Adresse</span>
            <div className="font-medium whitespace-pre-line">
              {formatAddress(currentAddress)}
            </div>
          </div>
          
          {currentEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${currentEmail.kontaktoplysning}`} className="text-blue-600 hover:underline">
                {currentEmail.kontaktoplysning}
              </a>
            </div>
          )}
          
          {currentPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`tel:${currentPhone.kontaktoplysning.replace(/[\s\-()]/g, '')}`} 
                className="text-primary hover:underline"
              >
                {formatPhoneNumber(currentPhone.kontaktoplysning)}
              </a>
            </div>
          )}
          
          {currentWebsite && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href={currentWebsite.kontaktoplysning} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {currentWebsite.kontaktoplysning}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInformationSection;

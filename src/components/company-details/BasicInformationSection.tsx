
import React from 'react';
import { Company } from '@/services/companyAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Calendar, Users, Mail, Phone } from 'lucide-react';
import { formatPhoneNumber } from '@/services/utils/formatUtils';

interface BasicInformationSectionProps {
  company: Company;
  cvrData: any;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({ company, cvrData }) => {
  const currentAddress = cvrData?.beliggenhedsadresse?.find((addr: any) => addr.periode?.gyldigTil === null);
  const currentEmail = cvrData?.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
  const currentPhone = cvrData?.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
  
  // Extract CEO/Director information
  const getCEO = () => {
    if (!cvrData?.Vrvirksomhed?.deltagerRelation) return null;
    
    for (const relation of cvrData.Vrvirksomhed.deltagerRelation) {
      const personName = relation.deltager?.navne?.find((n: any) => n.periode?.gyldigTil === null)?.navn ||
                        relation.deltager?.navne?.[relation.deltager.navne.length - 1]?.navn;
      
      if (relation.organisationer) {
        for (const org of relation.organisationer) {
          // Check if this is a director role
          if (org.hovedtype === 'DIREKTION') {
            return personName;
          }
          
          // Also check medlemsData for director role
          if (org.medlemsData) {
            for (const medlem of org.medlemsData) {
              if (medlem.attributter) {
                for (const attr of medlem.attributter) {
                  if (attr.type === 'FUNKTION' && attr.vaerdier) {
                    for (const vaerdi of attr.vaerdier) {
                      if (vaerdi.vaerdi === 'DIREKTØR' || vaerdi.vaerdi?.includes('DIREKTØR')) {
                        return personName;
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
    return null;
  };
  
  const ceo = getCEO();

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
          
          {ceo && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Direktør</span>
              <button
                onClick={() => {
                  const accordionTrigger = document.querySelector('[data-accordion-value="signing-rules"]') as HTMLElement;
                  if (accordionTrigger) {
                    // Open the accordion if it's not already open
                    const accordionItem = accordionTrigger.closest('[data-state]');
                    if (accordionItem && accordionItem.getAttribute('data-state') === 'closed') {
                      accordionTrigger.click();
                    }
                    // Wait a bit for the accordion to open, then scroll
                    setTimeout(() => {
                      accordionTrigger.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
                className="font-medium text-primary hover:underline cursor-pointer text-left"
              >
                {ceo}
              </button>
            </div>
          )}
          
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
          
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInformationSection;

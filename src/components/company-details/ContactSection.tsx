
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Globe, Printer, MapPin } from 'lucide-react';
import { Company } from '@/services/companyAPI';

interface ContactSectionProps {
  company: Company;
  cvrData: any;
}

const ContactSection: React.FC<ContactSectionProps> = ({ company, cvrData }) => {
  const currentEmail = cvrData?.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
  const currentPhone = cvrData?.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
  const currentFax = cvrData?.telefaxNummer?.find((fax: any) => fax.periode?.gyldigTil === null);
  const currentWebsite = cvrData?.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null);
  const secondaryPhone = cvrData?.sekundaertTelefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
  
  const postadresse = cvrData?.postadresse || [];
  const beliggenhedsadresse = cvrData?.beliggenhedsadresse || [];

  const formatAddress = (addr: any) => {
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Kontaktoplysninger
            </CardTitle>
            <CardDescription>Telefon, email og hjemmeside</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Email</span>
                  <div>
                    <a href={`mailto:${currentEmail.kontaktoplysning}`} className="font-medium text-primary hover:underline">
                      {currentEmail.kontaktoplysning}
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {currentPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Telefon</span>
                  <div className="font-medium">{currentPhone.kontaktoplysning}</div>
                </div>
              </div>
            )}
            
            {secondaryPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Sekundær telefon</span>
                  <div className="font-medium">{secondaryPhone.kontaktoplysning}</div>
                </div>
              </div>
            )}
            
            {currentFax && (
              <div className="flex items-center gap-3">
                <Printer className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Fax</span>
                  <div className="font-medium">{currentFax.kontaktoplysning}</div>
                </div>
              </div>
            )}
            
            {currentWebsite && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Hjemmeside</span>
                  <div>
                    <a href={currentWebsite.kontaktoplysning} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      {currentWebsite.kontaktoplysning}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {!currentEmail && !currentPhone && !currentFax && !currentWebsite && !secondaryPhone && (
              <p className="text-muted-foreground">Ingen kontaktoplysninger tilgængelige</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresser
            </CardTitle>
            <CardDescription>Beliggenhedsadresse og postadresse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {beliggenhedsadresse.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Beliggenhedsadresse</h4>
                {beliggenhedsadresse.filter((addr: any) => addr.periode?.gyldigTil === null).map((addr: any, index: number) => (
                  <div key={index} className="whitespace-pre-line font-medium">
                    {formatAddress(addr)}
                    {addr.conavn && <div className="text-sm text-muted-foreground mt-1">c/o {addr.conavn}</div>}
                  </div>
                ))}
              </div>
            )}

            {postadresse.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Postadresse</h4>
                {postadresse.filter((addr: any) => addr.periode?.gyldigTil === null).map((addr: any, index: number) => (
                  <div key={index} className="whitespace-pre-line font-medium">
                    {formatAddress(addr)}
                    {addr.conavn && <div className="text-sm text-muted-foreground mt-1">c/o {addr.conavn}</div>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactSection;

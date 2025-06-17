
import React from 'react';
import { Company } from '@/services/companyAPI';
import { Mail, Phone, Globe, Fax } from 'lucide-react';

interface ContactInformationCardProps {
  company: Company;
}

const ContactInformationCard: React.FC<ContactInformationCardProps> = ({ company }) => {
  const cvrData = company.realCvrData;
  
  if (!cvrData) return null;

  const currentEmail = cvrData.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
  const currentPhone = cvrData.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
  const currentFax = cvrData.telefaxNummer?.find((fax: any) => fax.periode?.gyldigTil === null);
  const currentWebsite = cvrData.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null);
  const secondaryPhone = cvrData.sekundaertTelefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);

  const hasContactInfo = currentEmail || currentPhone || currentFax || currentWebsite || secondaryPhone;

  if (!hasContactInfo) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Contact Information</h3>
      <div className="space-y-3">
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
              <span className="text-sm font-medium text-muted-foreground">Phone</span>
              <div className="font-medium">{currentPhone.kontaktoplysning}</div>
            </div>
          </div>
        )}
        
        {secondaryPhone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-sm font-medium text-muted-foreground">Secondary Phone</span>
              <div className="font-medium">{secondaryPhone.kontaktoplysning}</div>
            </div>
          </div>
        )}
        
        {currentFax && (
          <div className="flex items-center gap-3">
            <Fax className="h-4 w-4 text-muted-foreground" />
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
              <span className="text-sm font-medium text-muted-foreground">Website</span>
              <div>
                <a href={currentWebsite.kontaktoplysning} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                  {currentWebsite.kontaktoplysning}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInformationCard;

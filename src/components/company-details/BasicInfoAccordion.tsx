
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

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
    if (!cvrData) return { email: null, phone: null };
    
    const currentEmail = cvrData.elektroniskPost?.find((email: any) => email.periode?.gyldigTil === null);
    const currentPhone = cvrData.telefonNummer?.find((phone: any) => phone.periode?.gyldigTil === null);
    
    return {
      email: currentEmail?.kontaktoplysning || 
             cvrData.elektroniskPost?.[cvrData.elektroniskPost.length - 1]?.kontaktoplysning || 
             company.email || null,
      phone: currentPhone?.kontaktoplysning || 
             cvrData.telefonNummer?.[cvrData.telefonNummer.length - 1]?.kontaktoplysning || null
    };
  };

  const getWebsite = () => {
    if (!cvrData) return company.website;
    
    const currentWebsite = cvrData.hjemmeside?.find((site: any) => site.periode?.gyldigTil === null);
    return currentWebsite?.kontaktoplysning || 
           cvrData.hjemmeside?.[cvrData.hjemmeside.length - 1]?.kontaktoplysning || 
           company.website || null;
  };

  const getStartDate = () => {
    if (cvrData?.stiftelsesDato) {
      return formatDate(cvrData.stiftelsesDato);
    }
    if (company.yearFounded) {
      return company.yearFounded.toString();
    }
    return 'Ikke oplyst';
  };

  const getLegalForm = () => {
    if (!cvrData) return company.legalForm || 'Ikke oplyst';
    
    const currentForm = cvrData.virksomhedsform?.find((form: any) => form.periode?.gyldigTil === null);
    return currentForm?.langBeskrivelse || 
           currentForm?.kortBeskrivelse || 
           cvrData.virksomhedsform?.[cvrData.virksomhedsform.length - 1]?.langBeskrivelse ||
           company.legalForm || 
           'Ikke oplyst';
  };

  const getStatus = () => {
    if (!cvrData) return company.status || 'Ikke oplyst';
    
    const currentStatus = cvrData.virksomhedsstatus?.find((status: any) => status.periode?.gyldigTil === null);
    return currentStatus?.status || 
           cvrData.virksomhedsstatus?.[cvrData.virksomhedsstatus.length - 1]?.status ||
           company.status || 
           'Ikke oplyst';
  };

  const getAddress = () => {
    if (!cvrData?.beliggenhedsadresse) {
      return {
        street: company.address || 'Ikke oplyst',
        postal: company.postalCode || '',
        city: company.city || ''
      };
    }
    
    const currentAddress = cvrData.beliggenhedsadresse.find((addr: any) => addr.periode?.gyldigTil === null);
    const addr = currentAddress || cvrData.beliggenhedsadresse[cvrData.beliggenhedsadresse.length - 1];
    
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage}. sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    return {
      street: parts.join(' ') || company.address || 'Ikke oplyst',
      postal: addr.postnummer?.toString() || company.postalCode || '',
      city: addr.postdistrikt || company.city || ''
    };
  };

  const contactInfo = getContactInfo();
  const website = getWebsite();
  const address = getAddress();

  return (
    <AccordionItem value="basic" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="text-lg font-semibold">Grundoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-muted-foreground w-1/3">CVR-nummer</TableCell>
              <TableCell className="font-semibold">{company.cvr}</TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium text-muted-foreground w-1/3">Adresse</TableCell>
              <TableCell className="font-semibold">
                {address.street}, {address.postal} {address.city}
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium text-muted-foreground w-1/3">Startdato</TableCell>
              <TableCell className="font-semibold">{getStartDate()}</TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium text-muted-foreground w-1/3">Virksomhedsform</TableCell>
              <TableCell className="font-semibold">{getLegalForm()}</TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium text-muted-foreground w-1/3">E-mail</TableCell>
              <TableCell>
                {contactInfo.email ? (
                  <a href={`mailto:${contactInfo.email}`} className="font-medium text-primary hover:underline">
                    {contactInfo.email}
                  </a>
                ) : (
                  <span className="font-medium text-muted-foreground">Ikke oplyst</span>
                )}
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium text-muted-foreground w-1/3">Telefon</TableCell>
              <TableCell className="font-semibold">
                {contactInfo.phone || <span className="text-muted-foreground">Ikke oplyst</span>}
              </TableCell>
            </TableRow>
            
            {website && (
              <TableRow>
                <TableCell className="font-medium text-muted-foreground w-1/3">Hjemmeside</TableCell>
                <TableCell>
                  <a 
                    href={website.startsWith('http') ? website : `https://${website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-medium text-primary hover:underline"
                  >
                    {website}
                  </a>
                </TableCell>
              </TableRow>
            )}
            
            <TableRow>
              <TableCell className="font-medium text-muted-foreground w-1/3">Status</TableCell>
              <TableCell className="font-semibold">{getStatus()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BasicInfoAccordion;

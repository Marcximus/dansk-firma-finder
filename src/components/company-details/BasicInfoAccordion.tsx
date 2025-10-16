
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { FileText } from 'lucide-react';

interface BasicInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const BasicInfoAccordion: React.FC<BasicInfoAccordionProps> = ({ company, cvrData }) => {
  // DEBUG: Log the entire cvrData object
  console.log('🔍 DEBUG: cvrData in BasicInfoAccordion:', cvrData);
  console.log('🔍 DEBUG: cvrData?.stiftelsesDato:', cvrData?.stiftelsesDato);
  console.log('🔍 DEBUG: company.realCvrData:', company.realCvrData);
  
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
    console.log('📅 DEBUG getStartDate - Starting...');
    console.log('📅 DEBUG: cvrData exists?', !!cvrData);
    console.log('📅 DEBUG: cvrData?.stiftelsesDato value:', cvrData?.stiftelsesDato);
    
    // Priority 1: Direct stiftelsesDato field from CVR data
    if (cvrData?.stiftelsesDato) {
      console.log('✅ Using stiftelsesDato:', cvrData.stiftelsesDato);
      return formatDate(cvrData.stiftelsesDato);
    }
    console.log('❌ stiftelsesDato not found or empty');
    
    // Priority 2: livsforloeb registration date
    const livsforloebDate = cvrData?.livsforloeb?.[0]?.periode?.gyldigFra;
    console.log('📅 DEBUG: livsforloebDate:', livsforloebDate);
    if (livsforloebDate) {
      console.log('✅ Using livsforloeb date:', livsforloebDate);
      return formatDate(livsforloebDate);
    }
    console.log('❌ livsforloeb date not found');
    
    // Priority 3: Check for FØRSTE_REGNSKABSPERIODE_START in attributter
    console.log('📅 DEBUG: attributter:', cvrData?.attributter);
    const regnskabStart = cvrData?.attributter?.find((attr: any) => 
      attr.type === 'FØRSTE_REGNSKABSPERIODE_START'
    );
    console.log('📅 DEBUG: regnskabStart:', regnskabStart);
    if (regnskabStart?.vaerdier?.[0]?.vaerdi) {
      console.log('✅ Using FØRSTE_REGNSKABSPERIODE_START:', regnskabStart.vaerdier[0].vaerdi);
      return formatDate(regnskabStart.vaerdier[0].vaerdi);
    }
    console.log('❌ FØRSTE_REGNSKABSPERIODE_START not found');
    
    // Priority 4: Fallback to company.yearFounded
    console.log('📅 DEBUG: company.yearFounded:', company.yearFounded);
    if (company.yearFounded) {
      console.log('✅ Using company.yearFounded:', company.yearFounded);
      return company.yearFounded.toString();
    }
    console.log('❌ company.yearFounded not found');
    
    console.log('⚠️ Returning Ikke oplyst - no date found anywhere');
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
        <div className="space-y-2">
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <span>Navn</span>
            <span>{company.name}</span>
          </div>
          
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <span>CVR-nummer</span>
            <span>{company.cvr}</span>
          </div>
          
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <span>Adresse</span>
            <span>{address.street}, {address.postal} {address.city}</span>
          </div>
          
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <span>Startdato</span>
            <span>{getStartDate()}</span>
          </div>
          
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <span>Virksomhedsform</span>
            <span>{getLegalForm()}</span>
          </div>
          
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <span>Email</span>
            <span>
              {contactInfo.email ? (
                <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">
                  {contactInfo.email}
                </a>
              ) : (
                ''
              )}
            </span>
          </div>
          
          {contactInfo.phone && (
            <div className="grid grid-cols-[200px_1fr] gap-4">
              <span>Telefon</span>
              <span>{contactInfo.phone}</span>
            </div>
          )}
          
          {website && (
            <div className="grid grid-cols-[200px_1fr] gap-4">
              <span>Hjemmeside</span>
              <span>
                <a 
                  href={website.startsWith('http') ? website : `https://${website}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  {website}
                </a>
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-[200px_1fr] gap-4">
            <span>Status</span>
            <span>{getStatus()}</span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default BasicInfoAccordion;

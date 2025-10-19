
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { History, FileText, MapPin, AlertCircle } from 'lucide-react';

interface HistoryAccordionProps {
  cvrData: any;
}

const HistoryAccordion: React.FC<HistoryAccordionProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Ukendt';
    try {
      return new Date(dateString).toLocaleDateString('da-DK');
    } catch {
      return dateString;
    }
  };

  const formatAddress = (addr: any) => {
    const parts = [];
    if (addr.vejnavn) parts.push(addr.vejnavn);
    if (addr.husnummerFra) parts.push(addr.husnummerFra);
    if (addr.etage) parts.push(`${addr.etage} sal`);
    if (addr.sidedoer) parts.push(addr.sidedoer);
    
    const streetAddress = parts.join(' ');
    const postalInfo = [addr.postnummer, addr.postdistrikt].filter(Boolean).join(' ');
    
    return `${streetAddress}, ${postalInfo}`;
  };

  const historicalNames = cvrData.navne?.map((navnItem: any) => ({
    period: `${formatDate(navnItem.periode?.gyldigFra)} - ${navnItem.periode?.gyldigTil ? formatDate(navnItem.periode.gyldigTil) : 'Nuværende'}`,
    name: navnItem.navn,
    isCurrent: !navnItem.periode?.gyldigTil
  })).sort((a: any, b: any) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (b.isCurrent && !a.isCurrent) return 1;
    return 0;
  }) || [];

  const historicalAddresses = cvrData.beliggenhedsadresse?.map((addr: any) => ({
    period: `${formatDate(addr.periode?.gyldigFra)} - ${addr.periode?.gyldigTil ? formatDate(addr.periode.gyldigTil) : 'Nuværende'}`,
    address: formatAddress(addr),
    isCurrent: !addr.periode?.gyldigTil
  })).sort((a: any, b: any) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (b.isCurrent && !a.isCurrent) return 1;
    return 0;
  }) || [];

  const statusHistory = cvrData.virksomhedsstatus?.map((status: any) => ({
    period: `${formatDate(status.periode?.gyldigFra)} - ${status.periode?.gyldigTil ? formatDate(status.periode.gyldigTil) : 'Nuværende'}`,
    status: status.status,
    isCurrent: !status.periode?.gyldigTil
  })).sort((a: any, b: any) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (b.isCurrent && !a.isCurrent) return 1;
    return 0;
  }) || [];

  return (
    <AccordionItem value="history" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <History className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Registreringshistorik & Historiske stamdata</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <div className="space-y-2 sm:space-y-4 md:space-y-6">
          {historicalNames.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <FileText className="h-4 w-4" />
                <h4 className="font-semibold text-sm sm:text-base">Historisk navne</h4>
              </div>
              <div className="space-y-2">
                {historicalNames.map((name: any, index: number) => (
                  <div key={index} className={`border-l-2 sm:border-l-4 pl-3 py-1 ${name.isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <div className="font-medium text-xs sm:text-sm break-words">{name.name}</div>
                      <div className="text-xs text-muted-foreground">{name.period}</div>
                    </div>
                    {name.isCurrent && (
                      <div className="text-xs text-green-600 font-medium">Nuværende navn</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {historicalAddresses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <MapPin className="h-4 w-4" />
                <h4 className="font-semibold text-sm sm:text-base">Historiske adresser</h4>
              </div>
              <div className="space-y-2">
                {historicalAddresses.map((addr: any, index: number) => (
                  <div key={index} className={`border-l-2 sm:border-l-4 pl-3 py-1 ${addr.isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div className="font-medium text-xs sm:text-sm break-words flex-1">{addr.address}</div>
                      <div className="text-xs text-muted-foreground">{addr.period}</div>
                    </div>
                    {addr.isCurrent && (
                      <div className="text-xs text-green-600 font-medium">Nuværende adresse</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {statusHistory.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <AlertCircle className="h-4 w-4" />
                <h4 className="font-semibold text-sm sm:text-base">Statushistorik</h4>
              </div>
              <div className="space-y-2">
                {statusHistory.map((status: any, index: number) => (
                  <div key={index} className={`border-l-2 sm:border-l-4 pl-3 py-1 ${status.isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <div className="font-medium text-xs sm:text-sm">{status.status}</div>
                      <div className="text-xs text-muted-foreground">{status.period}</div>
                    </div>
                    {status.isCurrent && (
                      <div className="text-xs text-green-600 font-medium">Nuværende status</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default HistoryAccordion;


import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { History, FileText, MapPin, Building, AlertCircle } from 'lucide-react';

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
    
    return `${streetAddress}\n${postalInfo}`;
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
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <span className="text-lg font-semibold">Registreringshistorik & Historiske stamdata</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-8">
              {historicalNames.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5" />
                    <h4 className="font-semibold">Historisk navne</h4>
                  </div>
                  <div className="space-y-3">
                    {historicalNames.map((name: any, index: number) => (
                      <div key={index} className={`border-l-4 pl-4 ${name.isCurrent ? 'border-green-500' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{name.name}</div>
                            {name.isCurrent && (
                              <div className="text-sm text-green-600 font-medium">Nuværende navn</div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground ml-4">
                            {name.period}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {historicalAddresses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5" />
                    <h4 className="font-semibold">Historiske adresser</h4>
                  </div>
                  <div className="space-y-3">
                    {historicalAddresses.map((addr: any, index: number) => (
                      <div key={index} className={`border-l-4 pl-4 ${addr.isCurrent ? 'border-green-500' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="whitespace-pre-line font-medium">{addr.address}</div>
                            {addr.isCurrent && (
                              <div className="text-sm text-green-600 font-medium">Nuværende adresse</div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground ml-4">
                            {addr.period}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {statusHistory.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <h4 className="font-semibold">Statushistorik</h4>
                  </div>
                  <div className="space-y-3">
                    {statusHistory.map((status: any, index: number) => (
                      <div key={index} className={`border-l-4 pl-4 ${status.isCurrent ? 'border-green-500' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{status.status}</div>
                            {status.isCurrent && (
                              <div className="text-sm text-green-600 font-medium">Nuværende status</div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground ml-4">
                            {status.period}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};

export default HistoryAccordion;

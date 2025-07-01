
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Company } from '@/services/companyAPI';
import { extractExtendedInfo } from '@/services/cvrUtils';
import { Info, Phone, MapPin, Briefcase, Target, TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react';

interface ExtendedInfoAccordionProps {
  company: Company;
  cvrData: any;
}

const ExtendedInfoAccordion: React.FC<ExtendedInfoAccordionProps> = ({ company, cvrData }) => {
  console.log('ExtendedInfoAccordion - Raw CVR Data:', cvrData);
  
  const extendedInfo = extractExtendedInfo(cvrData);
  console.log('ExtendedInfoAccordion - Extracted Info:', extendedInfo);

  const InfoCard = ({ icon: Icon, label, value, fullWidth = false }: {
    icon: any;
    label: string;
    value: string | null;
    fullWidth?: boolean;
  }) => (
    <div className={`bg-gray-50 rounded-lg p-4 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="font-semibold text-gray-900">
        {value || 'Ikke tilgængelig'}
      </div>
    </div>
  );

  const ListCard = ({ icon: Icon, title, items }: {
    icon: any;
    title: string;
    items: any[] | null;
  }) => (
    <div className="bg-gray-50 rounded-lg p-4 col-span-full">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-600">{title}</span>
      </div>
      <div className="space-y-2">
        {items && items.length > 0 ? (
          items.map((item: any, index: number) => (
            <div key={index} className="bg-white rounded p-3 border-l-4 border-blue-200">
              {typeof item === 'string' ? (
                <div className="font-medium text-sm">{item}</div>
              ) : (
                <div>
                  <div className="font-medium text-sm">
                    {item.branchekode} {item.branchetekst}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm">Ingen registreret</div>
        )}
      </div>
    </div>
  );

  const CapitalCard = ({ items }: { items: any[] | null }) => (
    <div className="bg-gray-50 rounded-lg p-4 col-span-full">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-600">Kapitalklasser</span>
      </div>
      <div className="space-y-2">
        {items && items.length > 0 ? (
          items.map((kapital: any, index: number) => (
            <div key={index} className="bg-white rounded p-3 border-l-4 border-green-200">
              <div className="font-medium text-sm">
                {kapital.kapitalklasse || 'Ukendt kapitalklasse'}
              </div>
              {kapital.kapitalbeloeb && (
                <div className="text-gray-600 text-sm">
                  {kapital.kapitalbeloeb.toLocaleString('da-DK')} {kapital.valuta || 'DKK'}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm">Ingen registreret</div>
        )}
      </div>
    </div>
  );

  return (
    <AccordionItem value="extended" className="border rounded-lg">
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span className="text-lg font-semibold">Udvidede virksomhedsoplysninger</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Contact Info */}
          <InfoCard
            icon={Phone}
            label="Telefon"
            value={extendedInfo?.phone}
          />

          <InfoCard
            icon={MapPin}
            label="Kommune"
            value={extendedInfo?.municipality?.kommuneNavn || extendedInfo?.municipality}
          />

          <InfoCard
            icon={Briefcase}
            label="Branchekode"
            value={company.industry}
          />

          {/* Financial & Business Info */}
          <InfoCard
            icon={TrendingUp}
            label="Børsnoteret"
            value={extendedInfo?.isListed !== undefined ? (extendedInfo.isListed ? 'Ja' : 'Nej') : null}
          />

          <InfoCard
            icon={Calendar}
            label="Regnskabsår"
            value={extendedInfo?.accountingYear}
          />

          <InfoCard
            icon={FileText}
            label="Seneste vedtægtsdato"
            value={extendedInfo?.latestStatuteDate}
          />

          <InfoCard
            icon={DollarSign}
            label="Registreret kapital"
            value={extendedInfo?.registeredCapital ? 
              `${extendedInfo.registeredCapital.toLocaleString('da-DK')} DKK` : 
              null
            }
            fullWidth
          />

          {/* Purpose - Full Width */}
          <div className="bg-gray-50 rounded-lg p-4 col-span-full">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Formål</span>
            </div>
            <div className="bg-white rounded p-3 border-l-4 border-blue-200">
              <div className="text-sm leading-relaxed">
                {extendedInfo?.purpose || 'Ikke tilgængelig'}
              </div>
            </div>
          </div>

          {/* Lists */}
          <ListCard
            icon={Info}
            title="Binavne"
            items={extendedInfo?.binavne}
          />

          <ListCard
            icon={Briefcase}
            title="Bibrancher"
            items={extendedInfo?.secondaryIndustries}
          />

          <CapitalCard items={extendedInfo?.capitalClasses} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ExtendedInfoAccordion;

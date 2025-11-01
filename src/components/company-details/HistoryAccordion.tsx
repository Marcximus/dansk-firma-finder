
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { History } from 'lucide-react';
import { CompanyTimeline } from './CompanyTimeline';

interface HistoryAccordionProps {
  cvrData: any;
}

const HistoryAccordion: React.FC<HistoryAccordionProps> = ({ cvrData }) => {
  if (!cvrData) return null;

  return (
    <AccordionItem value="history" className="border rounded-lg">
      <AccordionTrigger className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hover:no-underline">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <History className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Registreringshistorik & Historiske stamdata</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6">
        <CompanyTimeline cvrData={cvrData} />
      </AccordionContent>
    </AccordionItem>
  );
};

export default HistoryAccordion;

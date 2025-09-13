
import React from 'react';
import { Company } from '@/services/companyAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, FileText, Map, Download, Share2 } from 'lucide-react';

interface CompanyHeaderProps {
  company: Company;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company }) => {
  // Function to get appropriate color and display text for status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return { color: 'bg-green-500', text: 'Aktiv' };
      case 'UNDER KONKURS':
        return { color: 'bg-orange-500', text: 'Under konkurs' };
      case 'UNDER LIKVIDATION':
        return { color: 'bg-orange-400', text: 'Under likvidation' };
      case 'OPHØRT':
        return { color: 'bg-gray-500', text: 'Ophørt' };
      case 'UKENDT':
        return { color: 'bg-gray-400', text: 'Ukendt' };
      default:
        // Show full status for dissolved companies and others
        if (status?.includes('OPLØST')) {
          return { color: 'bg-red-500', text: status };
        }
        return { color: 'bg-gray-500', text: status || 'Ukendt' };
    }
  };

  const statusDisplay = getStatusDisplay(company.status);

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 relative">
        <div className="absolute top-4 right-4 text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="lg" className="bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200 px-8 py-4 text-lg">
                Track Dette Selskab
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-64">Få besked på mail når der er ændringer i selskabet, fx nye bestyrelsesmedlemmer, kapital eller regnskaber</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 pr-52">{company.name}</h1>
        <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
          {company.yearFounded && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Etableret: {company.yearFounded}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>CVR: {company.cvr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Map className="h-4 w-4" />
            <span>{company.city}</span>
          </div>
          <Badge className={`${statusDisplay.color} text-white`}>
            {statusDisplay.text}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex gap-1">
            <Download size={16} />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" className="flex gap-1">
            <Share2 size={16} />
            Del
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CompanyHeader;

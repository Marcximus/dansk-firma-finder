
import React from 'react';
import { Company } from '@/services/companyAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Map, Download, Share2 } from 'lucide-react';

interface CompanyHeaderProps {
  company: Company;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company }) => {
  const statusColor = company.status === 'NORMAL' ? 'bg-green-500' : 'bg-gray-500';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{company.name}</h1>
      <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
        {company.yearFounded && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Established: {company.yearFounded}</span>
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
        <Badge className={`${statusColor} text-white`}>
          {company.status === 'NORMAL' ? 'Active' : company.status || 'Unknown'}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="flex gap-1">
          <Download size={16} />
          Download PDF
        </Button>
        <Button variant="outline" size="sm" className="flex gap-1">
          <Share2 size={16} />
          Share
        </Button>
      </div>
    </div>
  );
};

export default CompanyHeader;

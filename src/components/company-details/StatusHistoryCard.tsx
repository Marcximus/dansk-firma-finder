
import React from 'react';
import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusHistoryCardProps {
  cvrData: any;
}

const StatusHistoryCard: React.FC<StatusHistoryCardProps> = ({ cvrData }) => {
  if (!cvrData || !cvrData.virksomhedsstatus) return null;

  const statusHistory = cvrData.virksomhedsstatus || [];
  const lifeHistory = cvrData.livsforloeb || [];

  // Function to get display text for status
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return 'Aktiv';
      case 'OPLØST EFTER ERKLÆRING':
        return 'Opløst efter erklæring';
      case 'OPLØST EFTER KONKURS':
        return 'Opløst efter konkurs';
      case 'UNDER KONKURS':
        return 'Under konkurs';
      case 'UNDER LIKVIDATION':
        return 'Under likvidation';
      default:
        return status;
    }
  };

  // Function to get badge variant for status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return 'default';
      case 'OPLØST EFTER ERKLÆRING':
      case 'OPLØST EFTER KONKURS':
        return 'destructive';
      case 'UNDER KONKURS':
      case 'UNDER LIKVIDATION':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Activity className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Status History</h3>
      </div>
      
      {statusHistory.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Business Status Changes</h4>
          <div className="space-y-3">
            {statusHistory.map((status: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <Badge variant={getStatusVariant(status.status)}>
                    {getStatusDisplay(status.status)}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {status.periode?.gyldigFra || 'Unknown'} - {status.periode?.gyldigTil || 'Present'}
                  </div>
                </div>
                {status.sidstOpdateret && (
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(status.sidstOpdateret).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {lifeHistory.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Company Lifecycle</h4>
          <div className="space-y-2">
            {lifeHistory.map((life: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>Active Period</span>
                <span className="font-medium">
                  {life.periode?.gyldigFra || 'Unknown'} - {life.periode?.gyldigTil || 'Present'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusHistoryCard;

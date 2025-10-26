import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { generateCompanyUrl } from '@/lib/urlUtils';
import { 
  User, Building2, Calendar, Briefcase, ArrowLeft, ArrowRight,
  CheckCircle, XCircle, MapPin, TrendingUp, History, Users, 
  Database, Clock
} from 'lucide-react';

interface PersonDetailsProps {
  personData: {
    personName: string;
    personId?: string | number;
    address?: {
      street: string;
      zipCode: string;
      city: string;
    };
    activeRelations: any[];
    historicalRelations: any[];
    totalCompanies: number;
  };
}

const PersonDetails: React.FC<PersonDetailsProps> = ({ personData }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Ukendt';
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const calculateTotalOwnership = () => {
    let total = 0;
    personData.activeRelations.forEach((relation: any) => {
      relation.roles?.forEach((role: any) => {
        if (role.ownershipPercentage) {
          total += role.ownershipPercentage;
        }
      });
    });
    return total.toFixed(2);
  };

  // Flatten all relations into a single list with role details
  const renderAllRelations = () => {
    const allRelations: any[] = [];
    
    // Process active relations
    personData.activeRelations.forEach((relation: any) => {
      if (relation.roles && relation.roles.length > 0) {
        relation.roles.forEach((role: any) => {
          allRelations.push({
            ...relation,
            role,
            isActive: !role.validTo
          });
        });
      }
    });
    
    // Process historical relations
    personData.historicalRelations.forEach((relation: any) => {
      if (relation.roles && relation.roles.length > 0) {
        relation.roles.forEach((role: any) => {
          allRelations.push({
            ...relation,
            role,
            isActive: false
          });
        });
      }
    });

    if (allRelations.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Ingen tilknytninger fundet</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {allRelations.map((item: any, index: number) => (
          <div 
            key={index}
            className="border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            {/* Single line layout with all info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span 
                  className={`h-2 w-2 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {item.isActive ? 'Aktiv' : 'Ophørt'}
                </span>
              </div>

              {/* Company Name - Clickable */}
              <button
                onClick={() => {
                  if (item.companyCvr && item.companyName) {
                    const url = generateCompanyUrl(item.companyName, item.companyCvr);
                    navigate(url);
                  }
                }}
                className="font-bold text-base hover:text-primary underline-offset-4 hover:underline transition-colors"
              >
                {item.companyName}
              </button>

              {/* CVR - Clickable */}
              <button
                onClick={() => {
                  if (item.companyCvr && item.companyName) {
                    const url = generateCompanyUrl(item.companyName, item.companyCvr);
                    navigate(url);
                  }
                }}
                className="font-mono text-muted-foreground hover:text-primary transition-colors"
              >
                CVR: {item.companyCvr}
              </button>

              {/* Divider */}
              <span className="text-muted-foreground">•</span>

              {/* Role */}
              <span className="text-muted-foreground">
                {item.role.type === 'EJERREGISTER' && 'Ejer'}
                {item.role.type === 'LEDELSE' && (item.role.title || 'Ledelsesmedlem')}
                {!['EJERREGISTER', 'LEDELSE'].includes(item.role.type) && (item.role.title || item.role.type)}
              </span>

              {/* Divider */}
              <span className="text-muted-foreground">•</span>

              {/* Join Date */}
              <span className="text-muted-foreground">
                Tiltrådt: {item.role.validFrom ? formatDate(item.role.validFrom) : 'Ukendt'}
              </span>

              {/* Exit Date */}
              {item.role.validTo && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Fratrådt: {formatDate(item.role.validTo)}
                  </span>
                </>
              )}

              {/* Ownership */}
              {item.role.ownershipPercentage !== undefined && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium">
                    Ejerandel: {item.role.ownershipPercentage.toFixed(2)}%
                  </span>
                </>
              )}

              {/* Voting Rights */}
              {item.role.votingRights !== undefined && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Stemmer: {item.role.votingRights.toFixed(2)}%
                  </span>
                </>
              )}

              {/* Company Status */}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {item.companyStatus || 'Ukendt status'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative container mx-auto px-4 py-8 md:py-12">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6 hover:bg-white/50 dark:hover:bg-white/10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbage til søgning
          </Button>
          
          {/* Person header with avatar */}
          <div className="flex items-start gap-6">
            {/* Avatar with gradient ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-600 blur-lg opacity-50" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
              </div>
            </div>
            
            {/* Name and ID */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 break-words">
                {personData.personName}
              </h1>
              {personData.personId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Badge variant="outline" className="font-mono">
                    ID: {personData.personId}
                  </Badge>
                </div>
              )}
              
              {/* Person address */}
              {personData.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{personData.address.street}</span>
                  <span>•</span>
                  <span>{personData.address.zipCode} {personData.address.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Relations - Flat List */}
      <div className="container mx-auto px-4 py-6">
        {renderAllRelations()}
      </div>

      {/* Data Source Footer */}
      <div className="container mx-auto px-4 py-6 border-t mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Data fra Erhvervsstyrelsen CVR-register</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Opdateret: {new Date().toLocaleDateString('da-DK')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;

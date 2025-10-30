import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { generateCompanyUrl } from '@/lib/urlUtils';
import { 
  User, Building2, Calendar, Briefcase, ArrowLeft, ArrowRight,
  CheckCircle, XCircle, MapPin, TrendingUp, History, Users, 
  Database, Clock, ShieldOff
} from 'lucide-react';

// Map ownership values to percentage ranges
const mapOwnershipToRange = (value: number): string => {
  const percentage = value;
  
  if (percentage < 5) return '0-5%';
  if (percentage < 10) return '5-10%';
  if (percentage < 15) return '10-15%';
  if (percentage < 20) return '15-20%';
  if (percentage < 25) return '20-25%';
  if (percentage < 33.33) return '25-33%';
  if (percentage < 50) return '33-50%';
  if (percentage < 66.67) return '50-67%';
  if (percentage < 90) return '67-90%';
  return '90-100%';
};

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

  // Process relations into active and historical arrays
  const processRelations = () => {
    const activeRelations: any[] = [];
    const historicalRelations: any[] = [];
    
    // Process ALL relations and check each role's validTo field
    const allRelationsSources = [
      ...(personData.activeRelations || []),
      ...(personData.historicalRelations || [])
    ];
    
    allRelationsSources.forEach((relation: any) => {
      if (relation.roles && relation.roles.length > 0) {
        relation.roles.forEach((role: any) => {
          const relationWithRole = {
            ...relation,
            role,
            isActive: !role.validTo // Active if no validTo date
          };
          
          if (role.validTo) {
            // Has validTo date = historical
            historicalRelations.push(relationWithRole);
          } else {
            // No validTo date = active
            activeRelations.push(relationWithRole);
          }
        });
      }
    });

    // Sort active by validFrom date (newest first)
    activeRelations.sort((a, b) => {
      const dateA = a.role.validFrom ? new Date(a.role.validFrom).getTime() : 0;
      const dateB = b.role.validFrom ? new Date(b.role.validFrom).getTime() : 0;
      return dateB - dateA;
    });

    // Sort historical by validTo date (newest first)
    historicalRelations.sort((a, b) => {
      const dateA = a.role.validTo ? new Date(a.role.validTo).getTime() : 0;
      const dateB = b.role.validTo ? new Date(b.role.validTo).getTime() : 0;
      return dateB - dateA;
    });

    return { activeRelations, historicalRelations };
  };

  const renderRelationCard = (item: any, index: number) => (
    <div 
      key={index}
      className="border rounded-lg p-4 transition-all"
    >
      {/* Company Name */}
      <h3 className="text-xl font-bold mb-4">
        <button
          onClick={() => {
            if (item.companyCvr && item.companyName) {
              const url = generateCompanyUrl(item.companyName, item.companyCvr);
              navigate(url);
            }
          }}
          className="hover:text-primary hover:underline transition-colors text-left"
        >
          {item.companyName}
        </button>
      </h3>

      {/* Key-Value Pairs */}
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="text-muted-foreground">CVR-nummer</span>
          <button
            onClick={() => {
              if (item.companyCvr && item.companyName) {
                const url = generateCompanyUrl(item.companyName, item.companyCvr);
                navigate(url);
              }
            }}
            className="font-medium font-mono hover:text-primary hover:underline transition-colors text-left"
          >
            {item.companyCvr}
          </button>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="text-muted-foreground">Tilknyttet som</span>
          <button
            onClick={() => {
              if (item.companyCvr && item.companyName) {
                const url = generateCompanyUrl(item.companyName, item.companyCvr);
                navigate(url);
              }
            }}
            className="font-medium hover:text-primary hover:underline transition-colors text-left"
          >
            {item.role.type === 'EJERREGISTER' && 'Ejer'}
            {item.role.type === 'LEDELSE' && (item.role.title || 'Ledelsesmedlem')}
            {!['EJERREGISTER', 'LEDELSE'].includes(item.role.type) && (item.role.title || item.role.type)}
          </button>
        </div>

        {/* Status Indicator */}
        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="text-muted-foreground">Status</span>
          <button
            onClick={() => {
              if (item.companyCvr && item.companyName) {
                const url = generateCompanyUrl(item.companyName, item.companyCvr);
                navigate(url);
              }
            }}
            className="w-fit hover:opacity-80 transition-opacity"
          >
            <div className={`
              inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full font-medium text-xs
              bg-white dark:bg-gray-900
              ${item.isActive 
                ? 'text-green-600 dark:text-green-400 border border-green-500/40' 
                : 'text-red-600 dark:text-red-400 border border-red-500/40'
              }
            `}>
              <span className={`
                h-1.5 w-1.5 rounded-full animate-pulse
                ${item.isActive ? 'bg-green-500 shadow-md shadow-green-500/50' : 'bg-red-500 shadow-md shadow-red-500/50'}
              `} />
              <span>{item.isActive ? 'Aktiv Relation' : 'Ophørt Relation'}</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-2">
          <span className="text-muted-foreground">Tiltrædelsesdato</span>
          <button
            onClick={() => {
              if (item.companyCvr && item.companyName) {
                const url = generateCompanyUrl(item.companyName, item.companyCvr);
                navigate(url);
              }
            }}
            className="font-medium hover:text-primary hover:underline transition-colors text-left"
          >
            {item.role.validFrom ? formatDate(item.role.validFrom) : 'Ukendt'}
          </button>
        </div>

        {item.role.validTo && (
          <div className="grid grid-cols-[140px_1fr] gap-2">
            <span className="text-muted-foreground">Fratrådt</span>
            <button
              onClick={() => {
                if (item.companyCvr && item.companyName) {
                  const url = generateCompanyUrl(item.companyName, item.companyCvr);
                  navigate(url);
                }
              }}
              className="font-medium hover:text-primary hover:underline transition-colors text-left"
            >
              {formatDate(item.role.validTo)}
            </button>
          </div>
        )}

        {item.role.ownershipPercentage !== undefined && (
          <div className="grid grid-cols-[140px_1fr] gap-2">
            <span className="text-muted-foreground">Ejerandel</span>
            <button
              onClick={() => {
                if (item.companyCvr && item.companyName) {
                  const url = generateCompanyUrl(item.companyName, item.companyCvr);
                  navigate(url);
                }
              }}
              className="font-medium hover:text-primary hover:underline transition-colors text-left"
            >
              {mapOwnershipToRange(item.role.ownershipPercentage)}
            </button>
          </div>
        )}

        {item.role.votingRights !== undefined && (
          <div className="grid grid-cols-[140px_1fr] gap-2">
            <span className="text-muted-foreground">Stemmerettigheder</span>
            <button
              onClick={() => {
                if (item.companyCvr && item.companyName) {
                  const url = generateCompanyUrl(item.companyName, item.companyCvr);
                  navigate(url);
                }
              }}
              className="font-medium hover:text-primary hover:underline transition-colors text-left"
            >
              {item.role.votingRights.toFixed(2)}%
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const { activeRelations, historicalRelations } = processRelations();

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
              {personData.address ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{personData.address.street}</span>
                  {personData.address.zipCode && (
                    <>
                      <span>•</span>
                      <span>{personData.address.zipCode} {personData.address.city}</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldOff className="h-4 w-4 flex-shrink-0" />
                  <span>Adressebeskyttelse</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Relations - Separated into Active and Historical */}
      <div className="container mx-auto px-4 py-6">
        {activeRelations.length === 0 && historicalRelations.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Ingen tilknytninger fundet</p>
          </div>
        ) : (
          <>
            {/* Active Relations Section */}
            {activeRelations.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h2 className="text-2xl font-semibold">
                    Aktive Relationer ({activeRelations.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {activeRelations.map((item, index) => renderRelationCard(item, index))}
                </div>
              </div>
            )}

            {/* Historical Relations Section */}
            {historicalRelations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-2xl font-semibold">
                    Ophørte Relationer ({historicalRelations.length})
                  </h2>
                </div>
                <div className="space-y-4 opacity-80">
                  {historicalRelations.map((item, index) => renderRelationCard(item, index))}
                </div>
              </div>
            )}
          </>
        )}
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

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const renderRelationsTable = (relations: any[], isActive: boolean) => {
    if (!relations || relations.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{isActive ? 'Ingen aktive tilknytninger' : 'Ingen tidligere tilknytninger'}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {relations.map((relation: any, index: number) => (
          <div 
            key={index} 
            className="border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => {
              if (relation.companyCvr && relation.companyName) {
                const url = generateCompanyUrl(relation.companyName, relation.companyCvr);
                navigate(url);
              }
            }}
          >
            {/* Company Header Row */}
            <div className="bg-muted/30 px-4 py-3 border-b">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="font-semibold truncate">{relation.companyName}</div>
                  <Badge variant="outline" className="font-mono text-xs">
                    CVR: {relation.companyCvr}
                  </Badge>
                  {relation.companyStatus === 'NORMAL' ? (
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aktiv
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="opacity-60 text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      {relation.companyStatus}
                    </Badge>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>

            {/* Roles Grid - Spreadsheet Style */}
            {relation.roles && relation.roles.length > 0 && (
              <div className="p-4">
                <div className="space-y-3">
                  {relation.roles.map((role: any, roleIndex: number) => (
                    <div
                      key={roleIndex}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm pb-3 border-b last:border-b-0 last:pb-0"
                    >
                      {/* Role Type */}
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block mb-1">Rolle</span>
                        <div className="flex items-center gap-2">
                          {role.type === 'EJERREGISTER' || role.ownershipPercentage !== undefined ? (
                            <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          )}
                          <span className="font-medium">
                            {role.type === 'EJERREGISTER' && 'Ejer'}
                            {role.type === 'LEDELSE' && (role.title || 'Ledelsesmedlem')}
                            {!['EJERREGISTER', 'LEDELSE'].includes(role.type) && (role.title || role.type)}
                          </span>
                        </div>
                      </div>

                      {/* Ownership */}
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block mb-1">Ejerandel</span>
                        {role.ownershipPercentage !== undefined ? (
                          <span className="font-bold text-purple-700 dark:text-purple-400">
                            {role.ownershipPercentage.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>

                      {/* Voting Rights */}
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block mb-1">Stemmerettigheder</span>
                        {role.votingRights !== undefined ? (
                          <span className="font-bold text-blue-700 dark:text-blue-400">
                            {role.votingRights.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>

                      {/* Period */}
                      <div>
                        <span className="text-xs font-medium text-muted-foreground block mb-1">Periode</span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{role.validFrom ? formatDate(role.validFrom) : 'Ukendt'}</span>
                          <ArrowRight className="h-2.5 w-2.5 flex-shrink-0" />
                          <span>
                            {role.validTo ? formatDate(role.validTo) : (
                              <Badge variant="outline" className="h-4 text-[10px] px-1">Nu</Badge>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* Relations Details - Spreadsheet Style */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats in Simple Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Oversigt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Tilknytninger i alt</span>
                <div className="text-2xl font-bold">{personData.totalCompanies}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Aktive</span>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">{personData.activeRelations.length}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Historiske</span>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{personData.historicalRelations.length}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Samlet ejerskab</span>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">{calculateTotalOwnership()}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Relations */}
        {personData.activeRelations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Aktive tilknytninger ({personData.activeRelations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRelationsTable(personData.activeRelations, true)}
            </CardContent>
          </Card>
        )}

        {/* Historical Relations */}
        {personData.historicalRelations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-amber-600" />
                Historiske tilknytninger ({personData.historicalRelations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRelationsTable(personData.historicalRelations, false)}
            </CardContent>
          </Card>
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

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
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {isActive ? 'Ingen aktive tilknytninger' : 'Ingen tidligere tilknytninger'}
          </p>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {relations.map((relation: any, index: number) => (
          <Card 
            key={index} 
            className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => {
              if (relation.companyCvr && relation.companyName) {
                const url = generateCompanyUrl(relation.companyName, relation.companyCvr);
                navigate(url);
              }
            }}
          >
            <CardContent className="p-0">
              {/* Company Header */}
              <div className="p-4 border-b bg-gradient-to-r from-muted/30 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {relation.companyName}
                      </h3>
                      <Badge variant="outline" className="font-mono text-xs">
                        CVR: {relation.companyCvr}
                      </Badge>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {relation.companyStatus === 'NORMAL' ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aktiv virksomhed
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="opacity-60">
                          <XCircle className="h-3 w-3 mr-1" />
                          {relation.companyStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </div>

              {/* Roles Grid */}
              {relation.roles && relation.roles.length > 0 && (
                <div className="p-4">
                  <div className="grid gap-3">
                    {relation.roles.map((role: any, roleIndex: number) => (
                      <div
                        key={roleIndex}
                        className={`flex items-start gap-4 p-3 rounded-lg border ${
                          role.type === 'EJERREGISTER' || role.ownershipPercentage !== undefined
                            ? 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/30' 
                            : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30'
                        }`}
                      >
                        {/* Role Icon */}
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          role.type === 'EJERREGISTER' || role.ownershipPercentage !== undefined
                            ? 'bg-purple-100 dark:bg-purple-900/30' 
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {role.type === 'EJERREGISTER' || role.ownershipPercentage !== undefined ? (
                            <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        
                        {/* Role Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm mb-1">
                            {role.type === 'EJERREGISTER' && 'Ejer'}
                            {role.type === 'LEDELSE' && (role.title || 'Ledelsesmedlem')}
                            {!['EJERREGISTER', 'LEDELSE'].includes(role.type) && (role.title || role.type)}
                          </p>
                          
                          {/* Ownership metrics */}
                          {(role.ownershipPercentage !== undefined || role.votingRights !== undefined) && (
                            <div className="flex flex-wrap gap-3 mt-2">
                              {role.ownershipPercentage !== undefined && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                                  <span className="text-muted-foreground">Ejerandel:</span>
                                  <span className="font-bold text-purple-700 dark:text-purple-400">
                                    {role.ownershipPercentage.toFixed(2)}%
                                  </span>
                                </div>
                              )}
                              {role.votingRights !== undefined && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  <span className="text-muted-foreground">Stemmer:</span>
                                  <span className="font-bold text-blue-700 dark:text-blue-400">
                                    {role.votingRights.toFixed(2)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Period with better formatting */}
                          {(role.validFrom || role.validTo) && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="font-medium">
                                {role.validFrom ? formatDate(role.validFrom) : 'Ukendt'}
                              </span>
                              <ArrowRight className="h-3 w-3 flex-shrink-0" />
                              <span className="font-medium">
                                {role.validTo ? formatDate(role.validTo) : (
                                  <Badge variant="outline" className="h-5 text-xs">Nuværende</Badge>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Statistics Dashboard */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Companies */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tilknytninger</p>
                  <h3 className="text-3xl font-bold mt-1">{personData.totalCompanies}</h3>
                </div>
                <Building2 className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          {/* Active Relations */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktive</p>
                  <h3 className="text-3xl font-bold mt-1 text-green-600 dark:text-green-500">
                    {personData.activeRelations.length}
                  </h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          {/* Historical Relations */}
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Historiske</p>
                  <h3 className="text-3xl font-bold mt-1 text-amber-600 dark:text-amber-500">
                    {personData.historicalRelations.length}
                  </h3>
                </div>
                <History className="h-8 w-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          {/* Total Ownership */}
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Samlet Ejerskab</p>
                  <h3 className="text-3xl font-bold mt-1 text-purple-600 dark:text-purple-500">
                    {calculateTotalOwnership()}%
                  </h3>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Relations Table View */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aktive ({personData.activeRelations.length})
            </TabsTrigger>
            <TabsTrigger value="historical" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historiske ({personData.historicalRelations.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {renderRelationsTable(personData.activeRelations, true)}
          </TabsContent>
          
          <TabsContent value="historical">
            {renderRelationsTable(personData.historicalRelations, false)}
          </TabsContent>
        </Tabs>
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

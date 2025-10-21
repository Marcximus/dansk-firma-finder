import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { generateCompanyUrl } from '@/lib/urlUtils';
import { User, Building2, Calendar, Percent, Briefcase, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PersonDetailsProps {
  personData: {
    personName: string;
    activeRelations: any[];
    historicalRelations: any[];
    totalCompanies: number;
  };
}

const PersonDetails: React.FC<PersonDetailsProps> = ({ personData }) => {
  const navigate = useNavigate();

  const renderRelations = (relations: any[], isActive: boolean) => {
    if (!relations || relations.length === 0) {
      return (
        <div className="text-muted-foreground text-sm py-4">
          {isActive ? 'Ingen aktive tilknytninger' : 'Ingen tidligere tilknytninger'}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {relations.map((relation: any, index: number) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3">
                {/* Company name and CVR */}
                <div>
                  <button
                    onClick={() => {
                      if (relation.companyCvr && relation.companyName) {
                        const url = generateCompanyUrl(relation.companyName, relation.companyCvr);
                        navigate(url);
                      }
                    }}
                    className="text-lg font-semibold hover:text-primary underline decoration-dotted underline-offset-2 text-left flex items-center gap-2"
                  >
                    <Building2 className="h-5 w-5" />
                    {relation.companyName}
                  </button>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <span>CVR: {relation.companyCvr}</span>
                    <span className="flex items-center gap-1">
                      {relation.companyStatus === 'NORMAL' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Aktiv</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">{relation.companyStatus}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Roles */}
                {relation.roles && relation.roles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {relation.roles.map((role: any, roleIndex: number) => (
                      <div
                        key={roleIndex}
                        className={`border-l-4 ${
                          role.type === 'EJERREGISTER' ? 'border-purple-200' : 'border-blue-200'
                        } pl-3 py-2`}
                      >
                        <div className="flex items-center gap-2 font-medium">
                          <Briefcase className="h-4 w-4" />
                          <span>
                            {role.type === 'EJERREGISTER' && 'Ejer'}
                            {role.type === 'LEDELSE' && (role.title || 'Ledelsesmedlem')}
                            {!['EJERREGISTER', 'LEDELSE'].includes(role.type) && role.type}
                          </span>
                        </div>

                        {/* Ownership details */}
                        {role.ownershipPercentage !== undefined && (
                          <div className="text-sm mt-1 flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            <span>Ejerandel: <span className="font-medium">{role.ownershipPercentage.toFixed(2)}%</span></span>
                          </div>
                        )}
                        {role.votingRights !== undefined && (
                          <div className="text-sm flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            <span>Stemmerettigheder: <span className="font-medium">{role.votingRights.toFixed(2)}%</span></span>
                          </div>
                        )}

                        {/* Period */}
                        {(role.validFrom || role.validTo) && (
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {role.validFrom || 'Ukendt'} - {role.validTo || 'Nuværende'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbage til søgning
      </Button>

      {/* Person header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl">
            <User className="h-8 w-8 text-primary" />
            {personData.personName}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {personData.totalCompanies} {personData.totalCompanies === 1 ? 'tilknytning' : 'tilknytninger'} fundet
          </p>
        </CardHeader>
      </Card>

      {/* Relations */}
      <Accordion type="multiple" defaultValue={['active']} className="space-y-4">
        {/* Active relations */}
        <AccordionItem value="active" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold">
                Aktive tilknytninger ({personData.activeRelations.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {renderRelations(personData.activeRelations, true)}
          </AccordionContent>
        </AccordionItem>

        {/* Historical relations */}
        {personData.historicalRelations.length > 0 && (
          <AccordionItem value="historical" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  Tidligere tilknytninger ({personData.historicalRelations.length})
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              {renderRelations(personData.historicalRelations, false)}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default PersonDetails;

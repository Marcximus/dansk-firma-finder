
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Tag, Building } from 'lucide-react';
import { Company } from '@/services/companyAPI';

interface LegalSectionProps {
  company: Company;
  cvrData: any;
}

const LegalSection: React.FC<LegalSectionProps> = ({ company, cvrData }) => {
  const attributes = cvrData?.attributter || [];
  const businessUnits = cvrData?.penheder || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Juridiske oplysninger
            </CardTitle>
            <CardDescription>Virksomhedsform og beskyttelse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Virksomhedsform</span>
              <div className="font-medium">{company.legalForm || 'Ikke specificeret'}</div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Reklamebeskyttelse</span>
              <div className="font-medium">{cvrData?.reklamebeskyttet ? "Ja" : "Nej"}</div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <div className="font-medium">{company.status}</div>
            </div>

            {company.yearFounded && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Stiftelsesdato</span>
                <div className="font-medium">{company.yearFounded}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Formål
            </CardTitle>
            <CardDescription>Virksomhedens formål og aktiviteter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>Virksomhedsoplysninger fra Erhvervsstyrelsen. Detaljeret formålsbeskrivelse ikke tilgængelig i nuværende datastruktur.</p>
            </div>
            
            <div className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded">
              <strong>Bemærk:</strong> Komplet virksomhedsformål og vedtægter kræver direkte adgang til Erhvervsstyrelsens udvidede CVR-data eller virksomhedsdokumenter.
            </div>
          </CardContent>
        </Card>
      </div>

      {attributes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Virksomhedsattributter
            </CardTitle>
            <CardDescription>Yderligere registrerede oplysninger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attributes.map((attribute: any, index: number) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium text-sm mb-2">
                    {attribute.type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </div>
                  {attribute.vaerdier && attribute.vaerdier.length > 0 && (
                    <div className="space-y-2">
                      {attribute.vaerdier.map((value: any, valueIndex: number) => (
                        <div key={valueIndex} className="text-sm">
                          <div className="font-medium">{value.vaerdi}</div>
                          {value.periode && (
                            <div className="text-muted-foreground">
                              {value.periode.gyldigFra || 'Ukendt'} - {value.periode.gyldigTil || 'Nuværende'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {businessUnits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Produktionsenheder (P-numre)
            </CardTitle>
            <CardDescription>Registrerede forretningsenheder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businessUnits.map((unit: any, index: number) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">P-nummer: {unit.pNummer}</div>
                      <div className="text-sm text-muted-foreground">
                        Aktiv: {unit.periode?.gyldigFra || 'Ukendt'} - {unit.periode?.gyldigTil || 'Nuværende'}
                      </div>
                    </div>
                    {unit.sidstOpdateret && (
                      <div className="text-xs text-muted-foreground">
                        Opdateret: {new Date(unit.sidstOpdateret).toLocaleDateString('da-DK')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LegalSection;

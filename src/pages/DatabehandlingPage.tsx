import React from 'react';
import Layout from '@/components/Layout';
import { Shield, Lock, Eye, FileText, Users, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const DatabehandlingPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Databehandling</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Hvordan vi behandler personoplysninger i overensstemmelse med GDPR
          </p>
          <Badge variant="outline" className="mt-2">
            Opdateret: Januar 2025
          </Badge>
        </div>

        {/* GDPR Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              GDPR Compliance
            </CardTitle>
            <CardDescription>
              Selskabsinfo overholder General Data Protection Regulation (GDPR)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  Dataansvarlig
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Selskabsinfo ApS er dataansvarlig for behandlingen af personoplysninger.
                </p>
                <p className="text-xs text-muted-foreground">
                  CVR: 12345678<br/>
                  Adresse: Eksempelvej 123, 1234 København
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  Databeskyttelsesrådgiver
                </h4>
                <p className="text-sm text-muted-foreground">
                  Du kan kontakte vores databeskyttelsesrådgiver på:
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Email: dpo@selskabsinfo.dk<br/>
                  Telefon: +45 12 34 56 78
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Kategorier af personoplysninger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Oplysninger vi indsamler:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Badge variant="secondary">Kontaktoplysninger</Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                      <li>• Navn og efternavn</li>
                      <li>• E-mailadresse</li>
                      <li>• Telefonnummer</li>
                      <li>• Virksomhedstilknytning</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="secondary">Tekniske oplysninger</Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                      <li>• IP-adresse</li>
                      <li>• Browsertype og version</li>
                      <li>• Besøgstidspunkt</li>
                      <li>• Søgehistorik på platformen</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Formål med databehandling:</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium">Levering af tjenester</p>
                    <p className="text-sm text-muted-foreground">
                      Behandling af søgeforespørgsler og levering af virksomhedsrapporter
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium">Kundesupport</p>
                    <p className="text-sm text-muted-foreground">
                      Besvarelse af henvendelser og teknisk support
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium">Forbedring af tjenester</p>
                    <p className="text-sm text-muted-foreground">
                      Analyse af brugsm��nstre for at forbedre platformen
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Basis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Retsgrundlag for behandling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Kontraktopfyldelse</h4>
                  <p className="text-sm text-muted-foreground">
                    GDPR artikel 6(1)(b) - For levering af vores tjenester
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Legitim interesse</h4>
                  <p className="text-sm text-muted-foreground">
                    GDPR artikel 6(1)(f) - For analyse og forbedringer
                  </p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Samtykke</h4>
                  <p className="text-sm text-muted-foreground">
                    GDPR artikel 6(1)(a) - For markedsføring (hvis relevant)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Videregivelse af data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Vigtig information</h4>
                <p className="text-sm text-red-700">
                  Vi sælger ikke personoplysninger til tredjeparter. Data deles kun i følgende tilfælde:
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Tekniske leverandører</p>
                    <p className="text-sm text-muted-foreground">
                      Hosting, cloud-tjenester og IT-support (med databehandleraftaler)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Lovpligtig videregivelse</p>
                    <p className="text-sm text-muted-foreground">
                      Ved krav fra offentlige myndigheder eller domstole
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Dine rettigheder
            </CardTitle>
            <CardDescription>
              Som registreret har du følgende rettigheder efter GDPR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Ret til indsigt</h4>
                  <p className="text-sm text-muted-foreground">
                    Du kan få oplyst hvilke personoplysninger vi behandler om dig
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Ret til berigtigelse</h4>
                  <p className="text-sm text-muted-foreground">
                    Du kan få rettet forkerte eller ufuldstændige oplysninger
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Ret til sletning</h4>
                  <p className="text-sm text-muted-foreground">
                    Du kan få slettet dine personoplysninger under visse betingelser
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Ret til begrænsning</h4>
                  <p className="text-sm text-muted-foreground">
                    Du kan begrænse behandlingen af dine oplysninger
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Ret til dataportabilitet</h4>
                  <p className="text-sm text-muted-foreground">
                    Du kan få udleveret dine data i et struktureret format
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Ret til indsigelse</h4>
                  <p className="text-sm text-muted-foreground">
                    Du kan gøre indsigelse mod behandling baseret på legitim interesse
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Udøvelse af rettigheder</h4>
              <p className="text-sm text-blue-700 mb-2">
                For at udøve dine rettigheder, kontakt os på:
              </p>
              <p className="text-sm text-blue-700">
                Email: privacy@selskabsinfo.dk<br/>
                Vi svarer inden for 30 dage.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Opbevaringsperioder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Kontaktoplysninger</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Opbevares så længe du er aktiv bruger + 3 år efter sidste aktivitet
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Maks. 5 år
                  </Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Søgedata</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Anonymiseres efter 12 måneder til statistiske formål
                  </p>
                  <Badge variant="outline" className="text-xs">
                    12 måneder
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Kontakt vedrørende databehandling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Selskabsinfo ApS</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Adresse:</strong> Eksempelvej 123, 1234 København</p>
                  <p><strong>Email:</strong> privacy@selskabsinfo.dk</p>
                  <p><strong>Telefon:</strong> +45 12 34 56 78</p>
                  <p><strong>CVR:</strong> 12345678</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Datatilsynet</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Du har ret til at klage til Datatilsynet:
                </p>
                <div className="space-y-1 text-sm">
                  <p><strong>Adresse:</strong> Borgergade 28, 5., 1300 København K</p>
                  <p><strong>Email:</strong> dt@datatilsynet.dk</p>
                  <p><strong>Telefon:</strong> 33 19 32 00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tilbage til forsiden
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default DatabehandlingPage;
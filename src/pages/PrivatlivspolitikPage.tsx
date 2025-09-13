import React from 'react';
import Layout from '@/components/Layout';
import { Shield, Eye, Lock, UserCheck, Mail, Calendar, FileText, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PrivatlivspolitikPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privatlivspolitik og Databehandling</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Hvordan vi behandler dine personoplysninger i overensstemmelse med GDPR
          </p>
          <Badge variant="outline" className="mt-2">
            Opdateret: Januar 2025
          </Badge>
        </div>

        <div className="prose max-w-none">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Din privatlivsbeskyttelse er vigtig for os</h3>
            </div>
            <p className="text-green-800">
              Vi behandler dine personoplysninger sikkert og i overensstemmelse med 
              Databeskyttelsesforordningen (GDPR) og dansk lovgivning.
            </p>
          </div>

          {/* GDPR Compliance Section */}
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

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              1. Dataansvarlig
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-muted-foreground mb-2">
                <strong>Selskabsinfo ApS</strong> er dataansvarlig for behandlingen af dine personoplysninger.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>CVR-nr.: 12345678</p>
                <p>Adresse: Eksempelvej 123, 1234 København</p>
                <p>Email: privacy@selskabsinfo.dk</p>
                <p>Telefon: +45 12 34 56 78</p>
              </div>
            </div>
          </section>

          {/* Enhanced Data Categories Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                2. Kategorier af personoplysninger
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Oplysninger vi indsamler:</h4>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Når du bruger vores website (alle brugere)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Badge variant="secondary">Tekniske oplysninger</Badge>
                          <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                            <li>IP-adresse</li>
                            <li>Browsertype og -version</li>
                            <li>Besøgte sider og klikdata</li>
                            <li>Søgeord og filtre</li>
                            <li>Dato og tidspunkt for besøg</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Når du opretter en konto</h3>
                      <div className="space-y-2">
                        <Badge variant="secondary">Kontaktoplysninger</Badge>
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                          <li>Navn</li>
                          <li>Email-adresse</li>
                          <li>Telefonnummer (valgfrit)</li>
                          <li>Virksomhedsoplysninger (hvis relevant)</li>
                          <li>Adgangskode (krypteret)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Når du kontakter os for rådgivning</h3>
                      <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                        <li>Navn og kontaktoplysninger</li>
                        <li>Virksomhedsoplysninger</li>
                        <li>Spørgsmål og beskrivelser af dit behov</li>
                        <li>Præferencer for kontakt</li>
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
                        Analyse af brugsmønstre for at forbedre platformen
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Formål med behandlingen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 text-blue-600">Levering af tjenester</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                  <li>Tilgå og søge i virksomhedsdata</li>
                  <li>Personalisere din oplevelse</li>
                  <li>Levere premium-funktioner</li>
                  <li>Sende notifikationer og tracking</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 text-green-600">Kundesupport</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                  <li>Besvare spørgsmål og henvendelser</li>
                  <li>Levere teknisk support</li>
                  <li>Håndtere klager</li>
                  <li>Forbedre vores tjenester</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 text-purple-600">Juridisk og regnskabsmæssig rådgivning</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                  <li>Matche dig med rette rådgiver</li>
                  <li>Facilitere kontakt</li>
                  <li>Følge op på henvendelser</li>
                  <li>Kvalitetssikring</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 text-orange-600">Analyse og forbedring</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                  <li>Analysere brug af website</li>
                  <li>Forbedre brugeroplevelsen</li>
                  <li>Udvikle nye funktioner</li>
                  <li>Sikkerhed og svindelprevention</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Enhanced Legal Basis Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                4. Retsgrundlag for behandling
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

                <div className="space-y-3 mt-6">
                  <div className="flex items-start gap-3 p-3 border-l-4 border-blue-200 bg-blue-50">
                    <div className="text-sm">
                      <strong>Samtykke:</strong> Når du opretter en konto eller abonnerer på notifications
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border-l-4 border-green-200 bg-green-50">
                    <div className="text-sm">
                      <strong>Kontraktlig forpligtelse:</strong> Når vi leverer services du har bestilt
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border-l-4 border-yellow-200 bg-yellow-50">
                    <div className="text-sm">
                      <strong>Legitime interesser:</strong> Analyse af websitebrug og forbedring af services
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border-l-4 border-purple-200 bg-purple-50">
                    <div className="text-sm">
                      <strong>Lovpligtig forpligtelse:</strong> Bogføring og andre juridiske krav
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Data Sharing Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                5. Videregivelse af data
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
                      <p className="font-medium">Partnere</p>
                      <p className="text-sm text-muted-foreground">
                        Advokater og revisorer når du anmoder om rådgivning (kun nødvendige oplysninger)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Tekniske leverandører</p>
                      <p className="text-sm text-muted-foreground">
                        Hosting, cloud-tjenester og IT-support (med databehandleraftaler)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
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

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Opbevaring af data</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Kontooplysninger:</strong> Så længe kontoen er aktiv + 2 år</li>
                <li><strong>Transaktionsdata:</strong> 5 år (bogføringskrav)</li>
                <li><strong>Webstatistik:</strong> 2 år (anonymiseret efter 6 måneder)</li>
                <li><strong>Rådgivningshenvendelser:</strong> 3 år</li>
                <li><strong>Markedsføringslister:</strong> Indtil du afmelder dig</li>
              </ul>
            </div>
          </section>

          {/* Enhanced Data Rights Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                7. Dine rettigheder
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

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Cookies og tracking</h2>
            <p className="text-muted-foreground mb-4">
              Vi bruger cookies og lignende teknologier til at forbedre din oplevelse:
            </p>
            <div className="space-y-3">
              <div className="border-l-4 border-green-400 pl-4 bg-green-50 p-3 rounded-r-lg">
                <strong>Nødvendige cookies:</strong> Sikrer grundlæggende funktionalitet (kan ikke fravælges)
              </div>
              <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded-r-lg">
                <strong>Funktionelle cookies:</strong> Gemmer dine præferencer og indstillinger
              </div>
              <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 p-3 rounded-r-lg">
                <strong>Analytiske cookies:</strong> Hjælper os med at forstå, hvordan websitet bruges
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              9. Kontakt om privatlivsbeskyttelse
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-muted-foreground mb-3">
                Hvis du har spørgsmål om vores behandling af personoplysninger eller vil udøve dine rettigheder:
              </p>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>Email:</strong> privacy@selskabsinfo.dk</p>
                <p><strong>Telefon:</strong> +45 12 34 56 78</p>
                <p><strong>Post:</strong> Selskabsinfo ApS, Att: Databeskyttelse, Eksempelvej 123, 1234 København</p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Du kan også klage til Datatilsynet, hvis du mener, vi behandler dine oplysninger forkert.
              </p>
            </div>
          </section>

          {/* Additional Contact Section */}
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
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Sidst opdateret: 1. januar 2025
            </span>
          </div>
          <Button asChild>
            <Link to="/">Tilbage til forsiden</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PrivatlivspolitikPage;
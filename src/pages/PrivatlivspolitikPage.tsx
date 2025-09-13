import React from 'react';
import Layout from '@/components/Layout';
import { Shield, Eye, Lock, UserCheck, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PrivatlivspolitikPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privatlivspolitik</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Hvordan vi behandler dine personoplysninger i overensstemmelse med GDPR
          </p>
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

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              2. Hvilke personoplysninger indsamler vi?
            </h2>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Når du bruger vores website (alle brugere)</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>IP-adresse</li>
                  <li>Browsertype og -version</li>
                  <li>Besøgte sider og klikdata</li>
                  <li>Søgeord og filtre</li>
                  <li>Dato og tidspunkt for besøg</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Når du opretter en konto</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Navn</li>
                  <li>Email-adresse</li>
                  <li>Telefonnummer (valgfrit)</li>
                  <li>Virksomhedsoplysninger (hvis relevant)</li>
                  <li>Adgangskode (krypteret)</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Når du kontakter os for rådgivning</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Navn og kontaktoplysninger</li>
                  <li>Virksomhedsoplysninger</li>
                  <li>Spørgsmål og beskrivelser af dit behov</li>
                  <li>Præferencer for kontakt</li>
                </ul>
              </div>
            </div>
          </section>

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

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Retsgrundlag for behandling</h2>
            <div className="space-y-3">
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
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Videregivelse til tredjeparter</h2>
            <p className="text-muted-foreground mb-4">
              Vi videregiver kun dine personoplysninger til tredjeparter i følgende tilfælde:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>
                <strong>Partnere:</strong> Advokater og revisorer når du anmoder om rådgivning 
                (kun nødvendige oplysninger)
              </li>
              <li>
                <strong>Leverandører:</strong> IT-tjenester, hosting og betalingsbehandling 
                (databehandleraftaler på plads)
              </li>
              <li>
                <strong>Myndigheder:</strong> Når vi er juridisk forpligtet hertil
              </li>
            </ul>
          </section>

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

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Dine rettigheder</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Indsigtsret</h3>
                <p className="text-sm text-muted-foreground">
                  Du kan få oplyst, hvilke personoplysninger vi behandler om dig
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Ret til berigtigelse</h3>
                <p className="text-sm text-muted-foreground">
                  Du kan få rettet forkerte eller incomplete oplysninger
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Ret til sletning</h3>
                <p className="text-sm text-muted-foreground">
                  Du kan få slettet dine oplysninger under visse omstændigheder
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Ret til dataportabilitet</h3>
                <p className="text-sm text-muted-foreground">
                  Du kan få dine data udleveret i et struktureret format
                </p>
              </div>
            </div>
          </section>

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
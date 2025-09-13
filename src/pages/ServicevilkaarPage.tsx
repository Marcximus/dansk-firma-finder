import React from 'react';
import Layout from '@/components/Layout';
import { FileText, Calendar, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServicevilkaarPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Servicevilkår</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gældende fra 1. januar 2025
          </p>
        </div>

        <div className="prose max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Vigtig information</h3>
            </div>
            <p className="text-blue-800">
              Ved brug af Selskabsinfo accepterer du følgende servicevilkår. 
              Læs dem grundigt igennem før du benytter vores tjenester.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Generelle bestemmelser</h2>
            <p className="text-muted-foreground mb-4">
              Disse servicevilkår gælder for al brug af Selskabsinfo's website og tjenester. 
              Ved at tilgå eller bruge vores tjenester accepterer du at være bundet af disse vilkår.
            </p>
            <p className="text-muted-foreground">
              Vi forbeholder os ret til at ændre disse vilkår til enhver tid. 
              Ændringer træder i kraft ved offentliggørelse på denne side.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Tjenestebeskrivelse</h2>
            <p className="text-muted-foreground mb-4">
              Selskabsinfo leverer adgang til offentligt tilgængelige virksomhedsoplysninger 
              fra CVR-registeret og andre officielle danske datakilder.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Vores tjenester omfatter:</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Søgning i danske virksomheder</li>
                <li>Visning af grundlæggende virksomhedsoplysninger</li>
                <li>Finansielle nøgletal og regnskabsdata</li>
                <li>Ledelses- og ejerskabsoplysninger</li>
                <li>Historiske data og ændringer</li>
                <li>Tracking og notifikationer (premium)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Databrug og ansvar</h2>
            <p className="text-muted-foreground mb-4">
              Alle oplysninger på Selskabsinfo stammer fra offentligt tilgængelige kilder. 
              Vi bestræber os på at levere korrekte og opdaterede data, men kan ikke garantere 100% nøjagtighed.
            </p>
            <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 p-4 rounded-r-lg">
              <h3 className="font-medium mb-2 text-yellow-800">Ansvarsfraskrivelse</h3>
              <p className="text-yellow-800">
                Selskabsinfo påtager sig ikke ansvar for fejl eller mangler i data, 
                eller for tab der måtte opstå som følge af brug af vores tjenester.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Brugerkonto og betaling</h2>
            <p className="text-muted-foreground mb-4">
              Grundlæggende søgning er gratis. Premium-funktioner kræver oprettelse af konto og betaling.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Gratis tjenester</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Grundlæggende virksomhedssøgning</li>
                  <li>Visning af CVR-oplysninger</li>
                  <li>Begrænsede regnskabsdata</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Premium-tjenester</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Ubegrænset søgning</li>
                  <li>Detaljerede finansielle rapporter</li>
                  <li>Tracking og notifikationer</li>
                  <li>API-adgang</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Forbud og begrænsninger</h2>
            <p className="text-muted-foreground mb-4">Ved brug af vores tjenester forpligter du dig til ikke at:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
              <li>Bruge data til ulovlige formål</li>
              <li>Videresælge eller redistribuere data uden tilladelse</li>
              <li>Forsøge at omgå tekniske begrænsninger</li>
              <li>Overbelaste vores systemer med automatiserede opkald</li>
              <li>Bruge data til spam eller uønsket markedsføring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Privatlivsbeskyttelse</h2>
            <p className="text-muted-foreground">
              Vores behandling af personoplysninger er beskrevet i detaljer i vores{' '}
              <Link to="/privatlivspolitik" className="text-primary hover:underline">
                privatlivspolitik
              </Link>
              . Vi følger alle gældende GDPR-regler.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Opsigelse og suspension</h2>
            <p className="text-muted-foreground mb-4">
              Vi forbeholder os ret til at suspendere eller opsige adgang til vores tjenester 
              ved overtrædelse af disse vilkår eller ved misbrug.
            </p>
            <p className="text-muted-foreground">
              Du kan til enhver tid opsige dit abonnement ved at kontakte os eller 
              gennem din kontoside.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Kontakt og klager</h2>
            <p className="text-muted-foreground mb-4">
              Hvis du har spørgsmål til disse servicevilkår eller ønsker at indgive en klage, 
              kan du kontakte os:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-muted-foreground mb-2">
                <strong>Email:</strong> servicevilkaar@selskabsinfo.dk
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Telefon:</strong> +45 12 34 56 78
              </p>
              <p className="text-muted-foreground">
                <strong>Adresse:</strong> Selskabsinfo ApS, Eksempelvej 123, 1234 København
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

export default ServicevilkaarPage;
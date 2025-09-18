import React from 'react';
import Layout from '@/components/Layout';
import { FileText, Calendar, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const ServicevilkaarPage: React.FC = () => {
  return (
    <Layout>
      <SEO 
        title="Servicevilkår og Brugsvilkår | SelskabsInfo"
        description="Læs SelskabsInfos servicevilkår og brugsvilkår. Vigtige oplysninger om brug af vores tjenester og ansvar."
        canonicalUrl="https://selskabsinfo.dk/servicevilkaar"
        keywords="servicevilkår, brugsvilkår, ansvar, tjenestebetingelser"
      />
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
              Alle oplysninger på Selskabsinfo stammer fra offentligt tilgængelige kilder, primært CVR-registeret 
              og andre officielle danske myndigheder. Vi behandler og præsenterer disse data i god tro, 
              men kan ikke garantere fuldstændig nøjagtighed, aktualitet eller fuldstændighed.
            </p>
            
            <div className="border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded-r-lg mb-6">
              <h3 className="font-medium mb-3 text-red-800">VIGTIG ANSVARSFRASKRIVELSE</h3>
              <p className="text-red-800 mb-3">
                <strong>Selskabsinfo kan under ingen omstændigheder holdes ansvarspådragende</strong> hvis en virksomhed, 
                organisation eller person træffer forretningsmæssige, juridiske eller finansielle beslutninger 
                baseret på de oplysninger, der leveres gennem vores platform.
              </p>
              <p className="text-red-800 mb-3">
                Alle oplysninger leveret af Selskabsinfo skal betragtes som vejledende og må aldrig stå alene 
                som grundlag for vigtige beslutninger. Vi fraråder kraftigt at træffe væsentlige forretningsmæssige 
                eller juridiske beslutninger udelukkende baseret på vores data.
              </p>
              <p className="text-red-800">
                <strong>Professionel rådgivning er påkrævet:</strong> Alle oplysninger bør altid verificeres og 
                suppleres med professionel rådgivning fra kvalificerede eksperter inden anvendelse.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">Selskabsinfo påtager sig ikke ansvar for:</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Fejl, unøjagtigheder eller mangler i præsenterede data</li>
                <li>Forsinkelser i opdatering af oplysninger fra officielle kilder</li>
                <li>Tab eller skader opstået som følge af brug af vores tjenester</li>
                <li>Beslutninger truffet på baggrund af vores oplysninger</li>
                <li>Tekniske fejl, nedetid eller utilgængelighed</li>
                <li>Uautoriseret adgang til eller misbrug af data</li>
                <li>Konsekvenser af tredjeparters handlinger baseret på vores data</li>
              </ul>
            </div>

            <p className="text-muted-foreground">
              Brugeren accepterer fuld ansvar for enhver brug af oplysningerne og erkender, 
              at alle data leveres "som de er" uden nogen form for garanti eller løfte om egnethed til specifikke formål.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Krav om professionel verifikation</h2>
            <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-4 rounded-r-lg mb-4">
              <h3 className="font-medium mb-2 text-orange-800">OBLIGATORISK PROFESSIONEL GENNEMGANG</h3>
              <p className="text-orange-800">
                <strong>Alle oplysninger fra Selskabsinfo SKAL altid gennemgås og verificeres af relevante, 
                kvalificerede professionelle rådgivere før anvendelse til forretningsmæssige eller juridiske formål.</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Påkrævet juridisk rådgivning
                </h3>
                <p className="text-muted-foreground mb-2">
                  <strong>Alle selskabsretlige forhold SKAL verificeres af:</strong>
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Advokat med specialisering i selskabsret</li>
                  <li>Juridisk rådgiver med CVR/selskabserfaring</li>
                  <li>Statsautoriseret revisor for finansielle forhold</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Påkrævet finansiel rådgivning  
                </h3>
                <p className="text-muted-foreground mb-2">
                  <strong>Alle finansielle oplysninger SKAL verificeres af:</strong>
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Statsautoriseret revisor</li>
                  <li>Registreret revisor med relevant erfaring</li>
                  <li>Certificeret økonomisk rådgiver</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium mb-2 text-yellow-800">Særlige forhold der kræver professionel verifikation:</h3>
              <ul className="list-disc pl-5 text-yellow-800 space-y-1">
                <li>Due diligence undersøgelser forud for opkøb eller fusioner</li>
                <li>Kreditvurderinger og långivning</li>
                <li>Investeringsbeslutninger og kapitalallokering</li>
                <li>Juridiske procedurer og retssager</li>
                <li>Kontraktuelle forhandlinger og aftaler</li>
                <li>Compliance og regulatoriske forhold</li>
                <li>Skattemæssige dispositioner</li>
                <li>Forsikringsforhold og risikovurdering</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Brugerkonto og betaling</h2>
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
            <h2 className="text-xl font-semibold mb-4">6. Forbud og begrænsninger</h2>
            <p className="text-muted-foreground mb-4">Ved brug af vores tjenester forpligter du dig til ikke at:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2 mb-4">
              <li>Bruge data til ulovlige formål eller i strid med gældende lovgivning</li>
              <li>Videresælge, redistribuere eller kommercielt udnytte data uden skriftlig tilladelse</li>
              <li>Forsøge at omgå tekniske begrænsninger, sikkerhedsforanstaltninger eller adgangskontroller</li>
              <li>Overbelaste vores systemer med automatiserede opkald, scraping eller DOS-angreb</li>
              <li>Bruge data til spam, uønsket markedsføring eller krænkelse af privatlivets fred</li>
              <li>Fremstille eller distribuere vildledende information baseret på vores data</li>
              <li>Bruge tjenesten til konkurrerende eller skadelige formål</li>
              <li>Overtræde immaterielle rettigheder tilhørende Selskabsinfo eller tredjeparter</li>
            </ul>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium mb-2 text-red-800">Særlige begrænsninger for forretningsmæssig brug:</h3>
              <ul className="list-disc pl-5 text-red-800 space-y-1">
                <li>Data må ikke bruges som eneste grundlag for kreditbeslutninger</li>
                <li>Oplysninger må ikke videregives til offentlige myndigheder som dokumentation uden verifikation</li>
                <li>Data må ikke bruges til automatisk beslutningstagning med juridiske konsekvenser</li>
                <li>Oplysninger må ikke bruges til chikane eller forfølgelse af personer eller virksomheder</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Privatlivsbeskyttelse</h2>
            <p className="text-muted-foreground">
              Vores behandling af personoplysninger er beskrevet i detaljer i vores{' '}
              <Link to="/privatlivspolitik" className="text-primary hover:underline">
                privatlivspolitik
              </Link>
              . Vi følger alle gældende GDPR-regler.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Opsigelse og suspension</h2>
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
            <h2 className="text-xl font-semibold mb-4">9. Kontakt og klager</h2>
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
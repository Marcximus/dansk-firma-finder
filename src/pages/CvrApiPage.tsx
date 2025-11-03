import React from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import JSONLDScript, { createServiceSchema } from '@/components/JSONLDScript';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  Database, 
  Zap, 
  GitBranch, 
  FileSearch, 
  Globe, 
  CheckCircle2,
  Mail,
  Copy
} from 'lucide-react';

const CvrApiPage = () => {
  const [copied, setCopied] = React.useState(false);

  const exampleResponse = `{
  "cvr": 12345678,
  "navn": "Eksempel A/S",
  "adresse": {
    "vejnavn": "Eksempelvej",
    "husnummer": "42",
    "postnummer": 1234,
    "by": "København"
  },
  "branche": {
    "kode": "620100",
    "beskrivelse": "Computerprogrammering"
  },
  "status": "NORMAL",
  "stiftelsesdato": "2020-01-15",
  "telefon": "+45 12 34 56 78",
  "email": "kontakt@eksempel.dk",
  "hjemmeside": "https://eksempel.dk",
  "medarbejdere": {
    "antal": 25,
    "interval": "20-49"
  },
  "ledelse": [
    {
      "rolle": "Direktør",
      "navn": "Lars Nielsen",
      "startdato": "2020-01-15"
    }
  ],
  "regnskabsdata": {
    "seneste_år": 2023,
    "omsætning": 15000000,
    "resultat": 2500000,
    "egenkapital": 8000000
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exampleResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "Veldokumenteret API",
      description: "Vores online dokumentation indeholder alt det, du måtte få brug for, når der skal integreres CVR-data ind i jeres eget system. Eksempelvis indeholder dokumentationen interaktive eksempler over data, der kan returneres fra hvert endpoint."
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "Rådata fra CVR",
      description: "Vi tilbyder et API med rådata direkte fra Virks CVR-løsning. Rådata sikrer dig, hvis du (meget imod forventning) i fremtiden skulle ønske at skifte til deres officielle løsning."
    },
    {
      icon: <GitBranch className="h-8 w-8 text-primary" />,
      title: "Ejerskabshierarki",
      description: "Vi tilbyder et API med information om ejerskabshierarki, så du med et enkelt kald kan hente information om samtlige ejere eller datterselskaber, hele vejen op eller ned i hierarkiet."
    },
    {
      icon: <FileSearch className="h-8 w-8 text-primary" />,
      title: "Segmentering",
      description: "Vi tilbyder et pagineret API til segmentering af virksomheder, som eksempelvis kan benyttes til at finde potentielle kunder. Filtrer virksomheder på bl.a. branchekode, lokation, ansatte og stiftelsesdato."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Postman Dokumentation",
      description: "Hvis du benytter Postman, kan du med fordel prøve vores Postman-dokumentation. Den tillader dig at komme hurtigt igang med at teste vores endpoints, så du kan se om vores API er noget for dig!"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "OpenAPI Spec",
      description: "Vi tilbyder en OpenAPI 3.0 specifikation over alle vores endpoints. Den kan eksempelvis benyttes til automatisk kodegenerering af klienter i jeres foretrukne sprog."
    }
  ];

  const steps = [
    { number: "1", title: "Opret konto", description: "Opret din konto hos SelskabsInfo" },
    { number: "2", title: "Vælg prøveabonnement", description: "Start med vores fleksible prøveabonnement" },
    { number: "3", title: "Opret API key", description: "Generer din API-nøgle i kontrolpanelet" },
    { number: "4", title: "Integrer med vores API", description: "Begynd at hente CVR-data med det samme" }
  ];

  const dataPoints = [
    "Standardinformation (CVR-nr., navn, adresse, branche, status osv.)",
    "Opdaterede telefonnumre (data fra teleoperatører)",
    "Regnskabstal med flere års historik",
    "Rolleoplysninger (bestyrelse, direktion, revisor)",
    "Koncernhierarki",
    "Tegningsregler"
  ];

  const serviceSchema = createServiceSchema({
    name: "SelskabsInfo CVR API",
    description: "REST API til integration af dagligt opdateret CVR virksomhedsdata i dine IT-systemer"
  });

  return (
    <Layout>
      <SEO 
        title="CVR API - Integrer virksomhedsdata i dit system | SelskabsInfo"
        description="Få omgående adgang til data fra CVR-registret med et simpelt og veldokumenteret REST API. Undgå ansøgninger, ventetider og komplekse integrationer."
        keywords="CVR API, virksomhedsdata API, CVR integration, REST API, JSON API, virksomhedsoplysninger API"
        canonicalUrl="https://selskabsinfo.dk/cvr-api"
      />
      <JSONLDScript data={serviceSchema} />

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 md:space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-4 sm:space-y-6 py-8 sm:py-12">
          <Badge variant="secondary" className="mb-4">API Integration</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            SelskabsInfo CVR API – enkelt, pålideligt og hurtigt
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Integrer dagligt opdateret virksomhedsinformation i dine IT-systemer og applikationer på en standardiseret måde. Data er tilgængelig som JSON og XML.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Badge variant="outline" className="text-sm">REST API</Badge>
            <Badge variant="outline" className="text-sm">JSON & XML</Badge>
            <Badge variant="outline" className="text-sm">Dagligt opdateret</Badge>
            <Badge variant="outline" className="text-sm">OpenAPI 3.0</Badge>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted/30 rounded-lg p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Simpel adgang til data fra CVR</h2>
          <p className="text-center text-lg mb-6 text-muted-foreground max-w-3xl mx-auto">
            Vi gør det let, hurtigt og billigt at komme i gang med at integrere CVR data i dit eget system!
          </p>
          <p className="text-center text-base text-muted-foreground max-w-3xl mx-auto">
            Få omgående adgang til data fra CVR-registret med et simpelt og veldokumenteret REST API, og undgå ansøgninger, ventetider og integrationer med Virks sparsomt dokumenterede Elastic Search endpoints!
          </p>
        </section>

        {/* Quick Start Steps */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Kom i gang med det samme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 text-8xl font-bold text-primary/5">
                  {step.number}
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {step.number}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Vi tilbyder</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* API Example Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Eksempel på API-respons</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Se hvordan data returneres fra vores API i JSON-format
          </p>
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  GET /api/company/12345678
                </CardTitle>
                <CardDescription className="mt-2">
                  Eksempel på respons ved opslag af virksomhed
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Kopieret!' : 'Kopiér'}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
                <code className="text-foreground font-mono">
                  {exampleResponse}
                </code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Available Data Section */}
        <section className="bg-muted/30 rounded-lg p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Oplysninger leveret via API</h2>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4">
              {dataPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="text-center space-y-6 py-8 sm:py-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 sm:p-8 md:p-12">
          <Mail className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-2xl sm:text-3xl font-bold">Spørgsmål og idéer?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hvis du har spørgsmål eller idéer til specifik funktionalitet, er du mere end velkommen til at skrive til os.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild>
              <a href="mailto:kontakt@cvr.dev">
                Kontakt os på kontakt@cvr.dev
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Vi svarer typisk inden for 24 timer og hjælper gerne med at finde den rette løsning til jeres behov.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default CvrApiPage;

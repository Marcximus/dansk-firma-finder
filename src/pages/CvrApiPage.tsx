import React from 'react';
import { Link } from 'react-router-dom';
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
  "binavne": [
    {
      "navn": "Eksempel Technology",
      "periode": {
        "fra": "2021-03-15",
        "til": null
      }
    }
  ],
  "virksomhedsform": {
    "kode": "80",
    "beskrivelse": "Aktieselskab",
    "ansvarligDataleverandoer": "Erhvervsstyrelsen"
  },
  "status": {
    "kode": "NORMAL",
    "beskrivelse": "Normal",
    "sidstOpdateret": "2024-01-15T10:30:00Z"
  },
  "stiftelsesdato": "2020-01-15",
  "reklamebeskyttet": false,
  "kontaktoplysninger": {
    "telefon": [
      {
        "nummer": "+45 12 34 56 78",
        "type": "Primær",
        "valideret": true
      },
      {
        "nummer": "+45 98 76 54 32",
        "type": "Support",
        "valideret": true
      }
    ],
    "email": [
      {
        "adresse": "kontakt@eksempel.dk",
        "type": "Primær"
      },
      {
        "adresse": "support@eksempel.dk",
        "type": "Support"
      }
    ],
    "hjemmeside": [
      "https://eksempel.dk",
      "https://eksempel.com"
    ]
  },
  "adresser": {
    "primær": {
      "vejnavn": "Eksempelvej",
      "husnummer": "42",
      "etage": "3",
      "sidedør": "tv",
      "postnummer": 1234,
      "by": "København K",
      "kommune": {
        "kode": "0101",
        "navn": "København"
      },
      "landekode": "DK",
      "coNavn": null,
      "beliggenhedsadresse": true,
      "periode": {
        "fra": "2020-01-15",
        "til": null
      }
    },
    "tidligere": [
      {
        "vejnavn": "Gammel Vej",
        "husnummer": "10",
        "postnummer": 2300,
        "by": "København S",
        "periode": {
          "fra": "2018-01-01",
          "til": "2020-01-14"
        }
      }
    ]
  },
  "branche": {
    "hovedbranche": {
      "kode": "620100",
      "beskrivelse": "Computerprogrammering",
      "periode": {
        "fra": "2020-01-15",
        "til": null
      }
    },
    "bibranche": [
      {
        "kode": "620200",
        "beskrivelse": "Konsulentbistand vedrørende informationsteknologi",
        "periode": {
          "fra": "2021-06-01",
          "til": null
        }
      },
      {
        "kode": "631110",
        "beskrivelse": "Databehandling, webhosting og lignende serviceydelser",
        "periode": {
          "fra": "2022-01-01",
          "til": null
        }
      }
    ]
  },
  "medarbejdere": {
    "antalAnsatte": 25,
    "antalAnsatteInterval": {
      "nedre": 20,
      "øvre": 49
    },
    "antalInklusivEjere": 27,
    "årsværk": 23.5,
    "periode": "2023-12-31",
    "historik": [
      {
        "år": 2023,
        "antal": 25,
        "interval": "20-49"
      },
      {
        "år": 2022,
        "antal": 18,
        "interval": "10-19"
      },
      {
        "år": 2021,
        "antal": 12,
        "interval": "10-19"
      }
    ]
  },
  "kapital": {
    "aktiekapital": {
      "beløb": 500000,
      "valuta": "DKK",
      "sidstOpdateret": "2023-06-15"
    },
    "egenkapital": {
      "beløb": 8500000,
      "valuta": "DKK",
      "regnskabsår": 2023
    },
    "kapitalklasser": [
      {
        "type": "A-aktier",
        "stemmerPerAktie": 10,
        "antal": 25000,
        "pålydende": 10
      },
      {
        "type": "B-aktier",
        "stemmerPerAktie": 1,
        "antal": 25000,
        "pålydende": 10
      }
    ]
  },
  "ejere": [
    {
      "navn": "Holding Company ApS",
      "cvr": 87654321,
      "ejerandel": 75.5,
      "stemmeret": 85.0,
      "type": "Juridisk person",
      "registreret": "2020-01-15"
    },
    {
      "navn": "Investment Fund A/S",
      "cvr": 11223344,
      "ejerandel": 15.0,
      "stemmeret": 8.0,
      "type": "Juridisk person",
      "registreret": "2022-03-10"
    }
  ],
  "ledelse": {
    "direktion": [
      {
        "navn": "Lars Nielsen",
        "funktion": "Administrerende direktør",
        "startdato": "2020-01-15",
        "slutdato": null,
        "tegningsregel": "Direktionen tegner selskabet hver for sig"
      },
      {
        "navn": "Maria Jensen",
        "funktion": "Teknisk direktør",
        "startdato": "2021-06-01",
        "slutdato": null
      }
    ],
    "bestyrelse": [
      {
        "navn": "Peter Andersen",
        "funktion": "Bestyrelsesformand",
        "startdato": "2020-01-15",
        "slutdato": null
      },
      {
        "navn": "Anna Christensen",
        "funktion": "Bestyrelsesmedlem",
        "startdato": "2020-01-15",
        "slutdato": null
      },
      {
        "navn": "Henrik Larsen",
        "funktion": "Bestyrelsesmedlem",
        "startdato": "2021-04-01",
        "slutdato": null
      },
      {
        "navn": "Sophie Hansen",
        "funktion": "Bestyrelsessuppleant",
        "startdato": "2022-01-15",
        "slutdato": null
      }
    ],
    "revisor": [
      {
        "navn": "BDO Statsautoriseret revisionsaktieselskab",
        "cvr": 99887766,
        "type": "Godkendt revisionsvirksomhed",
        "startdato": "2020-01-15",
        "slutdato": null
      }
    ],
    "tidligere": [
      {
        "navn": "Ole Thomsen",
        "funktion": "Bestyrelsesmedlem",
        "startdato": "2020-01-15",
        "slutdato": "2021-03-31"
      }
    ]
  },
  "regnskab": {
    "regnskabsperiode": {
      "start": "01-01",
      "slut": "12-31"
    },
    "regnskabsklasse": "B",
    "revisionsklasse": "pålagt",
    "seneste": {
      "år": 2023,
      "omsætning": 25000000,
      "bruttofortjeneste": 18000000,
      "driftsresultat": 3500000,
      "ordinærtResultat": 3200000,
      "årsresultat": 2500000,
      "egenkapital": 8500000,
      "sumAktiver": 15000000,
      "kortfristetGæld": 4000000,
      "langfristetGæld": 2500000,
      "gældsgrad": 0.76,
      "soliditetsgrad": 56.7,
      "afkastningsgrad": 21.3,
      "egenkapitalforrentning": 29.4,
      "overskudsgrad": 12.8,
      "likviditetsgrad": 1.85
    },
    "historik": [
      {
        "år": 2023,
        "omsætning": 25000000,
        "årsresultat": 2500000,
        "egenkapital": 8500000,
        "medarbejdere": 25
      },
      {
        "år": 2022,
        "omsætning": 18000000,
        "årsresultat": 1800000,
        "egenkapital": 6000000,
        "medarbejdere": 18
      },
      {
        "år": 2021,
        "omsætning": 12000000,
        "årsresultat": 1200000,
        "egenkapital": 4200000,
        "medarbejdere": 12
      },
      {
        "år": 2020,
        "omsætning": 8000000,
        "årsresultat": 800000,
        "egenkapital": 3000000,
        "medarbejdere": 8
      }
    ]
  },
  "koncernforhold": {
    "modervirksomhed": {
      "navn": "Holding Company ApS",
      "cvr": 87654321,
      "land": "Danmark"
    },
    "datterselskaber": [
      {
        "navn": "Eksempel Software ApS",
        "cvr": 55443322,
        "ejerandel": 100,
        "land": "Danmark"
      },
      {
        "navn": "Eksempel Consulting ApS",
        "cvr": 66554433,
        "ejerandel": 75,
        "land": "Danmark"
      }
    ],
    "søsterselskaber": [
      {
        "navn": "Partner Company A/S",
        "cvr": 77665544,
        "fællesEjer": "Holding Company ApS"
      }
    ],
    "ultimativModervirksomhed": {
      "navn": "Global Investment Group Inc.",
      "land": "USA",
      "identifikation": "US123456789"
    }
  },
  "produktionsenheder": [
    {
      "pNummer": "1012345678",
      "navn": "Eksempel A/S - Hovedkontor",
      "adresse": {
        "vejnavn": "Eksempelvej",
        "husnummer": "42",
        "postnummer": 1234,
        "by": "København K"
      },
      "telefon": "+45 12 34 56 78",
      "medarbejdere": 20,
      "hovedbranche": "620100",
      "startdato": "2020-01-15"
    },
    {
      "pNummer": "1012345679",
      "navn": "Eksempel A/S - Afdeling Aarhus",
      "adresse": {
        "vejnavn": "Viborgvej",
        "husnummer": "100",
        "postnummer": 8000,
        "by": "Aarhus C"
      },
      "telefon": "+45 98 76 54 32",
      "medarbejdere": 5,
      "hovedbranche": "620100",
      "startdato": "2022-06-01"
    }
  ],
  "dokumenter": {
    "vedtægter": {
      "sidstOpdateret": "2023-06-15",
      "tilgængelig": true
    },
    "årsrapporter": [
      {
        "år": 2023,
        "publiceret": "2024-05-31",
        "dokumentID": "doc_2023_12345678",
        "tilgængelig": true
      },
      {
        "år": 2022,
        "publiceret": "2023-05-31",
        "dokumentID": "doc_2022_12345678",
        "tilgængelig": true
      }
    ],
    "stiftelsesdokument": {
      "dato": "2020-01-10",
      "tilgængelig": true
    }
  },
  "begivenheder": [
    {
      "type": "Kapitalændring",
      "dato": "2023-06-15",
      "beskrivelse": "Forhøjelse af aktiekapital fra 400.000 til 500.000 DKK"
    },
    {
      "type": "Ledelsesændring",
      "dato": "2022-01-15",
      "beskrivelse": "Sophie Hansen indtrådt som bestyrelsessuppleant"
    },
    {
      "type": "Adresseændring",
      "dato": "2020-01-15",
      "beskrivelse": "Flytning til Eksempelvej 42, 1234 København K"
    }
  ],
  "kreditoplysninger": {
    "kreditvurdering": "AAA",
    "kreditlimit": 5000000,
    "betalingsanmærkninger": 0,
    "konkurser": 0,
    "tvangsopløsninger": 0,
    "sidstOpdateret": "2024-01-15"
  },
  "metadata": {
    "sidstOpdateret": "2024-11-03T14:30:00Z",
    "dataKilde": "CVR Register",
    "apiVersion": "2.0",
    "requestId": "req_abc123xyz789"
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
            I bestemmer selv hvordan I gerne vil have jeres respons - Se et eksempel på hvordan data kan returneres fra vores API i JSON-format
          </p>
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  GET /api/selskab/12345678
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
              <div className="bg-black p-4 rounded-lg overflow-auto max-h-[500px] border border-green-500/30">
                <pre className="text-xs sm:text-sm">
                  <code className="text-green-400 font-mono">
                    {exampleResponse}
                  </code>
                </pre>
              </div>
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
            <Button size="lg" asChild className="animate-pulse shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-all">
              <Link to="/kontakt-os">
                Kontakt os
              </Link>
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

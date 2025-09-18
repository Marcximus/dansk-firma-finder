import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Building, 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Globe,
  Users,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const DatakilderPage: React.FC = () => {
  const primarySources = [
    {
      name: 'CVR-registeret',
      provider: 'Erhvervsstyrelsen',
      description: 'Det centrale virksomhedsregister med grundlæggende oplysninger om alle danske virksomheder',
      dataTypes: [
        'Virksomhedsnavne og CVR-numre',
        'Adresser og kontaktoplysninger', 
        'Virksomhedsform og branchekoder',
        'Ledelse og bestyrelsesmedlemmer',
        'Ejerskabsforhold og kapitalstruktur',
        'Tegningsregler og prokuraer'
      ],
      updateFrequency: 'Real-time',
      coverage: '100% af danske virksomheder',
      reliability: 99.9,
      official: true,
      website: 'https://datacvr.virk.dk'
    },
    {
      name: 'Årsrapporter',
      provider: 'Erhvervsstyrelsen',
      description: 'Officielle regnskaber og årsrapporter indsendt af virksomheder',
      dataTypes: [
        'Omsætning og finansielle nøgletal',
        'Balanceopgørelser',
        'Resultatopgørelser',
        'Noter og regnskabspraksis',
        'Ledelseserklæringer',
        'Revisorerklæringer'
      ],
      updateFrequency: 'Årligt + løbende',
      coverage: 'Alle rapportpligtige virksomheder',
      reliability: 99.5,
      official: true,
      website: 'https://datacvr.virk.dk'
    }
  ];

  const supplementarySources = [
    {
      name: 'Kreditoplysninger',
      provider: 'Danske kreditoplysningsbureauer',
      description: 'Kreditrating, betalingsadfærd og risikovurderinger',
      dataTypes: ['Kreditrating', 'Betalingshistorik', 'Inkassosager', 'Konkursrisiko'],
      frequency: 'Ugentligt',
      coverage: 'Større virksomheder'
    },
    {
      name: 'Tingbogen',
      provider: 'Domstolsstyrelsen',
      description: 'Panterettigheder og sikkerhedsakter i fast ejendom og løsøre',
      dataTypes: ['Pantebreve', 'Ejerpantebreve', 'Sikkerhedsakter'],
      frequency: 'Dagligt',
      coverage: 'Alle registrerede rettigheder'
    },
    {
      name: 'Fogedretterne',
      provider: 'Domstolsstyrelsen',
      description: 'Tvangsfuldbyrdelse og inkassosager',
      dataTypes: ['Udlæg', 'Arrest', 'Lønindeholdelse', 'Konkurs'],
      frequency: 'Ugentligt',
      coverage: 'Alle offentlige sager'
    },
    {
      name: 'Finanstilsynet',
      provider: 'Finanstilsynet',
      description: 'Særlige oplysninger for finansielle virksomheder',
      dataTypes: ['Tilladelser', 'Advarsler', 'Sanktioner', 'Kapitalkrav'],
      frequency: 'Løbende',
      coverage: 'Finansielle virksomheder'
    }
  ];

  const dataProcessing = [
    {
      step: 1,
      title: 'Dataindsamling',
      description: 'Automatisk indsamling fra officielle API\'er og datakilder',
      icon: Database,
      details: [
        'Direkte API-forbindelser til CVR-registeret',
        'Automatisk download af regnskaber',
        'Struktureret parsing af PDF-dokumenter',
        'Real-time overvågning af ændringer'
      ]
    },
    {
      step: 2,
      title: 'Datavalidering',
      description: 'Kvalitetssikring og fejlkontrol af indkomne data',
      icon: Shield,
      details: [
        'Automatisk validering af CVR-numre',
        'Konsistenstjek på tværs af kilder',
        'Duplikatkontrol og sammenligning',
        'Historisk validering af ændringer'
      ]
    },
    {
      step: 3,
      title: 'Datanormalisering',
      description: 'Standardisering og strukturering af data fra forskellige kilder',
      icon: Zap,
      details: [
        'Ensartet formatering af adresser',
        'Normalisering af virksomhedsnavne',
        'Klassificering af brancher',
        'Harmonisering af finansielle data'
      ]
    },
    {
      step: 4,
      title: 'Databerigelse',
      description: 'Tilføjelse af analyser, ratings og sammenhænge',
      icon: TrendingUp,
      details: [
        'Automatisk beregning af nøgletal',
        'Kreditrating og risikovurdering',
        'Branchesammenligninger',
        'Trend- og udviklingsindikatorer'
      ]
    }
  ];

  return (
    <Layout>
      <SEO 
        title="Datakilder - Pålidelige kilder til virksomhedsdata | SelskabsInfo"
        description="Læs om de officielle datakilder vi bruger til at levere præcise og opdaterede virksomhedsoplysninger."
        canonicalUrl="https://selskabsinfo.dk/datakilder"
        keywords="datakilder, CVR-registeret, officielle kilder, datakvalitet"
      />
      <div className="py-8 max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Datakilder</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Vi indsamler data fra pålidelige og officielle kilder for at give dig de mest præcise virksomhedsoplysninger
          </p>
        </div>

        {/* Primary Sources */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-semibold">Primære datakilder</h2>
            <Badge className="bg-green-100 text-green-800">Officielle kilder</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {primarySources.map((source, index) => (
              <Card key={index} className="border-green-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {source.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {source.provider}
                        {source.official && (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            Officiel
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Pålidelighed</div>
                      <div className="text-lg font-semibold text-green-600">{source.reliability}%</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{source.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Datatyper:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {source.dataTypes.map((type, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Opdateringsfrekvens</div>
                      <div className="font-medium">{source.updateFrequency}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Dækning</div>
                      <div className="font-medium">{source.coverage}</div>
                    </div>
                  </div>
                  
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={source.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Besøg {source.provider}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Supplementary Sources */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold">Supplerende datakilder</h2>
            <Badge className="bg-blue-100 text-blue-800">Autoriserede kilder</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supplementarySources.map((source, index) => (
              <Card key={index} className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base">{source.name}</CardTitle>
                  <CardDescription>{source.provider}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{source.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Datatyper:</strong> {source.dataTypes.join(', ')}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span><strong>Frekvens:</strong> {source.frequency}</span>
                      <span><strong>Dækning:</strong> {source.coverage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Data Processing */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-semibold">Databehandling og kvalitetssikring</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataProcessing.map((process) => {
              const IconComponent = process.icon;
              return (
                <Card key={process.step} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {process.step}. {process.title}
                    </CardTitle>
                    <CardDescription>{process.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {process.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-left">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Data Quality Metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Datakvalitet og opdateringsfrekvens</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Opdateringsfrekvens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">CVR-data</span>
                  <Badge className="bg-green-100 text-green-800">Real-time</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Regnskabsdata</span>
                  <Badge className="bg-blue-100 text-blue-800">Dagligt</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Kreditoplysninger</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Ugentligt</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Juridiske data</span>
                  <Badge className="bg-purple-100 text-purple-800">Ugentligt</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Datakvalitet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Nøjagtighed</span>
                  <span className="font-semibold text-green-600">99.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Komplethhed</span>
                  <span className="font-semibold text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Aktualitet</span>
                  <span className="font-semibold text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tilgængelighed</span>
                  <span className="font-semibold text-green-600">99.95%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Dækningsgrad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Aktive virksomheder</span>
                  <span className="font-semibold text-purple-600">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Historiske data</span>
                  <span className="font-semibold text-purple-600">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Finansielle data</span>
                  <span className="font-semibold text-purple-600">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Kreditoplysninger</span>
                  <span className="font-semibold text-purple-600">78%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Vigtige bemærkninger om datakvalitet</h3>
              <ul className="text-yellow-700 space-y-1 text-sm">
                <li>• Alle data kommer fra officielle og autoriserede kilder</li>
                <li>• Finansielle data er baseret på virksomhedernes egne indberetninger</li>
                <li>• Historiske data kan være begrænsede for nyere virksomheder</li>
                <li>• Kreditoplysninger er kun tilgængelige for større virksomheder</li>
                <li>• Data opdateres løbende, men der kan være forsinkelser fra originale kilder</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Har du spørgsmål til vores datakilder?</h2>
          <p className="text-muted-foreground mb-6">
            Vi er transparente om vores data og kilder. Kontakt os hvis du har spørgsmål til kvalitet, 
            opdateringsfrekvens eller specifikke datakilder.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/kontakt-os">Kontakt os</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/faq">Se FAQ</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DatakilderPage;
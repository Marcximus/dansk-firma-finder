import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Search, 
  TrendingUp, 
  Users, 
  Building, 
  Calendar,
  Star,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

const VirksomhedsrapporterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const reportTypes = [
    {
      id: 'standard',
      title: 'Standard virksomhedsrapport',
      description: 'Omfattende rapport med grundlæggende virksomhedsoplysninger',
      price: 'Gratis',
      features: [
        'CVR-oplysninger og kontaktdata',
        'Grundlæggende finansielle nøgletal',
        'Ledelse og bestyrelsesmedlemmer',
        'Ejerskabsforhold (overordnet)',
        'Seneste regnskabstal'
      ],
      badge: 'Populær',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'premium',
      title: 'Premium virksomhedsrapport',
      description: 'Detaljeret analyse med finansielle trends og kreditvurdering',
      price: '199 kr.',
      features: [
        'Alt fra Standard rapport',
        'Detaljeret finansiel analyse',
        'Kreditvurdering og rating',
        'Sammenligning med branchen',
        '5 års historiske data',
        'Risiko- og konkursanalyse',
        'Ejerskabsstruktur i dybden'
      ],
      badge: 'Anbefalet',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'enterprise',
      title: 'Enterprise virksomhedsrapport',
      description: 'Komplet due diligence rapport til professionelle formål',
      price: '499 kr.',
      features: [
        'Alt fra Premium rapport',
        'Koncernstruktur og tilknyttede selskaber',
        'Detaljeret konkurrentanalyse',
        'ESG-rating og bæredygtighed',
        'Compliance og juridisk analyse',
        'Markedsposition og outlook',
        'Ekspertannotationer og anbefalinger',
        'Tilpassede analyser'
      ],
      badge: 'Professional',
      badgeColor: 'bg-purple-500'
    }
  ];

  const sampleReports = [
    {
      company: 'Novo Nordisk A/S',
      cvr: '24256790',
      type: 'Premium',
      date: '2025-01-15',
      status: 'Klar'
    },
    {
      company: 'Danske Bank A/S',
      cvr: '61126228',
      type: 'Enterprise',
      date: '2025-01-14',
      status: 'Klar'
    },
    {
      company: 'LEGO A/S',
      cvr: '54562712',
      type: 'Standard',
      date: '2025-01-13',
      status: 'Klar'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here
    console.log('Searching for:', searchQuery);
  };

  return (
    <Layout>
      <div className="py-8 max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Virksomhedsrapporter</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Få detaljerede rapporter om danske virksomheder - fra grundlæggende oplysninger til omfattende analyser
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Bestil rapport
            </CardTitle>
            <CardDescription>
              Søg efter den virksomhed du vil have en rapport om
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Indtast virksomhedsnavn eller CVR-nummer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                Søg
              </Button>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="types" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="types">Rapporttyper</TabsTrigger>
            <TabsTrigger value="samples">Eksempelrapporter</TabsTrigger>
            <TabsTrigger value="faq">Spørgsmål & Svar</TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report) => (
                <Card key={report.id} className="relative overflow-hidden">
                  {report.badge && (
                    <div className="absolute top-4 right-4">
                      <Badge className={`${report.badgeColor} text-white`}>
                        {report.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="pr-20">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                    <div className="text-2xl font-bold text-primary">{report.price}</div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {report.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button className="w-full">
                      Bestil rapport
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Hvad er inkluderet?</CardTitle>
                <CardDescription>
                  Sammenligning af de forskellige rapporttyper
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Grundoplysninger
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Virksomhedsnavn, CVR-nummer og adresse</li>
                      <li>• Kontaktoplysninger og hjemmeside</li>
                      <li>• Virksomhedsform og branchekode</li>
                      <li>• Stiftelsesdato og aktuel status</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Finansielle data
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Omsætning, resultat og egenkapital</li>
                      <li>• Nøgletal og rentabilitet</li>
                      <li>• Kreditrating og risikovurdering</li>
                      <li>• Historiske trends og prognoser</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Ledelse og ejerskab
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Direktion og bestyrelse</li>
                      <li>• Tegningsregler og roller</li>
                      <li>• Ejerskabsstruktur og kapitalforhold</li>
                      <li>• Tilknyttede virksomheder</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Risiko og compliance
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Konkurs- og likvidationsrisiko</li>
                      <li>• Betalingsadfærd og kredithistorik</li>
                      <li>• Juridiske sager og tvangsfuldbyrdelse</li>
                      <li>• Compliance og regulatoriske forhold</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="samples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eksempelrapporter</CardTitle>
                <CardDescription>
                  Se eksempler på rapporter for at forstå indholdet og kvaliteten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <div className="font-semibold">{report.company}</div>
                          <div className="text-sm text-muted-foreground">
                            CVR: {report.cvr} • {report.type} rapport
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {report.date}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-green-600">
                          {report.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 mb-3">
                    <strong>Bemærk:</strong> Eksempelrapporterne er anonymiserede og viser rapportstruktur og -indhold.
                  </p>
                  <p className="text-sm text-blue-700">
                    Alle data i de faktiske rapporter er realtidsdata fra officielle kilder.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Leveringstid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Standard rapport:</span>
                    <span className="font-medium">Øjeblikkeligt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium rapport:</span>
                    <span className="font-medium">2-5 minutter</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enterprise rapport:</span>
                    <span className="font-medium">5-15 minutter</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formater
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>PDF til print og arkivering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Excel til videre analyse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Online visning i browser</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Hvad inkluderer rapporterne?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Alle rapporter bygger på officielle data fra CVR-registeret, årsrapporter 
                    og andre pålidelige kilder. Data opdateres løbende og er maksimalt 24 timer gammelt.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Datakilder og kvalitet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CVR-registeret (Erhvervsstyrelsen)</li>
                    <li>• Årsrapporter og regnskaber</li>
                    <li>• Kreditoplysningsbureauer</li>
                    <li>• Offentlige myndigheder</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Klar til at få din første rapport?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            Begynd med en gratis Standard rapport eller få en omfattende analyse med vores Premium og Enterprise rapporter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Search className="w-4 h-4 mr-2" />
              Søg virksomhed
            </Button>
            <Button size="lg" variant="outline" className="text-primary-foreground border-white hover:bg-white hover:text-primary bg-white/10">
              Se priser og features
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VirksomhedsrapporterPage;
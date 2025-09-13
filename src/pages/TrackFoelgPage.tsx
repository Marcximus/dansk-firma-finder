import React from 'react';
import Layout from '@/components/Layout';
import { Target, Bell, Star, TrendingUp, ArrowLeft, CheckCircle, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TrackFoelgPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Track & Følg</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hold øje med ændringer i virksomheder du følger og få automatiske notifikationer om vigtige opdateringer
          </p>
        </div>

        {/* Pricing Packages */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Vælg din pakke</h2>
            <p className="text-muted-foreground">Find den løsning der passer til dine behov</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Package */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Standard</span>
                  <Badge variant="secondary">Gratis</Badge>
                </CardTitle>
                <CardDescription>
                  Perfekt til at komme i gang
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold">0,-</div>
                  <div className="text-sm text-muted-foreground">pr. måned</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Følg 1 virksomhed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Grundlæggende notifikationer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Email alerts</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    asChild
                  >
                    <Link to="/checkout?package=standard">
                      Vælg Standard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium Package */}
            <Card className="relative border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Premium</span>
                  <Badge className="bg-primary text-primary-foreground">Populær</Badge>
                </CardTitle>
                <CardDescription>
                  Til små og mellemstore virksomheder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold">99,-</div>
                  <div className="text-sm text-muted-foreground">pr. måned</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Følg op til 5 virksomheder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Daglige notifikationer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Email og SMS alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Avancerede filtre</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Historisk data</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Button 
                    className="w-full"
                    asChild
                  >
                    <Link to="/checkout?package=premium">
                      Vælg Premium
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Package */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Enterprise</span>
                  <Badge variant="outline">Erhverv</Badge>
                </CardTitle>
                <CardDescription>
                  Til store organisationer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold">499,-</div>
                  <div className="text-sm text-muted-foreground">pr. måned</div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Følg op til 100 virksomheder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Realtids notifikationer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Alle kommunikationskanaler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Tilpassede alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Fuld historisk database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Export til Excel/PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Dedikeret support</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    asChild
                  >
                    <Link to="/checkout?package=enterprise">
                      Vælg Enterprise
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Automatiske notifikationer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Få besked med det samme når der sker ændringer i de virksomheder du følger
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Favoritlister
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Organiser virksomheder i tilpassede lister og følg dem systematisk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Trendanalyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Se udviklingen over tid og spot mønstre i virksomhedsændringer
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What You Can Track */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Hvad kan du følge?
            </CardTitle>
            <CardDescription>
              Hold øje med alle de vigtige ændringer der sker i virksomheder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">Grundlæggende oplysninger</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Navneændringer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Adresseflytninger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Statusændringer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Selskabsform</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-purple-600">Ledelse & ejerskab</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Nye direktører</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Bestyrelsesændringer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Ejerskabsændringer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Tegningsregler</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-orange-600">Finansielle data</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Kapitalopdateringer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Nye regnskaber</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Medarbejdertal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Brancheskift</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Sådan fungerer det
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold mb-2">Søg og find</h4>
                <p className="text-sm text-muted-foreground">
                  Find de virksomheder du vil følge via vores søgefunktion
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-semibold mb-2">Tilføj til favoritter</h4>
                <p className="text-sm text-muted-foreground">
                  Klik på stjernen for at tilføje virksomheden til din liste
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold mb-2">Sæt præferencer</h4>
                <p className="text-sm text-muted-foreground">
                  Vælg hvilke typer ændringer du vil have besked om
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-orange-600">4</span>
                </div>
                <h4 className="font-semibold mb-2">Få notifikationer</h4>
                <p className="text-sm text-muted-foreground">
                  Modtag automatiske opdateringer via email eller SMS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* CTA and Back Button */}
        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Kom i gang med tracking
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/kontakt-os">Kontakt os for demo</Link>
            </Button>
          </div>
          
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

export default TrackFoelgPage;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Standard Package */}
            <Card className="relative hover-scale transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">Standard</CardTitle>
                <CardDescription className="text-sm">
                  Perfekt til at komme i gang
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-6 pb-4 border-b border-border">
                  <div className="text-4xl font-bold mb-1">0,-</div>
                  <div className="text-sm text-muted-foreground">pr. måned</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Følg 1 virksomhed</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Grundlæggende notifikationer</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Email alerts</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <Link to="/checkout?package=standard" className="animate-fade-in">
                    Vælg Standard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Package - Featured */}
            <Card className="relative hover-scale transition-all duration-300 hover:shadow-xl border-primary shadow-lg scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
                  Mest populær
                </Badge>
              </div>
              <CardHeader className="text-center pb-4 pt-6">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">Premium</CardTitle>
                <CardDescription className="text-sm">
                  Til små og mellemstore virksomheder
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-6 pb-4 border-b border-border">
                  <div className="text-4xl font-bold text-primary mb-1">99,-</div>
                  <div className="text-sm text-muted-foreground">pr. måned</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Følg op til 5 virksomheder</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Daglige notifikationer</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Email og SMS alerts</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Avancerede filtre</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Historisk data</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  size="lg"
                  asChild
                >
                  <Link to="/checkout?package=premium" className="animate-fade-in">
                    Vælg Premium
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Package */}
            <Card className="relative hover-scale transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">Enterprise</CardTitle>
                <CardDescription className="text-sm">
                  Til store organisationer
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-6 pb-4 border-b border-border">
                  <div className="text-4xl font-bold mb-1">499,-</div>
                  <div className="text-sm text-muted-foreground">pr. måned</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Følg op til 100 virksomheder</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Realtids notifikationer</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Alle kommunikationskanaler</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Tilpassede alerts</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Fuld historisk database</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Export til Excel/PDF</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Dedikeret support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  size="lg"
                  asChild
                >
                  <Link to="/checkout?package=enterprise" className="animate-fade-in">
                    Vælg Enterprise
                  </Link>
                </Button>
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
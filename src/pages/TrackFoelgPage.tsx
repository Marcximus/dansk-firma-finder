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

        {/* Pricing/Premium Feature */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Premium funktion
            </CardTitle>
            <CardDescription>
              Track & Følg er en del af vores premium-pakke
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-2">Få fuld adgang til tracking</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Følg op til 100 virksomheder</li>
                    <li>• Daglige notifikationer</li>
                    <li>• Avancerede filtre og alerts</li>
                    <li>• Historisk tracking data</li>
                    <li>• Export til Excel/PDF</li>
                  </ul>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    Premium
                  </Badge>
                  <div className="text-2xl font-bold">499,-</div>
                  <div className="text-sm text-muted-foreground">pr. måned</div>
                </div>
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
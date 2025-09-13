import React from 'react';
import Layout from '@/components/Layout';
import { Book, Search, Target, Users, Building2, Lightbulb, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SearchGuidePage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Book className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Guide til søgning</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Lær hvordan du finder de virksomheder du leder efter
          </p>
        </div>

        {/* Search Tips Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Søgestrategier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Brug fulde firmanavne</p>
                  <p className="text-sm text-muted-foreground">F.eks. "LEGO A/S" i stedet for kun "LEGO"</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Prøv forskellige stavemåder</p>
                  <p className="text-sm text-muted-foreground">Virksomheder kan have forskellige navneformer</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Søg på CVR-nummer</p>
                  <p className="text-sm text-muted-foreground">Den mest præcise måde at finde en virksomhed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Søgeresultater
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Filtrer efter status</p>
                  <p className="text-sm text-muted-foreground">Aktive, opløste eller alle virksomheder</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Sorter efter relevans</p>
                  <p className="text-sm text-muted-foreground">De mest relevante resultater vises først</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Tjek flere resultater</p>
                  <p className="text-sm text-muted-foreground">Den ønskede virksomhed kan være længere nede</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Detaljeret søgeguide
            </CardTitle>
            <CardDescription>
              Følg disse trin for at få de bedste søgeresultater
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Start bredt</h3>
                <p className="text-sm text-muted-foreground">
                  Begynd med det mest almindelige navn for virksomheden
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Indsnævr søgningen</h3>
                <p className="text-sm text-muted-foreground">
                  Tilføj selskabsform (A/S, ApS, I/S) eller lokation
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Verificer resultatet</h3>
                <p className="text-sm text-muted-foreground">
                  Tjek adresse og CVR-nummer for at sikre det rigtige match
                </p>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Eksempler på gode søgninger
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">CVR</Badge>
                  <span>25052943 (LEGO A/S)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Fuldt navn</Badge>
                  <span>Novo Nordisk A/S</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Med lokation</Badge>
                  <span>Mærsk København</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Almindelige udfordringer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-red-600 mb-2">Problem: Ingen resultater</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Tjek stavning af firmanavn</li>
                  <li>• Prøv kortere søgetermer</li>
                  <li>• Søg på CVR-nummer i stedet</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-red-600 mb-2">Problem: For mange resultater</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Tilføj selskabsform (A/S, ApS)</li>
                  <li>• Inkluder by eller region</li>
                  <li>• Brug mere specifikt firmanavn</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/hjaelpecenter" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tilbage til hjælpecenter
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SearchGuidePage;
import React from 'react';
import Layout from '@/components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Search, Book, MessageCircle, Phone, Mail, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HjaelpecenterPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Hjælpecenter</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Find svar på dine spørgsmål eller kontakt vores support
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="pl-10"
                placeholder="Søg efter hjælp..." 
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Guide til søgning
              </CardTitle>
              <CardDescription>
                Lær hvordan du finder de virksomheder du leder efter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/soegeguide">Se guide</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kontakt support
              </CardTitle>
              <CardDescription>
                Få personlig hjælp fra vores supportteam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/kontakt-os">Kontakt os</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                FAQ
              </CardTitle>
              <CardDescription>
                Ofte stillede spørgsmål og deres svar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/faq">Se FAQ</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Populære emner</h2>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="search-tips" className="border rounded-lg" id="search-guide">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  <span className="text-left">Hvordan søger jeg effektivt efter virksomheder?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Søgetips for bedre resultater:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>Brug kun dele af virksomhedsnavnet - f.eks. "danske" i stedet for "Danske Bank"</li>
                      <li>Prøv at søge på CVR-nummer hvis du kender det</li>
                      <li>Kombiner virksomhedsnavn med by - f.eks. "tdc København"</li>
                      <li>Søg på branche hvis du vil finde lignende virksomheder</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-blue-900">Eksempler på gode søgninger:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-white rounded px-3 py-2 border border-blue-200">
                        <span className="font-mono text-blue-700">"novo"</span> → Finder Novo Nordisk og relaterede selskaber
                      </div>
                      <div className="bg-white rounded px-3 py-2 border border-blue-200">
                        <span className="font-mono text-blue-700">"12345678"</span> → Søg direkte på CVR-nummer
                      </div>
                      <div className="bg-white rounded px-3 py-2 border border-blue-200">
                        <span className="font-mono text-blue-700">"advokatfirma København"</span> → Find alle advokatfirmaer i København
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account-management" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-left">Hvordan opretter og administrerer jeg min konto?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Oprettelse af konto:</h4>
                    <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
                      <li>Klik på "Log Ind / Tilmeld" i toppen af siden</li>
                      <li>Vælg "Tilmeld" fanen</li>
                      <li>Indtast din email og vælg en sikker adgangskode</li>
                      <li>Bekræft din email gennem det link vi sender</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Kontoindstillinger:</h4>
                    <p className="text-muted-foreground mb-2">Efter login kan du:</p>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>Ændre dine personlige oplysninger</li>
                      <li>Administrere abonnementer og betalinger</li>
                      <li>Se din søgehistorik</li>
                      <li>Indstille notifikationer</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-understanding" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  <span className="text-left">Hvordan forstår jeg virksomhedsoplysningerne?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Grundoplysninger:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li><strong>CVR-nummer:</strong> Unikt 8-cifret nummer for alle danske virksomheder</li>
                      <li><strong>Status:</strong> Om virksomheden er aktiv, ophørt, under konkurs, etc.</li>
                      <li><strong>Virksomhedsform:</strong> ApS, A/S, I/S, Enkeltmandsvirksomhed, etc.</li>
                      <li><strong>Branchekode:</strong> Officiel kategorisering af virksomhedens aktivitet</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Finansielle nøgletal:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li><strong>Omsætning:</strong> Virksomhedens samlede indtægter</li>
                      <li><strong>Resultat:</strong> Overskud eller underskud efter omkostninger</li>
                      <li><strong>Egenkapital:</strong> Virksomhedens nettoværdi</li>
                      <li><strong>Antal ansatte:</strong> Fuldtidsansatte eller årsværk</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tracking" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="text-left">Hvordan fungerer virksomhedstracking?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Virksomhedstracking giver dig automatiske opdateringer når der sker ændringer 
                    i de virksomheder du følger.
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Sådan starter du tracking:</h4>
                    <ol className="list-decimal pl-5 text-muted-foreground space-y-1">
                      <li>Find den virksomhed du vil følge</li>
                      <li>Klik på "Track Dette Selskab" knappen</li>
                      <li>Opret en konto hvis du ikke allerede har en</li>
                      <li>Vælg hvilke typer ændringer du vil have besked om</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Du får besked om:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>Nye regnskaber og finansielle opdateringer</li>
                      <li>Ændringer i ledelse (direktører, bestyrelsesmedlemmer)</li>
                      <li>Kapitalændringer og nye investeringsrunder</li>
                      <li>Adresse- og kontaktoplysninger</li>
                      <li>Statusændringer (konkurs, likvidation, etc.)</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="technical-issues" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-left">Hvad gør jeg ved tekniske problemer?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Almindelige løsninger:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>Opdater din browser til den nyeste version</li>
                      <li>Ryd cache og cookies</li>
                      <li>Prøv en anden browser (Chrome, Firefox, Safari)</li>
                      <li>Tjek din internetforbindelse</li>
                      <li>Deaktiver ad-blockers midlertidigt</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-yellow-800">Hvis problemet fortsætter:</h4>
                    <p className="text-yellow-800 mb-2">
                      Kontakt vores support med følgende information:
                    </p>
                    <ul className="list-disc pl-5 text-yellow-700 space-y-1 text-sm">
                      <li>Hvilken browser og version du bruger</li>
                      <li>Beskrivelse af problemet</li>
                      <li>Hvornår problemet opstod</li>
                      <li>Screenshot hvis relevant</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contact Options */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Stadig brug for hjælp?</h2>
          <p className="text-muted-foreground mb-6">
            Vores supportteam er klar til at hjælpe dig med alle dine spørgsmål
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg">
              <Mail className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Email support</h3>
              <p className="text-sm text-muted-foreground mb-3">support@selskabsinfo.dk</p>
              <span className="text-xs text-green-600">Svar inden for 24 timer</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg">
              <Phone className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Telefon support</h3>
              <p className="text-sm text-muted-foreground mb-3">+45 12 34 56 78</p>
              <span className="text-xs text-green-600">Hverdage 9-17</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white rounded-lg">
              <MessageCircle className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold mb-1">Live chat</h3>
              <p className="text-sm text-muted-foreground mb-3">Øjeblikkelig hjælp</p>
              <span className="text-xs text-green-600">Hverdage 9-17</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HjaelpecenterPage;
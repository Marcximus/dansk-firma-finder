import React from 'react';
import Layout from '@/components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Search, Building, FileText, Users, Shield, Phone, Mail, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FAQPage: React.FC = () => {
  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Ofte stillede spørgsmål</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Find svar på de mest almindelige spørgsmål om Selskabsinfo og vores tjenester
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {/* Generelle spørgsmål */}
          <AccordionItem value="general-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span className="text-left">Hvad er Selskabsinfo?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground">
                Selskabsinfo er en dansk tjeneste, der giver dig adgang til omfattende virksomhedsoplysninger fra CVR-registeret. 
                Vi samler og præsenterer data på en overskuelig måde, så du nemt kan få overblik over danske virksomheder, 
                deres ejerforhold, regnskabstal og meget mere.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="search-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span className="text-left">Hvordan søger jeg efter en virksomhed?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Du kan søge efter virksomheder på flere måder:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Virksomhedsnavn (fuldt eller delvist)</li>
                <li>CVR-nummer (8 cifre)</li>
                <li>Branchekode eller branchetype</li>
                <li>By eller postnummer</li>
                <li>Kombination af ovenstående</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Søgningen er intelligent og finder resultater, selv hvis du ikke staver helt korrekt.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-left">Hvilke oplysninger kan jeg finde om virksomheder?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Vi viser omfattende information om danske virksomheder, herunder:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Grundoplysninger</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>CVR-nummer og virksomhedsnavn</li>
                    <li>Adresse og kontaktoplysninger</li>
                    <li>Stiftelsesdato og status</li>
                    <li>Virksomhedsform og branche</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Finansielle data</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Omsætning og resultat</li>
                    <li>Egenkapital og balance</li>
                    <li>Antal ansatte</li>
                    <li>Regnskabstal gennem flere år</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ledelse og ejere</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Direktion og bestyrelse</li>
                    <li>Tegningsregler</li>
                    <li>Ejerskabsforhold</li>
                    <li>Revisor</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Historiske data</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    <li>Navneændringer</li>
                    <li>Adressehistorik</li>
                    <li>Statusændringer</li>
                    <li>Tidligere ledelse</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-2" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-left">Hvor kommer data fra, og hvor opdateret er det?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Alle data kommer direkte fra officielle danske myndigheder:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li>CVR-registeret (Erhvervsstyrelsen) - grunddata og regnskaber</li>
                <li>Regnskabsdata fra årsrapporter indsendt til myndighederne</li>
                <li>Oplysninger om ejerskab og ledelse fra CVR</li>
              </ul>
              <p className="text-muted-foreground">
                Data opdateres løbende, og de fleste oplysninger er maksimalt 24-48 timer gamle. 
                Regnskabsdata opdateres, så snart virksomheder indsender deres årsrapporter.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="features-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-left">Hvad betyder "Track Dette Selskab"?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground">
                Når du klikker på "Track Dette Selskab", kan du få automatiske opdateringer om virksomheden via email. 
                Du vil få besked, når der sker ændringer i selskabet, såsom:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-3">
                <li>Nye bestyrelsesmedlemmer eller direktører</li>
                <li>Ændringer i kapitalforhold</li>
                <li>Nye regnskaber</li>
                <li>Adresseændringer</li>
                <li>Statusændringer</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="legal-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-left">Er det lovligt at bruge disse oplysninger?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground">
                Ja, alle oplysninger vi viser er offentligt tilgængelige i henhold til dansk lovgivning. 
                CVR-registeret er offentligt, og virksomheder er forpligtet til at offentliggøre deres regnskaber. 
                Du kan frit bruge oplysningerne til legitimate forretningsmæssige formål som kreditvurdering, 
                markedsanalyse eller due diligence.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span className="text-left">Er tjenesten gratis?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground">
                Grundlæggende virksomhedsoplysninger er gratis tilgængelige. For avancerede funktioner som 
                tracking, bulk-export, API-adgang og detaljerede finansielle analyser tilbyder vi premium-abonnementer. 
                Kontakt os for at høre om priser og muligheder.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="help-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="text-left">Jeg har brug for juridisk eller regnskabsmæssig rådgivning - kan I hjælpe?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Vi samarbejder med kvalificerede advokater og revisorer, der kan hjælpe med:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Juridisk hjælp</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                    <li>Selskabsstiftelse</li>
                    <li>Vedtægter og tegningsregler</li>
                    <li>Ejerforhold og kapitaludvidelse</li>
                    <li>Opkøb og fusioner</li>
                    <li>Likvidation og konkurs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Regnskabshjælp</h4>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                    <li>Løbende bogføring</li>
                    <li>Årsregnskaber</li>
                    <li>Momsangivelser</li>
                    <li>Skatteoptimering</li>
                    <li>Økonomisk rådgivning</li>
                  </ul>
                </div>
              </div>
              <p className="text-muted-foreground mt-3">
                Klik på knapperne "Hjælp til Jura" eller "Hjælp til Regnskab" i toppen af siden for at komme i kontakt.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="technical-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span className="text-left">Jeg kan ikke finde den virksomhed, jeg søger efter</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Hvis du ikke kan finde en virksomhed, kan det skyldes:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li>Virksomheden er ophørt eller slettet af CVR</li>
                <li>Stavefejl i virksomhedsnavnet</li>
                <li>Virksomheden er meget ny (kan tage op til 24 timer at blive synlig)</li>
                <li>Søgeordene er for specifikke - prøv at søge på dele af navnet</li>
              </ul>
              <p className="text-muted-foreground">
                Prøv at søge på CVR-nummeret i stedet, eller kontakt os hvis problemet fortsætter.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Rapporter og tjenester */}
          <AccordionItem value="reports-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-left">Hvad er forskellen på Standard, Premium og Enterprise rapporter?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Standard rapport (Gratis)</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Grundlæggende CVR-oplysninger</li>
                    <li>Kontaktdata og virksomhedsform</li>
                    <li>Seneste regnskabstal</li>
                    <li>Ledelse og bestyrelse</li>
                    <li>Grundlæggende ejerskabsinfo</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">Premium rapport (199 kr.)</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Alt fra Standard rapport</li>
                    <li>5 års finansiel historik</li>
                    <li>Kreditvurdering og rating</li>
                    <li>Branchesammenligning</li>
                    <li>Risiko- og konkursanalyse</li>
                    <li>Detaljeret ejerskabsstruktur</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">Enterprise rapport (499 kr.)</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Alt fra Premium rapport</li>
                    <li>Komplet koncernstruktur</li>
                    <li>Konkurrentanalyse</li>
                    <li>ESG-rating og bæredygtighed</li>
                    <li>Compliance analyse</li>
                    <li>Markedsposition og outlook</li>
                    <li>Ekspertannotationer</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reports-2" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-left">Hvor hurtigt får jeg min rapport?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Standard rapport:</span>
                  <span className="text-green-600 font-semibold">Øjeblikkeligt</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Premium rapport:</span>
                  <span className="text-blue-600 font-semibold">2-5 minutter</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Enterprise rapport:</span>
                  <span className="text-purple-600 font-semibold">5-15 minutter</span>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                Rapporterne genereres automatisk og sendes til din email. Du får besked via email, 
                når din rapport er klar til download.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reports-3" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-left">Kan jeg få refunderet hvis jeg ikke er tilfreds med rapporten?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Ja, vi tilbyder 30 dages tilfredshedsgaranti på alle betalte rapporter. Hvis du ikke er tilfreds 
                med kvaliteten eller indholdet, kan du få fuld refundering ved at kontakte os inden for 30 dage.
              </p>
              <p className="text-muted-foreground">
                Bemærk at refundering ikke gælder, hvis data ikke er tilgængelige på grund af virksomhedens 
                manglende indberetning til CVR-registeret.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Tekniske spørgsmål */}
          <AccordionItem value="tech-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span className="text-left">Kan jeg søge på flere virksomheder på én gang?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Ja, vi tilbyder bulk-søgning for premium-kunder. Du kan uploade en liste med CVR-numre 
                eller virksomhedsnavne og få rapporter for alle på én gang.
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Upload Excel-fil med op til 1000 virksomheder</li>
                <li>Automatisk matching og rapportgenerering</li>
                <li>Bulk-rabat fra 10% ved 50+ rapporter</li>
                <li>API-adgang for systemintegration</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tech-2" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span className="text-left">Tilbyder I API-adgang?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Ja, vi tilbyder RESTful API-adgang for virksomheder, der vil integrere vores data 
                i deres egne systemer:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li>JSON-baseret API med omfattende dokumentation</li>
                <li>Real-time adgang til alle CVR-data</li>
                <li>Webhook-støtte for automatiske opdateringer</li>
                <li>Sandbox-miljø til test og udvikling</li>
                <li>Forskellige prispakker baseret på antal kald</li>
              </ul>
              <p className="text-muted-foreground">
                Kontakt os for API-dokumentation og prisoplysninger.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tech-3" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-left">Kan jeg eksportere data til Excel eller CSV?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Ja, alle rapporter kan eksporteres i flere formater:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded text-center">
                  <h4 className="font-semibold text-green-700">PDF</h4>
                  <p className="text-sm text-muted-foreground">Til print og arkivering</p>
                </div>
                <div className="p-3 bg-blue-50 rounded text-center">
                  <h4 className="font-semibold text-blue-700">Excel</h4>
                  <p className="text-sm text-muted-foreground">Til videre analyse</p>
                </div>
                <div className="p-3 bg-purple-50 rounded text-center">
                  <h4 className="font-semibold text-purple-700">CSV</h4>
                  <p className="text-sm text-muted-foreground">Til systemimport</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                Premium og Enterprise rapporter inkluderer alle formater. Standard rapporter kan eksporteres til PDF.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Betaling og abonnement */}
          <AccordionItem value="billing-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span className="text-left">Hvilke betalingsmuligheder tilbyder I?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">Vi accepterer følgende betalingsmuligheder:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded text-center">
                  <div className="font-semibold">Dankort</div>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <div className="font-semibold">Visa/MasterCard</div>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <div className="font-semibold">MobilePay</div>
                </div>
                <div className="p-3 bg-gray-50 rounded text-center">
                  <div className="font-semibold">Bankoverførsel</div>
                </div>
              </div>
              <p className="text-muted-foreground mt-3">
                Alle betalinger behandles sikkert gennem certificerede betalingsudbydere. 
                For virksomheder tilbyder vi også fakturabetalinger ved månedlige abonnementer.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="billing-2" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-left">Tilbyder I virksomhedsabonnementer?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Ja, vi har specialdesignede abonnementspakker til virksomheder:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">Professionel (899 kr./måned)</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>50 Premium rapporter pr. måned</li>
                    <li>Ubegrænset søgning og tracking</li>
                    <li>API-adgang (10,000 kald/måned)</li>
                    <li>Prioriteret support</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">Enterprise (2.499 kr./måned)</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>200 rapporter pr. måned (alle typer)</li>
                    <li>Ubegrænset API-adgang</li>
                    <li>Dedicated kundekonsulent</li>
                    <li>Tilpassede integrationer</li>
                    <li>SLA på 99,9% oppetid</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="billing-3" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-left">Får jeg regning/faktura for mine køb?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Ja, du får automatisk en regning via email efter hver betaling. Regningen indeholder:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li>Detaljeret specifikation af købte tjenester</li>
                <li>CVR-nummer og momsinformation</li>
                <li>Dato og transaktions-ID</li>
                <li>PDF-format til dit regnskab</li>
              </ul>
              <p className="text-muted-foreground">
                Virksomheder kan få tilpassede fakturaer med egen referenceordre og leveringsadresse.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Dataforståelse */}
          <AccordionItem value="data-understanding-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-left">Hvad betyder kreditvurderingen?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Vores kreditvurdering er en samlet vurdering af virksomhedens finansielle sundhed og betalingsevne:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-green-700">A (Excellent)</span>
                    <span className="text-sm text-muted-foreground ml-2">Meget lav risiko</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-blue-700">B (God)</span>
                    <span className="text-sm text-muted-foreground ml-2">Lav risiko</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-yellow-700">C (Middel)</span>
                    <span className="text-sm text-muted-foreground ml-2">Moderat risiko</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-red-50 rounded">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-red-700">D (Høj risiko)</span>
                    <span className="text-sm text-muted-foreground ml-2">Høj betalingsrisiko</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                Vurderingen baseres på regnskabsdata, betalingshistorik, branche og markedsforhold.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-understanding-2" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span className="text-left">Hvorfor vises der ikke regnskabsdata for nogle virksomheder?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Der kan være flere årsager til manglende regnskabsdata:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                <li><strong>Ny virksomhed:</strong> Har ikke nået sin første regnskabsaflæggelse</li>
                <li><strong>Manglende indberetning:</strong> Virksomheden har ikke indsendt årsrapport</li>
                <li><strong>Fritaget for indberetning:</strong> Meget små virksomheder er nogle gange fritaget</li>
                <li><strong>Ophørt virksomhed:</strong> Regnskabsdata er ikke længere tilgængelig</li>
                <li><strong>Special virksomhedsformer:</strong> Fonde, foreninger mv. har andre regler</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Vi viser altid, hvornår data sidst blev opdateret, og om der mangler oplysninger.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Tracking og monitoring */}
          <AccordionItem value="tracking-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-left">Hvor ofte får jeg opdateringer fra Track & Følg?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Du får opdateringer, så snart der sker ændringer i de virksomheder, du følger:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li><strong>Øjeblikkeligt:</strong> Ved kritiske ændringer (konkurs, opløsning)</li>
                <li><strong>Dagligt:</strong> Ved ledelsesændringer, nye regnskaber</li>
                <li><strong>Ugentligt:</strong> Sammenfatning af mindre ændringer</li>
                <li><strong>Månedligt:</strong> Komplet statusrapport</li>
              </ul>
              <p className="text-muted-foreground">
                Du kan selv vælge, hvilke typer ændringer du vil følge, og hvor ofte du vil have besked.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tracking-2" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span className="text-left">Kan jeg få SMS-notifikationer i stedet for emails?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Ja, for premium-kunder tilbyder vi SMS-notifikationer for kritiske ændringer:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li>Konkurs eller likvidation</li>
                <li>Væsentlige ledelsesændringer</li>
                <li>Kapitalændringer over 1 mio. kr.</li>
                <li>Adresseændringer</li>
              </ul>
              <p className="text-muted-foreground">
                SMS-tjenesten koster 2 kr. pr. besked og kan aktiveres i dine kontoindstillinger.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Internationale virksomheder */}
          <AccordionItem value="international-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span className="text-left">Kan jeg finde oplysninger om udenlandske virksomheder?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Vi fokuserer primært på danske virksomheder, men kan også levere begrænset information om:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li><strong>Nordiske virksomheder:</strong> Grundlæggende oplysninger fra offentlige registre</li>
                <li><strong>EU-virksomheder:</strong> Basis virksomhedsdata hvor tilgængeligt</li>
                <li><strong>Internationale datterselskaber:</strong> Af danske virksomheder</li>
                <li><strong>Udenlandske ejere:</strong> Af danske virksomheder</li>
              </ul>
              <p className="text-muted-foreground">
                For omfattende international virksomhedsanalyse anbefaler vi samarbejde med specialiserede leverandører.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Troubleshooting */}
          <AccordionItem value="troubleshoot-1" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span className="text-left">Hjemmesiden virker langsom eller går ned</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Hvis du oplever tekniske problemer, kan du prøve følgende:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li>Opdater din browser eller prøv en anden browser</li>
                <li>Ryd cache og cookies</li>
                <li>Tjek din internetforbindelse</li>
                <li>Prøv at tilgå siden fra en anden enhed</li>
              </ul>
              <p className="text-muted-foreground mb-3">
                Vi overvåger vores systemer 24/7 og har normalt 99,9% oppetid. Hvis problemet fortsætter, 
                kontakt os på support@selskabsinfo.dk med detaljer om:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Hvilken browser og version du bruger</li>
                <li>Tidspunktet for problemet</li>
                <li>Eventuelle fejlmeddelelser</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="troubleshoot-2" className="border rounded-lg">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span className="text-left">Jeg modtager ikke emails fra jer</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <p className="text-muted-foreground mb-3">
                Hvis du ikke modtager emails fra os, tjek følgende:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mb-3">
                <li><strong>Spam-mappe:</strong> Tjek om emails er endt i spam</li>
                <li><strong>Email-adresse:</strong> Kontroller at din email er korrekt i din profil</li>
                <li><strong>Whitelisting:</strong> Tilføj @selskabsinfo.dk til dine godkendte afsendere</li>
                <li><strong>Filtre:</strong> Tjek om du har email-filtre, der blokerer vores emails</li>
              </ul>
              <p className="text-muted-foreground">
                Vi sender emails fra noreply@selskabsinfo.dk og support@selskabsinfo.dk. 
                Kontakt os hvis problemet fortsætter, så vi kan undersøge leveringsstatus.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Har du andre spørgsmål?</h3>
            <p className="text-muted-foreground mb-4">
              Hvis du ikke kan finde svaret på dit spørgsmål her, er du velkommen til at kontakte os.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>kontakt@selskabsinfo.dk</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+45 12 34 56 78</span>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link to="/">Tilbage til søgning</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
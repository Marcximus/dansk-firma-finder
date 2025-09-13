import React from 'react';
import Layout from '@/components/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Search, Building, FileText, Users, Shield, Phone, Mail } from 'lucide-react';
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
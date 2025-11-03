import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ShoppingCart, CreditCard, Package, RotateCcw, FileText,
  Shield, UserCheck, Globe, AlertCircle, Scale, Lock, Users, Bell
} from "lucide-react";

const HandelsbetingelserPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <SEO
        title="Handelsbetingelser - SelskabsInfo"
        description="Læs vores handelsbetingelser for køb af virksomhedsrapporter og premium tjenester på SelskabsInfo."
        canonicalUrl="https://selskabsinfo.dk/handelsbetingelser"
        keywords="handelsbetingelser, køb, betaling, levering, fortrydelsesret, SelskabsInfo"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage
        </Button>

        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Handelsbetingelser</h1>
            <p className="text-muted-foreground">
              Gældende fra 1. januar 2025
            </p>
          </div>

          {/* Introduktion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Introduktion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Disse handelsbetingelser ("Betingelserne") udgør en juridisk bindende aftale mellem dig ("Kunden", "du" eller "din") 
                og SelskabsInfo ("vi", "os" eller "vores") vedrørende dit køb og brug af digitale tjenester og produkter 
                tilgængelige via vores platform på selskabsinfo.dk.
              </p>
              <p>
                Ved at gennemføre et køb, oprette en konto eller på anden måde bruge vores tjenester, accepterer du automatisk 
                at være bundet af disse Betingelser. Hvis du ikke accepterer disse Betingelser i deres helhed, må du ikke 
                bruge eller købe vores tjenester.
              </p>
              <p>
                SelskabsInfo leverer omfattende virksomhedsdata, detaljerede rapporter, analyseværktøjer og premium tjenester 
                til både private forbrugere, små virksomheder, mellemstore virksomheder og store erhvervskunder i Danmark. 
                Vores data stammer fra offentlige danske registre, primært CVR-registret (Det Centrale Virksomhedsregister).
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="font-semibold mb-2">Vigtigt at læse:</p>
                <p className="text-sm">
                  Disse Betingelser skal læses i sammenhæng med vores Servicevilkår, Privatlivspolitik og Datakilder-information. 
                  I tilfælde af modstrid mellem disse dokumenter, har de rangorden som følger: 1) Handelsbetingelser, 
                  2) Servicevilkår, 3) Privatlivspolitik.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Produkter og priser */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Produkter og Priser
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Produkttyper</h3>
                <p className="mb-2">Vi tilbyder følgende kategorier af digitale produkter og tjenester:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li><span className="font-semibold">Virksomhedsrapporter (PDF):</span> Omfattende rapporter med virksomhedsdata, 
                  finansielle nøgletal, ejerforhold, ledelsesoplysninger og historiske data. Leveres som downloadbar PDF-fil.</li>
                  <li><span className="font-semibold">Premium abonnementer:</span> Løbende adgang til udvidede funktioner, 
                  ubegrænset søgning, avancerede filtre og prioriteret support. Tilgængelig som månedlige eller årlige abonnementer.</li>
                  <li><span className="font-semibold">Track & Følg tjenester:</span> Automatisk overvågning af virksomhedsændringer 
                  med notifikationer via email eller SMS. Inkluderer besked om nye regnskaber, ændringer i ledelse, adresseændringer mv.</li>
                  <li><span className="font-semibold">Fremhævning af virksomheder:</span> Markedsføringstjenester der placerer 
                  virksomhedsprofiler højere i søgeresultater og giver adgang til branding-funktioner som logo, banner og beskrivelse.</li>
                  <li><span className="font-semibold">API adgang:</span> Programmatisk adgang til vores database via REST API 
                  med forskellige rate limits afhængig af abonnementsniveau.</li>
                  <li><span className="font-semibold">Bulk data downloads:</span> Mulighed for at downloade større datasæt 
                  til analyse og integration i egne systemer.</li>
                  <li><span className="font-semibold">Konsulentydelser:</span> Skræddersyede analyser, due diligence rapporter 
                  og datarensning efter individuel aftale.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Priser og momsforhold</h3>
                <p>
                  Alle priser er angivet i danske kroner (DKK) inklusiv dansk moms (25%), medmindre andet udtrykkeligt er angivet. 
                  For erhvervskunder med gyldigt momsnummer i et andet EU-land kan der gælde særlige momsregler (reverse charge).
                </p>
                <p className="mt-2">
                  Vi forbeholder os ret til at ændre priser uden forudgående varsel for nye køb. For eksisterende abonnementer 
                  gælder prisændringer først ved næste fornyelse, og du vil modtage mindst 30 dages varsel, jf. afsnit om abonnementer.
                </p>
                <p className="mt-2">
                  Priser kan variere baseret på valutakurser for internationale betalinger. Den endelige pris bekræftes før 
                  gennemførelse af betaling.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Særlige tilbud og rabatter</h3>
                <p>
                  Vi tilbyder fra tid til anden kampagnepriser, introduktionstilbud og rabatter. Disse kan have begrænsede 
                  perioder, være begrænsede til et bestemt antal kunder eller være betinget af bestemte kriterier.
                </p>
                <p className="mt-2">
                  Medmindre andet udtrykkeligt er angivet, kan rabatter og tilbud ikke kombineres. Vi forbeholder os ret til 
                  at annullere ordrer, der misbrug tilbudskoder eller kampagnepriser.
                </p>
                <p className="mt-2">
                  Studerende, almennyttige organisationer og offentlige myndigheder kan være berettiget til særlige rabatter. 
                  Kontakt os på support@selskabsinfo.dk for yderligere information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Produktbeskrivelser og ændringer</h3>
                <p>
                  Vi bestræber os på at give nøjagtige og opdaterede beskrivelser af vores produkter. Vi forbeholder os dog 
                  ret til at ændre specifikationer, funktioner og produktbeskrivelser uden varsel, hvis det er nødvendigt 
                  af tekniske eller forretningsmæssige grunde.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Køb og betaling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Køb og Betaling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Accepterede betalingsmetoder</h3>
                <p className="mb-2">Vi accepterer følgende betalingsmetoder via vores betalingsudbyder Stripe:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li><span className="font-semibold">Betalingskort:</span> Dankort, Visa, Visa Electron, Mastercard, Maestro, American Express</li>
                  <li><span className="font-semibold">MobilePay:</span> Dansk mobilbetaling</li>
                  <li><span className="font-semibold">Apple Pay og Google Pay:</span> For understøttede enheder</li>
                  <li><span className="font-semibold">Faktura:</span> Kun for erhvervskunder efter forudgående kreditgodkendelse. 
                  Betalingsfrist på fakturaer er 14 dage netto fra fakturadato.</li>
                  <li><span className="font-semibold">Bankoverførsel:</span> For større ordrer over 10.000 DKK efter aftale</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Betalingsbetingelser og tidspunkt</h3>
                <p>
                  Betaling skal ske i forbindelse med købet, før produktet eller tjenesten leveres. For engangsprodukt som 
                  virksomhedsrapporter skal der betales fuldt ud ved køb.
                </p>
                <p className="mt-2">
                  For abonnementer opkræves betalingen automatisk ved hver fornyelsesperiode (månedligt eller årligt), 
                  medmindre abonnementet opsiges inden fornyelsestidspunktet. Du modtager en kvittering via email 
                  ved hver automatisk betaling.
                </p>
                <p className="mt-2">
                  Hvis en automatisk betaling mislykkes, vil vi forsøge at opkræve betalingen igen op til 3 gange over 
                  en periode på 7 dage. Hvis betalingen fortsat mislykkes, vil dit abonnement blive suspenderet indtil 
                  betalingen er gennemført.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Betalingssikkerhed og PCI-compliance</h3>
                <p>
                  Alle betalinger håndteres via Stripe, en PCI DSS Level 1 certificeret betalingsudbyder, der opfylder 
                  de højeste internationale sikkerhedsstandarder for håndtering af betalingskortdata.
                </p>
                <p className="mt-2">
                  SelskabsInfo gemmer aldrig dine komplette betalingskortoplysninger. Vi gemmer kun de sidste 4 cifre 
                  af dit kortnummer og udløbsdato for at hjælpe dig med at identificere dit kort.
                </p>
                <p className="mt-2">
                  Alle betalingstransaktioner er krypteret med TLS 1.3 (Transport Layer Security) og bruger 3D Secure 
                  autentificering hvor det er påkrævet af din bank.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Mistænkelige transaktioner og svindel</h3>
                <p>
                  Vi forbeholder os ret til at nægte eller annullere ordrer, hvis vi har grund til at mistænke svindel, 
                  misbrug af stjålne betalingskort eller andre uregelmæssigheder. I sådanne tilfælde kan vi kræve 
                  yderligere dokumentation for din identitet eller betalingsmetode.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Betalingsfejl og forsinket betaling</h3>
                <p>
                  Ved forsinket betaling for fakturaordrer påløber der rente i henhold til renteloven (p.t. Nationalbankens 
                  diskonto + 8%). Derudover kan vi opkræve et administrationsgebyr på 100 DKK ved hver rykkerskrivelse.
                </p>
                <p className="mt-2">
                  Ved forsinket betaling ud over 30 dage kan sagen overgives til inkasso, og du vil være ansvarlig for 
                  alle omkostninger forbundet hermed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Valuta og internationale transaktioner</h3>
                <p>
                  Alle priser er angivet i danske kroner (DKK). Hvis din bank bruger en anden valuta, vil din bank eller 
                  kortudsteder konvertere beløbet til din lokale valuta og kan opkræve et gebyr for valutaomveksling. 
                  Vi er ikke ansvarlige for eventuelle vekselgebyrer.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Kvitteringer og fakturaer</h3>
                <p>
                  Du modtager automatisk en kvittering via email ved hvert køb. For erhvervskunder udstedes der en 
                  momsspecificeret faktura, der opfylder gældende lovkrav.
                </p>
                <p className="mt-2">
                  Hvis du ikke modtager kvittering eller faktura inden for 24 timer, kontakt venligst 
                  support@selskabsinfo.dk med dit ordrenummer.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Levering */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Levering og Adgang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Digitale produkter og øjeblikkelig levering</h3>
                <p>
                  Alle vores produkter og tjenester er digitale og leveres elektronisk. Der findes ingen fysiske produkter 
                  eller forsendelser. Levering sker øjeblikkeligt efter gennemført og verificeret betaling.
                </p>
                <p className="mt-2">
                  Du får adgang til dine køb via din personlige bruger-konto på selskabsinfo.dk. Rapporter kan downloades 
                  direkte, og abonnementer aktiveres automatisk med adgang til alle relevante funktioner.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Forventet leveringstid pr. produkttype</h3>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li><span className="font-semibold">Virksomhedsrapporter (PDF):</span> Øjeblikkelig download umiddelbart 
                  efter betaling. Rapporten genereres dynamisk med de nyeste tilgængelige data og er klar til download inden 
                  for 30 sekunder.</li>
                  <li><span className="font-semibold">Premium abonnement:</span> Aktiveres inden for 5 minutter efter 
                  gennemført betaling. Du modtager en bekræftelsesmail med instruktioner.</li>
                  <li><span className="font-semibold">Track & Følg opsætning:</span> Aktiveres inden for 1 time. Første 
                  notifikationer sendes ud baseret på dine indstillinger.</li>
                  <li><span className="font-semibold">API nøgler:</span> Genereres og leveres via email inden for 24 timer 
                  på hverdage. Inkluderer fuld dokumentation og onboarding guide.</li>
                  <li><span className="font-semibold">Fremhævningspakker:</span> Aktiveres inden for 4-24 timer efter 
                  modtagelse af dit logo og bannermateriale. Vi gennemgår materialet og kontakter dig ved spørgsmål.</li>
                  <li><span className="font-semibold">Bulk data downloads:</span> Leveres via sikker downloadlink inden 
                  for 48 timer på hverdage, afhængig af datamængde.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adgang til tidligere køb</h3>
                <p>
                  Alle dine tidligere køb er tilgængelige i din konto under "Mine køb" eller "Download historie". 
                  Virksomhedsrapporter kan gendownloades ubegrænset i 90 dage efter køb. Herefter arkiveres de, 
                  men kan genbestilles med opdaterede data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Tekniske problemer og forsinket levering</h3>
                <p>
                  Hvis du oplever problemer med at få adgang til dit køb, eller hvis leveringen er forsinket ud over 
                  de angivne tidsrammer, bedes du kontakte vores support på support@selskabsinfo.dk inden for 48 timer.
                </p>
                <p className="mt-2">
                  Ved dokumenterede tekniske problemer på vores side, der forsinker leveringen med mere end 72 timer, 
                  har du ret til fuld refundering, hvis du ønsker at annullere købet.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Email levering og spam-filtre</h3>
                <p>
                  Vigtige meddelelser, kvitteringer og produkter sendes til den email-adresse, der er tilknyttet din konto. 
                  Sørg for at tjekke din spam/junk-mappe, hvis du ikke modtager forventede emails inden for den angivne tid.
                </p>
                <p className="mt-2">
                  Vi anbefaler at tilføje @selskabsinfo.dk til din sikre afsenderliste for at sikre problemfri levering.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Systemnedtid og planlagt vedligeholdelse</h3>
                <p>
                  I sjældne tilfælde kan systemet være utilgængeligt på grund af vedligeholdelse eller uforudsete tekniske 
                  problemer. Planlagt vedligeholdelse varsles minimum 48 timer i forvejen via email og på vores platform.
                </p>
                <p className="mt-2">
                  Under nedetid kan du ikke få adgang til eller købe nye produkter. Eksisterende abonnementer forlænges 
                  automatisk med den tid, systemet var nede, hvis nedetiden overstiger 24 timer.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Kontooprette og brugervilkår */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Kontoopretter og Brugervilkår
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Krav til kontoopretter</h3>
                <p>
                  For at oprette en konto og købe produkter skal du være mindst 18 år og have fuld handleevne. 
                  Ved registrering bekræfter du, at de oplysninger, du angiver, er sandfærdige og korrekte.
                </p>
                <p className="mt-2">
                  Erhvervskonti skal registreres med gyldigt CVR-nummer og firmaoplysninger. Vi forbeholder os ret til 
                  at verificere virksomhedsoplysninger før aktivering af erhvervskonti med særlige rettigheder.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ansvar for kontooplysninger</h3>
                <p>
                  Du er fuldt ansvarlig for at holde dine login-oplysninger (email og password) fortrolige og sikre. 
                  Del aldrig dine login-oplysninger med andre personer.
                </p>
                <p className="mt-2">
                  Du er ansvarlig for al aktivitet, der sker via din konto. Hvis du opdager uautoriseret brug af din 
                  konto, skal du straks informere os på support@selskabsinfo.dk og ændre dit password.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Kontoophør og suspension</h3>
                <p>
                  Vi forbeholder os ret til at suspendere eller permanent lukke konti, der:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Misbruger tjenesten eller overtræder disse betingelser</li>
                  <li>Bruger tjenesten til ulovlige formål</li>
                  <li>Deler konti med flere brugere uden relevant licens</li>
                  <li>Forsøger at omgå tekniske begrænsninger eller sikkerhedsforanstaltninger</li>
                  <li>Udøver automatiseret scraping uden API-licens</li>
                  <li>Leverer falske oplysninger ved registrering</li>
                </ul>
                <p className="mt-2">
                  Ved suspension eller lukning af konto på grund af overtrædelse gives der ingen refundering af betalte 
                  abonnementer eller produkter.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Brugerens forpligtelser</h3>
                <p>
                  Som bruger forpligter du dig til at:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Bruge tjenesten i overensstemmelse med dansk lovgivning</li>
                  <li>Respektere andres privatlivs og ikke bruge data til chikane eller krænkelser</li>
                  <li>Ikke videresælge eller distribuere data uden særlig aftale</li>
                  <li>Ikke reverse-engineere, dekompilere eller forsøge at udlede kildekode</li>
                  <li>Overholde databeskyttelseslovgivning (GDPR) ved brug af persondata</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Fortrydelsesret */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Fortrydelsesret
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">14 dages fortrydelsesret</h3>
                <p>
                  Som forbruger har du 14 dages fortrydelsesret i henhold til forbrugeraftalelovens regler.
                  Fortrydelsesretten regnes fra den dag, du modtager en ordrebekræftelse.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Undtagelser for digitale produkter</h3>
                <p className="font-semibold text-amber-600 mb-2">Vigtigt:</p>
                <p>
                  For digitale produkter, der leveres øjeblikkeligt (virksomhedsrapporter, API adgang),
                  bortfalder fortrydelsesretten, når du begynder at downloade eller bruge produktet.
                </p>
                <p className="mt-2">
                  Ved køb giver du dit udtrykkelige samtykke til, at vi leverer produktet straks, og du
                  accepterer dermed, at fortrydelsesretten bortfalder.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Abonnementer</h3>
                <p>
                  For månedlige og årlige abonnementer har du fuld fortrydelsesret i de første 14 dage,
                  hvis du ikke har brugt tjenesten. Efter 14 dage kan abonnementet opsiges til udløb af
                  den betalte periode.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sådan fortryder du</h3>
                <p>
                  Du kan fortryde dit køb ved at sende en e-mail til support@selskabsinfo.dk med
                  dit ordrenummer og angivelse af, at du ønsker at fortryde købet.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Returnering af beløb</h3>
                <p>
                  Hvis dit køb fortrydes rettidigt og lovligt, refunderer vi det fulde beløb inden for 14 dage
                  til samme betalingsmetode, som blev brugt ved købet.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Abonnementer */}
          <Card>
            <CardHeader>
              <CardTitle>Abonnementer og Opsigelse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Automatisk fornyelse</h3>
                <p>
                  Abonnementer fornyes automatisk ved hver periodes udløb (månedligt eller årligt),
                  medmindre de opsiges senest 24 timer før fornyelsesdatoen.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Opsigelse</h3>
                <p>
                  Du kan til enhver tid opsige dit abonnement via din profil under "Indstillinger" eller
                  ved at kontakte support@selskabsinfo.dk.
                </p>
                <p className="mt-2">
                  Ved opsigelse bevarer du adgang til tjenesten indtil udløbet af den betalte periode.
                  Der gives ikke refusion for ubrugte dage.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Prisændringer</h3>
                <p>
                  Ved prisændringer på eksisterende abonnementer vil du modtage besked mindst 30 dage før
                  den nye pris træder i kraft. Du har ret til at opsige dit abonnement inden da.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reklamationsret */}
          <Card>
            <CardHeader>
              <CardTitle>Reklamationsret og Garanti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Reklamation ved fejl</h3>
                <p>
                  Hvis du oplever tekniske fejl eller mangler ved vores tjenester, skal du reklamere
                  straks og senest inden for 2 måneder efter, at fejlen blev opdaget.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Datakvalitet</h3>
                <p>
                  Vi garanterer ikke, at alle data er 100% korrekte eller fuldstændige, da data kommer fra
                  offentlige registre. Se vores servicevilkår for yderligere information om ansvarsbegrænsning.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Kontakt ved reklamation</h3>
                <p>
                  Reklamationer skal sendes til support@selskabsinfo.dk med en beskrivelse af problemet
                  samt dokumentation (screenshots, ordrenummer, osv.).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ansvar og misbrug */}
          <Card>
            <CardHeader>
              <CardTitle>Ansvar og Misbrug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Brugeransvar</h3>
                <p>
                  Du er ansvarlig for at holde dine login-oplysninger sikre. Du må ikke dele din adgang
                  med andre. Vi forbeholder os ret til at lukke konti ved mistanke om misbrug.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ulovlig brug</h3>
                <p>
                  Det er ikke tilladt at bruge vores tjenester til ulovlige formål, inklusiv men ikke
                  begrænset til bedrageri, identitetstyveri, chikane eller overtrædelse af privatlivs-lovgivning.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Konsekvenser ved misbrug</h3>
                <p>
                  Ved misbrug eller overtrædelse af vores vilkår kan vi øjeblikkeligt lukke din konto
                  uden refusion og forbeholde os ret til at anmelde forholdet til myndighederne.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tvister */}
          <Card>
            <CardHeader>
              <CardTitle>Tvistløsning og Lovvalg</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Dansk ret</h3>
                <p>
                  Disse handelsbetingelser er underlagt dansk ret. Eventuelle tvister afgøres ved danske domstole.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Forbrugeroplysninger</h3>
                <p>Hvis du som forbruger har en klage, kan du kontakte:</p>
                <ul className="space-y-2 list-disc list-inside mt-2">
                  <li>Konkurrence- og Forbrugerstyrelsen på www.forbrug.dk</li>
                  <li>Center for Klageløsning på www.forbrug.dk/klagecenter</li>
                  <li>EU's online klageportal på ec.europa.eu/consumers/odr/</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Vores kontaktoplysninger</h3>
                <p>SelskabsInfo</p>
                <p>E-mail: support@selskabsinfo.dk</p>
                <p>Telefon: +45 XX XX XX XX</p>
              </div>
            </CardContent>
          </Card>

          {/* Intellektuel ejendomsret */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Intellektuel Ejendomsret og Ophavsret
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Vores rettigheder</h3>
                <p>
                  Al indhold på SelskabsInfo, herunder men ikke begrænset til software, design, grafik, logo, tekst, 
                  kode, databaser, funktionalitet og brugergrænseflader, er beskyttet af dansk og international 
                  ophavsret, varemærkelov og andre love om intellektuel ejendomsret.
                </p>
                <p className="mt-2">
                  SelskabsInfo og tilhørende logoer er registrerede varemærker. Du må ikke bruge vores varemærker 
                  uden forudgående skriftlig tilladelse.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Licens til brug af data</h3>
                <p>
                  Ved køb af produkter får du en begrænset, ikke-eksklusiv, ikke-overdragelig licens til at bruge 
                  dataene til eget brug eller internt i din virksomhed, afhængig af dit abonnement.
                </p>
                <p className="mt-2">
                  Du må ikke:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Videresælge eller distribuere data til tredjeparter uden særlig aftale</li>
                  <li>Publicere data offentligt (undtagen små uddrag med kilde-angivelse)</li>
                  <li>Bruge data til at opbygge konkurrerende databaser</li>
                  <li>Udlede eller rekonstruere vores proprietære algoritmer</li>
                  <li>Fjerne vandmærker eller copyright-beskeder fra downloadede dokumenter</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Offentlige data og vores bearbejdning</h3>
                <p>
                  Mens en stor del af vores rådata stammer fra offentlige danske registre, har vi tilføjet betydelig 
                  værdi gennem:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Strukturering, normalisering og validering af data</li>
                  <li>Krydstjek og sammenlægning fra multiple kilder</li>
                  <li>Udvikling af søgealgoritmer og analyseværktøjer</li>
                  <li>Berigelse med supplerende informationer</li>
                  <li>Visualisering og præsentation</li>
                </ul>
                <p className="mt-2">
                  Denne bearbejdning er beskyttet af ophavsret og database-rettigheder uafhængigt af rådata-kilderne.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Brugerindhold</h3>
                <p>
                  Hvis du uploader materiale (fx logo eller beskrivelser) til din virksomhedsprofil, giver du os 
                  en ikke-eksklusiv licens til at vise og behandle dette materiale som en del af tjenesten.
                </p>
                <p className="mt-2">
                  Du erklærer og garanterer, at du har alle nødvendige rettigheder til det materiale, du uploader, 
                  og at det ikke krænker tredjeparts rettigheder.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* GDPR og databeskyttelse */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Databeskyttelse og GDPR Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Databehandleransvar</h3>
                <p>
                  SelskabsInfo fungerer som dataansvarlig for de personoplysninger, vi indsamler fra vores brugere 
                  (kontooplysninger, betalingsinformationer, brugshistorik). Se vores Privatlivspolitik for detaljerede 
                  oplysninger om, hvordan vi behandler dine personoplysninger.
                </p>
                <p className="mt-2">
                  Når du bruger vores tjeneste til at søge og tilgå informationer om tredjeparter (virksomheder og personer), 
                  fungerer vi som databehandler, og du fungerer som dataansvarlig for din brug af disse data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dit ansvar som dataansvarlig</h3>
                <p>
                  Når du tilgår personoplysninger gennem vores platform, er du forpligtet til at:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Overholde GDPR og anden relevant databeskyttelseslovgivning</li>
                  <li>Kun bruge persondata til lovlige og legitime formål</li>
                  <li>Have et lovligt behandlingsgrundlag for din brug af data</li>
                  <li>Respektere registreredes rettigheder (indsigt, sletning, berigtigelse mv.)</li>
                  <li>Implementere passende tekniske og organisatoriske sikkerhedsforanstaltninger</li>
                  <li>Ikke videregive personoplysninger til tredjeparter uden lovhjemmel</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Databehandleraftale</h3>
                <p>
                  For erhvervskunder, der systematisk behandler personoplysninger via vores platform, kan der indgås 
                  en databehandleraftale, der præciserer ansvar og forpligtelser i henhold til GDPR art. 28.
                </p>
                <p className="mt-2">
                  Kontakt os på support@selskabsinfo.dk for at indgå en databehandleraftale.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sikkerhedsforanstaltninger</h3>
                <p>
                  Vi implementerer omfattende tekniske og organisatoriske sikkerhedsforanstaltninger, herunder:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>TLS/SSL kryptering af al datatransmission</li>
                  <li>Krypterede databaser med adgangskontrol</li>
                  <li>Regelmæssige sikkerhedsaudits og penetrationstest</li>
                  <li>Logs og overvågning af uautoriseret adgang</li>
                  <li>Backup og disaster recovery procedurer</li>
                  <li>Medarbejdertræning i datasikkerhed og fortrolighed</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Databrud</h3>
                <p>
                  I tilfælde af et databrud, der kompromitterer personoplysninger, vil vi i overensstemmelse med GDPR 
                  informere berørte brugere og relevante myndigheder inden for 72 timer.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Force Majeure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Force Majeure og Ansvarsbegrænsning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Force Majeure begivenheder</h3>
                <p>
                  Vi er ikke ansvarlige for forsinkelser eller manglende opfyldelse af vores forpligtelser, hvis dette 
                  skyldes omstændigheder uden for vores rimelige kontrol, herunder men ikke begrænset til:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Naturkatastrofer (jordskælv, oversvømmelser, storme, brand)</li>
                  <li>Krig, terrorisme, optøjer eller civil uorden</li>
                  <li>Strejke, lockout eller andre arbejdskonflikter</li>
                  <li>Cyberangreb, hacking eller DDoS-angreb</li>
                  <li>Strømsvigt eller telekommunikationsnedbrud</li>
                  <li>Lovændringer, myndighedsindgreb eller ekspropriation</li>
                  <li>Pandemier eller epidemier</li>
                  <li>Problemer hos tredjepartsleverandører (hosting, betalingsudbydere, datakilder)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ansvarsbegrænsning</h3>
                <p className="font-semibold text-amber-600 mb-2">Vigtig juridisk information:</p>
                <p>
                  I det omfang loven tillader det, er SelskabsInfos samlede ansvar overfor dig begrænset til det beløb, 
                  du har betalt til os i de seneste 12 måneder for den specifikke tjeneste, der gav anledning til kravet.
                </p>
                <p className="mt-2">
                  Vi er under ingen omstændigheder ansvarlige for:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Indirekte tab, følgeskader eller driftstab</li>
                  <li>Tab af forventet profit eller omsætning</li>
                  <li>Tab af data (udover refundering af betalte beløb)</li>
                  <li>Tab af goodwill eller omdømme</li>
                  <li>Beslutninger truffet baseret på vores data</li>
                  <li>Fejl eller unøjagtigheder i data fra tredjepartskilder</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ingen garanti for kontinuitet</h3>
                <p>
                  Vi garanterer ikke uafbrudt, fejlfri eller sikker adgang til tjenesten. Tjenesten leveres "as is" 
                  og "as available" uden nogen form for garanti, hverken udtrykkelig eller underforstået.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Undtagelser fra ansvarsbegrænsning</h3>
                <p>
                  Intet i disse betingelser begrænser vores ansvar for:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Død eller personskade forårsaget af vores forsømmelighed</li>
                  <li>Bedrageri eller svigagtig urigtig fremstilling</li>
                  <li>Ethvert andet ansvar, der ikke lovligt kan begrænses eller udelukkes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Tredjepartsleverandører */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tredjepartsleverandører og Integrationer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Afhængighed af tredjeparter</h3>
                <p>
                  Vores tjeneste er afhængig af forskellige tredjepartsleverandører og datakilder:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li><span className="font-semibold">Stripe:</span> Betalingsbehandling og abonnementshåndtering</li>
                  <li><span className="font-semibold">CVR-registret:</span> Primær datakilde for virksomhedsoplysninger</li>
                  <li><span className="font-semibold">Cloud hosting (Supabase/AWS):</span> Infrastruktur og datalagring</li>
                  <li><span className="font-semibold">Email leverandører:</span> Transaktionelle emails og notifikationer</li>
                  <li><span className="font-semibold">CDN og DNS udbydere:</span> Content delivery og performance</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ansvar for tredjepartstjenester</h3>
                <p>
                  Vi er ikke ansvarlige for problemer, nedetid eller datatab forårsaget af tredjepartsleverandører. 
                  Vi bestræber os dog på at vælge pålidelige partnere og have backup-løsninger, hvor det er muligt.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Links til eksterne websites</h3>
                <p>
                  Vores platform kan indeholde links til eksterne websites (fx virksomheders hjemmesider). Vi er ikke 
                  ansvarlige for indhold, privatlivspolitik eller praksis på disse eksterne sites.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">API integrationer</h3>
                <p>
                  Hvis du integrerer vores API i dine systemer, er du ansvarlig for at:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Overholde rate limits og tekniske specifikationer</li>
                  <li>Håndtere fejl og nedetid i din applikation</li>
                  <li>Ikke cache eller gemme data længere end tilladt i din licens</li>
                  <li>Opdatere til nye API versioner inden deprecated versioner lukkes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Support og kommunikation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Support, Kommunikation og Meddelelser
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Supportkanaler og svartider</h3>
                <p>
                  Vi tilbyder følgende supportkanaler:
                </p>
                <ul className="space-y-2 list-disc list-inside ml-4 mt-2">
                  <li><span className="font-semibold">Email support (support@selskabsinfo.dk):</span> Tilgængelig for alle 
                  kunder. Forventet svartid 24-48 timer på hverdage.</li>
                  <li><span className="font-semibold">Prioriteret support:</span> Premium og Enterprise abonnenter får 
                  svar inden for 4-8 timer på hverdage.</li>
                  <li><span className="font-semibold">Telefonsupport:</span> Kun tilgængelig for Enterprise kunder efter aftale.</li>
                  <li><span className="font-semibold">Hjælpecenter og FAQ:</span> Self-service dokumentation tilgængelig 24/7.</li>
                  <li><span className="font-semibold">Statusside:</span> Real-time information om systemstatus og planlagt vedligeholdelse.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Supportomfang</h3>
                <p>
                  Vores support dækker:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Tekniske problemer med platformen</li>
                  <li>Hjælp til at bruge funktioner</li>
                  <li>Fakturerings- og abonnementsspørgsmål</li>
                  <li>Datakvalitetsproblemer</li>
                  <li>API dokumentation og integration support</li>
                </ul>
                <p className="mt-2">
                  Vi tilbyder ikke:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li>Juridisk eller finansiel rådgivning</li>
                  <li>Skræddersyet dataanalyse (medmindre aftalt separat)</li>
                  <li>Support til tredjepartssoftware eller -integrationer</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Officielle meddelelser</h3>
                <p>
                  Alle vigtige meddelelser, herunder ændringer af betingelser, prisændringer og sikkerhedsopdateringer, 
                  sendes til den email-adresse, der er registreret på din konto.
                </p>
                <p className="mt-2">
                  Det er dit ansvar at holde din email-adresse opdateret og tjekke din email regelmæssigt. Meddelelser 
                  anses for modtaget 24 timer efter afsendelse.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hvordan du kontakter os</h3>
                <p>
                  For alle henvendelser vedrørende disse handelsbetingelser eller vores tjenester:
                </p>
                <ul className="space-y-1 list-disc list-inside ml-4 mt-2">
                  <li><span className="font-semibold">Email:</span> support@selskabsinfo.dk</li>
                  <li><span className="font-semibold">Telefon:</span> +45 XX XX XX XX (kun erhvervskunder)</li>
                  <li><span className="font-semibold">Post:</span> SelskabsInfo, [Adresse], [Postnummer] [By]</li>
                  <li><span className="font-semibold">CVR:</span> XXXXXXXX</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Overdragelse og separabilitet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Overdragelse, Separabilitet og Øvrige Bestemmelser
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Overdragelse af rettigheder</h3>
                <p>
                  Du må ikke overdrager, overdrage eller på anden måde overføre dine rettigheder eller forpligtelser 
                  under disse betingelser til tredjeparter uden vores forudgående skriftlige samtykke.
                </p>
                <p className="mt-2">
                  Vi kan frit overdrage vores rettigheder og forpligtelser til et koncernselskab, en efterfølger 
                  eller erhverver af vores virksomhed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Separabilitet (severability)</h3>
                <p>
                  Hvis nogen del af disse betingelser findes ulovlige, ugyldige eller ikke kan håndhæves af en domstol, 
                  skal denne del udskilles, og de resterende bestemmelser forbliver i fuld kraft.
                </p>
                <p className="mt-2">
                  I sådanne tilfælde skal den ugyldige bestemmelse erstattes af en gyldig bestemmelse, der kommer så 
                  tæt som muligt på den tilsigtede økonomiske effekt.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ingen afkald på rettigheder</h3>
                <p>
                  Vores manglende håndhævelse af nogen rettighed eller bestemmelse i disse betingelser udgør ikke et 
                  afkald på denne rettighed eller bestemmelse.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hele aftalen</h3>
                <p>
                  Disse handelsbetingelser, sammen med vores Servicevilkår og Privatlivspolitik, udgør den fulde aftale 
                  mellem dig og SelskabsInfo vedrørende brugen af vores tjenester og erstatter alle tidligere aftaler 
                  eller forståelser, skriftlige eller mundtlige.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Fortolkning</h3>
                <p>
                  Overskrifter i disse betingelser er kun til orientering og påvirker ikke fortolkningen. Henvisninger 
                  til "herunder", "inklusiv" eller lignende betyder "herunder, men ikke begrænset til".
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dansk som originalsprog</h3>
                <p>
                  Disse betingelser er oprindeligt skrevet på dansk. Ved eventuelle oversættelser til andre sprog 
                  er den danske version autoritativ og afgørende ved fortolkningstvister.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ændringer */}
          <Card>
            <CardHeader>
              <CardTitle>Ændringer af Handelsbetingelser</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Vi forbeholder os ret til at opdatere disse handelsbetingelser. Væsentlige ændringer vil
                blive meddelt via e-mail eller ved login på platformen.
              </p>
              <p>
                Ved fortsat brug af tjenesten efter ændringerne er trådt i kraft, accepterer du de opdaterede betingelser.
              </p>
              <p className="text-muted-foreground italic">
                Sidst opdateret: 1. januar 2025
              </p>
            </CardContent>
          </Card>

          {/* Back button */}
          <div className="flex justify-center pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/")}
            >
              Tilbage til forsiden
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HandelsbetingelserPage;

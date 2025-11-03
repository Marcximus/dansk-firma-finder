import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, CreditCard, Package, RotateCcw, FileText } from "lucide-react";

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
                Disse handelsbetingelser gælder for køb af digitale tjenester og produkter fra SelskabsInfo.
                Ved at gennemføre et køb accepterer du automatisk disse betingelser.
              </p>
              <p>
                SelskabsInfo leverer virksomhedsdata, rapporter og premium tjenester til både private og erhvervskunder i Danmark.
              </p>
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
                <ul className="space-y-2 list-disc list-inside">
                  <li>Virksomhedsrapporter (PDF)</li>
                  <li>Premium abonnementer (månedlige og årlige)</li>
                  <li>Track & Følg tjenester</li>
                  <li>Fremhævning af virksomheder</li>
                  <li>API adgang</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Priser</h3>
                <p>
                  Alle priser er angivet i danske kroner (DKK) inklusiv moms (25%), medmindre andet er angivet.
                  Vi forbeholder os ret til at ændre priser uden forudgående varsel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Særlige tilbud</h3>
                <p>
                  Kampagnepriser og rabatter kan have begrænsede perioder og kan ikke kombineres med andre tilbud,
                  medmindre andet er angivet.
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
                <h3 className="font-semibold mb-2">Betalingsmetoder</h3>
                <p>Vi accepterer følgende betalingsmetoder:</p>
                <ul className="space-y-2 list-disc list-inside mt-2">
                  <li>Betalingskort (Dankort, Visa, Mastercard)</li>
                  <li>MobilePay</li>
                  <li>Faktura (kun erhvervskunder ved forudbetaling)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Betalingsbetingelser</h3>
                <p>
                  Betaling skal ske ved køb. For abonnementer opkræves betalingen automatisk ved hver
                  fornyelsesperiode, medmindre abonnementet opsiges.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sikkerhed</h3>
                <p>
                  Alle betalinger håndteres via Stripe, der er certificeret efter de højeste sikkerhedsstandarder (PCI DSS Level 1).
                  SelskabsInfo gemmer ikke dine betalingskortoplysninger.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Køb på kredit</h3>
                <p>
                  Vi tilbyder ikke kreditkøb. Alle køb skal betales fuldt ud ved bestilling.
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
                <h3 className="font-semibold mb-2">Digitale produkter</h3>
                <p>
                  Alle vores produkter er digitale og leveres øjeblikkeligt efter gennemført betaling.
                  Du får adgang via din bruger-konto eller modtager produktet via e-mail.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Leveringstid</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Virksomhedsrapporter: Øjeblikkelig download efter betaling</li>
                  <li>Premium adgang: Aktiveres inden for 5 minutter</li>
                  <li>API nøgler: Leveres via e-mail inden for 24 timer</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Tekniske problemer</h3>
                <p>
                  Hvis du oplever problemer med at få adgang til dit køb, kontakt venligst vores support
                  på support@selskabsinfo.dk inden for 48 timer.
                </p>
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

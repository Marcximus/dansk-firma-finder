import { Building2, FileText, Bell, Code, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AlleProdukterPage = () => {
  const products = [
    {
      id: "virksomhedssoegning",
      icon: Building2,
      title: "Virksomhedssøgning",
      description: "Find præcis den virksomhed, du leder efter med vores kraftfulde søgemaskine. Søg efter CVR-nummer, virksomhedsnavn, eller adresse og få øjeblikkelig adgang til detaljerede virksomhedsoplysninger.",
      features: [
        "Søg i alle danske virksomheder",
        "Avancerede søgefiltre",
        "Realtidsdata fra Erhvervsstyrelsen",
        "Hurtig og præcis søgning",
        "Gratis grundlæggende oplysninger"
      ],
      link: "/",
      cta: "Søg nu"
    },
    {
      id: "virksomhedsrapporter",
      icon: FileText,
      title: "Virksomhedsrapporter",
      description: "Få omfattende virksomhedsrapporter med alt, hvad du har brug for til at træffe informerede beslutninger. Vores rapporter indeholder finansielle nøgletal, ledelsesoplysninger, ejerforhold og meget mere.",
      features: [
        "3 rapportniveauer: Standard, Premium & Enterprise",
        "Finansielle analyser og nøgletal",
        "Ledelse og ejerskabsstrukturer",
        "Historiske data og udviklingstendenser",
        "PDF-download og delingsmuligheder"
      ],
      link: "/virksomhedsrapporter",
      cta: "Se rapporttyper"
    },
    {
      id: "track-foelg",
      icon: Bell,
      title: "Track & Følg",
      description: "Hold dig opdateret med automatiske notifikationer om ændringer i de virksomheder, du følger. Perfekt til compliance, kreditvurdering eller konkurrentovervågning.",
      features: [
        "Realtids notifikationer om virksomhedsændringer",
        "Følg ubegrænset antal virksomheder",
        "Tilpasselige notifikationsindstillinger",
        "Email og dashboard-notifikationer",
        "Historik over alle ændringer"
      ],
      link: "/track-foelg",
      cta: "Start abonnement"
    },
    {
      id: "cvr-api",
      icon: Code,
      title: "CVR API",
      description: "Integrer CVR-data direkte i dine systemer med vores kraftfulde API. Perfekt til udviklere, der har brug for pålidelig og opdateret virksomhedsdata i deres applikationer.",
      features: [
        "RESTful API med omfattende dokumentation",
        "Realtidsdata fra Erhvervsstyrelsen",
        "Høj oppetid og hurtige responstider",
        "Fleksible prisplaner baseret på forbrug",
        "Dedikeret teknisk support"
      ],
      link: "/cvr-api",
      cta: "Se API-dokumentation"
    },
    {
      id: "fremhaev-virksomhed",
      icon: Star,
      title: "Fremhæv Virksomhed",
      description: "Gør din virksomhed mere synlig i søgeresultaterne på SelskabsInfo.dk. Øg din online tilstedeværelse og gør det lettere for potentielle kunder og samarbejdspartnere at finde dig.",
      features: [
        "Fremhævet placering i søgeresultater",
        "Udvidet virksomhedsprofil",
        "Øget synlighed overfor tusindvis af brugere",
        "Tilpasselige markedsføringsmuligheder",
        "Detaljeret statistik over visninger"
      ],
      link: "/fremhaev-virksomhed",
      cta: "Læs mere"
    }
  ];

  return (
    <Layout>
      <SEO
        title="Alle Produkter | SelskabsInfo.dk"
        description="Udforsk alle vores produkter og tjenester til virksomhedsdata: Virksomhedssøgning, Virksomhedsrapporter, Track & Følg, CVR API og Fremhæv Virksomhed."
        keywords="virksomhedssøgning, virksomhedsrapporter, cvr data, api, track følg, fremhæv virksomhed"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Alle Vores Produkter
              </h1>
              <p className="text-xl text-muted-foreground">
                Komplet oversigt over alle vores produkter og tjenester til at hjælpe dig med at
                få de virksomhedsoplysninger, du har brug for.
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {products.map((product, index) => {
                const Icon = product.icon;
                return (
                  <Card key={product.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <CardHeader className="bg-muted/50">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl md:text-3xl mb-2">
                            {product.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {product.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3 text-lg">Nøglefunktioner:</h3>
                        <ul className="space-y-2">
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-1">✓</span>
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link to={product.link}>
                          {product.cta}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Har du brug for hjælp?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Kontakt os, hvis du har spørgsmål til vores produkter eller har brug for rådgivning
                om, hvilken løsning der passer bedst til dine behov.
              </p>
              <Button asChild size="lg" variant="outline">
                <Link to="/kontakt-os">
                  Kontakt os
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AlleProdukterPage;

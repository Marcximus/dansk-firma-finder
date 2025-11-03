import { Building2, FileText, Bell, Code, Star, ArrowRight, Sparkles } from "lucide-react";
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
      cta: "Søg nu",
      gradient: "from-blue-500/10 via-cyan-500/10 to-blue-500/10",
      accentColor: "text-blue-500",
      bgGlow: "bg-blue-500/5"
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
      cta: "Se rapporttyper",
      gradient: "from-purple-500/10 via-pink-500/10 to-purple-500/10",
      accentColor: "text-purple-500",
      bgGlow: "bg-purple-500/5"
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
      cta: "Start abonnement",
      gradient: "from-amber-500/10 via-orange-500/10 to-amber-500/10",
      accentColor: "text-amber-500",
      bgGlow: "bg-amber-500/5"
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
      cta: "Se API-dokumentation",
      gradient: "from-green-500/10 via-emerald-500/10 to-green-500/10",
      accentColor: "text-green-500",
      bgGlow: "bg-green-500/5"
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
      cta: "Læs mere",
      gradient: "from-rose-500/10 via-pink-500/10 to-rose-500/10",
      accentColor: "text-rose-500",
      bgGlow: "bg-rose-500/5"
    }
  ];

  return (
    <Layout>
      <SEO
        title="Alle Produkter | SelskabsInfo.dk"
        description="Udforsk alle vores produkter og tjenester til virksomhedsdata: Virksomhedssøgning, Virksomhedsrapporter, Track & Følg, CVR API og Fremhæv Virksomhed."
        keywords="virksomhedssøgning, virksomhedsrapporter, cvr data, api, track følg, fremhæv virksomhed"
      />

      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">5 Kraftfulde Produkter</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent animate-fade-in">
                Alle Vores Produkter
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in delay-100">
                Komplet oversigt over alle vores produkter og tjenester til at hjælpe dig med at
                få de virksomhedsoplysninger, du har brug for
              </p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rounded-lg rotate-12 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-16 h-16 border-2 border-secondary/20 rounded-full animate-pulse delay-500" />
        </section>

        {/* Products Section */}
        <section className="pb-32 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto space-y-32">
              {products.map((product, index) => {
                const Icon = product.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div 
                    key={product.id} 
                    className="group relative animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Number Badge */}
                    <div className={`absolute -top-8 ${isEven ? 'left-0' : 'right-0'} text-8xl md:text-9xl font-bold text-muted/5 select-none`}>
                      0{index + 1}
                    </div>
                    
                    <div className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${isEven ? '' : 'md:grid-flow-dense'}`}>
                      {/* Content Side */}
                      <div className={`space-y-6 ${isEven ? 'md:pr-8' : 'md:pl-8 md:col-start-2'}`}>
                        <div className={`inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${product.gradient} backdrop-blur-sm border border-border/50 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-10 w-10 ${product.accentColor}`} />
                        </div>
                        
                        <div>
                          <h2 className="text-4xl md:text-5xl font-bold mb-4 group-hover:text-primary transition-colors">
                            {product.title}
                          </h2>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        <Button 
                          asChild 
                          size="lg" 
                          className="group/btn shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <Link to={product.link} className="gap-2">
                            {product.cta}
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>

                      {/* Features Card Side */}
                      <div className={isEven ? 'md:col-start-2' : 'md:col-start-1'}>
                        <Card className={`relative overflow-hidden border-2 border-border/50 backdrop-blur-sm bg-card/50 hover:border-primary/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]`}>
                          {/* Glow Effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                          
                          <CardContent className="relative p-8">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                              <span className={`w-1.5 h-6 rounded-full ${product.accentColor.replace('text-', 'bg-')}`} />
                              Nøglefunktioner
                            </h3>
                            
                            <ul className="space-y-4">
                              {product.features.map((feature, idx) => (
                                <li 
                                  key={idx} 
                                  className="flex items-start gap-3 group/item animate-fade-in"
                                  style={{ animationDelay: `${(index * 100) + (idx * 50)}ms` }}
                                >
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${product.bgGlow} ${product.accentColor} flex items-center justify-center text-xs font-bold group-hover/item:scale-110 transition-transform`}>
                                    ✓
                                  </span>
                                  <span className="text-muted-foreground group-hover/item:text-foreground transition-colors">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1)_0%,transparent_65%)]" />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Vi er her for at hjælpe</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Har du brug for hjælp?
              </h2>
              
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Kontakt os, hvis du har spørgsmål til vores produkter eller har brug for rådgivning
                om, hvilken løsning der passer bedst til dine behov.
              </p>
              
              <Button 
                asChild 
                size="lg" 
                variant="default"
                className="shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
              >
                <Link to="/kontakt-os" className="gap-2">
                  Kontakt os
                  <ArrowRight className="w-5 h-5" />
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

import { Building2, FileText, Bell, Code, Star, ArrowRight, Sparkles, Zap, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AlleProdukterPage = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallaxElements = document.querySelectorAll('.parallax');
      
      parallaxElements.forEach((el) => {
        const speed = el.getAttribute('data-speed') || '0.5';
        const yPos = -(scrolled * parseFloat(speed));
        (el as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { icon: Building2, label: "Virksomheder", value: "500K+" },
    { icon: Zap, label: "Søgninger/dag", value: "10K+" },
    { icon: TrendingUp, label: "Præcision", value: "99.9%" },
    { icon: Shield, label: "Opdateret", value: "Real-time" }
  ];

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

      <div className="min-h-screen relative overflow-hidden" ref={scrollContainerRef}>
        {/* Animated Background with Floating Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          
          {/* Animated Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Floating Shapes */}
          <div className="parallax absolute top-20 left-10 w-32 h-32 border border-primary/10 rounded-2xl rotate-12" data-speed="0.3" />
          <div className="parallax absolute top-40 right-20 w-24 h-24 border border-secondary/10 rounded-full" data-speed="0.4" />
          <div className="parallax absolute bottom-40 left-1/3 w-20 h-20 border border-accent/10 rounded-lg rotate-45" data-speed="0.2" />
          <div className="parallax absolute top-1/3 right-1/4 w-16 h-16 bg-primary/5 rounded-full blur-xl" data-speed="0.5" />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground),0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground),0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">5 Kraftfulde Produkter</span>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 animate-fade-in">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Alle Vores Produkter
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
                Komplet oversigt over alle vores produkter og tjenester til at hjælpe dig med at
                få de virksomhedsoplysninger, du har brug for
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto pt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div 
                      key={idx}
                      className="group relative p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-500 hover:scale-110 hover:shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500" />
                      <Icon className="w-8 h-8 text-primary mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
                      <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
                    
                    <div className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${isEven ? '' : 'md:grid-flow-dense'}`}>
                      {/* Content Side */}
                      <div className={`space-y-8 ${isEven ? 'md:pr-12' : 'md:pl-12 md:col-start-2'}`}>
                        {/* Icon Container with Enhanced Animation */}
                        <div className="relative inline-block">
                          <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500`} />
                          <div className={`relative inline-flex items-center gap-4 p-6 rounded-3xl bg-gradient-to-br ${product.gradient} backdrop-blur-sm border-2 border-border/50 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}>
                            <Icon className={`h-12 w-12 ${product.accentColor} group-hover:rotate-12 transition-transform duration-500`} />
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <h2 className="text-4xl md:text-6xl font-black leading-tight">
                            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/60 transition-all duration-500">
                              {product.title}
                            </span>
                          </h2>
                          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <Button 
                            asChild 
                            size="lg" 
                            className="group/btn relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 text-base px-8 py-6"
                          >
                            <Link to={product.link} className="gap-3">
                              <span className="relative z-10">{product.cta}</span>
                              <ArrowRight className="relative z-10 w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                              <div className={`absolute inset-0 bg-gradient-to-r ${product.gradient} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500`} />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {/* Features Card Side with Enhanced Design */}
                      <div className={isEven ? 'md:col-start-2' : 'md:col-start-1'}>
                        <div className="relative">
                          {/* Background Glow */}
                          <div className={`absolute -inset-4 bg-gradient-to-br ${product.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-500`} />
                          
                          <Card className="relative overflow-hidden border-2 border-border/50 backdrop-blur-xl bg-card/80 hover:border-primary/50 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.03] rounded-3xl">
                            {/* Animated Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                            
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                            
                            <CardContent className="relative p-8 md:p-10">
                              <div className="flex items-center gap-3 mb-8">
                                <span className={`w-2 h-10 rounded-full bg-gradient-to-b ${product.accentColor.replace('text-', 'from-')} to-transparent`} />
                                <h3 className="font-black text-2xl">Nøglefunktioner</h3>
                              </div>
                              
                              <ul className="space-y-5">
                                {product.features.map((feature, idx) => (
                                  <li 
                                    key={idx} 
                                    className="flex items-start gap-4 group/item animate-fade-in hover:translate-x-2 transition-all duration-300"
                                    style={{ animationDelay: `${(index * 100) + (idx * 50)}ms` }}
                                  >
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-xl ${product.bgGlow} ${product.accentColor} flex items-center justify-center text-sm font-bold group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-300 shadow-lg`}>
                                      ✓
                                    </span>
                                    <span className="text-base text-muted-foreground group-hover/item:text-foreground transition-colors pt-1">
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
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Dramatic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.15)_0%,transparent_70%)]" />
          
          {/* Animated Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-5xl mx-auto">
              <Card className="relative overflow-hidden border-2 border-primary/20 backdrop-blur-xl bg-card/50 shadow-2xl">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                
                <CardContent className="p-12 md:p-16 text-center relative">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 backdrop-blur-sm mb-8 hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm font-semibold text-primary">Vi er her for at hjælpe</span>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl font-black mb-6">
                    <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                      Har du brug for hjælp?
                    </span>
                  </h2>
                  
                  <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                    Kontakt os, hvis du har spørgsmål til vores produkter eller har brug for rådgivning
                    om, hvilken løsning der passer bedst til dine behov.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      asChild 
                      size="lg" 
                      className="relative group overflow-hidden shadow-2xl hover:shadow-primary/25 transition-all duration-500 hover:scale-110 text-lg px-10 py-7"
                    >
                      <Link to="/kontakt-os" className="gap-3">
                        <span className="relative z-10">Kontakt os</span>
                        <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      size="lg" 
                      variant="outline"
                      className="border-2 hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg px-10 py-7"
                    >
                      <Link to="/" className="gap-3">
                        <Building2 className="w-5 h-5" />
                        Søg virksomhed
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AlleProdukterPage;

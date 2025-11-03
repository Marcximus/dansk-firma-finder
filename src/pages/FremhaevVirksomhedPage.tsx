import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, TrendingUp, Award, Shield, Check, Sparkles, Target, BarChart3, Image, Share2, Crown, Clock, Users, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FremhaevVirksomhedPage = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    cvr: "",
    contactPerson: "",
    email: "",
    phone: "",
    package: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Tak for din henvendelse! Vi vender tilbage hurtigst muligt.");
    setFormData({
      companyName: "",
      cvr: "",
      contactPerson: "",
      email: "",
      phone: "",
      package: "",
      message: ""
    });
  };

  const premiumFeatures = [
    { icon: TrendingUp, title: "Fremhævet i søgeresultater", description: "Vis din virksomhed øverst i alle relevante søgninger" },
    { icon: Crown, title: "Premium badge", description: "Eksklusivt badge på din virksomhedsprofil" },
    { icon: BarChart3, title: "Tilføj ekstra oplysninger", description: "Udvid din profil med yderligere information" },
    { icon: Target, title: "Opdater status løbende", description: "Hold dine informationer altid opdaterede" },
    { icon: Star, title: "Prioriteret placering", description: "Topplacering i alle relevante visninger" },
    { icon: Sparkles, title: "Øget synlighed", description: "Op til 10x mere synlighed end standardprofiler" },
    { icon: Share2, title: "Social media integration", description: "Link til alle dine sociale platforme" },
    { icon: Image, title: "Brugerdefineret banner", description: "Upload dit eget logo og bannerbillede" }
  ];

  const pricingTiers = [
    {
      name: "Basis",
      duration: "1-3 måneder",
      features: [
        "Fremhævet i søgeresultater",
        "Premium badge",
        "Tilføj ekstra oplysninger",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Premium",
      duration: "6 måneder",
      features: [
        "Alle Basis funktioner",
        "Prioriteret placering",
        "Social media integration",
        "Brugerdefineret banner",
        "Prioriteret support"
      ],
      popular: true
    },
    {
      name: "Årligt",
      duration: "12 måneder",
      features: [
        "Alle Premium funktioner",
        "Maksimal synlighed",
        "Dedikeret account manager",
        "Månedlige rapporter",
        "24/7 support"
      ],
      popular: false
    }
  ];

  const benefits = [
    { icon: Users, title: "Nå flere potentielle kunder", description: "Øg din rækkevidde og få flere kundehenvendelser" },
    { icon: Shield, title: "Styrk troværdigheden", description: "Premium badge signalerer professionalisme" },
    { icon: Target, title: "Kontroller din tilstedeværelse", description: "Fuld kontrol over hvordan din virksomhed præsenteres" },
    { icon: Award, title: "Skil dig ud fra konkurrenterne", description: "Vær synlig når det betyder noget" }
  ];

  const steps = [
    { number: "1", title: "Vælg din pakke", description: "Find den løsning der passer til dine behov" },
    { number: "2", title: "Kontakt os", description: "Udfyld formularen med dine ønsker" },
    { number: "3", title: "Vi aktiverer", description: "Vi sætter din fremhævelse op professionelt" },
    { number: "4", title: "Se resultater", description: "Mærk forskellen næsten øjeblikkeligt" }
  ];

  const faqs = [
    {
      question: "Hvor hurtigt vil min virksomhed blive fremhævet?",
      answer: "Din virksomhed vil blive fremhævet inden for 24 timer efter vi har modtaget din betaling og alle nødvendige informationer."
    },
    {
      question: "Kan jeg opgradere min pakke senere?",
      answer: "Ja, du kan til enhver tid opgradere til en større pakke. Vi refunderer den resterende værdi af din nuværende pakke."
    },
    {
      question: "Hvad sker der når min periode udløber?",
      answer: "Vi sender dig en påmindelse 2 uger før udløb. Du kan vælge at forny, opgradere eller lade den udløbe. Din profil fortsætter som en standard profil."
    },
    {
      question: "Kan jeg annullere min aftale?",
      answer: "Ja, vi tilbyder 30 dages tilfredshedsgaranti. Hvis du ikke er tilfreds, refunderer vi det fulde beløb."
    },
    {
      question: "Hvilke betalingsmetoder accepterer I?",
      answer: "Vi accepterer alle større betalingskort, MobilePay, og bankoverførsel for årlige pakker."
    }
  ];

  return (
    <Layout>
      <Helmet>
        <title>Fremhæv din virksomhed - Øg synlighed og få flere kunder | CVR.dev</title>
        <meta name="description" content="Fremhæv din virksomhed i søgeresultater, tilføj ekstra information og få mere synlighed. Kontakt os for en skræddersyet løsning." />
        <meta name="keywords" content="fremhæv virksomhed, synlighed, markedsføring, virksomhedsprofil, CVR, premium profil" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 px-4">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Premium virksomhedsprofil</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Fremhæv din virksomhed
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Få din virksomhed til at skille sig ud med en premium profil. Øg synligheden, 
              tiltræk flere kunder og styrk din online tilstedeværelse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button size="lg" className="shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-all" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
                <Mail className="mr-2 h-4 w-4" />
                Få et tilbud
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                Se priser
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium funktioner</h2>
            <p className="text-muted-foreground text-lg">
              Alt du har brug for til at skille dig ud fra konkurrenterne
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Vælg din pakke</h2>
            <p className="text-muted-foreground text-lg">
              Find den løsning der passer bedst til din virksomhed
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-xl scale-105' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Mest populær
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    {tier.duration}
                  </CardDescription>
                  <div className="mt-4">
                    <p className="text-3xl font-bold">Kontakt os</p>
                    <p className="text-sm text-muted-foreground">for pris</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => {
                      setFormData({ ...formData, package: tier.name });
                      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Vælg {tier.name}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Hvorfor fremhæve din virksomhed?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sådan fungerer det</h2>
            <p className="text-muted-foreground text-lg">
              Kom i gang på få minutter
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Få et uforpligtende tilbud</h2>
            <p className="text-muted-foreground text-lg">
              Udfyld formularen så kontakter vi dig hurtigst muligt
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      <Building2 className="h-4 w-4 inline mr-2" />
                      Virksomhedsnavn *
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      placeholder="Indtast virksomhedsnavn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvr">CVR-nummer *</Label>
                    <Input
                      id="cvr"
                      name="cvr"
                      value={formData.cvr}
                      onChange={handleInputChange}
                      required
                      placeholder="12345678"
                      maxLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Kontaktperson *</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    placeholder="Dit navn"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="din@email.dk"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Telefon *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+45 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Ønsket pakke *</Label>
                  <Select
                    value={formData.package}
                    onValueChange={(value) => setFormData({ ...formData, package: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg en pakke" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basis">Basis (1-3 måneder)</SelectItem>
                      <SelectItem value="Premium">Premium (6 måneder)</SelectItem>
                      <SelectItem value="Årligt">Årligt (12 måneder)</SelectItem>
                      <SelectItem value="Andet">Andet / Usikker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Specielle ønsker eller spørgsmål</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Fortæl os om dine behov..."
                    rows={5}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Send anmodning
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Fremhævede virksomheder</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10x</div>
              <p className="text-muted-foreground">Mere synlighed i gennemsnit</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground">Tilfredshedsrate</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ofte stillede spørgsmål</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Klar til at fremhæve din virksomhed?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Kontakt os i dag og få et uforpligtende tilbud på en premium profil
          </p>
          <Button size="lg" className="shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-all" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
            <Mail className="mr-2 h-4 w-4" />
            Få et tilbud nu
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default FremhaevVirksomhedPage;

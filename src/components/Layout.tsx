
import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isJuridiskDialogOpen, setIsJuridiskDialogOpen] = useState(false);
  const [isRegnskabDialogOpen, setIsRegnskabDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    question: '',
    companySize: '',
    urgency: '',
    budget: '',
    wantCall: false,
    wantEmail: false,
  });
  const [regnskabFormData, setRegnskabFormData] = useState({
    name: '',
    email: '',
    phone: '',
    question: '',
    companySize: '',
    annualRevenue: '',
    currentProvider: '',
    wantCall: false,
    wantEmail: false,
  });
  const navigate = useNavigate();

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(headerSearchQuery.trim())}`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Juridisk form submitted:', formData);
    // Here you would typically send the data to your backend
    setIsJuridiskDialogOpen(false);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      question: '',
      companySize: '',
      urgency: '',
      budget: '',
      wantCall: false,
      wantEmail: false,
    });
  };

  const handleRegnskabFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Regnskab form submitted:', regnskabFormData);
    // Here you would typically send the data to your backend
    setIsRegnskabDialogOpen(false);
    // Reset form
    setRegnskabFormData({
      name: '',
      email: '',
      phone: '',
      question: '',
      companySize: '',
      annualRevenue: '',
      currentProvider: '',
      wantCall: false,
      wantEmail: false,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegnskabInputChange = (field: string, value: string | boolean) => {
    setRegnskabFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-3 px-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold text-primary">Selskabsinfo</Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link>
          </div>
          
          <form onSubmit={handleHeaderSearch} className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="pl-10"
                placeholder="Søg efter virksomhedsnavn, CVR, branche eller by..." 
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex items-center gap-2">
            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Log Ind / Tilmeld</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Log ind eller tilmeld dig</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log Ind</TabsTrigger>
                    <TabsTrigger value="register">Tilmeld</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="din@email.dk"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Adgangskode</Label>
                        <Input
                          id="login-password"
                          type="password"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Log Ind
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4">
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="din@email.dk"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Adgangskode</Label>
                        <Input
                          id="register-password"
                          type="password"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password-confirm">Bekræft adgangskode</Label>
                        <Input
                          id="register-password-confirm"
                          type="password"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Tilmeld
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isJuridiskDialogOpen} onOpenChange={setIsJuridiskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Hjælp til Jura
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Har du brug for hjælp til det juridiske?</DialogTitle>
                </DialogHeader>
                <div className="mb-4 text-sm text-muted-foreground">
                  Skriv dit spørgsmål og dine kontaktoplysninger, så kontakter vores advokat dig med en løsning og en pris
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Dit spørgsmål</Label>
                    <Textarea
                      id="question"
                      placeholder="Beskriv dit juridiske spørgsmål..."
                      value={formData.question}
                      onChange={(e) => handleInputChange('question', e.target.value)}
                      required
                    />
                  </div>

                  {/* Company Size */}
                  <div className="space-y-3">
                    <Label>Virksomhedsstørrelse</Label>
                    <RadioGroup
                      value={formData.companySize}
                      onValueChange={(value) => handleInputChange('companySize', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enkeltmandsvirksomhed" id="r1" />
                        <Label htmlFor="r1">Enkeltmandsvirksomhed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1-10" id="r2" />
                        <Label htmlFor="r2">1-10 ansatte</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="11-50" id="r3" />
                        <Label htmlFor="r3">11-50 ansatte</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="51-200" id="r4" />
                        <Label htmlFor="r4">51-200 ansatte</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="200+" id="r5" />
                        <Label htmlFor="r5">200+ ansatte</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-3">
                    <Label>Hvor hurtigt skal det løses?</Label>
                    <RadioGroup
                      value={formData.urgency}
                      onValueChange={(value) => handleInputChange('urgency', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="akut" id="u1" />
                        <Label htmlFor="u1">Akut (inden for 24 timer)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hurtig" id="u2" />
                        <Label htmlFor="u2">Hurtig (inden for en uge)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="u3" />
                        <Label htmlFor="u3">Normal (inden for en måned)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fleksibel" id="u4" />
                        <Label htmlFor="u4">Fleksibel tidsramme</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Budget */}
                  <div className="space-y-3">
                    <Label>Forventet budget</Label>
                    <RadioGroup
                      value={formData.budget}
                      onValueChange={(value) => handleInputChange('budget', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="under-10k" id="b1" />
                        <Label htmlFor="b1">Under 10.000 kr.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="10k-25k" id="b2" />
                        <Label htmlFor="b2">10.000-25.000 kr.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="25k-50k" id="b3" />
                        <Label htmlFor="b3">25.000-50.000 kr.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="50k+" id="b4" />
                        <Label htmlFor="b4">50.000+ kr.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ved-ikke" id="b5" />
                        <Label htmlFor="b5">Ved ikke / ønsker rådgivning</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Navn</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonnummer</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wantCall"
                        checked={formData.wantCall}
                        onCheckedChange={(checked) => handleInputChange('wantCall', checked as boolean)}
                      />
                      <Label htmlFor="wantCall">Jeg vil ringes op</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wantEmail"
                        checked={formData.wantEmail}
                        onCheckedChange={(checked) => handleInputChange('wantEmail', checked as boolean)}
                      />
                      <Label htmlFor="wantEmail">Jeg vil have en mail</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsJuridiskDialogOpen(false)}>
                      Annuller
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Send forespørgsel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isRegnskabDialogOpen} onOpenChange={setIsRegnskabDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Hjælp til Regnskab
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Har du brug for hjælp til regnskabet?</DialogTitle>
                </DialogHeader>
                <div className="mb-4 text-sm text-muted-foreground">
                  Skriv dit spørgsmål og dine kontaktoplysninger, så kontakter vores revisor dig med en løsning og en pris
                </div>
                
                <form onSubmit={handleRegnskabFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="regnskab-question">Dit spørgsmål</Label>
                    <Textarea
                      id="regnskab-question"
                      placeholder="Beskriv dit regnskabsmæssige spørgsmål..."
                      value={regnskabFormData.question}
                      onChange={(e) => handleRegnskabInputChange('question', e.target.value)}
                      required
                    />
                  </div>

                  {/* Company Size */}
                  <div className="space-y-3">
                    <Label>Virksomhedsstørrelse</Label>
                    <RadioGroup
                      value={regnskabFormData.companySize}
                      onValueChange={(value) => handleRegnskabInputChange('companySize', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enkeltmandsvirksomhed" id="rs1" />
                        <Label htmlFor="rs1">Enkeltmandsvirksomhed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1-10" id="rs2" />
                        <Label htmlFor="rs2">1-10 ansatte</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="11-50" id="rs3" />
                        <Label htmlFor="rs3">11-50 ansatte</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="51-200" id="rs4" />
                        <Label htmlFor="rs4">51-200 ansatte</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="200+" id="rs5" />
                        <Label htmlFor="rs5">200+ ansatte</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Annual Revenue */}
                  <div className="space-y-3">
                    <Label>Årlig omsætning</Label>
                    <RadioGroup
                      value={regnskabFormData.annualRevenue}
                      onValueChange={(value) => handleRegnskabInputChange('annualRevenue', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="under-1m" id="ar1" />
                        <Label htmlFor="ar1">Under 1 mio. kr.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1m-5m" id="ar2" />
                        <Label htmlFor="ar2">1-5 mio. kr.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5m-25m" id="ar3" />
                        <Label htmlFor="ar3">5-25 mio. kr.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="25m-100m" id="ar4" />
                        <Label htmlFor="ar4">25-100 mio. kr.</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="100m+" id="ar5" />
                        <Label htmlFor="ar5">100+ mio. kr.</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Current Provider */}
                  <div className="space-y-3">
                    <Label>Har I revisor i dag?</Label>
                    <RadioGroup
                      value={regnskabFormData.currentProvider}
                      onValueChange={(value) => handleRegnskabInputChange('currentProvider', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ingen" id="cp1" />
                        <Label htmlFor="cp1">Nej, ingen revisor</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="utilfreds" id="cp2" />
                        <Label htmlFor="cp2">Ja, men utilfreds</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="supplerende" id="cp3" />
                        <Label htmlFor="cp3">Ja, men søger supplerende hjælp</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sammenlign" id="cp4" />
                        <Label htmlFor="cp4">Ja, men vil sammenligne priser</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regnskab-name">Navn</Label>
                    <Input
                      id="regnskab-name"
                      type="text"
                      value={regnskabFormData.name}
                      onChange={(e) => handleRegnskabInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regnskab-email">Email</Label>
                    <Input
                      id="regnskab-email"
                      type="email"
                      value={regnskabFormData.email}
                      onChange={(e) => handleRegnskabInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="regnskab-phone">Telefonnummer</Label>
                    <Input
                      id="regnskab-phone"
                      type="tel"
                      value={regnskabFormData.phone}
                      onChange={(e) => handleRegnskabInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="regnskab-wantCall"
                        checked={regnskabFormData.wantCall}
                        onCheckedChange={(checked) => handleRegnskabInputChange('wantCall', checked as boolean)}
                      />
                      <Label htmlFor="regnskab-wantCall">Jeg vil ringes op</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="regnskab-wantEmail"
                        checked={regnskabFormData.wantEmail}
                        onCheckedChange={(checked) => handleRegnskabInputChange('wantEmail', checked as boolean)}
                      />
                      <Label htmlFor="regnskab-wantEmail">Jeg vil have en mail</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsRegnskabDialogOpen(false)}>
                      Annuller
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Send forespørgsel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Selskabsinfo</h3>
              <p className="text-muted-foreground">Nem adgang til danske virksomhedsoplysninger siden 2025.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Tjenester</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-muted-foreground hover:text-primary">Virksomhedssøgning</Link></li>
                <li><Link to="/virksomhedsrapporter" className="text-muted-foreground hover:text-primary">Virksomhedsrapporter</Link></li>
                <li><Link to="/datakilder" className="text-muted-foreground hover:text-primary">Datakilder</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/hjaelpecenter" className="text-muted-foreground hover:text-primary">Hjælpecenter</Link></li>
                <li><Link to="/kontakt-os" className="text-muted-foreground hover:text-primary">Kontakt Os</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Juridisk</h3>
              <ul className="space-y-2">
                <li><Link to="/servicevilkaar" className="text-muted-foreground hover:text-primary">Servicevilkår</Link></li>
                <li><Link to="/privatlivspolitik" className="text-muted-foreground hover:text-primary">Privatlivspolitik</Link></li>
                <li><Link to="/databehandling" className="text-muted-foreground hover:text-primary">Databehandling</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-muted-foreground text-sm pt-8 mt-8 border-t">
            © 2025 Selskabsinfo. Alle data kommer fra offentlige registre.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

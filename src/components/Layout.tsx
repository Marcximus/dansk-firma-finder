
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

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isJuridiskDialogOpen, setIsJuridiskDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    question: '',
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
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    setIsJuridiskDialogOpen(false);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      question: '',
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-3 px-4 flex flex-col md:flex-row items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-primary">Selskabsinfo</Link>
          
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
            <Button variant="outline">Log Ind</Button>
            
            <Dialog open={isJuridiskDialogOpen} onOpenChange={setIsJuridiskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Hjælp til Jura
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
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
            
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Hjælp til Regnskab
            </Button>
            <Button>Tilmeld</Button>
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
                <li><a href="#" className="text-muted-foreground hover:text-primary">Virksomhedssøgning</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Virksomhedsrapporter</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Finansiel Analyse</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Hjælpecenter</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Kontakt Os</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Juridisk</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Servicevilkår</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privatlivspolitik</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Datakilder</a></li>
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

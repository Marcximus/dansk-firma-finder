
import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(headerSearchQuery, 500); // 500ms delay
  const navigate = useNavigate();

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(debouncedSearchQuery.trim())}`);
    }
  }, [debouncedSearchQuery, navigate]);

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(headerSearchQuery.trim())}`);
    }
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

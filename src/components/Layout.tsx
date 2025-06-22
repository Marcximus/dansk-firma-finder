
import React, { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      // Navigate to home page and trigger search
      navigate(`/?search=${encodeURIComponent(headerSearchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-3 px-4 flex flex-col md:flex-row items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-primary">Selskabs Info</Link>
          
          <form onSubmit={handleHeaderSearch} className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                className="pl-10"
                placeholder="Search by company name, CVR, industry, or city..." 
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">Log In</Button>
            <Button>Sign Up</Button>
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
              <h3 className="text-lg font-semibold mb-4">Selskabs Info</h3>
              <p className="text-muted-foreground">Providing easy access to Danish company information since 2025.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Company Search</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Business Reports</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Financial Analysis</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Data Sources</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-muted-foreground text-sm pt-8 mt-8 border-t">
            © 2025 Selskabs Info. All data sourced from public registries.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

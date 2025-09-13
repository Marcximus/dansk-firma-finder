import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ArrowLeft, CheckCircle, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PackageInfo {
  name: string;
  price: number;
  features: string[];
  description: string;
}

const packages: Record<string, PackageInfo> = {
  standard: {
    name: 'Standard',
    price: 0,
    description: 'Perfekt til at komme i gang',
    features: [
      'Følg 1 virksomhed',
      'Grundlæggende notifikationer',
      'Email alerts'
    ]
  },
  premium: {
    name: 'Premium',
    price: 99,
    description: 'Til små og mellemstore virksomheder',
    features: [
      'Følg op til 5 virksomheder',
      'Daglige notifikationer',
      'Email og SMS alerts',
      'Avancerede filtre',
      'Historisk data'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    description: 'Til store organisationer',
    features: [
      'Følg op til 100 virksomheder',
      'Realtids notifikationer',
      'Alle kommunikationskanaler',
      'Tilpassede alerts',
      'Fuld historisk database',
      'Export til Excel/PDF',
      'Dedikeret support'
    ]
  }
};

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const packageParam = searchParams.get('package') || 'standard';

  useEffect(() => {
    const pkg = packages[packageParam];
    if (pkg) {
      setSelectedPackage(pkg);
    }
  }, [packageParam]);

  if (!selectedPackage) {
    return (
      <Layout>
        <div className="py-8 max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Pakke ikke fundet</h1>
          <Button asChild>
            <Link to="/track-foelg">Tilbage til pakkeoversigt</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle payment processing here
    console.log('Processing payment for:', selectedPackage.name);
  };

  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/track-foelg" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tilbage til pakkeoversigt
            </Link>
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">
              Du er ved at tilmelde dig {selectedPackage.name} pakken
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Ordresammendrag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{selectedPackage.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedPackage.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {selectedPackage.price === 0 ? 'Gratis' : `${selectedPackage.price},-`}
                      </div>
                      {selectedPackage.price > 0 && (
                        <div className="text-sm text-muted-foreground">pr. måned</div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Inkluderet:</h5>
                    {selectedPackage.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                      {selectedPackage.price === 0 ? 'Gratis' : `${selectedPackage.price},- DKK`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="order-1 lg:order-2">
            {selectedPackage.price === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Gratis tilmelding</CardTitle>
                  <CardDescription>
                    Opret din gratis konto og kom i gang med det samme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="din@email.dk" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Fuldt navn</Label>
                      <Input id="name" type="text" placeholder="Dit fulde navn" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Virksomhed (valgfri)</Label>
                      <Input id="company" type="text" placeholder="Din virksomhed" />
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg">
                      Opret gratis konto
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Betalingsoplysninger
                  </CardTitle>
                  <CardDescription>
                    Sikker betaling med SSL-kryptering
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="din@email.dk" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Fornavn</Label>
                        <Input id="firstName" type="text" placeholder="Fornavn" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Efternavn</Label>
                        <Input id="lastName" type="text" placeholder="Efternavn" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Virksomhed</Label>
                      <Input id="company" type="text" placeholder="Din virksomhed" required />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Kortnummer</Label>
                      <Input 
                        id="cardNumber" 
                        type="text" 
                        placeholder="1234 5678 9012 3456" 
                        required 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Udløb (MM/ÅÅ)</Label>
                        <Input id="expiry" type="text" placeholder="12/28" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" type="text" placeholder="123" required />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Dine oplysninger er sikre og krypterede</span>
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg">
                      Betal {selectedPackage.price},- DKK
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              <span>SSL-sikret</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>30 dages returret</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>Opsig når som helst</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
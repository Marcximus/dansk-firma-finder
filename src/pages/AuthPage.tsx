import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get('redirect') || '/track-foelg';

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(redirectTo);
      }
    };
    checkAuth();
  }, [navigate, redirectTo]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "Velkommen!",
          description: isLogin ? "Du er nu logget ind" : "Din konto er oprettet og du er logget ind",
        });
        navigate(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectTo, isLogin, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Login fejlede",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) {
          toast({
            title: "Oprettelse fejlede",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Tjek din email",
            description: "Vi har sendt en bekræftelseslink til din email adresse",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Der opstod en fejl",
        description: "Prøv igen senere",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-8 max-w-md mx-auto px-4">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link to="/track-foelg" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tilbage
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? 'Log ind' : 'Opret konto'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Log ind for at administrere dine abonnementer'
                : 'Opret en konto for at komme i gang med Track & Følg'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Fuldt navn
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dit fulde navn"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.dk"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Adgangskode
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Din adgangskode"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Behandler...' : (isLogin ? 'Log ind' : 'Opret konto')}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {isLogin ? 'Har du ikke en konto?' : 'Har du allerede en konto?'}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="w-full"
              >
                {isLogin ? 'Opret ny konto' : 'Log ind i stedet'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              <span>Sikker og krypteret</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
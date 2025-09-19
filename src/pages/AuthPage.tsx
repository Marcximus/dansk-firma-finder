import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Building2, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cvrNumber, setCvrNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
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
        // Validate terms acceptance for signup
        if (!acceptTerms || !acceptPrivacy) {
          toast({
            title: "Acceptér vilkår",
            description: "Du skal acceptere både servicevilkår og privatlivspolitik for at oprette en konto",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
            data: {
              full_name: fullName,
              company_name: companyName,
              phone: phoneNumber,
              cvr_number: cvrNumber,
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

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'azure') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
        },
      });

      if (error) {
        toast({
          title: "Social login fejlede",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Der opstod en fejl",
        description: "Prøv igen senere",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <SEO 
        title="Log ind eller opret konto | SelskabsInfo"
        description="Log ind på din SelskabsInfo-konto eller opret en ny konto for at få adgang til premium funktioner."
        canonicalUrl="https://selskabsinfo.dk/auth"
        keywords="log ind, opret konto, registrering, login"
      />
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
                <>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Virksomhedsnavn (valgfrit)
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Dit firma navn"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvrNumber" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      CVR/Momsnummer (valgfrit)
                    </Label>
                    <Input
                      id="cvrNumber"
                      type="text"
                      value={cvrNumber}
                      onChange={(e) => setCvrNumber(e.target.value)}
                      placeholder="12345678"
                      maxLength={8}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefonnummer (valgfrit)
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+45 12 34 56 78"
                    />
                  </div>
                </>
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

              {!isLogin && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      required
                    />
                    <Label htmlFor="acceptTerms" className="text-sm">
                      Jeg accepterer{' '}
                      <Link to="/servicevilkaar" className="text-primary underline">
                        Servicevilkår
                      </Link>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={acceptPrivacy}
                      onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                      required
                    />
                    <Label htmlFor="acceptPrivacy" className="text-sm">
                      Jeg accepterer{' '}
                      <Link to="/privatlivspolitik" className="text-primary underline">
                        Privatlivspolitik
                      </Link>
                    </Label>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Behandler...' : (isLogin ? 'Log ind' : 'Opret konto')}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Social Login Options */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Eller fortsæt med
              </p>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full h-9"
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Fortsæt med Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full h-9"
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  Fortsæt med Apple
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('azure')}
                  className="w-full h-9"
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 0h11.377v11.372H0V0zm12.623 0H24v11.372H12.623V0zM0 12.623h11.377V24H0V12.623zm12.623 0H24V24H12.623V12.623z" fill="#f25022"/>
                    <path d="M0 0h11.377v11.372H0V0z" fill="#7fba00"/>
                    <path d="M12.623 0H24v11.372H12.623V0z" fill="#00a4ef"/>
                    <path d="M0 12.623h11.377V24H0V12.623z" fill="#ffb900"/>
                  </svg>
                  Fortsæt med Microsoft
                </Button>
              </div>
            </div>

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
                  setCompanyName('');
                  setCvrNumber('');
                  setPhoneNumber('');
                  setAcceptTerms(false);
                  setAcceptPrivacy(false);
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
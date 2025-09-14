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

  const handleSocialLogin = async (provider: 'google' | 'github' | 'apple' | 'facebook' | 'azure') => {
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
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full h-9"
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Fortsæt med Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('azure')}
                  className="w-full h-9"
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.53 12.1H12.4v3.22h5.14c-.22 1.17-.86 2.16-1.82 2.82v2.34h2.93c1.72-1.58 2.71-3.91 2.71-6.67 0-.63-.06-1.25-.17-1.85l.17.14z"/>
                    <path d="M12.4 22c2.46 0 4.52-.81 6.03-2.19l-2.93-2.34c-.82.55-1.87.87-3.1.87-2.38 0-4.4-1.61-5.12-3.78H4.28v2.42C5.77 19.23 8.84 22 12.4 22z"/>
                    <path d="M7.28 14.56c-.18-.55-.28-1.13-.28-1.73s.1-1.18.28-1.73V8.68H4.28C3.46 10.3 3 12.11 3 14.06s.46 3.76 1.28 5.38l3-2.38z"/>
                    <path d="M12.4 6.38c1.34 0 2.54.46 3.49 1.36l2.61-2.61C16.91 3.57 14.85 2.76 12.4 2.76 8.84 2.76 5.77 5.53 4.28 8.78l3 2.38c.72-2.17 2.74-3.78 5.12-3.78z"/>
                  </svg>
                  Fortsæt med Microsoft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('github')}
                  className="w-full h-9"
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Fortsæt med GitHub
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
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { User, Building2, Phone, Mail, Calendar, CreditCard, FileText, Star, Settings, Download, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_TIERS } from '@/constants/subscriptions';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface FollowedCompany {
  id: string;
  company_name: string;
  company_cvr: string;
  company_data: any;
  notification_preferences: any;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followedCompanies, setFollowedCompanies] = useState<FollowedCompany[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { subscribed, subscriptionTier, openCustomerPortal, subscriptionEnd } = useSubscription();
  const { toast } = useToast();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    full_name: '',
    company_name: '',
    phone: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else {
        setProfile(profileData);
        setEditForm({
          full_name: profileData.full_name || '',
          company_name: profileData.company_name || '',
          phone: profileData.phone || '',
        });
      }

      // Load followed companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('followed_companies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (companiesError) {
        console.error('Error loading followed companies:', companiesError);
      } else {
        setFollowedCompanies(companiesData || []);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke indlæse dine data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: editForm.full_name,
          company_name: editForm.company_name,
          phone: editForm.phone,
          email: user.email,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Profil opdateret",
        description: "Dine oplysninger er blevet gemt",
      });

      setIsEditing(false);
      loadUserData(); // Reload data
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke gemme dine oplysninger",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        phone: profile.phone || '',
      });
    }
    setIsEditing(false);
  };

  const removeFollowedCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('followed_companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      setFollowedCompanies(prev => prev.filter(company => company.id !== companyId));
      toast({
        title: "Virksomhed fjernet",
        description: "Virksomheden er ikke længere på din følgeliste",
      });
    } catch (error) {
      console.error('Error removing company:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke fjerne virksomheden",
        variant: "destructive",
      });
    }
  };

  const getCurrentTierInfo = () => {
    if (!subscribed || !subscriptionTier) return null;
    return SUBSCRIPTION_TIERS[subscriptionTier as keyof typeof SUBSCRIPTION_TIERS];
  };

  const currentTier = getCurrentTierInfo();

  if (loading) {
    return (
      <Layout>
        <div className="py-8 max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              Min Profil
            </h1>
            <p className="text-muted-foreground mt-2">
              Administrer dine kontooplysninger og præferencer
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="companies">Følger ({followedCompanies.length})</TabsTrigger>
            <TabsTrigger value="subscription">Abonnement</TabsTrigger>
            <TabsTrigger value="reports">Rapporter</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personlige oplysninger</CardTitle>
                  <CardDescription>
                    Opdater dine kontaktoplysninger og firmadetails
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rediger
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Annuller
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Gemmer...' : 'Gem'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">E-mail kan ikke ændres</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Fuldt navn</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({...prev, full_name: e.target.value}))}
                        placeholder="Dit fulde navn"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile?.full_name || 'Ikke angivet'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name">Virksomhedsnavn</Label>
                    {isEditing ? (
                      <Input
                        id="company_name"
                        value={editForm.company_name}
                        onChange={(e) => setEditForm(prev => ({...prev, company_name: e.target.value}))}
                        placeholder="Dit firmanavn"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile?.company_name || 'Ikke angivet'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonnummer</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))}
                        placeholder="Dit telefonnummer"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile?.phone || 'Ikke angivet'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Oprettet</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile ? new Date(profile.created_at).toLocaleDateString('da-DK') : 'Ukendt'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followed Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Virksomheder du følger</CardTitle>
                <CardDescription>
                  Administrer de virksomheder du får notifikationer om
                </CardDescription>
              </CardHeader>
              <CardContent>
                {followedCompanies.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ingen virksomheder fulgt endnu</h3>
                    <p className="text-muted-foreground mb-4">
                      Brug søgefunktionen til at finde og følge virksomheder
                    </p>
                    <Button asChild>
                      <a href="/">Søg virksomheder</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followedCompanies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{company.company_name}</h4>
                          <p className="text-sm text-muted-foreground">CVR: {company.company_cvr}</p>
                          <div className="flex gap-2 mt-2">
                            {company.notification_preferences?.email && (
                              <Badge variant="secondary">E-mail</Badge>
                            )}
                            {company.notification_preferences?.sms && (
                              <Badge variant="secondary">SMS</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/company/${company.company_cvr}`}>Se detaljer</a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeFollowedCompany(company.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dit abonnement</CardTitle>
                <CardDescription>
                  Administrer dit abonnement og se betalingsoplysninger
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscribed && currentTier ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">{currentTier.name}</h3>
                        <p className="text-green-600">{currentTier.price} {currentTier.currency} pr. måned</p>
                        {subscriptionEnd && (
                          <p className="text-sm text-green-600 mt-1">
                            Næste fakturering: {new Date(subscriptionEnd).toLocaleDateString('da-DK')}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-green-600 text-white">Aktiv</Badge>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Funktioner inkluderet:</h4>
                      <ul className="space-y-2">
                        {currentTier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex gap-3">
                      <Button onClick={openCustomerPortal} className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Administrer abonnement
                      </Button>
                      <Button variant="outline" onClick={openCustomerPortal}>
                        <Download className="h-4 w-4 mr-2" />
                        Download fakturaer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Intet aktivt abonnement</h3>
                    <p className="text-muted-foreground mb-4">
                      Køb et abonnement for at følge virksomheder og få notifikationer
                    </p>
                    <Button asChild>
                      <a href="/track-foelg">Se abonnementer</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dine virksomhedsrapporter</CardTitle>
                <CardDescription>
                  Se og download rapporter du har bestilt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ingen rapporter endnu</h3>
                  <p className="text-muted-foreground mb-4">
                    Bestil detaljerede rapporter om virksomheder
                  </p>
                  <Button asChild>
                    <a href="/virksomhedsrapporter">Bestil rapporter</a>
                  </Button>
                </div>
                {/* TODO: Add actual reports functionality when implemented */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfilePage;
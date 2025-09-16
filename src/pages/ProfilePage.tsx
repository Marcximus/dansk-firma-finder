import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { User, Building2, Phone, Mail, Calendar, CreditCard, FileText, Star, Settings, Download, Edit2, Save, X, Bell, Eye, Trash2, Plus, Crown, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

  const getSubscriptionIcon = () => {
    if (!subscribed || !currentTier) return Crown;
    switch (subscriptionTier) {
      case 'standard': return Star;
      case 'premium': return Crown;
      case 'enterprise': return Shield;
      default: return Crown;
    }
  };

  const SubscriptionIcon = getSubscriptionIcon();

  if (loading) {
    return (
      <Layout>
        <div className="py-8 max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              Min Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Hold styr på virksomhederne du følger og administrer din konto
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Rediger profil
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Followed Companies */}
          <div className="lg:col-span-2 space-y-6">
            {/* Followed Companies - Main Focus */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Virksomheder du følger</CardTitle>
                      <CardDescription>
                        {followedCompanies.length} virksomheder på din følgeliste
                      </CardDescription>
                    </div>
                  </div>
                  <Button asChild>
                    <a href="/">
                      <Plus className="h-4 w-4 mr-2" />
                      Tilføj flere
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {followedCompanies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ingen virksomheder fulgt endnu</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start med at søge efter virksomheder og tilføj dem til din følgeliste for at få automatiske opdateringer
                    </p>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                      <a href="/">
                        <Plus className="h-4 w-4 mr-2" />
                        Find virksomheder
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {followedCompanies.map((company) => (
                      <div key={company.id} className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-lg truncate">{company.company_name}</h3>
                                <p className="text-sm text-muted-foreground">CVR: {company.company_cvr}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              {company.notification_preferences?.email && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  E-mail
                                </Badge>
                              )}
                              {company.notification_preferences?.sms && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Bell className="h-3 w-3" />
                                  SMS
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Fulgt siden: {new Date(company.created_at).toLocaleDateString('da-DK')}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/company/${company.company_cvr}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Se detaljer
                              </a>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeFollowedCompany(company.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Quick View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="full_name" className="text-sm">Fuldt navn</Label>
                      <Input
                        id="full_name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({...prev, full_name: e.target.value}))}
                        placeholder="Dit fulde navn"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name" className="text-sm">Virksomhedsnavn</Label>
                      <Input
                        id="company_name"
                        value={editForm.company_name}
                        onChange={(e) => setEditForm(prev => ({...prev, company_name: e.target.value}))}
                        placeholder="Dit firmanavn"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm">Telefonnummer</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))}
                        placeholder="Dit telefonnummer"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile?.full_name || 'Ikke angivet'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile?.company_name || 'Ikke angivet'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile?.phone || 'Ikke angivet'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className={subscribed ? 'border-green-200 bg-green-50/50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SubscriptionIcon className={`h-5 w-5 ${subscribed ? 'text-green-600' : 'text-muted-foreground'}`} />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscribed && currentTier ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-green-800">{currentTier.name}</h3>
                        <p className="text-sm text-green-600">{currentTier.price} {currentTier.currency}/måned</p>
                      </div>
                      <Badge className="bg-green-600 text-white">Aktiv</Badge>
                    </div>
                    
                    {subscriptionEnd && (
                      <div className="text-sm text-muted-foreground">
                        Næste fakturering: {new Date(subscriptionEnd).toLocaleDateString('da-DK')}
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <Button 
                        onClick={openCustomerPortal} 
                        className="w-full" 
                        variant="outline"
                        size="sm"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Administrer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Intet aktivt abonnement
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <a href="/track-foelg">
                        <Zap className="h-4 w-4 mr-2" />
                        Opgrader nu
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Oversigt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Virksomheder fulgt</span>
                  <span className="font-semibold">{followedCompanies.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rapporter bestilt</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Medlem siden</span>
                  <span className="font-semibold text-sm">
                    {profile ? new Date(profile.created_at).toLocaleDateString('da-DK') : '-'}
                  </span>
                </div>
                
                <div className="pt-2 border-t">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href="/virksomhedsrapporter">
                      <FileText className="h-4 w-4 mr-2" />
                      Bestil rapporter
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
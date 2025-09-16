import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { User, Building2, Phone, Mail, Calendar, CreditCard, FileText, Star, Settings, Download, Edit2, Save, X, Bell, Eye, Trash2, Plus, Crown, Shield, Zap, TrendingUp, TrendingDown, AlertCircle, Clock, Users, DollarSign, MapPin, Calendar as CalendarIcon } from 'lucide-react';
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
  updated_at: string;
}

interface CompanyChange {
  type: 'address' | 'management' | 'financials' | 'status' | 'ownership';
  description: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
}

interface OrderedReport {
  id: string;
  company_name: string;
  company_cvr: string;
  report_type: string;
  order_date: string;
  status: 'processing' | 'ready' | 'downloaded';
  download_url?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followedCompanies, setFollowedCompanies] = useState<FollowedCompany[]>([]);
  const [orderedReports, setOrderedReports] = useState<OrderedReport[]>([]);
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

  // Helper function to get recent changes for a company
  const getRecentChanges = (companyData: any): CompanyChange[] => {
    // Mock data for now - in real implementation, this would come from change tracking
    const mockChanges: CompanyChange[] = [
      {
        type: 'management',
        description: 'Ny direktør tilføjet: Jens Hansen',
        date: '2024-01-15',
        severity: 'high'
      },
      {
        type: 'address',
        description: 'Adresse ændret til ny lokation',
        date: '2024-01-10',
        severity: 'medium'
      },
      {
        type: 'financials',
        description: 'Ny regnskabsperiode offentliggjort',
        date: '2024-01-05',
        severity: 'low'
      }
    ];
    
    return mockChanges.slice(0, 2); // Show last 2 changes
  };

  // Helper function to get change icon and color
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'management': return Users;
      case 'address': return MapPin;
      case 'financials': return DollarSign;
      case 'status': return AlertCircle;
      case 'ownership': return Building2;
      default: return AlertCircle;
    }
  };

  const getChangeColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Mock reports data - in real implementation, this would come from database
  const mockReports: OrderedReport[] = [
    {
      id: '1',
      company_name: 'BESTSELLER A/S',
      company_cvr: '10012345',
      report_type: 'Fuld virksomhedsrapport',
      order_date: '2024-01-15',
      status: 'ready',
      download_url: '/reports/bestseller-report.pdf'
    },
    {
      id: '2',
      company_name: 'NOVO NORDISK A/S',
      company_cvr: '24256790',
      report_type: 'Finansiel analyse',
      order_date: '2024-01-12',
      status: 'processing'
    }
  ];

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Followed Companies */}
          <div className="lg:col-span-3 space-y-6">
            {/* Followed Companies - Main Focus */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Virksomheder du følger</h2>
                    <p className="text-muted-foreground">
                      {followedCompanies.length} virksomheder på din følgeliste
                    </p>
                  </div>
                </div>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <a href="/">
                    <Plus className="h-4 w-4 mr-2" />
                    Tilføj flere
                  </a>
                </Button>
              </div>

              {followedCompanies.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/20">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Ingen virksomheder fulgt endnu</h3>
                  <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
                    Start med at søge efter virksomheder og tilføj dem til din følgeliste for at få automatiske opdateringer om vigtige ændringer
                  </p>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3">
                    <a href="/">
                      <Plus className="h-5 w-5 mr-3" />
                      Find virksomheder at følge
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {followedCompanies.map((company) => {
                    const recentChanges = getRecentChanges(company.company_data);
                    return (
                      <div key={company.id} className="group bg-white border border-border/50 rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                        {/* Company Header */}
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/10">
                              <Building2 className="h-8 w-8 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xl font-bold text-foreground mb-1 truncate">{company.company_name}</h3>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-muted-foreground">CVR: {company.company_cvr}</span>
                                <Badge variant="outline" className="text-xs font-medium">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Siden {new Date(company.created_at).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 ml-6">
                            <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90">
                              <a href={`/company/${company.company_cvr}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Se profil
                              </a>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeFollowedCompany(company.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Company Stats Grid */}
                        <div className="grid grid-cols-4 gap-6 mb-5 p-5 bg-muted/20 rounded-xl">
                          <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl mb-2 mx-auto">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Medarbejdere</p>
                            <p className="font-bold text-lg">{company.company_data?.employeeCount || '0'}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl mb-2 mx-auto">
                              <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="font-bold text-lg">{company.company_data?.status || 'Aktiv'}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl mb-2 mx-auto">
                              <CalendarIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Stiftet</p>
                            <p className="font-bold text-lg">{company.company_data?.yearFounded || 'N/A'}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-xl mb-2 mx-auto">
                              <TrendingUp className="h-5 w-5 text-orange-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Ændringer</p>
                            <p className="font-bold text-lg text-orange-600">{recentChanges.length}</p>
                          </div>
                        </div>

                        {/* Recent Changes */}
                        {recentChanges.length > 0 && (
                          <div className="mb-5">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Seneste aktivitet
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {recentChanges.map((change, index) => {
                                const ChangeIcon = getChangeIcon(change.type);
                                return (
                                  <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/30">
                                    <div className={`p-2 rounded-lg ${getChangeColor(change.severity)}`}>
                                      <ChangeIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium leading-tight">{change.description}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(change.date).toLocaleDateString('da-DK')}
                                        </p>
                                        <Badge variant="outline" className="text-xs px-2 py-0">
                                          {change.type}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Notification Preferences */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/30">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">Notifikationer:</span>
                            {company.notification_preferences?.email && (
                              <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700">
                                <Mail className="h-3 w-3" />
                                E-mail
                              </Badge>
                            )}
                            {company.notification_preferences?.sms && (
                              <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-700">
                                <Bell className="h-3 w-3" />
                                SMS
                              </Badge>
                            )}
                            {!company.notification_preferences?.email && !company.notification_preferences?.sms && (
                              <Badge variant="outline" className="text-muted-foreground">
                                Ingen aktive
                              </Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                            Rediger notifikationer
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ordered Reports Section */}
            <Card className="border-2 border-blue-200/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Bestilte rapporter</CardTitle>
                      <CardDescription>
                        Dine købte virksomhedsrapporter og analyser
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Bestil rapport
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mockReports.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Ingen rapporter bestilt endnu</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Bestil detaljerede virksomhedsrapporter og finansielle analyser
                    </p>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Bestil din første rapport
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{report.company_name}</h4>
                            <p className="text-sm text-muted-foreground">CVR: {report.company_cvr}</p>
                            <p className="text-sm text-muted-foreground">{report.report_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              Bestilt: {new Date(report.order_date).toLocaleDateString('da-DK')}
                            </p>
                            <Badge 
                              variant={report.status === 'ready' ? 'default' : report.status === 'processing' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {report.status === 'ready' ? 'Klar til download' : 
                               report.status === 'processing' ? 'Behandles' : 'Downloadet'}
                            </Badge>
                          </div>
                          {report.status === 'ready' && report.download_url && (
                            <Button size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
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
                  <Zap className="h-5 w-5" />
                  Hurtig oversigt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Fulgte virksomheder</span>
                    </div>
                    <div className="text-lg font-bold text-primary">{followedCompanies.length}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Bestilte rapporter</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">{mockReports.length}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Nye ændringer</span>
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      {followedCompanies.reduce((acc, company) => acc + getRecentChanges(company.company_data).length, 0)}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Medlem siden</div>
                  <div className="font-semibold">
                    {profile ? new Date(profile.created_at).toLocaleDateString('da-DK') : 'N/A'}
                  </div>
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
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { User, Building2, Phone, Mail, Calendar, CreditCard, FileText, Star, Settings as SettingsIcon, Download, Edit2, Save, X, Bell, Eye, Trash2, Plus, Crown, Shield, Zap, TrendingUp, TrendingDown, AlertCircle, Clock, Users, DollarSign, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_TIERS } from '@/constants/subscriptions';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getRecentChanges, type CompanyChange } from '@/services/utils/changeUtils';
import NotificationSettingsForm from '@/components/NotificationSettingsForm';

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
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedCompanyForSettings, setSelectedCompanyForSettings] = useState<FollowedCompany | null>(null);
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

  const toggleNotifications = async (companyId: string, currentEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('followed_companies')
        .update({
          notification_preferences: {
            ...followedCompanies.find(c => c.id === companyId)?.notification_preferences,
            email: !currentEnabled
          }
        })
        .eq('id', companyId);

      if (error) throw error;

      setFollowedCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { 
              ...company, 
              notification_preferences: { 
                ...company.notification_preferences, 
                email: !currentEnabled 
              } 
            }
          : company
      ));

      toast({
        title: "Notifikationer opdateret",
        description: `Notifikationer ${!currentEnabled ? 'aktiveret' : 'deaktiveret'}`,
      });
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke opdatere notifikationer",
        variant: "destructive",
      });
    }
  };

  const openNotificationSettings = (company: FollowedCompany) => {
    setSelectedCompanyForSettings(company);
    setNotificationDialogOpen(true);
  };

  const updateNotificationPreferences = async (preferences: { email: boolean; sms: boolean; call: boolean }) => {
    if (!selectedCompanyForSettings) return;

    try {
      const { error } = await supabase
        .from('followed_companies')
        .update({
          notification_preferences: preferences
        })
        .eq('id', selectedCompanyForSettings.id);

      if (error) throw error;

      setFollowedCompanies(prev => prev.map(company => 
        company.id === selectedCompanyForSettings.id 
          ? { 
              ...company, 
              notification_preferences: preferences
            }
          : company
      ));

      toast({
        title: "Notifikationer opdateret",
        description: "Dine notifikationsindstillinger er blevet gemt",
      });

      setNotificationDialogOpen(false);
      setSelectedCompanyForSettings(null);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Fejl",
        description: "Kunne ikke opdatere notifikationsindstillinger",
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
        type: 'financial',
        description: 'Ny regnskabsperiode offentliggjort',
        date: '2024-01-05',
        severity: 'low'
      }
    ];
    
    return mockChanges.slice(0, 2); // Show last 2 changes
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
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Virksomheder du følger</h2>
                </div>
              </div>

              {followedCompanies.length === 0 ? (
                <div className="text-center py-16">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ingen virksomheder fulgt endnu</h3>
                  <p className="text-muted-foreground mb-6">
                    Start med at søge efter virksomheder og tilføj dem til din følgeliste
                  </p>
                  <Button asChild>
                    <a href="/">Find virksomheder</a>
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">#</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Selskab</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">CVR</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Seneste Ændring</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Dato</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Notifikationer</th>
                        <th className="text-left py-3 text-sm font-medium text-muted-foreground">Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followedCompanies.map((company, index) => {
                        const recentChanges = getRecentChanges(company.company_data);
                        const latestChange = recentChanges.length > 0 ? recentChanges[0] : null;
                        
                        return (
                          <tr key={company.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-3 text-sm text-muted-foreground">{index + 1}.</td>
                            <td className="py-3 font-semibold text-foreground">{company.company_name}</td>
                            <td className="py-3 text-sm font-mono text-muted-foreground">{company.company_cvr}</td>
                            <td className="py-3 text-sm text-muted-foreground">
                              {latestChange ? latestChange.description : 'Ingen ændringer'}
                            </td>
                            <td className="py-3 text-sm text-muted-foreground">
                              {latestChange ? new Date(latestChange.date).toLocaleDateString('da-DK') : '-'}
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleNotifications(company.id, company.notification_preferences?.email || false)}
                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                    company.notification_preferences?.email 
                                      ? 'bg-success/10 text-success hover:bg-success/20' 
                                      : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                  }`}
                                >
                                  {company.notification_preferences?.email ? 'ON' : 'OFF'}
                                </button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openNotificationSettings(company)}
                                  className="p-1 h-7 w-7"
                                >
                                  <SettingsIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={`/company/${company.company_cvr}`}>
                                    <Eye className="h-4 w-4" />
                                  </a>
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
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <Button asChild className="bg-primary hover:bg-primary/90">
                      <a href="/">
                        <Plus className="h-4 w-4 mr-2" />
                        Tilføj flere
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Ordered Reports Section */}
            <div className="space-y-6 mt-16">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Bestilte rapporter</h2>
                </div>
              </div>

              {mockReports.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ingen rapporter bestilt endnu</h3>
                  <p className="text-muted-foreground mb-6">
                    Bestil detaljerede virksomhedsrapporter og finansielle analyser
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Bestil din første rapport
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                          <th className="text-left py-3 text-sm font-medium text-muted-foreground">Selskab</th>
                          <th className="text-left py-3 text-sm font-medium text-muted-foreground">CVR</th>
                          <th className="text-left py-3 text-sm font-medium text-muted-foreground">Rapport Type</th>
                          <th className="text-left py-3 text-sm font-medium text-muted-foreground">Dato</th>
                          <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockReports.map((report, index) => (
                          <tr key={report.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="py-3 px-4 text-sm text-muted-foreground">{index + 1}.</td>
                            <td className="py-3 font-semibold text-foreground">{report.company_name}</td>
                            <td className="py-3 text-sm font-mono text-muted-foreground">{report.company_cvr}</td>
                            <td className="py-3 text-sm text-muted-foreground">{report.report_type}</td>
                            <td className="py-3 text-sm text-muted-foreground">
                              {new Date(report.order_date).toLocaleDateString('da-DK')}
                            </td>
                            <td className="py-3">
                              {report.status === 'ready' ? (
                                <Button size="sm" variant="default">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              ) : report.status === 'processing' ? (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  Behandles
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Downloaded
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Bestil flere rapporter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {profile?.full_name || user?.email || 'Bruger'}
                    </CardTitle>
                    <CardDescription>
                      {user?.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fulde navn</Label>
                      <p className="text-sm">{profile?.full_name || 'Ikke angivet'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Virksomhed</Label>
                      <p className="text-sm">{profile?.company_name || 'Ikke angivet'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Telefon</Label>
                      <p className="text-sm">{profile?.phone || 'Ikke angivet'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Fulde navn</Label>
                      <Input
                        id="full_name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name">Virksomhed</Label>
                      <Input
                        id="company_name"
                        value={editForm.company_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <SubscriptionIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {subscribed ? currentTier?.name : 'Standard Plan'}
                    </CardTitle>
                    <CardDescription>
                      {subscribed ? 'Aktiv abonnement' : 'Opgrader for flere funktioner'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscribed ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">Aktiv</Badge>
                    </div>
                    {subscriptionEnd && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Fornyes</span>
                        <span className="text-sm font-medium">
                          {new Date(subscriptionEnd).toLocaleDateString('da-DK')}
                        </span>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={openCustomerPortal} className="w-full">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Administrer abonnement
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Opgrader til Premium for ubegrænset adgang
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <a href="/checkout">
                        <Crown className="h-4 w-4 mr-2" />
                        Opgrader nu
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Notification Settings Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Notifikationsindstillinger</DialogTitle>
            <DialogDescription>
              Vælg hvordan du vil modtage notifikationer for {selectedCompanyForSettings?.company_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompanyForSettings && (
            <NotificationSettingsForm 
              company={selectedCompanyForSettings}
              onSave={updateNotificationPreferences}
              onCancel={() => setNotificationDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProfilePage;
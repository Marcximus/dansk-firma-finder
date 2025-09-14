import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Search, 
  TrendingUp, 
  Users, 
  Building, 
  Calendar,
  Star,
  Shield,
  Clock,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { searchCompanies, Company } from '@/services/companyAPI';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';

const VirksomhedsrapporterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('types');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [companyReportTypes, setCompanyReportTypes] = useState<Record<string, string>>({});
  const [showSearchInput, setShowSearchInput] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle search results
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchCompanies(debouncedSearchQuery);
          setSearchResults(results.slice(0, 9)); // Get 9 results to show 3 at a time with scroll
          setShowDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSearch = () => {
    const searchElement = document.querySelector('[data-search-section]');
    if (searchElement) {
      searchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus on the search input after scrolling and add glow animation
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          // Add glow animation class
          searchInputRef.current.classList.add('animate-glow-twice');
          // Remove the animation class after it completes
          setTimeout(() => {
            if (searchInputRef.current) {
              searchInputRef.current.classList.remove('animate-glow-twice');
            }
          }, 2000);
        }
      }, 500);
    }
  };

  const switchToReportTypes = () => {
    setActiveTab('types');
    // Scroll to the tabs section
    const tabsElement = document.querySelector('[data-tabs-section]');
    if (tabsElement) {
      tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here or redirect to search results
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // You could navigate to a search results page or show results inline
    }
  };

  const handleCompanySelect = (company: Company) => {
    // Check if company is already selected
    if (selectedCompanies.find(c => c.cvr === company.cvr)) {
      return; // Don't add duplicate
    }
    
    // Add to selected companies
    setSelectedCompanies(prev => [...prev, company]);
    setSearchQuery('');
    setShowDropdown(false);
    setShowSearchInput(false); // Hide search input after selecting
    setActiveTab('types');
    console.log('Selected company:', company);
  };

  const handleReportOrder = (reportId: string) => {
    if (selectedCompanies.length === 0) return;
    
    // Initialize all companies with the selected report type
    const initialReportTypes: Record<string, string> = {};
    selectedCompanies.forEach(company => {
      initialReportTypes[company.cvr] = reportId;
    });
    setCompanyReportTypes(initialReportTypes);
    setSelectedReportType(reportId);
    setShowOrderConfirmation(true);
  };

  const handleOrderConfirmation = async () => {
    try {
      // Check if any companies need paid reports
      const paidReports = Object.entries(companyReportTypes).filter(([cvr, reportType]) => {
        return reportType === 'premium' || reportType === 'enterprise';
      });

      if (paidReports.length === 0) {
        // All reports are free (Standard), handle directly
        console.log('Ordering free reports:', companyReportTypes, 'for companies:', selectedCompanies);
        setShowOrderConfirmation(false);
        setSelectedReportType('');
        setCompanyReportTypes({});
        // Show success message for free reports
        return;
      }

      // Group companies by report type for Stripe checkout
      const premiumCompanies = selectedCompanies.filter(company => 
        companyReportTypes[company.cvr] === 'premium'
      );
      const enterpriseCompanies = selectedCompanies.filter(company => 
        companyReportTypes[company.cvr] === 'enterprise'
      );

      // Create payments for each report type
      if (premiumCompanies.length > 0) {
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            reportType: 'premium',
            companies: premiumCompanies
          }
        });

        if (error) throw error;

        // Redirect to Stripe checkout
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      }

      if (enterpriseCompanies.length > 0) {
        const { data, error } = await supabase.functions.invoke('create-payment', {
          body: {
            reportType: 'enterprise',
            companies: enterpriseCompanies
          }
        });

        if (error) throw error;

        // Redirect to Stripe checkout
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      }

      // Close the confirmation dialog
      setShowOrderConfirmation(false);
      setSelectedReportType('');
      setCompanyReportTypes({});
    } catch (error) {
      console.error('Error creating payment:', error);
      // You could show an error toast here
    }
  };

  const clearAllSelections = () => {
    setSelectedCompanies([]);
    setSearchQuery('');
    setSelectedReportType('');
    setCompanyReportTypes({});
    setShowOrderConfirmation(false);
    setShowSearchInput(true); // Show search input when clearing
  };

  const removeCompany = (cvrToRemove: string) => {
    const newCompanies = selectedCompanies.filter(company => company.cvr !== cvrToRemove);
    setSelectedCompanies(newCompanies);
    
    // If no companies left, show search input again
    if (newCompanies.length === 0) {
      setShowSearchInput(true);
    }
  };

  const addMoreCompanies = () => {
    // Show search input to allow adding more companies
    setShowSearchInput(true);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'Premium':
        return 'text-purple-600';
      case 'Enterprise':
        return 'text-blue-600';
      case 'Standard':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const updateCompanyReportType = (cvr: string, reportType: string) => {
    setCompanyReportTypes(prev => ({
      ...prev,
      [cvr]: reportType
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(companyReportTypes).forEach(([cvr, reportType]) => {
      const report = reportTypes.find(r => r.id === reportType);
      if (report && report.currentPrice !== '0,-') {
        total += parseInt(report.currentPrice.replace(/\D/g, ''));
      }
    });
    return total === 0 ? 'Gratis' : `${total},-`;
  };

  const reportTypes = [
    {
      id: 'standard',
      title: 'Standard virksomhedsrapport',
      description: 'Omfattende rapport med grundlæggende virksomhedsoplysninger',
      originalPrice: '149,-',
      currentPrice: '0,-',
      features: [
        'CVR-oplysninger og kontaktdata',
        'Grundlæggende finansielle nøgletal',
        'Ledelse og bestyrelsesmedlemmer',
        'Ejerskabsforhold (overordnet)',
        'Seneste regnskabstal'
      ],
      badge: 'Populær',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'premium',
      title: 'Premium virksomhedsrapport',
      description: 'Detaljeret analyse med finansielle trends og kreditvurdering',
      originalPrice: '499,-',
      currentPrice: '199,-',
      features: [
        'Alt fra Standard rapport',
        'Detaljeret finansiel analyse',
        'Kreditvurdering og rating',
        'Sammenligning med branchen',
        '5 års historiske data',
        'Risiko- og konkursanalyse',
        'Ejerskabsstruktur i dybden'
      ],
      badge: 'Anbefalet',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'enterprise',
      title: 'Enterprise virksomhedsrapport',
      description: 'Komplet "Outside-In" due diligence rapport til professionelle formål',
      originalPrice: '899,-',
      currentPrice: '499,-',
      features: [
        'Alt fra Premium rapport',
        'Koncernstruktur og tilknyttede selskaber',
        'Detaljeret konkurrentanalyse',
        'ESG-rating og bæredygtighed',
        'Compliance og juridisk analyse',
        'Markedsposition og outlook',
        'Ekspertannotationer og anbefalinger',
        'Tilpassede analyser'
      ],
      badge: 'Professional',
      badgeColor: 'bg-purple-500'
    }
  ];

  const sampleReports = [
    {
      company: 'LEGO A/S',
      cvr: '54562712',
      type: 'Standard',
      date: '2025-01-13',
      status: 'Klar'
    },
    {
      company: 'Danske Bank A/S',
      cvr: '61126228',
      type: 'Enterprise',
      date: '2025-01-14',
      status: 'Klar'
    },
    {
      company: 'Novo Nordisk A/S',
      cvr: '24256790',
      type: 'Premium',
      date: '2025-01-15',
      status: 'Klar'
    }
  ];

  return (
    <Layout>
      <div className="py-8 max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Virksomhedsrapporter</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Få detaljerede rapporter om danske virksomheder - fra grundlæggende oplysninger til omfattende analyser
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8" data-search-section>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Bestil rapport
            </CardTitle>
            <CardDescription>
              {selectedCompanies.length > 0 ? 'Vælg rapporttype for dine valgte virksomheder' : 'Søg efter den virksomhed du vil have en rapport om'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCompanies.length > 0 && !showSearchInput ? (
              <div className="space-y-4">
                {/* Report selection text - moved to top */}
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Vælg den type rapport du ønsker for {selectedCompanies.length === 1 
                      ? selectedCompanies[0].name 
                      : `${selectedCompanies.length} virksomheder`}
                  </p>
                </div>

                {/* Selected companies grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCompanies.map((company) => (
                    <div key={company.cvr} className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building className="h-6 w-6 text-primary" />
                        <div>
                          <div className="font-semibold">{company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            CVR: {company.cvr} • {company.city}
                          </div>
                          {company.industry && (
                            <div className="text-sm text-muted-foreground">
                              {company.industry}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeCompany(company.cvr)}>
                        Fjern
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Action buttons - moved to bottom */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={addMoreCompanies}>
                    Vælg flere selskaber
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllSelections}>
                    Ryd alle valg
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show selected companies if any exist, even when adding more */}
                {selectedCompanies.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Valgte virksomheder:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCompanies.map((company) => (
                        <div key={company.cvr} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            <span className="font-medium">{company.name}</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => removeCompany(company.cvr)}>
                            Fjern
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search input */}
                <div className="relative" ref={searchRef}>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        ref={searchInputRef}
                        placeholder="Indtast virksomhedsnavn eller CVR-nummer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                      />
                      
                      {/* Search Results Dropdown */}
                      {showDropdown && (searchResults.length > 0 || isSearching) && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-[240px] overflow-hidden">
                          {isSearching ? (
                            <div className="p-4 text-center text-muted-foreground">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                Søger...
                              </div>
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="max-h-[240px] overflow-y-auto">
                              {searchResults.slice(0, 3).map((company, index) => {
                                const isSelected = selectedCompanies.find(c => c.cvr === company.cvr);
                                return (
                                  <div
                                    key={company.cvr}
                                    className={`p-3 ${isSelected ? 'bg-primary/10 border-l-2 border-l-primary cursor-default' : 'hover:bg-accent cursor-pointer'} border-b border-border last:border-b-0 transition-colors`}
                                    onClick={() => !isSelected && handleCompanySelect(company)}
                                  >
                                    <div className="flex items-start gap-3">
                                      <Building className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate flex items-center gap-2">
                                          {company.name}
                                          {isSelected && (
                                            <Badge variant="secondary" className="text-xs">
                                              Valgt
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          CVR: {company.cvr}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                          <MapPin className="h-3 w-3" />
                                          {company.city}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {searchResults.length > 3 && (
                                <div className="p-2 bg-muted/50 text-center">
                                  <span className="text-xs text-muted-foreground">
                                    Scroll for flere resultater ({searchResults.length - 3} mere)
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <Button type="submit">
                      <Search className="w-4 h-4 mr-2" />
                      Søg
                    </Button>
                  </form>
                </div>
                
                {selectedCompanies.length > 0 && (
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={() => setShowSearchInput(false)}>
                      Færdig med at vælge virksomheder
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-tabs-section>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="types">Rapporttyper</TabsTrigger>
            <TabsTrigger value="samples">Eksempelrapporter</TabsTrigger>
            <TabsTrigger value="faq">Spørgsmål & Svar</TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report) => (
                <Card key={report.id} className="relative overflow-hidden h-full flex flex-col">
                  {report.badge && (
                    <div className="absolute top-4 right-4">
                      <Badge className={`${report.badgeColor} text-white`}>
                        {report.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="pr-20">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">{report.originalPrice}</span>
                      <span className="text-2xl font-bold text-primary">{report.currentPrice}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <ul className="space-y-2 flex-1">
                      {report.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 border border-primary/10 hover:border-primary/20 transition-all duration-700 hover:scale-[1.01] font-medium"
                      onClick={() => selectedCompanies.length > 0 ? handleReportOrder(report.id) : scrollToSearch()}
                    >
                      {selectedCompanies.length > 0 
                        ? `Bestil ${report.title.toLowerCase()}` 
                        : 'Vælg virksomhed først'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Hvad er inkluderet?</CardTitle>
                <CardDescription>
                  Sammenligning af de forskellige rapporttyper
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Grundoplysninger
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Virksomhedsnavn, CVR-nummer og adresse</li>
                      <li>• Kontaktoplysninger og hjemmeside</li>
                      <li>• Virksomhedsform og branchekode</li>
                      <li>• Stiftelsesdato og aktuel status</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Finansielle data
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Omsætning, resultat og egenkapital</li>
                      <li>• Nøgletal og rentabilitet</li>
                      <li>• Kreditrating og risikovurdering</li>
                      <li>• Historiske trends og prognoser</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Ledelse og ejerskab
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Direktion og bestyrelse</li>
                      <li>• Tegningsregler og roller</li>
                      <li>• Ejerskabsstruktur og kapitalforhold</li>
                      <li>• Tilknyttede virksomheder</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Risiko og compliance
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Konkurs- og likvidationsrisiko</li>
                      <li>• Betalingsadfærd og kredithistorik</li>
                      <li>• Juridiske sager og tvangsfuldbyrdelse</li>
                      <li>• Compliance og regulatoriske forhold</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="samples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Eksempelrapporter</CardTitle>
                <CardDescription>
                  Se eksempler på rapporter for at forstå indholdet og kvaliteten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <div className="font-semibold">{report.company}</div>
                           <div className="text-sm text-muted-foreground">
                             CVR: {report.cvr} • <span className={getReportTypeColor(report.type)}>{report.type} rapport</span>
                           </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {report.date}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-green-600 animate-pulse bg-green-50 border-green-300 shadow-sm shadow-green-200">
                          {report.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 mb-3">
                    <strong>Bemærk:</strong> Eksempelrapporterne er anonymiserede og viser rapportstruktur og -indhold.
                  </p>
                  <p className="text-sm text-blue-700">
                    Alle data i de faktiske rapporter er realtidsdata fra officielle kilder.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Leveringstid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Standard rapport:</span>
                    <span className="font-medium">Øjeblikkeligt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium rapport:</span>
                    <span className="font-medium">2-5 timer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enterprise rapport:</span>
                    <span className="font-medium">5-15 timer</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formater
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>PDF til print og arkivering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Excel til videre analyse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Online visning i browser</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Hvad inkluderer rapporterne?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Alle rapporter bygger på officielle data fra CVR-registeret, årsrapporter 
                    og andre pålidelige kilder. Data opdateres løbende og er maksimalt 24 timer gammelt.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Datakilder og kvalitet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CVR-registeret (Erhvervsstyrelsen)</li>
                    <li>• Årsrapporter og regnskaber</li>
                    <li>• Kreditoplysningsbureauer</li>
                    <li>• Offentlige myndigheder</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Order Confirmation Dialog */}
        <Dialog open={showOrderConfirmation} onOpenChange={setShowOrderConfirmation}>
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="space-y-3 pb-6">
              <DialogTitle className="text-2xl flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Bekræft bestilling
              </DialogTitle>
              <DialogDescription className="text-base">
                Vælg rapporttype for hver virksomhed og bekræft din bestilling
              </DialogDescription>
            </DialogHeader>
            
            {selectedCompanies.length > 0 && (
              <div className="space-y-6">
                {/* Companies with Report Selection */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Virksomheder og rapporter ({selectedCompanies.length})
                    </h4>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {selectedCompanies.map((company, index) => {
                      const selectedReport = companyReportTypes[company.cvr] 
                        ? reportTypes.find(r => r.id === companyReportTypes[company.cvr])
                        : null;
                      
                      return (
                        <div key={company.cvr} className="p-6 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-start justify-between gap-6">
                            {/* Company Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg mt-1">
                                  <Building className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold text-lg text-gray-900 mb-1">{company.name}</h5>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="font-medium">CVR: {company.cvr}</span>
                                    {company.city && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {company.city}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Report Selection */}
                            <div className="flex items-center gap-4 min-w-[300px]">
                              <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                  Rapporttype:
                                </label>
                                <Select 
                                  value={companyReportTypes[company.cvr] || ''} 
                                  onValueChange={(value) => updateCompanyReportType(company.cvr, value)}
                                >
                                  <SelectTrigger className="w-full border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500">
                                    <SelectValue placeholder="Vælg rapport" />
                                  </SelectTrigger>
                                  <SelectContent className="z-50 bg-white shadow-lg">
                                    {reportTypes.map((report) => (
                                      <SelectItem key={report.id} value={report.id}>
                                        {report.title} - {report.currentPrice}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Price Display */}
                              <div className="text-right min-w-[100px]">
                                <div className="text-xs text-gray-500 mb-1">Pris</div>
                                {selectedReport ? (
                                  <div className="flex flex-col items-end gap-1">
                                    {selectedReport.originalPrice !== selectedReport.currentPrice && (
                                      <span className="text-sm text-gray-400 line-through">
                                        {selectedReport.originalPrice}
                                      </span>
                                    )}
                                    <span className="text-lg font-bold text-green-600">
                                      {selectedReport.currentPrice}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Report Description */}
                          {selectedReport && (
                            <div className="mt-4 ml-11 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-sm text-blue-800">{selectedReport.description}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Total Section */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xl mb-1">Total bestilling</h4>
                      <p className="text-green-100 text-sm">
                        {Object.keys(companyReportTypes).length} af {selectedCompanies.length} virksomheder har valgt rapport
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-100 text-sm mb-1">Total pris</div>
                      <div className="text-3xl font-bold">{calculateTotal()}</div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Information */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h4 className="font-bold text-lg flex items-center gap-2 text-amber-800 mb-3">
                    <Clock className="h-5 w-5" />
                    Leveringsinformation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-amber-100">
                      <div className="font-medium text-green-600">Standard</div>
                      <div className="text-sm text-gray-600">Øjeblikkeligt</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-amber-100">
                      <div className="font-medium text-blue-600">Premium</div>
                      <div className="text-sm text-gray-600">2-5 timer</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-amber-100">
                      <div className="font-medium text-purple-600">Enterprise</div>
                      <div className="text-sm text-gray-600">5-15 timer</div>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 mt-3 text-center">
                    Alle rapporter sendes til din email når de er klar
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter className="pt-6 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowOrderConfirmation(false)}
                className="px-6"
              >
                Annuller
              </Button>
              <Button 
                onClick={handleOrderConfirmation}
                disabled={Object.keys(companyReportTypes).length === 0}
                className="px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg disabled:bg-gray-400"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Bekræft bestilling ({Object.keys(companyReportTypes).length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Klar til at få din første rapport?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            Begynd med en gratis Standard rapport eller få en omfattende analyse med vores Premium og Enterprise rapporter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={scrollToSearch}>
              <Search className="w-4 h-4 mr-2" />
              Søg virksomhed
            </Button>
            <Button size="lg" variant="outline" className="text-primary-foreground border-white hover:bg-white hover:text-primary bg-white/10" onClick={switchToReportTypes}>
              Se priser og features
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VirksomhedsrapporterPage;
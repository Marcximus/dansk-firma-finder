import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCompanyById, Company } from '@/services/companyAPI';
import Layout from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Building, Users, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CompanyChange {
  type: 'name' | 'address' | 'status' | 'industry' | 'email' | 'phone' | 'management';
  date: string;
  oldValue?: string;
  newValue: string;
  description: string;
}

const CompanyChangesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [changes, setChanges] = useState<CompanyChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyAndChanges = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const companyData = await getCompanyById(id);
        if (companyData) {
          setCompany(companyData);
          const extractedChanges = extractChanges(companyData);
          setChanges(extractedChanges);
        } else {
          toast({
            title: "Virksomhed ikke fundet",
            description: "Den ønskede virksomhed kunne ikke findes.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        toast({
          title: "Fejl",
          description: "Kunne ikke indlæse virksomhedsdetaljer. Prøv venligst igen.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyAndChanges();
  }, [id, navigate, toast]);

  const extractChanges = (company: Company): CompanyChange[] => {
    const changes: CompanyChange[] = [];
    const cvrData = company.realCvrData;

    if (!cvrData) return changes;

    // Extract name changes
    if (cvrData.navne && cvrData.navne.length > 1) {
      const sortedNames = [...cvrData.navne].sort((a, b) => 
        new Date(a.periode.gyldigFra).getTime() - new Date(b.periode.gyldigFra).getTime()
      );
      
      for (let i = 1; i < sortedNames.length; i++) {
        changes.push({
          type: 'name',
          date: sortedNames[i].periode.gyldigFra,
          oldValue: sortedNames[i-1].navn,
          newValue: sortedNames[i].navn,
          description: `Virksomhedsnavnet blev ændret fra "${sortedNames[i-1].navn}" til "${sortedNames[i].navn}"`
        });
      }
    }

    // Extract address changes
    if (cvrData.beliggenhedsadresse && cvrData.beliggenhedsadresse.length > 1) {
      const sortedAddresses = [...cvrData.beliggenhedsadresse].sort((a, b) => 
        new Date(a.periode.gyldigFra).getTime() - new Date(b.periode.gyldigFra).getTime()
      );
      
      for (let i = 1; i < sortedAddresses.length; i++) {
        const oldAddr = sortedAddresses[i-1];
        const newAddr = sortedAddresses[i];
        const oldAddress = `${oldAddr.vejnavn} ${oldAddr.husnummerFra}${oldAddr.bogstavFra || ''}${oldAddr.etage ? ', ' + oldAddr.etage : ''}, ${oldAddr.postnummer} ${oldAddr.postdistrikt}`;
        const newAddress = `${newAddr.vejnavn} ${newAddr.husnummerFra}${newAddr.bogstavFra || ''}${newAddr.etage ? ', ' + newAddr.etage : ''}, ${newAddr.postnummer} ${newAddr.postdistrikt}`;
        
        changes.push({
          type: 'address',
          date: newAddr.periode.gyldigFra,
          oldValue: oldAddress,
          newValue: newAddress,
          description: `Adressen blev ændret fra "${oldAddress}" til "${newAddress}"`
        });
      }
    }

    // Extract status changes
    if (cvrData.virksomhedsstatus && cvrData.virksomhedsstatus.length > 1) {
      const sortedStatuses = [...cvrData.virksomhedsstatus].sort((a, b) => 
        new Date(a.periode.gyldigFra).getTime() - new Date(b.periode.gyldigFra).getTime()
      );
      
      for (let i = 1; i < sortedStatuses.length; i++) {
        changes.push({
          type: 'status',
          date: sortedStatuses[i].periode.gyldigFra,
          oldValue: sortedStatuses[i-1].status,
          newValue: sortedStatuses[i].status,
          description: `Virksomhedsstatus blev ændret fra "${sortedStatuses[i-1].status}" til "${sortedStatuses[i].status}"`
        });
      }
    }

    // Extract industry changes
    if (cvrData.hovedbranche && cvrData.hovedbranche.length > 1) {
      const sortedIndustries = [...cvrData.hovedbranche].sort((a, b) => 
        new Date(a.periode.gyldigFra).getTime() - new Date(b.periode.gyldigFra).getTime()
      );
      
      for (let i = 1; i < sortedIndustries.length; i++) {
        changes.push({
          type: 'industry',
          date: sortedIndustries[i].periode.gyldigFra,
          oldValue: sortedIndustries[i-1].branchetekst,
          newValue: sortedIndustries[i].branchetekst,
          description: `Hovedbranche blev ændret fra "${sortedIndustries[i-1].branchetekst}" til "${sortedIndustries[i].branchetekst}"`
        });
      }
    }

    // Extract email changes
    if (cvrData.elektroniskPost && cvrData.elektroniskPost.length > 1) {
      const sortedEmails = [...cvrData.elektroniskPost].sort((a, b) => 
        new Date(a.periode.gyldigFra).getTime() - new Date(b.periode.gyldigFra).getTime()
      );
      
      for (let i = 1; i < sortedEmails.length; i++) {
        changes.push({
          type: 'email',
          date: sortedEmails[i].periode.gyldigFra,
          oldValue: sortedEmails[i-1].kontaktoplysning,
          newValue: sortedEmails[i].kontaktoplysning,
          description: `E-mail blev ændret fra "${sortedEmails[i-1].kontaktoplysning}" til "${sortedEmails[i].kontaktoplysning}"`
        });
      }
    }

    // Sort all changes by date (newest first)
    return changes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'name': return <Building className="h-4 w-4" />;
      case 'address': return <MapPin className="h-4 w-4" />;
      case 'status': return <Badge className="h-4 w-4" />;
      case 'industry': return <Building className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'management': return <Users className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'name': return 'Navn';
      case 'address': return 'Adresse';
      case 'status': return 'Status';
      case 'industry': return 'Branche';
      case 'email': return 'E-mail';
      case 'phone': return 'Telefon';
      case 'management': return 'Ledelse';
      default: return 'Ændring';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <SEO 
          title="Indlæser ændringer - SelskabsInfo"
          description="Indlæser de seneste ændringer for virksomheden"
        />
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Indlæser ændringer...</p>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <SEO 
          title="Virksomhed ikke fundet - SelskabsInfo"
          description="Den ønskede virksomhed kunne ikke findes"
        />
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Virksomhed ikke fundet</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={`Seneste ændringer for ${company.name} - SelskabsInfo`}
        description={`Se de seneste ændringer og historiske data for ${company.name}. CVR: ${company.cvr}.`}
        canonicalUrl={`https://selskabsinfo.dk/company/${id}/changes`}
        keywords={`${company.name}, CVR ${company.cvr}, virksomhedsændringer, historik`}
      />
      
      <div className="py-6 max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-4">
            <Link to={`/company/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbage til virksomhed
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Seneste ændringer</h1>
          <p className="text-lg text-muted-foreground mb-4">{company.name}</p>
        </div>

        {changes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ingen ændringer fundet</h3>
              <p className="text-muted-foreground">
                Der er ikke registreret nogen historiske ændringer for denne virksomhed i CVR-data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {changes.map((change, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getChangeIcon(change.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {getChangeTypeLabel(change.type)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(change.date)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm mb-3">{change.description}</p>
                  {change.oldValue && (
                    <div className="space-y-2">
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <span className="text-xs font-medium text-red-700">FØR:</span>
                        <p className="text-sm text-red-800 mt-1">{change.oldValue}</p>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <span className="text-xs font-medium text-green-700">EFTER:</span>
                        <p className="text-sm text-green-800 mt-1">{change.newValue}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompanyChangesPage;
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getPersonData } from '@/services/companyAPI';
import Layout from '@/components/Layout';
import PersonDetails from '@/components/PersonDetails';
import SEO from '@/components/SEO';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const PersonPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [personData, setPersonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get person ID (enhedsNummer) and name from query parameters
  const personId = searchParams.get('id');
  const personNameFromQuery = searchParams.get('name');
  const personNameFromSlug = slug
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || '';
  
  const personName = personNameFromQuery || personNameFromSlug;
  
  console.log('PersonPage - Loading person:', {
    slug,
    personId,
    personNameFromQuery,
    personNameFromSlug,
    finalPersonName: personName
  });

  useEffect(() => {
    const fetchPersonData = async () => {
      if (!personName) {
        setError('Ugyldigt personnavn');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log('Fetching person data for:', { personName, personId });
      
      try {
        const data = await getPersonData(personName, personId || undefined);
        
        console.log('Person data received:', {
          personName,
          totalCompanies: data?.totalCompanies,
          activeRelations: data?.activeRelations?.length,
          historicalRelations: data?.historicalRelations?.length
        });
        
        if (!data || data.totalCompanies === 0) {
          setError(`Ingen data fundet for "${personName}"`);
          setPersonData(null);
        } else {
          setPersonData(data);
        }
      } catch (error) {
        console.error('Error fetching person data:', error);
        setError('Der opstod en fejl ved hentning af persondata');
        setPersonData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [personName, personId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Person ikke fundet</h1>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              Søgte efter: <span className="font-mono bg-muted px-2 py-1 rounded">{personName}</span>
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Forslag:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Prøv at søge efter virksomheden i stedet</li>
                <li>Kontroller stavningen af navnet</li>
                <li>Personen har muligvis ingen registrerede tilknytninger</li>
              </ul>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Tilbage til forsiden
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!personData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Ingen data tilgængelig</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`${personData.personName} - Tilknytninger og Roller`}
        description={`Se alle ${personData.personName}s aktive og tidligere tilknytninger til danske virksomheder, herunder ejerskab, bestyrelsesposter og ledelsesroller.`}
        canonicalUrl={`/person/${slug}`}
        keywords={`${personData.personName}, tilknytninger, bestyrelsesmedlem, ejer, direktør, danske virksomheder`}
      />
      <PersonDetails personData={personData} />
    </Layout>
  );
};

export default PersonPage;

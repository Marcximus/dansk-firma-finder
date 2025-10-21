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
        console.error('[PersonPage] No person name provided');
        setError('Ugyldigt personnavn');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log('[PersonPage] Fetching person data for:', { personName, personId });
      
      try {
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
        });
        
        // Race between data fetch and timeout
        const data = await Promise.race([
          getPersonData(personName, personId || undefined),
          timeoutPromise
        ]) as any;
        
        console.log('[PersonPage] Person data received:', {
          personName,
          totalCompanies: data?.totalCompanies,
          activeRelations: data?.activeRelations?.length,
          historicalRelations: data?.historicalRelations?.length,
          searchMethod: data?.searchMethod,
          debug: data?.debug
        });
        
        if (!data || data.totalCompanies === 0) {
          console.warn('[PersonPage] No data or no companies found');
          setError(`Ingen virksomheder fundet for "${personName}". Tjek stavningen eller prøv et andet navn.`);
          setPersonData(null);
        } else {
          setPersonData(data);
        }
      } catch (error: any) {
        console.error('[PersonPage] Error fetching person data:', error);
        console.error('[PersonPage] Error details:', {
          message: error?.message,
          status: error?.status,
          response: error?.response
        });
        
        // Better error messages based on error type
        if (error.message?.includes('timeout')) {
          setError(`Anmodningen tog for lang tid. Prøv venligst igen.`);
        } else if (error.context?.status) {
          setError(`Server error (${error.context.status}): ${error.message}`);
        } else {
          setError(`Kunne ikke hente data for "${personName}". ${error.message || 'Tjek stavningen eller prøv igen senere.'}`);
        }
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
            <div className="text-xs text-muted-foreground mb-4 p-3 bg-muted rounded text-left">
              <p className="font-semibold mb-1">Debug Info:</p>
              <p>Søgte efter: {personName}</p>
              {personId && <p>Person ID: {personId}</p>}
            </div>
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

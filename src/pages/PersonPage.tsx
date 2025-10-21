import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonData } from '@/services/companyAPI';
import Layout from '@/components/Layout';
import PersonDetails from '@/components/PersonDetails';
import SEO from '@/components/SEO';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PersonPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [personData, setPersonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Convert slug back to person name (approximate)
  const personName = slug
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || '';

  useEffect(() => {
    const fetchPersonData = async () => {
      if (!personName) {
        toast.error('Ugyldigt personnavn');
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const data = await getPersonData(personName);
        
        if (!data || data.totalCompanies === 0) {
          toast.error(`Ingen data fundet for ${personName}`);
          navigate('/');
          return;
        }

        setPersonData(data);
      } catch (error) {
        console.error('Error fetching person data:', error);
        toast.error('Der opstod en fejl ved hentning af persondata');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [personName, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!personData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Person ikke fundet</p>
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

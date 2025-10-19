
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCompanyById, Company } from '@/services/companyAPI';
import CompanyDetails from '@/components/CompanyDetails';
import Layout from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';
import SEO from '@/components/SEO';
import JSONLDScript, { createCompanySchema } from '@/components/JSONLDScript';

const CompanyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const companyData = await getCompanyById(id);
        if (companyData) {
          // Keep original data without transformations for detailed view
          setCompany(companyData);
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

    fetchCompany();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Indlæser virksomhedsdetaljer...</p>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Virksomhed ikke fundet</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={`${company.name} - Virksomhedsoplysninger | SelskabsInfo`}
        description={`Se detaljerede oplysninger om ${company.name}. CVR: ${company.cvr}. Find regnskaber, ledelse, ejerforhold og historiske data.`}
        canonicalUrl={`https://selskabsinfo.dk/company/${id}`}
        keywords={`${company.name}, CVR ${company.cvr}, danske virksomheder, selskabsoplysninger`}
      />
      <JSONLDScript data={createCompanySchema(company)} />
      
      <CompanyDetails company={company} />
    </Layout>
  );
};

export default CompanyPage;

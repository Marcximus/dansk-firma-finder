import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyById, Company } from '@/services/companyAPI';
import CompanyDetails from '@/components/CompanyDetails';
import Layout from '@/components/Layout';
import { useToast } from '@/components/ui/use-toast';

const CompanyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Transform company data to simplify legal forms and statuses
  const transformCompanyData = (company: Company): Company => {
    // Transform legal form
    let transformedLegalForm = company.legalForm;
    if (company.legalForm === 'Anden udenlandsk virksomhed' || 
        company.legalForm === 'Filial af udenlandsk aktieselskab, kommanditakties etc') {
      transformedLegalForm = 'Udenlandsk Virksomhed';
    }

    // Transform status - simplify dissolved statuses
    let transformedStatus = company.status;
    if (company.status?.includes('OPLØST')) {
      transformedStatus = 'OPLØST';
    }

    return {
      ...company,
      legalForm: transformedLegalForm,
      status: transformedStatus
    };
  };

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const companyData = await getCompanyById(id);
        if (companyData) {
          // Apply transformations to the company data
          const transformedCompany = transformCompanyData(companyData);
          setCompany(transformedCompany);
        } else {
          toast({
            title: "Company not found",
            description: "The requested company could not be found.",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        toast({
          title: "Error",
          description: "Failed to load company details. Please try again.",
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
          <p className="text-lg text-muted-foreground">Loading company details...</p>
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Company not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <CompanyDetails company={company} />
    </Layout>
  );
};

export default CompanyPage;

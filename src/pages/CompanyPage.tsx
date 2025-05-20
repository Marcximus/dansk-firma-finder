
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyById, Company } from '@/services/companyAPI';
import CompanyDetails from '@/components/CompanyDetails';
import { useToast } from '@/components/ui/use-toast';

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
          setCompany(companyData);
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
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">Loading company details...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">Company not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CompanyDetails company={company} />
    </div>
  );
};

export default CompanyPage;

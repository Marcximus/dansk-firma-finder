
import React, { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import CompanyCard from '@/components/CompanyCard';
import { searchCompanies, Company } from '@/services/companyAPI';
import { useToast } from '@/components/ui/use-toast';

const HomePage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchCompanies(query);
      setCompanies(results);
      setHasSearched(true);
      
      if (results.length === 0) {
        toast({
          title: "No companies found",
          description: "Try adjusting your search criteria.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      toast({
        title: "Error",
        description: "Failed to search companies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Danish Company Database</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Search and explore information about companies registered in Denmark.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Searching for companies...</p>
        </div>
      ) : (
        <>
          {hasSearched && (
            <div className="mb-4">
              <h2 className="text-xl font-medium">
                {companies.length} {companies.length === 1 ? 'result' : 'results'} found
              </h2>
            </div>
          )}

          {companies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            hasSearched && (
              <div className="text-center py-12 bg-muted rounded-lg">
                <h3 className="text-xl font-medium mb-2">No companies found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or searching for a different company name or industry.
                </p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;

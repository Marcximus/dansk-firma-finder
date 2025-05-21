
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCompanies, Company } from '@/services/companyAPI';
import SearchBar from '@/components/SearchBar';
import CompanyCard from '@/components/CompanyCard';
import Layout from '@/components/Layout';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const { data: companies = [], isLoading, refetch } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: () => searchCompanies(searchTerm),
    enabled: false,
  });

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    refetch();
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="py-12 text-center">
          <h1 className="text-4xl font-bold mb-6">Danish Company Database</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Search and explore detailed information about Danish companies
          </p>
          <div className="flex justify-center mb-12">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>

        {searchTerm && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Searching...' : `Results for "${searchTerm}"`}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company: Company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {searchTerm && companies.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">
              No companies found matching your search criteria.
            </p>
          </div>
        )}
        
        {!searchTerm && !isLoading && (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">
              Enter a search term to find companies.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;

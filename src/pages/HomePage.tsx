
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchCompanies, Company } from '@/services/companyAPI';
import SearchBar from '@/components/SearchBar';
import CompanyCard from '@/components/CompanyCard';
import Layout from '@/components/Layout';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const queryClient = useQueryClient();
  
  const { data: rawCompanies = [], isLoading } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: () => searchCompanies(searchTerm),
    enabled: !!searchTerm,
  });

  // Sort companies by relevance to search term
  const companies = rawCompanies.sort((a, b) => {
    if (!searchTerm) return a.name.localeCompare(b.name);
    
    const searchLower = searchTerm.toLowerCase();
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // Exact match comes first
    if (aName === searchLower && bName !== searchLower) return -1;
    if (bName === searchLower && aName !== searchLower) return 1;
    
    // Starts with search term comes next
    if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
    if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1;
    
    // Contains search term comes next
    if (aName.includes(searchLower) && !bName.includes(searchLower)) return -1;
    if (bName.includes(searchLower) && !aName.includes(searchLower)) return 1;
    
    // If both have same relevance level, sort alphabetically
    return a.name.localeCompare(b.name);
  });

  const handleSearch = (query: string) => {
    console.log('HomePage: handleSearch called with query:', query);
    setSearchTerm(query);
    // Invalidate and refetch the query with the new search term
    queryClient.invalidateQueries({ queryKey: ['companies', query] });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="py-12 text-center">
          <h1 className="text-4xl font-bold mb-6">Selskabs Info</h1>
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


import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { searchCompanies, Company } from '@/services/companyAPI';
import SearchBar from '@/components/SearchBar';
import CompanyCard from '@/components/CompanyCard';
import Layout from '@/components/Layout';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Handle search from URL parameters (from header search)
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    } else if (location.pathname === '/' && location.search === '') {
      setSearchTerm('');
    }
  }, [location, searchParams]);
  
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: () => searchCompanies(searchTerm),
    enabled: !!searchTerm,
  });

  // Debug: Log what companies are about to be rendered
  useEffect(() => {
    if (companies.length > 0) {
      console.log('🎨 HomePage: About to render companies in this exact order (NO FRONTEND SORTING):');
      companies.forEach((company: Company, index: number) => {
        console.log(`  ${index + 1}. ${company.name} (Backend Score: ${(company as any)._debugScore || 'N/A'})`);
      });
    }
  }, [companies]);

  const handleSearch = (query: string) => {
    console.log('🎨 HomePage: handleSearch called with query:', query);
    setSearchTerm(query);
    // Invalidate and refetch the query with the new search term
    queryClient.invalidateQueries({ queryKey: ['companies', query] });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Only show hero section if no search has been performed */}
        {!searchTerm && (
          <div className="py-12 text-center">
            <h1 className="text-4xl font-bold mb-6">Selskabs Info</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Search and explore detailed information about Danish companies
            </p>
            <div className="flex justify-center mb-12">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>
        )}

        {/* Show search bar at top when search is active */}
        {searchTerm && (
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        )}

        {searchTerm && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              {isLoading ? 'Searching...' : `Results for "${searchTerm}"`}
            </h2>
          </div>
        )}

        {/* Render companies in the exact order from backend - NO SORTING ON FRONTEND */}
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

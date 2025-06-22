
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { searchCompanies, Company } from '@/services/companyAPI';
import SearchBar from '@/components/SearchBar';
import CompanyCard from '@/components/CompanyCard';
import Layout from '@/components/Layout';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const queryClient = useQueryClient();
  const location = useLocation();
  
  // Clear search when navigating to home page
  useEffect(() => {
    if (location.pathname === '/' && location.search === '') {
      setSearchTerm('');
    }
  }, [location]);
  
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: () => searchCompanies(searchTerm),
    enabled: !!searchTerm,
  });

  // Debug: Log what companies are about to be rendered with detailed analysis
  useEffect(() => {
    if (companies.length > 0 && searchTerm) {
      console.log('🎨 HomePage: About to render companies in this order:');
      const cleanSearchTerm = searchTerm.toLowerCase().trim();
      
      companies.forEach((company: Company, index: number) => {
        const cleanCompanyName = company.name.toLowerCase().trim();
        const isExactMatch = cleanCompanyName === cleanSearchTerm;
        const isContained = cleanCompanyName.includes(cleanSearchTerm);
        const startsWithSearch = cleanCompanyName.startsWith(cleanSearchTerm);
        
        console.log(`  ${index + 1}. ${company.name}`);
        console.log(`     🎯 Length: ${company.name.length}`);
        console.log(`     🎯 Exact match: ${isExactMatch}`);
        console.log(`     📦 Contains "${searchTerm}": ${isContained}`);
        console.log(`     🏁 Starts with "${searchTerm}": ${startsWithSearch}`);
        
        // Check for expected ranking issues
        if (searchTerm.toLowerCase() === 'lego' && company.name === 'LEGO A/S' && index !== 0) {
          console.log(`     ⚠️ RANKING ISSUE: "LEGO A/S" should be first for "Lego" search but is at position ${index + 1}`);
        }
      });
      
      // Additional analysis for "Lego" searches
      if (searchTerm.toLowerCase() === 'lego') {
        console.log('🔍 HomePage: LEGO SEARCH ANALYSIS:');
        const legoAS = companies.find(c => c.name === 'LEGO A/S');
        const legoSystem = companies.find(c => c.name === 'LEGO SYSTEM A/S');
        const legoHolding = companies.find(c => c.name === 'LEGO Holding A/S');
        
        if (legoAS) {
          const legoASIndex = companies.findIndex(c => c.name === 'LEGO A/S');
          console.log(`   - "LEGO A/S" is at position ${legoASIndex + 1} (should be 1)`);
        }
        if (legoSystem) {
          const legoSystemIndex = companies.findIndex(c => c.name === 'LEGO SYSTEM A/S');
          console.log(`   - "LEGO SYSTEM A/S" is at position ${legoSystemIndex + 1}`);
        }
        if (legoHolding) {
          const legoHoldingIndex = companies.findIndex(c => c.name === 'LEGO Holding A/S');
          console.log(`   - "LEGO Holding A/S" is at position ${legoHoldingIndex + 1}`);
        }
      }
    }
  }, [companies, searchTerm]);

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

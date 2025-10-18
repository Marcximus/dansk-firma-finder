
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useSearchParams } from 'react-router-dom';
import { searchCompanies, Company } from '@/services/companyAPI';
import SearchBar from '@/components/SearchBar';
import CompanyCard from '@/components/CompanyCard';
import Layout from '@/components/Layout';
import { Spinner } from '@/components/ui/spinner';
import SEO from '@/components/SEO';
import JSONLDScript, { createWebsiteSchema, createOrganizationSchema } from '@/components/JSONLDScript';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 15;

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [shouldFocusSearch, setShouldFocusSearch] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Handle search from URL parameters (from header search) and focus trigger
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const focusParam = searchParams.get('focus');
    
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    } else if (location.pathname === '/' && location.search === '') {
      setSearchTerm('');
    }
    
    // Trigger focus and glow animation if focus parameter is present
    if (focusParam === 'search') {
      setShouldFocusSearch(true);
      // Reset the focus trigger after it's been used
      setTimeout(() => setShouldFocusSearch(false), 100);
    }
  }, [location, searchParams]);
  
  const { data: rawCompanies = [], isLoading } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: () => searchCompanies(searchTerm),
    enabled: !!searchTerm,
  });

  // Transform company data to simplify legal forms and statuses
  const transformCompanyData = (company: Company): Company => {
    // Transform legal form
    let transformedLegalForm = company.legalForm;
    if (company.legalForm?.toLowerCase().includes('filial')) {
      transformedLegalForm = 'Filial';
    } else if (company.legalForm === 'Anden udenlandsk virksomhed') {
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

  // Apply transformations to all companies
  const companies = rawCompanies.map(transformCompanyData);
  
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
    setCurrentPage(1); // Reset to first page on new search
    // Invalidate and refetch the query with the new search term
    queryClient.invalidateQueries({ queryKey: ['companies', query] });
  };

  // Calculate pagination
  const totalPages = companies ? Math.ceil(companies.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCompanies = companies?.slice(startIndex, endIndex) || [];

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <SEO 
        title="SelskabsInfo - Søg i danske virksomheder og få omfattende selskabsoplysninger"
        description="Søg og udforsk detaljerede oplysninger om danske virksomheder. Find CVR-data, regnskaber, ledelse og meget mere. Gratis søgning i alle danske selskaber."
        canonicalUrl="https://selskabsinfo.dk/"
        keywords="danske virksomheder, CVR søgning, selskabsoplysninger, virksomhedsdata, regnskaber, ledelse"
      />
      <JSONLDScript data={createWebsiteSchema()} />
      <JSONLDScript data={createOrganizationSchema()} />
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        {/* Only show hero section if no search has been performed */}
        {!searchTerm && (
          <div className="py-8 sm:py-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Selskabsinfo</h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              Søg og udforsk detaljerede oplysninger om danske virksomheder
            </p>
            <div className="flex justify-center mb-8 sm:mb-12 px-4">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} shouldFocus={shouldFocusSearch} />
            </div>
          </div>
        )}

        {searchTerm && (
          <div className="mb-4 px-3 sm:px-0">
            <h1 className="sr-only">Søgeresultater for {searchTerm}</h1>
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              {isLoading ? (
                <>
                  <Spinner variant="default" size={20} />
                  <span className="text-sm sm:text-base">Søger...</span>
                </>
              ) : (
                <span className="text-sm sm:text-base break-words">{`Resultater for "${searchTerm}"`}</span>
              )}
            </h2>
          </div>
        )}

        {/* Render companies in the exact order from backend - NO SORTING ON FRONTEND */}
        {companies.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-3 sm:px-0">
              {paginatedCompanies.map((company: Company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex justify-center px-3 sm:px-0">
                <Pagination>
                  <PaginationContent className="gap-1 sm:gap-2">
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} min-h-[44px] text-xs sm:text-sm px-2 sm:px-4`}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer min-h-[44px] min-w-[44px] text-xs sm:text-sm"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis className="text-xs sm:text-sm" />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} min-h-[44px] text-xs sm:text-sm px-2 sm:px-4`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {searchTerm && companies.length === 0 && !isLoading && (
          <div className="text-center py-6 sm:py-8 px-4">
            <p className="text-base sm:text-lg text-muted-foreground">
              Ingen virksomheder fundet, der matcher dine søgekriterier.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;

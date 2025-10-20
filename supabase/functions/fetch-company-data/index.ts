
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { buildSearchQuery } from "./helpers/query-builder.ts"
import { determineLegalForm } from "./helpers/legal-form-detector.ts"
import { determineStatus } from "./helpers/status-detector.ts"
import { transformCompanyData } from "./helpers/company-transformer.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { cvr, companyName, personName } = requestBody;
    
    // Validate inputs
    if (!cvr && !companyName && !personName) {
      return new Response(
        JSON.stringify({ error: 'Either CVR, company name, or person name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (cvr && (!/^\d{8}$/.test(cvr))) {
      return new Response(
        JSON.stringify({ error: 'CVR must be exactly 8 digits' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (companyName && (typeof companyName !== 'string' || companyName.trim().length === 0 || companyName.length > 200)) {
      return new Response(
        JSON.stringify({ error: 'Company name must be between 1 and 200 characters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (personName && (typeof personName !== 'string' || personName.trim().length === 0 || personName.length > 200)) {
      return new Response(
        JSON.stringify({ error: 'Person name must be between 1 and 200 characters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');
    
    if (!username || !password) {
      console.error('[ERROR] API credentials not configured');
      throw new Error('Service configuration error');
    }

    // Create basic auth header
    const auth = btoa(`${username}:${password}`);
    const searchQuery = buildSearchQuery(cvr, companyName, personName);
    const searchUrl = 'http://distribution.virk.dk/cvr-permanent/virksomhed/_search';

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    });

    if (!response.ok) {
      console.error(`[ERROR] External API request failed: ${response.status}`);
      throw new Error('Failed to fetch company data');
    }

    const data = await response.json();
    
    // Log what we received from the API
    console.log('[DEBUG] API Response hits:', data.hits?.hits?.length);
    if (data.hits?.hits?.[0]?._source) {
      const source = data.hits.hits[0]._source;
      console.log('[DEBUG] Full CVR Data keys:', Object.keys(source));
      console.log('[DEBUG] Has Vrvirksomhed?', !!source.Vrvirksomhed);
      console.log('[DEBUG] Has deltagerRelation?', !!source.Vrvirksomhed?.deltagerRelation);
      console.log('[DEBUG] deltagerRelation count:', source.Vrvirksomhed?.deltagerRelation?.length || 0);
      console.log('[DEBUG] Has virksomhedsRelation?', !!source.Vrvirksomhed?.virksomhedsRelation);
      console.log('[DEBUG] virksomhedsRelation count:', source.Vrvirksomhed?.virksomhedsRelation?.length || 0);
    }

    // Transform the API response to match our Company interface
    const companies = data.hits?.hits?.map((hit: any) => {
      const transformedCompany = transformCompanyData(hit, determineLegalForm, determineStatus, companyName);
      return {
        ...transformedCompany,
        _debugScore: hit._score
      };
    }) || [];
    
    return new Response(
      JSON.stringify({ 
        companies,
        // Also return the full data for the first result (useful for detailed view)
        fullCvrData: data.hits?.hits?.[0]?._source,
        _debug: {
          totalHits: data.hits?.total,
          maxScore: data.hits?.max_score,
          searchQuery: personName || companyName || cvr,
          searchType: personName ? 'person' : (cvr ? 'cvr' : 'company'),
          hasDeltagerRelation: !!data.hits?.hits?.[0]?._source?.Vrvirksomhed?.deltagerRelation,
          hasVirksomhedsRelation: !!data.hits?.hits?.[0]?._source?.Vrvirksomhed?.virksomhedsRelation
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[ERROR]', {
      function: 'fetch-company-data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch company data. Please try again.',
        companies: []
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

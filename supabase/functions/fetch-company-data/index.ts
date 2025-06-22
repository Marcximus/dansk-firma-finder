
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
  console.log('=== 🔍 EDGE FUNCTION CALLED ===');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`📋 Method: ${req.method}`);
  console.log(`🌐 URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📥 Parsing request body...');
    const requestBody = await req.json();
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
    
    const { cvr, companyName } = requestBody;
    console.log(`🏢 CVR: ${cvr}, Company Name: ${companyName}`);
    
    if (!cvr && !companyName) {
      console.error('❌ Neither CVR nor company name provided');
      throw new Error('Either CVR number or company name is required');
    }
    
    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');
    
    console.log(`🔑 Username exists: ${!!username}`);
    console.log(`🔑 Password exists: ${!!password}`);
    
    if (!username || !password) {
      console.error('❌ Danish Business API credentials not configured');
      throw new Error('Danish Business API credentials not configured');
    }

    // Create basic auth header
    const auth = btoa(`${username}:${password}`);
    
    console.log('🔧 Building search query...');
    const searchQuery = buildSearchQuery(cvr, companyName);
    const searchUrl = 'http://distribution.virk.dk/cvr-permanent/virksomhed/_search';

    console.log(`🎯 Posting to: ${searchUrl}`);
    console.log(`📊 Search query:`, JSON.stringify(searchQuery, null, 2));

    console.log('📡 Making API request...');
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchQuery)
    });

    console.log(`📈 API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`💥 Error response:`, errorText);
      throw new Error(`Danish Business API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 API Response received, hits count:', data.hits?.total);
    console.log('🎯 Max score:', data.hits?.max_score);

    // Transform the API response to match our Company interface
    const companies = data.hits?.hits?.map((hit: any, index: number) => {
      const transformedCompany = transformCompanyData(hit, determineLegalForm, determineStatus, companyName);
      console.log(`${index + 1}. 🏢 Company: ${transformedCompany.name}, Score: ${hit._score}`);
      return {
        ...transformedCompany,
        _debugScore: hit._score // Add score for debugging
      };
    }) || [];

    console.log(`=== 🏆 FINAL RANKING ORDER (${companies.length} companies) ===`);
    companies.forEach((company, index) => {
      console.log(`${index + 1}. 🥇 ${company.name} (Score: ${company._debugScore})`);
    });

    // If searching for a company name, let's analyze the ranking
    if (companyName) {
      console.log(`=== 🔍 RANKING ANALYSIS FOR "${companyName}" ===`);
      const cleanSearchTerm = companyName.toLowerCase().trim();
      companies.forEach((company, index) => {
        const cleanCompanyName = company.name.toLowerCase().trim();
        const isExactMatch = cleanCompanyName === cleanSearchTerm;
        const isContained = cleanCompanyName.includes(cleanSearchTerm);
        const startsWithSearch = cleanCompanyName.startsWith(cleanSearchTerm);
        
        console.log(`${index + 1}. "${company.name}" (Score: ${company._debugScore})`);
        console.log(`   📏 Length: ${company.name.length}`);
        console.log(`   🎯 Exact match: ${isExactMatch}`);
        console.log(`   📦 Contains search: ${isContained}`);
        console.log(`   🏁 Starts with search: ${startsWithSearch}`);
      });
    }

    console.log('✅ Returning response...');
    return new Response(
      JSON.stringify({ 
        companies,
        // Also return the full data for the first result (useful for detailed view)
        fullCvrData: data.hits?.hits?.[0]?._source,
        _debug: {
          totalHits: data.hits?.total,
          maxScore: data.hits?.max_score,
          searchQuery: companyName || cvr,
          timestamp: new Date().toISOString()
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
    console.error('=== 💥 ERROR IN EDGE FUNCTION ===');
    console.error('🔥 Error details:', error);
    console.error('📚 Stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        companies: [],
        _debug: {
          functionError: true,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        }
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

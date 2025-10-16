import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[sync-companies] Starting company sync');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    console.log('[sync-companies] Checking admin role for user:', user.id);
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });
    
    if (roleError) {
      console.error('[sync-companies] Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to verify admin status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!isAdmin) {
      console.log('[sync-companies] User is not admin');
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('[sync-companies] Admin access verified');

    const { batchSize = 1000, offset = 0 } = await req.json().catch(() => ({}));

    // Get Danish Business API credentials
    const username = Deno.env.get('DANISH_BUSINESS_API_USERNAME');
    const password = Deno.env.get('DANISH_BUSINESS_API_PASSWORD');

    if (!username || !password) {
      throw new Error('Danish Business API credentials not configured');
    }

    // Fetch companies from Danish Business API
    // Use range query for CVR numbers (valid range: 10000000-99999999)
    const elasticQuery = {
      "_source": ["Vrvirksomhed.cvrNummer", "Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn", "Vrvirksomhed.virksomhedMetadata.sammensatStatus"],
      "size": batchSize,
      "from": offset,
      "query": {
        "range": {
          "Vrvirksomhed.cvrNummer": {
            "gte": 10000000,
            "lte": 99999999
          }
        }
      },
      "sort": [
        { "Vrvirksomhed.cvrNummer": "asc" }
      ]
    };

    console.log(`[sync-companies] Fetching batch: offset=${offset}, size=${batchSize}`);
    console.log(`[sync-companies] Query:`, JSON.stringify(elasticQuery.query));

    const apiResponse = await fetch('http://distribution.virk.dk/cvr-permanent/virksomhed/_search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      },
      body: JSON.stringify(elasticQuery),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[sync-companies] API Error:', apiResponse.status, errorText);
      throw new Error(`Failed to fetch from Danish Business API: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    
    // Log the full response to debug
    console.log('[sync-companies] Full API Response:', JSON.stringify(apiData));
    console.log('[sync-companies] Hits structure:', JSON.stringify(apiData?.hits));
    
    const hits = apiData?.hits?.hits || [];
    const totalCompanies = apiData?.hits?.total?.value || apiData?.hits?.total || 0;

    console.log(`[sync-companies] Found ${hits.length} companies (total: ${totalCompanies})`);

    // Log sample hit to understand structure
    if (hits.length > 0) {
      console.log('[sync-companies] Sample hit structure:', JSON.stringify(hits[0]));
    }

    // Transform and insert companies
    const companies = hits.map((hit: any) => {
      // The structure might be hit._source.Vrvirksomhed or just hit._source
      const source = hit._source?.Vrvirksomhed || hit._source;
      
      console.log('[sync-companies] Processing company:', {
        cvr: source?.cvrNummer,
        name: source?.virksomhedMetadata?.nyesteNavn?.navn,
        status: source?.virksomhedMetadata?.sammensatStatus
      });
      
      return {
        cvr: source?.cvrNummer?.toString(),
        name: source?.virksomhedMetadata?.nyesteNavn?.navn || 'Unavngivet',
        status: source?.virksomhedMetadata?.sammensatStatus === 'NORMAL' ? 'active' : 'inactive',
        lastmod: new Date().toISOString(),
      };
    }).filter((c: any) => c.cvr); // Only include if CVR exists

    if (companies.length > 0) {
      // Upsert companies into database
      const { error: upsertError } = await supabase
        .from('companies')
        .upsert(companies, {
          onConflict: 'cvr',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error('[sync-companies] Database error:', upsertError);
        throw upsertError;
      }
    }

    console.log(`[sync-companies] Successfully synced ${companies.length} companies`);

    return new Response(JSON.stringify({
      success: true,
      synced: companies.length,
      total: totalCompanies,
      hasMore: (offset + batchSize) < totalCompanies,
      nextOffset: offset + batchSize,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[sync-companies] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
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
    // Query for active companies (status = "NORMAL")
    const elasticQuery = {
      "_source": ["Vrvirksomhed.cvrNummer", "Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn", "Vrvirksomhed.virksomhedMetadata.sammensatStatus"],
      "size": batchSize,
      "from": offset,
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "Vrvirksomhed.virksomhedMetadata.sammensatStatus": "NORMAL"
              }
            }
          ]
        }
      },
      "sort": [
        { "Vrvirksomhed.cvrNummer": "asc" }
      ]
    };

    console.log(`[sync-companies] Fetching batch: offset=${offset}, size=${batchSize}`);

    const apiResponse = await fetch('http://distribution.virk.dk/cvr-permanent/virksomhed/_search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      },
      body: JSON.stringify(elasticQuery),
    });

    if (!apiResponse.ok) {
      throw new Error('Failed to fetch from Danish Business API');
    }

    const apiData = await apiResponse.json();
    const hits = apiData?.hits?.hits || [];
    const totalCompanies = apiData?.hits?.total?.value || 0;

    console.log(`[sync-companies] Found ${hits.length} companies (total: ${totalCompanies})`);

    // Transform and insert companies
    const companies = hits.map((hit: any) => {
      const source = hit._source?.Vrvirksomhed;
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
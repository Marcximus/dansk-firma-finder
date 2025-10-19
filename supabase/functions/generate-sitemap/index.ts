import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Function to generate URL-safe slug from company name
function generateCompanySlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .trim()
    // Replace Danish characters with their closest equivalents
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

const ITEMS_PER_SITEMAP = 50000;
const BASE_URL = 'https://selskabsinfo.dk';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const { path } = await req.json().catch(() => ({ path: url.pathname }));
    
    const pathToUse = path || url.pathname;

    console.log(`[generate-sitemap] Request for: ${pathToUse}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle sitemap index request
    if (pathToUse.endsWith('/sitemap.xml') || pathToUse.endsWith('/sitemap')) {
      return generateSitemapIndex(supabase);
    }

    // Handle static sitemap request
    if (pathToUse.includes('/sitemap-static.xml')) {
      return generateStaticSitemap();
    }

    // Handle company sitemap pages (e.g., /sitemap-companies-1.xml)
    const companiesMatch = pathToUse.match(/\/sitemap-companies-(\d+)\.xml/);
    if (companiesMatch) {
      const page = parseInt(companiesMatch[1]);
      return generateCompaniesSitemap(supabase, page);
    }

    return new Response('Not Found', { status: 404 });

  } catch (error) {
    console.error('[generate-sitemap] Error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
});

async function generateSitemapIndex(supabase: any): Promise<Response> {
  console.log('[generate-sitemap] Generating sitemap index');

  // Count total companies
  const { count } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const totalCompanies = count || 0;
  const totalPages = Math.ceil(totalCompanies / ITEMS_PER_SITEMAP);
  const lastmod = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static sitemap
  xml += '  <sitemap>\n';
  xml += `    <loc>${BASE_URL}/sitemap-static.xml</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += '  </sitemap>\n';

  // Add company sitemaps
  for (let i = 1; i <= totalPages; i++) {
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/sitemap-companies-${i}.xml</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '  </sitemap>\n';
  }

  xml += '</sitemapindex>';

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}

function generateStaticSitemap(): Response {
  console.log('[generate-sitemap] Generating static sitemap');

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/virksomhedsrapporter', priority: '0.9', changefreq: 'weekly' },
    { url: '/track-foelg', priority: '0.9', changefreq: 'weekly' },
    { url: '/hjaelpecenter', priority: '0.8', changefreq: 'monthly' },
    { url: '/soegeguide', priority: '0.8', changefreq: 'monthly' },
    { url: '/faq', priority: '0.7', changefreq: 'monthly' },
    { url: '/kontakt-os', priority: '0.7', changefreq: 'monthly' },
    { url: '/datakilder', priority: '0.6', changefreq: 'monthly' },
    { url: '/servicevilkaar', priority: '0.5', changefreq: 'yearly' },
    { url: '/privatlivspolitik', priority: '0.5', changefreq: 'yearly' },
  ];

  const lastmod = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

async function generateCompaniesSitemap(supabase: any, page: number): Promise<Response> {
  console.log(`[generate-sitemap] Generating companies sitemap page ${page}`);

  const offset = (page - 1) * ITEMS_PER_SITEMAP;

  const { data: companies, error } = await supabase
    .from('companies')
    .select('cvr, name, lastmod')
    .eq('status', 'active')
    .order('cvr', { ascending: true })
    .range(offset, offset + ITEMS_PER_SITEMAP - 1);

  if (error) {
    console.error('[generate-sitemap] Database error:', error);
    throw error;
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const company of companies || []) {
    const lastmod = company.lastmod 
      ? new Date(company.lastmod).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    const slug = generateCompanySlug(company.name);

    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/virksomhed/${slug}/${company.cvr}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
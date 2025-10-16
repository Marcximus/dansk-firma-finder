import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SitemapPageProps {
  type?: 'static' | 'companies';
}

const SitemapPage = ({ type }: SitemapPageProps) => {
  const { page } = useParams();
  const location = useLocation();

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        let path = location.pathname;
        
        // Handle main sitemap.xml - generate index
        if (path === '/sitemap.xml') {
          path = '/sitemap.xml';
        } else if (type === 'static') {
          path = '/sitemap-static.xml';
        } else if (type === 'companies' && page) {
          path = `/sitemap-companies-${page}.xml`;
        }

        const { data, error } = await supabase.functions.invoke('generate-sitemap', {
          body: { path },
        });

        if (error) throw error;

        // Return XML response
        const xml = data?.xml || data;
        
        // Set response headers and replace document
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'application/xml');
        
        // Replace the entire document with XML
        document.open();
        document.write(xml);
        document.close();
        
        // Set content type
        if (document.contentType !== 'application/xml') {
          const blob = new Blob([xml], { type: 'application/xml' });
          const url = URL.createObjectURL(blob);
          window.location.replace(url);
        }
      } catch (error) {
        console.error('Sitemap generation error:', error);
        document.body.innerHTML = '<error>Failed to generate sitemap</error>';
      }
    };

    fetchSitemap();
  }, [type, page, location.pathname]);

  return null;
};

export default SitemapPage;
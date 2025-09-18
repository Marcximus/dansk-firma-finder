import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageview } from '@/lib/analytics';

const Analytics: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Fire page view on route change
    const url = `${window.location.origin}${location.pathname}${location.search}`;
    const title = document.title;
    
    // Small delay to ensure the document title has been updated by the SEO component
    setTimeout(() => {
      pageview(url, document.title);
    }, 100);
  }, [location]);

  return null; // This component doesn't render anything
};

export default Analytics;
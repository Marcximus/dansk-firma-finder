// Google Analytics 4 utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-0B0J8GJWBB';

// Track page views
export const pageview = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: title,
    });
  }
};

// Track custom events
export const event = (action: string, parameters?: {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, parameters);
  }
};

// Track search events
export const trackSearch = (searchTerm: string, resultCount?: number) => {
  event('search', {
    search_term: searchTerm,
    event_category: 'engagement',
    custom_parameters: {
      result_count: resultCount,
    }
  });
};

// Track company view events
export const trackCompanyView = (companyName: string, cvr: string) => {
  event('view_item', {
    event_category: 'engagement',
    event_label: 'company_view',
    custom_parameters: {
      company_name: companyName,
      cvr_number: cvr,
    }
  });
};
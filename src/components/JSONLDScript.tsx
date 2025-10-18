import React from 'react';

interface JSONLDScriptProps {
  data: object;
}

const JSONLDScript: React.FC<JSONLDScriptProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2)
      }}
    />
  );
};

// Schema.org structured data generators
export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SelskabsInfo",
  "description": "Søg og udforsk detaljerede oplysninger om danske virksomheder",
  "url": "https://selskabsinfo.dk",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://selskabsinfo.dk/?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SelskabsInfo",
    "url": "https://selskabsinfo.dk"
  }
});

export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SelskabsInfo",
  "description": "Danmarks førende platform for virksomhedsoplysninger og selskabsdata",
  "url": "https://selskabsinfo.dk",
  "logo": "https://selskabsinfo.dk/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+45-12-34-56-78",
    "contactType": "customer service",
    "availableLanguage": "Danish",
    "areaServed": "DK"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "DK",
    "addressLocality": "København"
  },
  "sameAs": [
    "https://www.linkedin.com/company/selskabsinfo"
  ]
});

export const createCompanySchema = (company: any) => {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.name,
    "legalName": company.name,
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "CVR",
      "value": company.cvr
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": company.address,
      "addressLocality": company.city,
      "postalCode": company.postalCode,
      "addressCountry": "DK"
    },
    "organizationType": company.legalForm
  };

  // Add optional fields if they exist
  if (company.yearFounded) {
    schema.foundingDate = `${company.yearFounded}-01-01`;
  }
  
  if (company.employeeCount) {
    schema.numberOfEmployees = {
      "@type": "QuantitativeValue",
      "value": company.employeeCount
    };
  }
  
  if (company.industry) {
    schema.industry = company.industry;
  }
  
  if (company.website) {
    schema.url = company.website;
  }
  
  if (company.email) {
    schema.email = company.email;
  }
  
  if (company.phone) {
    schema.telephone = company.phone;
  }
  
  if (company.description) {
    schema.description = company.description;
  }

  return schema;
};

export const createFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const createServiceSchema = (service: {name: string, description: string, price?: string}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "Organization",
    "name": "SelskabsInfo"
  },
  "areaServed": "DK",
  "availableLanguage": "da",
  "offers": service.price ? {
    "@type": "Offer",
    "price": service.price,
    "priceCurrency": "DKK"
  } : undefined
});

export const createBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": crumb.url
  }))
});

export default JSONLDScript;
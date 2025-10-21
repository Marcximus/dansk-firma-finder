/**
 * Utility functions for generating SEO-friendly URLs
 */

/**
 * Generates a URL-safe slug from a company name
 * Handles Danish characters (æ, ø, å) properly
 */
export const generateCompanySlug = (companyName: string): string => {
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
};

/**
 * Generates a full company URL path
 * Format: /virksomhed/:slug/:cvr
 */
export const generateCompanyUrl = (companyName: string, cvr: string): string => {
  const slug = generateCompanySlug(companyName);
  return `/virksomhed/${slug}/${cvr}`;
};

/**
 * Generates a company changes URL path
 * Format: /virksomhed/:slug/:cvr/aendringer
 */
export const generateCompanyChangesUrl = (companyName: string, cvr: string): string => {
  const slug = generateCompanySlug(companyName);
  return `/virksomhed/${slug}/${cvr}/aendringer`;
};

/**
 * Generates a URL-safe slug from a person name
 * Handles Danish characters (æ, ø, å) properly
 */
export const generatePersonSlug = (personName: string): string => {
  return personName
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
};

/**
 * Generates a person URL path with original name and optional ID preserved
 * Format: /person/:slug?id=123456789&name=Original+Name
 */
export const generatePersonUrl = (personName: string, enhedsNummer?: string | number): string => {
  const slug = generatePersonSlug(personName);
  const encodedName = encodeURIComponent(personName);
  const idParam = enhedsNummer ? `id=${enhedsNummer}&` : '';
  return `/person/${slug}?${idParam}name=${encodedName}`;
};

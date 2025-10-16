-- Create companies table for sitemap caching
CREATE TABLE IF NOT EXISTS public.companies (
  cvr TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lastmod TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_lastmod ON public.companies(lastmod DESC);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow public read access for sitemap generation
CREATE POLICY "Public read access for companies"
  ON public.companies
  FOR SELECT
  USING (true);

-- Only admins can manage company data
CREATE POLICY "Admins can manage companies"
  ON public.companies
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
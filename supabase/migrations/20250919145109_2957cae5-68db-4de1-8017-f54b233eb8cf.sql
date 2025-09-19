-- Add 3 example users to the profiles table
INSERT INTO public.profiles (user_id, full_name, email, company_name, phone, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'Lars Nielsen',
  'lars.nielsen@techcorp.dk',
  'TechCorp A/S',
  '+45 12 34 56 78',
  now() - interval '15 days',
  now() - interval '2 days'
),
(
  gen_random_uuid(),
  'Maria Petersen',
  'maria@consulting.dk',
  'Consulting Partners ApS',
  '+45 87 65 43 21',
  now() - interval '8 days',
  now() - interval '1 day'
),
(
  gen_random_uuid(),
  'Anders Johannsen',
  'anders.j@finanshus.dk',
  'Finanshus Danmark A/S',
  '+45 23 45 67 89',
  now() - interval '3 days',
  now() - interval '5 hours'
);
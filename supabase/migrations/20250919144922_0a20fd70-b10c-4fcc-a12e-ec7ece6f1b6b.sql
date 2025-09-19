-- Add admin role for the existing user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('1de79193-41ad-4e21-9b28-292810d942b8', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
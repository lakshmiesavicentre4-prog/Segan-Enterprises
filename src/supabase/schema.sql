-- =====================================================================
-- SEGAN ENTERPRISES - DATABASE SCHEMA & SECURITIES SETUP
-- Platform: Supabase PostgreSQL
-- =====================================================================

-- Enable UUID Generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Sequence for Token Numbers (Auto-increment)
CREATE SEQUENCE IF NOT EXISTS application_token_seq START WITH 1;

-- Function to generate Segan Token format (SEGAN-2026-000001)
CREATE OR REPLACE FUNCTION generate_segan_token()
RETURNS TEXT AS $$
DECLARE
  next_val INT;
  year_str TEXT;
BEGIN
  SELECT nextval('application_token_seq') INTO next_val;
  SELECT to_char(CURRENT_DATE, 'YYYY') INTO year_str;
  RETURN 'SEGAN-' || year_str || '-' || lpad(next_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------
-- 1. PROFILES Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 2. SERVICES Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  processing_days INT NOT NULL DEFAULT 3,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 3. SERVICE_DOCUMENTS Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.service_documents ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 4. APPLICATIONS Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number TEXT UNIQUE NOT NULL DEFAULT generate_segan_token(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Document Verification', 'Under Review', 'Processing', 'Approved', 'Completed', 'Rejected')),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 5. APPLICATION_DOCUMENTS Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Storage file path
  verified TEXT NOT NULL DEFAULT 'Pending' CHECK (verified IN ('Pending', 'Approved', 'Rejected')),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 6. NOTIFICATIONS Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 7. PAYMENTS Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  gateway TEXT NOT NULL, -- 'Razorpay' | 'Cashfree' | 'Simulator'
  transaction_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Success', 'Failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 8. ACTIVITY_LOGS Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  browser TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------
-- 9. SETTINGS Table
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  portal_name TEXT NOT NULL DEFAULT 'SEGAN ENTERPRISES',
  portal_tagline TEXT NOT NULL DEFAULT 'Digital Services Simplified',
  support_phone TEXT DEFAULT '+91 98765 43210',
  support_email TEXT DEFAULT 'support@segan.in',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  allow_new_registrations BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Ensure a default setting structure exists
INSERT INTO public.settings (id, portal_name, portal_tagline)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'SEGAN ENTERPRISES', 'Digital Services Simplified')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Helpers function to check if user is admin or superadmin
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin_or_super());

CREATE POLICY "Users/Admins can update profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin_or_super());

-- Services Policies (Public reading, Admin modification)
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (active = true OR public.is_admin_or_super());

CREATE POLICY "Admins can insert services" ON public.services
  FOR INSERT WITH CHECK (public.is_admin_or_super());

CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE USING (public.is_admin_or_super());

CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE USING (public.is_admin_or_super());

-- Service Documents Policies
CREATE POLICY "Service docs are viewable by everyone" ON public.service_documents
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage service docs" ON public.service_documents
  FOR ALL USING (public.is_admin_or_super());

-- Applications Policies
CREATE POLICY "Users can only view their own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_super());

CREATE POLICY "Users can insert their own applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins/Users can update applications" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin_or_super());

-- Application Documents Policies
CREATE POLICY "Users can view their own app docs" ON public.application_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_documents.application_id
      AND (applications.user_id = auth.uid() OR public.is_admin_or_super())
    )
  );

CREATE POLICY "Users can insert their app docs" ON public.application_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update app docs" ON public.application_documents
  FOR ALL USING (public.is_admin_or_super());

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_super());

CREATE POLICY "Users can mark read their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin_or_super());

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin_or_super());

-- Payments Policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = payments.application_id
      AND (applications.user_id = auth.uid() OR public.is_admin_or_super())
    )
  );

CREATE POLICY "Users can insert payments" ON public.payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = payments.application_id
      AND applications.user_id = auth.uid()
    )
  );

-- Activity Logs Policies
CREATE POLICY "Only admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (public.is_admin_or_super());

-- Settings Policies
CREATE POLICY "Settings are viewable by everyone" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify settings" ON public.settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );


-- =====================================================================
-- AUTH PROFILE GENERATOR TRIGGER (SUPABASE COUPLING)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Resident'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

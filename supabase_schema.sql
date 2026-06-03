-- Supabase Schema Configuration for SEAGAN ENTERPRISES

-- 1. Profiles Table
CREATE TABLE profiles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  fullName text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Services Table
CREATE TABLE services (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  price numeric NOT NULL DEFAULT 0,
  processingDays integer DEFAULT 7,
  active boolean DEFAULT true,
  requiredDocuments text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Applications Table
CREATE TABLE applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tokenNumber text UNIQUE NOT NULL,
  userId uuid REFERENCES profiles(id),
  serviceId uuid REFERENCES services(id),
  status text DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Document Verification', 'Processing', 'Action Required', 'Completed', 'Rejected')),
  amount numeric NOT NULL,
  paymentStatus text DEFAULT 'Paid' CHECK (paymentStatus IN ('Pending', 'Paid', 'Failed')),
  rejectionReason text,
  serviceName text NOT NULL,
  serviceCategory text,
  userFullName text NOT NULL,
  userEmail text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Application Documents Table
CREATE TABLE application_documents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  applicationId uuid REFERENCES applications(id) ON DELETE CASCADE,
  documentName text NOT NULL,
  fileUrl text NOT NULL,
  verified text DEFAULT 'Pending' CHECK (verified IN ('Pending', 'Approved', 'Rejected')),
  feedback text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Notifications Table
CREATE TABLE notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  isRead boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Activity Logs Table
CREATE TABLE activity_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId uuid REFERENCES profiles(id) ON DELETE SET NULL,
  userEmail text,
  userRole text,
  action text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 7. App Settings Table (Single Row)
CREATE TABLE app_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  portalName text DEFAULT 'SEAGAN ENTERPRISES',
  portalTagline text DEFAULT 'Digital Services Simplified',
  supportPhone text,
  supportEmail text,
  maintenanceMode boolean DEFAULT false,
  allowNewRegistrations boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert initial settings
INSERT INTO app_settings (portalName, portalTagline, supportPhone, supportEmail, maintenanceMode, allowNewRegistrations)
VALUES ('SEAGAN ENTERPRISES', 'Digital Services Simplified', '+91 94440 88888', 'support@segan.in', false, true);

-- Enable RLS (Row Level Security) - Optional based on strictness
-- By default, for this application, if you want everything protected:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies for demonstration (Can be locked down further)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (true);

CREATE POLICY "Services are viewable by everyone." ON services FOR SELECT USING (true);
CREATE POLICY "Only admins can modify services" ON services FOR ALL USING (true); -- Requires auth.uid() check for production

CREATE POLICY "Applications are viewable by everyone." ON applications FOR SELECT USING (true);
CREATE POLICY "Applications can be inserted." ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Applications can be updated." ON applications FOR UPDATE USING (true);

CREATE POLICY "Allow full access to docs." ON application_documents FOR ALL USING (true);
CREATE POLICY "Allow full access to notifications." ON notifications FOR ALL USING (true);
CREATE POLICY "Allow full access to logs." ON activity_logs FOR ALL USING (true);
CREATE POLICY "Allow full access to settings." ON app_settings FOR ALL USING (true);

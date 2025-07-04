/*
  # Create user profile tables for nurses and healthcare organizations

  1. New Tables
    - `nurse_profiles`
      - Complete nurse profile information including personal details, certifications, and preferences
    - `nurse_availability`
      - Weekly availability schedule for nurses
    - `nurse_licenses`
      - Professional licenses held by nurses
    - `nurse_education`
      - Educational background
    - `nurse_work_history`
      - Employment history
    - `nurse_references`
      - Professional references
    - `nurse_service_rates`
      - Service-specific hourly rates
    - `hco_profiles`
      - Healthcare organization profile information
    - `hco_payment_methods`
      - Payment methods for HCOs

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Nurse Profiles Table
CREATE TABLE IF NOT EXISTS nurse_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  date_of_birth date,
  ssn_encrypted text DEFAULT '', -- Would be properly encrypted in production
  profile_photo_url text,
  bio text DEFAULT '',
  specialties text[] DEFAULT '{}',
  additional_certifications text DEFAULT '',
  years_experience integer DEFAULT 0,
  travel_radius integer DEFAULT 25,
  work_preference text DEFAULT 'both' CHECK (work_preference IN ('remote', 'in-person', 'both')),
  credentialing_status text DEFAULT 'pending' CHECK (credentialing_status IN ('pending', 'approved', 'needs_documents', 'rejected')),
  rating decimal(3,2) DEFAULT 0,
  total_jobs integer DEFAULT 0,
  address_street text DEFAULT '',
  address_city text DEFAULT '',
  address_state text DEFAULT '',
  address_zip_code text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nurse Availability Table
CREATE TABLE IF NOT EXISTS nurse_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  monday jsonb DEFAULT '[]',
  tuesday jsonb DEFAULT '[]',
  wednesday jsonb DEFAULT '[]',
  thursday jsonb DEFAULT '[]',
  friday jsonb DEFAULT '[]',
  saturday jsonb DEFAULT '[]',
  sunday jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nurse Licenses Table
CREATE TABLE IF NOT EXISTS nurse_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  state text NOT NULL,
  license_number text NOT NULL,
  license_type text NOT NULL CHECK (license_type IN ('RN', 'LPN', 'NP', 'CNS', 'CRNA', 'CNM')),
  expiration_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nurse Education Table
CREATE TABLE IF NOT EXISTS nurse_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  degree text NOT NULL,
  school text NOT NULL,
  graduation_date text NOT NULL,
  field text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Nurse Work History Table
CREATE TABLE IF NOT EXISTS nurse_work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employer text NOT NULL,
  position text NOT NULL,
  start_date text NOT NULL,
  end_date text,
  description text DEFAULT '',
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Nurse References Table
CREATE TABLE IF NOT EXISTS nurse_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Nurse Service Rates Table
CREATE TABLE IF NOT EXISTS nurse_service_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type text NOT NULL,
  hourly_rate decimal(10,2) NOT NULL,
  is_negotiable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HCO Profiles Table
CREATE TABLE IF NOT EXISTS hco_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  organization_name text NOT NULL,
  contact_person_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  organization_type text DEFAULT '',
  address_street text DEFAULT '',
  address_city text DEFAULT '',
  address_state text DEFAULT '',
  address_zip_code text DEFAULT '',
  billing_address_street text DEFAULT '',
  billing_address_city text DEFAULT '',
  billing_address_state text DEFAULT '',
  billing_address_zip_code text DEFAULT '',
  is_verified boolean DEFAULT false,
  verification_documents text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- HCO Payment Methods Table
CREATE TABLE IF NOT EXISTS hco_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('credit_card', 'ach')),
  last4 text NOT NULL,
  is_default boolean DEFAULT false,
  stripe_payment_method_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE nurse_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_service_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE hco_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hco_payment_methods ENABLE ROW LEVEL SECURITY;

-- Nurse Profiles Policies
CREATE POLICY "Users can view their own nurse profile"
  ON nurse_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nurse profile"
  ON nurse_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nurse profile"
  ON nurse_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nurse Availability Policies
CREATE POLICY "Users can manage their own availability"
  ON nurse_availability
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nurse Licenses Policies
CREATE POLICY "Users can manage their own licenses"
  ON nurse_licenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nurse Education Policies
CREATE POLICY "Users can manage their own education"
  ON nurse_education
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nurse Work History Policies
CREATE POLICY "Users can manage their own work history"
  ON nurse_work_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nurse References Policies
CREATE POLICY "Users can manage their own references"
  ON nurse_references
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Nurse Service Rates Policies
CREATE POLICY "Users can manage their own service rates"
  ON nurse_service_rates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- HCO Profiles Policies
CREATE POLICY "Users can view their own HCO profile"
  ON hco_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own HCO profile"
  ON hco_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HCO profile"
  ON hco_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- HCO Payment Methods Policies
CREATE POLICY "Users can manage their own payment methods"
  ON hco_payment_methods
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies for viewing all profiles (for credentialing)
CREATE POLICY "Admins can view all nurse profiles"
  ON nurse_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'userType' = 'admin'
    )
  );

CREATE POLICY "Admins can update nurse credentialing status"
  ON nurse_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'userType' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'userType' = 'admin'
    )
  );

-- HCOs can view approved nurse profiles for job matching
CREATE POLICY "HCOs can view approved nurse profiles"
  ON nurse_profiles
  FOR SELECT
  TO authenticated
  USING (
    credentialing_status = 'approved' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'userType' = 'hco'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nurse_profiles_user_id ON nurse_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nurse_profiles_credentialing_status ON nurse_profiles(credentialing_status);
CREATE INDEX IF NOT EXISTS idx_nurse_licenses_user_id ON nurse_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_nurse_education_user_id ON nurse_education(user_id);
CREATE INDEX IF NOT EXISTS idx_nurse_work_history_user_id ON nurse_work_history(user_id);
CREATE INDEX IF NOT EXISTS idx_nurse_references_user_id ON nurse_references(user_id);
CREATE INDEX IF NOT EXISTS idx_nurse_service_rates_user_id ON nurse_service_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_hco_profiles_user_id ON hco_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_hco_payment_methods_user_id ON hco_payment_methods(user_id);
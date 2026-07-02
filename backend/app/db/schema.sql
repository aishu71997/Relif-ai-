-- =====================================================================
-- ReliefAI Supabase Database Schema
-- Optimized for: PostgreSQL, PostGIS, Real-time Replication, and RLS
-- Project: Kaggle AI Agents Intensive Capstone (Agents for Good)
-- =====================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom domain/types for state validation
CREATE TYPE user_role AS ENUM ('responder', 'ngo_lead', 'medical_staff', 'community_leader');
CREATE TYPE incident_status AS ENUM ('open', 'assigned', 'resolved');
CREATE TYPE incident_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE resource_category AS ENUM ('medical', 'food', 'water', 'shelter', 'fuel');
CREATE TYPE allocation_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE triage_tag AS ENUM ('green', 'yellow', 'red', 'black'); -- Green (Minor), Yellow (Delayed), Red (Immediate), Black (Expectant)

-- =====================================================================
-- TABLE: profiles
-- Extends Supabase auth.users to house custom user details and roles.
-- =====================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'community_leader',
    phone_number VARCHAR(50),
    organization VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================================
-- TABLE: shelters
-- Tracks disaster relief centers, total capacities, and current occupancies.
-- =====================================================================
CREATE TABLE public.shelters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOMETRY(Point, 4326) NOT NULL, -- PostGIS coordinate system
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    current_occupancy INTEGER NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0),
    status VARCHAR(50) DEFAULT 'operational' CHECK (status IN ('operational', 'full', 'damaged', 'closed')),
    contact_phone VARCHAR(50),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_occupancy_limit CHECK (current_occupancy <= max_capacity)
);

-- =====================================================================
-- TABLE: incidents
-- Manages reports of physical disasters, blockages, or rescue requests.
-- =====================================================================
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status incident_status NOT NULL DEFAULT 'open',
    priority incident_priority NOT NULL DEFAULT 'medium',
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================================
-- TABLE: resources
-- Tracks real-time supply balances housed inside specific shelters.
-- =====================================================================
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category resource_category NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit VARCHAR(50) NOT NULL, -- e.g., 'liters', 'boxes', 'kg'
    shelter_id UUID REFERENCES public.shelters(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================================
-- TABLE: resource_allocations
-- Coordinates transit orders of physical logistics between stations.
-- =====================================================================
CREATE TABLE public.resource_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    source_shelter_id UUID NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
    destination_shelter_id UUID NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
    allocated_quantity INTEGER NOT NULL CHECK (allocated_quantity > 0),
    status allocation_status NOT NULL DEFAULT 'pending',
    assigned_driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_distinct_shelters CHECK (source_shelter_id <> destination_shelter_id)
);

-- =====================================================================
-- TABLE: triage_records
-- Houses medical assessments conducted directly in disaster areas.
-- =====================================================================
CREATE TABLE public.triage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
    patient_name VARCHAR(150) DEFAULT 'Unknown / John Doe',
    triage_tag triage_tag NOT NULL DEFAULT 'green',
    respirations INTEGER, -- breaths per minute
    pulse INTEGER, -- beats per minute
    mental_status TEXT,
    critical_injuries TEXT,
    first_responder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================================
-- TABLE: mesh_sync_logs
-- Logs peer-to-peer data replication events across offline local radios.
-- =====================================================================
CREATE TABLE public.mesh_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_id VARCHAR(100) NOT NULL,
    records_synced INTEGER NOT NULL DEFAULT 0,
    mesh_protocol VARCHAR(50) DEFAULT 'LoRa', -- e.g., 'LoRa', 'BLE', 'Ad-hoc Wi-Fi'
    synchronized_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================================
-- SPATIAL AND PERFORMANCE INDEXES
-- Optimized for real-time spatial lookup ranges and join lookups.
-- =====================================================================

-- Spatial Indexing (GIST) for rapid geo-fencing queries
CREATE INDEX idx_shelters_geom ON public.shelters USING GIST (location);
CREATE INDEX idx_incidents_geom ON public.incidents USING GIST (location);

-- B-Tree Performance Indexing
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_priority ON public.incidents(priority);
CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_allocations_status ON public.resource_allocations(status);
CREATE INDEX idx_triage_tag ON public.triage_records(triage_tag);

-- =====================================================================
-- AUTOMATIC UPDATE TIMESTAMPS TRIGGERS
-- =====================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_shelters_modtime BEFORE UPDATE ON public.shelters FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_incidents_modtime BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_resources_modtime BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_allocations_modtime BEFORE UPDATE ON public.resource_allocations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_triage_modtime BEFORE UPDATE ON public.triage_records FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all operational tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesh_sync_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check requesting user's operational role
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles user_role[])
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT role INTO user_role_val FROM public.profiles WHERE id = auth.uid();
    RETURN user_role_val = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Table RLS Policies
CREATE POLICY "Public profiles are visible to all authenticated users."
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can edit their own profiles."
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Shelters Table RLS Policies
CREATE POLICY "Shelters are readable by all authenticated users."
    ON public.shelters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only NGO leads and Responders can modify shelters."
    ON public.shelters FOR ALL TO authenticated 
    USING (public.check_user_role(ARRAY['ngo_lead'::user_role, 'responder'::user_role]))
    WITH CHECK (public.check_user_role(ARRAY['ngo_lead'::user_role, 'responder'::user_role]));

-- 3. Incidents Table RLS Policies
CREATE POLICY "Incidents are readable by all authenticated users."
    ON public.incidents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Any authenticated user can submit an incident."
    ON public.incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Only Responders and NGO leads can manage incident states."
    ON public.incidents FOR UPDATE TO authenticated
    USING (public.check_user_role(ARRAY['responder'::user_role, 'ngo_lead'::user_role]));

-- 4. Resources Table RLS Policies
CREATE POLICY "Resources are readable by all authenticated users."
    ON public.resources FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only Responders and NGO leads can modify resources inventory."
    ON public.resources FOR ALL TO authenticated
    USING (public.check_user_role(ARRAY['responder'::user_role, 'ngo_lead'::user_role]));

-- 5. Resource Allocations Table RLS Policies
CREATE POLICY "Allocations are readable by all authenticated users."
    ON public.resource_allocations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only NGO leads can schedule allocations."
    ON public.resource_allocations FOR INSERT TO authenticated
    WITH CHECK (public.check_user_role(ARRAY['ngo_lead'::user_role]));

CREATE POLICY "NGO leads and assigned Drivers can manage allocation states."
    ON public.resource_allocations FOR UPDATE TO authenticated
    USING (auth.uid() = assigned_driver_id OR public.check_user_role(ARRAY['ngo_lead'::user_role]));

-- 6. Triage Records Table RLS Policies
CREATE POLICY "Only Medical staff and Responders can read triage records."
    ON public.triage_records FOR SELECT TO authenticated
    USING (public.check_user_role(ARRAY['medical_staff'::user_role, 'responder'::user_role]));

CREATE POLICY "Only Medical staff and Responders can create/edit triage records."
    ON public.triage_records FOR ALL TO authenticated
    USING (public.check_user_role(ARRAY['medical_staff'::user_role, 'responder'::user_role]));

-- 7. Mesh Sync Logs Table RLS Policies
CREATE POLICY "Mesh logs are visible to active Responders and NGO leads."
    ON public.mesh_sync_logs FOR SELECT TO authenticated
    USING (public.check_user_role(ARRAY['responder'::user_role, 'ngo_lead'::user_role]));

CREATE POLICY "System nodes can log mesh synchronizations."
    ON public.mesh_sync_logs FOR INSERT TO authenticated WITH CHECK (true);

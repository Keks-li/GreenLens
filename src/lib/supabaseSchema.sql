-- GreenLens Municipal Command Center — PostgreSQL / Supabase Database Schema
-- Run this SQL in your Supabase Project SQL Editor to provision all tables, relations, and initial seeds.

-- 1. Enable PostGIS extension for spatial queries if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Municipalities Table
CREATE TABLE IF NOT EXISTS municipalities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Drainage Segments (Digital Twin GIS Network)
CREATE TABLE IF NOT EXISTS drainage_segments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    municipality_id TEXT REFERENCES municipalities(id) ON DELETE CASCADE,
    drain_type TEXT NOT NULL,
    capacity_m3_s NUMERIC(5, 2) NOT NULL,
    current_flow_m3_s NUMERIC(5, 2) NOT NULL,
    blockage_percent INTEGER CHECK (blockage_percent >= 0 AND blockage_percent <= 100),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT CHECK (risk_level IN ('healthy', 'moderate', 'high', 'critical')),
    last_inspected DATE,
    last_cleaned DATE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    thermal_scan_status TEXT,
    population_at_risk TEXT,
    critical_infrastructure TEXT,
    historical_flooding TEXT,
    ai_directive TEXT,
    status TEXT DEFAULT 'Healthy',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Incidents Table (Citizen & Sensor Reports)
CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    drain_id TEXT REFERENCES drainage_segments(id) ON DELETE SET NULL,
    sector TEXT NOT NULL,
    category TEXT CHECK (category IN ('Blocked Drain', 'Illegal Dumping', 'Siltation', 'Structural Failure', 'Other')),
    severity TEXT CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
    status TEXT CHECK (status IN ('unresolved', 'assigned', 'in-progress', 'resolved')) DEFAULT 'unresolved',
    reported_by TEXT NOT NULL,
    ai_confidence TEXT,
    estimated_waste_volume TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT,
    image_url TEXT,
    assigned_team_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 5. Field Teams
CREATE TABLE IF NOT EXISTS field_teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lead_name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    members_count INTEGER DEFAULT 4,
    status TEXT CHECK (status IN ('Available', 'On Mission', 'Resting', 'Off Duty')) DEFAULT 'Available',
    current_location TEXT,
    vehicle_info TEXT,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Dispatch Assignments
CREATE TABLE IF NOT EXISTS dispatch_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drain_id TEXT REFERENCES drainage_segments(id) ON DELETE CASCADE,
    incident_id TEXT REFERENCES incidents(id) ON DELETE SET NULL,
    team_id TEXT REFERENCES field_teams(id) ON DELETE CASCADE,
    priority TEXT CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'High',
    deadline_hours INTEGER DEFAULT 8,
    instructions TEXT,
    status TEXT CHECK (status IN ('dispatched', 'en-route', 'on-site', 'completed')) DEFAULT 'dispatched',
    dispatched_by TEXT DEFAULT 'Command Lead',
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. System Metrics / Executive KPIs
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipality_id TEXT REFERENCES municipalities(id) ON DELETE CASCADE,
    reports_today INTEGER DEFAULT 0,
    critical_incidents INTEGER DEFAULT 0,
    high_flood_risk_areas INTEGER DEFAULT 0,
    active_cleanups INTEGER DEFAULT 0,
    resolved_today INTEGER DEFAULT 0,
    waste_removed_tons NUMERIC(5, 2) DEFAULT 0.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED DATA FOR WINNEBA
INSERT INTO municipalities (id, name, region, latitude, longitude, contact_email)
VALUES ('winneba', 'Winneba Municipal Assembly', 'Central Region, Ghana', 5.3556, -0.6247, 'command@winneba.gov.gh')
ON CONFLICT (id) DO NOTHING;

INSERT INTO drainage_segments (id, name, sector, municipality_id, drain_type, capacity_m3_s, current_flow_m3_s, blockage_percent, risk_score, risk_level, last_inspected, last_cleaned, latitude, longitude, thermal_scan_status, population_at_risk, critical_infrastructure, historical_flooding, ai_directive, status)
VALUES 
('D-102', 'Central Market Primary Culvert', 'Central Market Sector', 'winneba', 'Reinforced Box Culvert', 14.5, 2.1, 80, 91, 'critical', '2026-08-25', '2026-06-12', 5.3562, -0.6231, '80% dense blockage - silt & single-use plastics', '4,200 traders & residents', 'Winneba Central Market', '3 severe flood occurrences', 'CRITICAL — Dispatch heavy clearance crew within 4 hours.', 'Action Required'),
('D-117', 'South Residential Swale & Main Drain', 'South Residential', 'winneba', 'Open Trapezoidal Channel', 9.2, 1.4, 68, 87, 'high', '2026-08-24', '2026-07-04', 5.3489, -0.6190, 'Structural wall degradation & moderate silt', '1,850 residents', 'Methodist Primary School', '2 minor overflows in 2025', 'HIGH PRIORITY — Schedule excavator and debris team prior to heavy rain.', 'Action Required'),
('D-104', 'North University Link Canal', 'North Campus Zone', 'winneba', 'Lined Concrete Canal', 18.0, 3.8, 85, 95, 'critical', '2026-08-26', '2026-05-19', 5.3645, -0.6280, 'Choked with plastic bottles and vegetative debris', '6,100 students and staff', 'UEW South Campus Road', '4 severe flood occurrences', 'EMERGENCY — Blockage causing immediate backflow.', 'Dispatched')
ON CONFLICT (id) DO NOTHING;

INSERT INTO field_teams (id, name, lead_name, specialization, members_count, status, current_location, vehicle_info, rating, contact_phone)
VALUES
('team-1', 'Rapid Response Unit Alpha', 'Kwame Mensah', 'Emergency Culvert Clearance', 8, 'Available', 'Sector 2 Depot', 'Truck GH-WN-402 (Vac & Jetter)', 4.9, '+233 24 555 0192'),
('team-2', 'Drainage Squad 2', 'Abena Osei', 'Structural Masonry & Swale Clearing', 6, 'On Mission', 'South Residential (Drain D-117)', 'Flatbed GH-WN-118 + Mini-Bobcat', 4.8, '+233 20 555 0831'),
('team-3', 'Emergency Strike Unit', 'Emmanuel Kofi', 'Flood Prevention & High-Volume Pumps', 10, 'On Mission', 'North Campus Link (Drain D-104)', 'Heavy Support Rig GH-WN-900', 5.0, '+233 55 555 9940')
ON CONFLICT (id) DO NOTHING;-- 11. CITIZEN ECO-REWARDS & REFUSE TRACKER TABLE
CREATE TABLE IF NOT EXISTS citizen_rewards (
  id TEXT PRIMARY KEY,
  municipality_id TEXT REFERENCES municipalities(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  reports_count INT DEFAULT 0,
  refuse_kg_reported NUMERIC(10, 2) DEFAULT 0.0,
  refuse_kg_cleared NUMERIC(10, 2) DEFAULT 0.0,
  reward_points INT DEFAULT 0,
  tier TEXT DEFAULT 'Bronze Contributor',
  rewards_redeemed_ghs NUMERIC(10, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'Active',
  last_report_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE citizen_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access to citizen_rewards" ON citizen_rewards FOR ALL USING (true) WITH CHECK (true);

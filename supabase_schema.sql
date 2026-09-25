-- Supabase Postgres Schema for Connect Plus

-- 1. Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    hod_id UUID -- Will link to auth.users
);

-- 2. Users Table (Extending auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR NOT NULL,
    employee_id VARCHAR UNIQUE NOT NULL,
    official_email VARCHAR UNIQUE NOT NULL,
    role VARCHAR NOT NULL DEFAULT 'STAFF',
    department_id INTEGER REFERENCES departments(id),
    designation VARCHAR,
    job_profile VARCHAR,
    specialization VARCHAR,
    assigned_courses VARCHAR,
    mobile_number VARCHAR,
    profile_photo VARCHAR,
    short_bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key from departments to users
ALTER TABLE departments ADD CONSTRAINT fk_hod FOREIGN KEY (hod_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Resources Table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    visibility VARCHAR NOT NULL DEFAULT 'PRIVATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Resource Versions Table
CREATE TABLE resource_versions (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    parent_version_id INTEGER REFERENCES resource_versions(id) ON DELETE SET NULL,
    storage_path VARCHAR NOT NULL,
    checksum VARCHAR,
    file_size INTEGER,
    mime_type VARCHAR,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    change_note TEXT,
    status VARCHAR NOT NULL DEFAULT 'PUBLISHED'
);

-- 5. Resource Permissions Table
CREATE TABLE resource_permissions (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR NOT NULL,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_permissions ENABLE ROW LEVEL SECURITY;

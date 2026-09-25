-- ============================================================
-- Connect Plus — Supabase Schema (SAFE TO RE-RUN)
-- All statements use IF NOT EXISTS / OR REPLACE / IF EXISTS
-- Project: hwqfetrkcehprcqwqibf
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    hod_id     UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES (linked to Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name        TEXT NOT NULL DEFAULT '',
    employee_id      TEXT UNIQUE,
    official_email   TEXT UNIQUE,
    role             TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('ADMIN','HOD','STAFF')),
    department_id    INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    designation      TEXT,
    job_profile      TEXT,
    education        TEXT,
    specialization   TEXT,
    assigned_courses TEXT,
    mobile_number    TEXT,
    profile_photo    TEXT,
    short_bio        TEXT,
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Add hod_id FK on departments if not already added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_dept_hod'
    ) THEN
        ALTER TABLE departments
            ADD CONSTRAINT fk_dept_hod
            FOREIGN KEY (hod_id) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
    id            SERIAL PRIMARY KEY,
    owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT,
    visibility    TEXT NOT NULL DEFAULT 'PRIVATE'
                      CHECK (visibility IN ('PRIVATE','DEPARTMENT_DISCOVERABLE','INSTITUTION_DISCOVERABLE')),
    tags          TEXT[],
    category      TEXT,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    forked_from_id INTEGER REFERENCES resources(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEACHING KITS
-- ============================================================
CREATE TABLE IF NOT EXISTS teaching_kits (
    id            SERIAL PRIMARY KEY,
    owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    subject       TEXT NOT NULL,
    description   TEXT,
    visibility    TEXT NOT NULL DEFAULT 'PRIVATE'
                      CHECK (visibility IN ('PRIVATE','DEPARTMENT_DISCOVERABLE','INSTITUTION_DISCOVERABLE')),
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teaching_kit_resources (
    kit_id        INTEGER NOT NULL REFERENCES teaching_kits(id) ON DELETE CASCADE,
    resource_id   INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    added_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(kit_id, resource_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id                  SERIAL PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    message             TEXT NOT NULL,
    type                TEXT NOT NULL CHECK (type IN ('PERMISSION_REQUEST', 'PERMISSION_ACCEPTED', 'PERMISSION_DECLINED', 'SYSTEM')),
    related_resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    requester_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_read             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER BLOCKS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_blocks (
    id          SERIAL PRIMARY KEY,
    blocker_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- ============================================================
-- RESOURCE REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS resource_reviews (
    id          SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating      INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, reviewer_id)
);

-- ============================================================
-- RESOURCE VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS resource_versions (
    id                SERIAL PRIMARY KEY,
    resource_id       INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    version_number    INTEGER NOT NULL,
    parent_version_id INTEGER REFERENCES resource_versions(id) ON DELETE SET NULL,
    storage_path      TEXT NOT NULL,
    checksum          TEXT,
    file_size         BIGINT,
    mime_type         TEXT,
    created_by        UUID NOT NULL REFERENCES auth.users(id),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    change_note       TEXT,
    status            TEXT NOT NULL DEFAULT 'PUBLISHED'
                          CHECK (status IN ('DRAFT_VERSION','PENDING_REVIEW','PUBLISHED','REJECTED','ARCHIVED')),
    published_at      TIMESTAMPTZ
);

-- ============================================================
-- RESOURCE PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS resource_permissions (
    id               SERIAL PRIMARY KEY,
    resource_id      INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('VIEW','USE','MODIFY')),
    granted_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

-- ============================================================
-- ACCESS REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS access_requests (
    id              SERIAL PRIMARY KEY,
    resource_id     INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    requester_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_level TEXT NOT NULL CHECK (requested_level IN ('VIEW','USE','MODIFY')),
    reason          TEXT,
    status          TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','APPROVED','REJECTED','REVOKED','EXPIRED')),
    resolved_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    target_type TEXT,
    target_id   TEXT,
    meta        JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, official_email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update resources.updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_resources_updated_at ON resources;
CREATE TRIGGER set_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_versions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_kits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_kit_resources ENABLE ROW LEVEL SECURITY;

-- Drop old policies first (so re-runs don't error)
DROP POLICY IF EXISTS "Users can read own profile"            ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"          ON profiles;
DROP POLICY IF EXISTS "Owners full access"                    ON resources;
DROP POLICY IF EXISTS "Discoverable resources"                ON resources;
DROP POLICY IF EXISTS "Permitted users can view"              ON resources;
DROP POLICY IF EXISTS "Versions follow resource access"       ON resource_versions;
DROP POLICY IF EXISTS "Permissions visible to owner and grantee" ON resource_permissions;
DROP POLICY IF EXISTS "Access request visibility"             ON access_requests;
DROP POLICY IF EXISTS "Authenticated can create access requests" ON access_requests;
DROP POLICY IF EXISTS "Authenticated can view departments"    ON departments;
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can read their own blocks"       ON user_blocks;
DROP POLICY IF EXISTS "Users can create blocks"               ON user_blocks;
DROP POLICY IF EXISTS "Users can delete blocks"               ON user_blocks;
DROP POLICY IF EXISTS "HODs can create reviews"               ON resource_reviews;
DROP POLICY IF EXISTS "Anyone can view reviews"               ON resource_reviews;
DROP POLICY IF EXISTS "Users can view all profiles"           ON profiles;
DROP POLICY IF EXISTS "Users can view discoverable kits"      ON teaching_kits;
DROP POLICY IF EXISTS "Owners full access kits"               ON teaching_kits;
DROP POLICY IF EXISTS "Anyone can view kit resources"         ON teaching_kit_resources;
DROP POLICY IF EXISTS "Owners can add kit resources"          ON teaching_kit_resources;

-- Profiles
CREATE POLICY "Users can view all profiles"
    ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Resources
CREATE POLICY "Owners full access"
    ON resources FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Discoverable resources"
    ON resources FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        visibility IN ('DEPARTMENT_DISCOVERABLE','INSTITUTION_DISCOVERABLE')
    );
CREATE POLICY "Permitted users can view"
    ON resources FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM resource_permissions
            WHERE resource_permissions.resource_id = resources.id
              AND resource_permissions.user_id = auth.uid()
        )
    );

-- Notifications
CREATE POLICY "Users can read their own notifications"
    ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User Blocks
CREATE POLICY "Users can read their own blocks"
    ON user_blocks FOR SELECT USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);
CREATE POLICY "Users can create blocks"
    ON user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete blocks"
    ON user_blocks FOR DELETE USING (auth.uid() = blocker_id);

-- Resource Reviews
CREATE POLICY "Anyone can view reviews"
    ON resource_reviews FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "HODs can create reviews"
    ON resource_reviews FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'HOD')
    );

-- Versions
CREATE POLICY "Versions follow resource access"
    ON resource_versions FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM resources r
            WHERE r.id = resource_versions.resource_id
              AND (r.owner_id = auth.uid()
                   OR r.visibility IN ('DEPARTMENT_DISCOVERABLE','INSTITUTION_DISCOVERABLE')
                   OR EXISTS (SELECT 1 FROM resource_permissions rp WHERE rp.resource_id = r.id AND rp.user_id = auth.uid()))
        )
    );

-- Permissions
CREATE POLICY "Permissions visible to owner and grantee"
    ON resource_permissions FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM resources WHERE id = resource_id AND owner_id = auth.uid())
    );

-- Access requests
CREATE POLICY "Access request visibility"
    ON access_requests FOR SELECT USING (
        requester_id = auth.uid() OR
        EXISTS (SELECT 1 FROM resources WHERE id = resource_id AND owner_id = auth.uid())
    );
CREATE POLICY "Authenticated can create access requests"
    ON access_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Departments
CREATE POLICY "Authenticated can view departments"
    ON departments FOR SELECT USING (auth.uid() IS NOT NULL);

-- Teaching Kits
CREATE POLICY "Owners full access kits"
    ON teaching_kits FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can view discoverable kits"
    ON teaching_kits FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        visibility IN ('DEPARTMENT_DISCOVERABLE','INSTITUTION_DISCOVERABLE')
    );

-- Teaching Kit Resources
CREATE POLICY "Anyone can view kit resources"
    ON teaching_kit_resources FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Owners can add kit resources"
    ON teaching_kit_resources FOR ALL USING (
        EXISTS (SELECT 1 FROM teaching_kits WHERE id = kit_id AND owner_id = auth.uid())
    );

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload to own folder"  ON storage.objects;
DROP POLICY IF EXISTS "Users read own files"        ON storage.objects;
DROP POLICY IF EXISTS "Users delete own files"      ON storage.objects;

CREATE POLICY "Users upload to own folder"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users read own files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own files"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- AFTER RUNNING:
-- 1. Create users in Supabase Auth > Authentication > Users:
--    zetraplayz472@gmail.com / code@1234
--    sample@gmail.com / sample1234
-- 2. Then run:
--    UPDATE profiles SET role = 'ADMIN' WHERE official_email = 'zetraplayz472@gmail.com';
-- ============================================================

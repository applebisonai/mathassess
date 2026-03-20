-- ============================================================
-- MathAssess Database Schema
-- Run this in your Supabase SQL Editor
-- Supabase Dashboard → SQL Editor → New Query → paste and run
-- ============================================================

-- ============================================================
-- STUDENTS TABLE
-- Stores all student records tied to a teacher
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade_level INTEGER NOT NULL CHECK (grade_level >= 0 AND grade_level <= 5),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ASSESSMENTS TABLE
-- Metadata about each assessment type (reference table)
-- ============================================================
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,  -- e.g. 'schedule-2a', 'schedule-2b'
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  grade_range TEXT,
  models TEXT[],        -- e.g. ARRAY['FNWS', 'BNWS', 'NID']
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert the assessments we have so far
INSERT INTO assessments (id, name, short_name, grade_range, models) VALUES
  ('schedule-2a', 'Schedule 2A: Early Number Words and Numerals', '2A', 'K–1', ARRAY['FNWS', 'BNWS', 'NID']),
  ('schedule-2b', 'Schedule 2B: Early Structuring',               '2B', 'K–2', ARRAY['SN20']),
  ('schedule-2c', 'Schedule 2C: Early Arithmetical Strategies',   '2C', 'K–2', ARRAY['SEAL'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ASSESSMENT SESSIONS TABLE
-- One row per time a teacher assesses a student
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  date_administered DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  raw_responses JSONB,          -- All item responses stored as JSON
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONSTRUCT PLACEMENTS TABLE
-- Teacher-confirmed LFIN level placement per construct
-- One row per construct per session
-- ============================================================
CREATE TABLE IF NOT EXISTS construct_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),
  model_name TEXT NOT NULL,     -- 'FNWS', 'BNWS', 'NID', 'SEAL', etc.
  suggested_level INTEGER,      -- Calculated by the system
  confirmed_level INTEGER,      -- Final teacher judgment (may differ)
  date_placed DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- This is what keeps teachers' data private from each other
-- CRITICAL for student data protection (FERPA)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE construct_placements ENABLE ROW LEVEL SECURITY;

-- STUDENTS: Teachers can only see/edit their own students
CREATE POLICY "Teachers see own students"
  ON students FOR ALL
  USING (teacher_id = auth.uid());

-- SESSIONS: Teachers can only see/edit their own sessions
CREATE POLICY "Teachers see own sessions"
  ON assessment_sessions FOR ALL
  USING (teacher_id = auth.uid());

-- CONSTRUCT PLACEMENTS: Tied to the student's teacher
CREATE POLICY "Teachers see own placements"
  ON construct_placements FOR ALL
  USING (
    student_id IN (
      SELECT id FROM students WHERE teacher_id = auth.uid()
    )
  );

-- ASSESSMENTS: Everyone can read (it's just metadata/templates)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read assessments"
  ON assessments FOR SELECT
  USING (true);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(teacher_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON assessment_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON assessment_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_placements_student ON construct_placements(student_id);
CREATE INDEX IF NOT EXISTS idx_placements_session ON construct_placements(session_id);

-- ============================================================
-- UPDATED_AT trigger (auto-update timestamp on edits)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON assessment_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DONE! Your database is ready.
-- Next step: Get your API keys from:
-- Supabase Dashboard → Settings → API
-- Copy ANON KEY and URL into your .env.local file
-- ============================================================

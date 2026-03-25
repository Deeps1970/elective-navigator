
-- Add new columns to electives
ALTER TABLE public.electives ADD COLUMN IF NOT EXISTS eligibility_criteria text DEFAULT '';
ALTER TABLE public.electives ADD COLUMN IF NOT EXISTS syllabus_link text DEFAULT '';
ALTER TABLE public.electives ADD COLUMN IF NOT EXISTS credits integer DEFAULT 3;

-- Modify students table: add batch, remove cgpa dependency (keep column for now, we'll ignore it in code)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS batch text DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email text DEFAULT '';

-- Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_no text NOT NULL REFERENCES public.students(reg_no) ON DELETE CASCADE,
  elective_id integer NOT NULL REFERENCES public.electives(elective_id) ON DELETE RESTRICT,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(reg_no)
);

-- Enable RLS on enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for enrollments
CREATE POLICY "Allow select for all" ON public.enrollments FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert for all" ON public.enrollments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow delete for all" ON public.enrollments FOR DELETE TO public USING (true);

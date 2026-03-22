
-- Create electives table
CREATE TABLE public.electives (
  elective_id SERIAL PRIMARY KEY,
  elective_name TEXT NOT NULL,
  max_capacity INT NOT NULL DEFAULT 30,
  current_count INT NOT NULL DEFAULT 0
);

-- Create students table
CREATE TABLE public.students (
  reg_no TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dept TEXT NOT NULL,
  section TEXT NOT NULL,
  cgpa NUMERIC(4,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  year INT NOT NULL CHECK (year >= 1 AND year <= 4),
  elective_id INT NOT NULL REFERENCES public.electives(elective_id) ON DELETE RESTRICT
);

-- Enable RLS
ALTER TABLE public.electives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS policies for electives
CREATE POLICY "Allow select for all" ON public.electives FOR SELECT USING (true);
CREATE POLICY "Allow update count for all" ON public.electives FOR UPDATE USING (true) WITH CHECK (true);

-- RLS policies for students
CREATE POLICY "Allow select for all" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow insert for all" ON public.students FOR INSERT WITH CHECK (true);

-- Insert initial electives
INSERT INTO public.electives (elective_name, max_capacity, current_count) VALUES
  ('ERP Solutions', 30, 0),
  ('Digital Image Processing', 30, 0),
  ('Internet of Things', 30, 0);

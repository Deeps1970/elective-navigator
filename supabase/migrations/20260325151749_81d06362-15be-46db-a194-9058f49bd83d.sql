
-- Make elective_id nullable for students who register but haven't enrolled yet
ALTER TABLE public.students ALTER COLUMN elective_id DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN cgpa SET DEFAULT 0;
ALTER TABLE public.students ALTER COLUMN year SET DEFAULT 1;

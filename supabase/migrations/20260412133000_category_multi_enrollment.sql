ALTER TABLE public.electives
ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE public.electives
DROP CONSTRAINT IF EXISTS electives_category_check;

ALTER TABLE public.electives
ADD CONSTRAINT electives_category_check
CHECK (category IS NULL OR category IN ('PE1', 'PE2', 'PE3', 'PE4', 'OE'));

ALTER TABLE public.enrollments
DROP CONSTRAINT IF EXISTS enrollments_reg_no_key;

ALTER TABLE public.enrollments
DROP CONSTRAINT IF EXISTS unique_student_elective;

ALTER TABLE public.enrollments
ADD CONSTRAINT unique_student_elective
UNIQUE (reg_no, elective_id);

ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

ALTER TABLE public.electives
DROP COLUMN IF EXISTS eligibility_criteria;

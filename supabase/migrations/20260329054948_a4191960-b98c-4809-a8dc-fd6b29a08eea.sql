
CREATE TABLE public.elective_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elective_id integer NOT NULL REFERENCES public.electives(elective_id) ON DELETE CASCADE,
  department text NOT NULL
);

ALTER TABLE public.elective_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for all" ON public.elective_departments FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert for all" ON public.elective_departments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow delete for all" ON public.elective_departments FOR DELETE TO public USING (true);

CREATE UNIQUE INDEX elective_dept_unique ON public.elective_departments (elective_id, department);

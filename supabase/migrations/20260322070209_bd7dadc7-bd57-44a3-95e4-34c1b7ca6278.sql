CREATE POLICY "Allow update for all" ON public.students FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for all" ON public.students FOR DELETE TO public USING (true);
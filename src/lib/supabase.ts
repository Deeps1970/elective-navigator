import { supabase } from '@/integrations/supabase/client';

export { supabase };

export interface Elective {
  elective_id: number;
  elective_name: string;
  max_capacity: number;
  current_count: number;
}

export interface Student {
  reg_no: string;
  name: string;
  dept: string;
  section: string;
  cgpa: number;
  year: number;
  elective_id: number;
  electives?: Elective;
}

export async function fetchElectives(): Promise<Elective[]> {
  const { data, error } = await supabase
    .from('electives')
    .select('*')
    .order('elective_id');
  if (error) throw error;
  return data ?? [];
}

export async function addStudent(student: Omit<Student, 'electives'>): Promise<void> {
  const { data: existing } = await supabase
    .from('students')
    .select('reg_no')
    .eq('reg_no', student.reg_no)
    .maybeSingle();
  if (existing) throw new Error('A student with this Register Number already exists.');

  const { data: elective } = await supabase
    .from('electives')
    .select('*')
    .eq('elective_id', student.elective_id)
    .single();
  if (!elective) throw new Error('Elective not found.');
  if (elective.current_count >= elective.max_capacity) throw new Error('This elective is full. No seats available.');

  const { error: insertErr } = await supabase.from('students').insert(student);
  if (insertErr) throw insertErr;

  const { error: updateErr } = await supabase
    .from('electives')
    .update({ current_count: elective.current_count + 1 })
    .eq('elective_id', student.elective_id);
  if (updateErr) throw updateErr;
}

export interface SearchFilters {
  name?: string;
  dept?: string;
  section?: string;
  cgpa?: number;
}

export async function searchStudents(filters: SearchFilters): Promise<Student[]> {
  let query = supabase
    .from('students')
    .select('*, electives(elective_name)')
    .order('name');

  if (filters.name) query = query.ilike('name', `%${filters.name}%`);
  if (filters.dept) query = query.eq('dept', filters.dept);
  if (filters.section) query = query.eq('section', filters.section);
  if (filters.cgpa !== undefined && filters.cgpa > 0) query = query.gte('cgpa', filters.cgpa);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

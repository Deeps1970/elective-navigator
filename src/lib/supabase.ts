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
  electives?: Partial<Elective>;
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

export async function addElective(name: string, maxCapacity: number): Promise<void> {
  const { data: existing } = await supabase
    .from('electives')
    .select('elective_id')
    .eq('elective_name', name)
    .maybeSingle();
  if (existing) throw new Error('An elective with this name already exists.');

  const { error } = await supabase
    .from('electives')
    .insert({ elective_name: name, max_capacity: maxCapacity, current_count: 0 });
  if (error) throw error;
}

export interface SearchFilters {
  name?: string;
  dept?: string;
  section?: string;
  cgpa?: number;
  elective_id?: number;
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
  if (filters.elective_id) query = query.eq('elective_id', filters.elective_id);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateStudent(
  regNo: string,
  updates: Partial<Omit<Student, 'electives' | 'reg_no'>>,
  oldElectiveId: number,
  newElectiveId: number
): Promise<void> {
  if (updates.cgpa !== undefined && (updates.cgpa < 0 || updates.cgpa > 10)) {
    throw new Error('CGPA must be between 0 and 10');
  }

  if (oldElectiveId !== newElectiveId) {
    const { data: newEl } = await supabase
      .from('electives').select('*').eq('elective_id', newElectiveId).single();
    if (!newEl) throw new Error('Elective not found.');
    if (newEl.current_count >= newEl.max_capacity) throw new Error('New elective is full.');

    const { data: oldEl } = await supabase
      .from('electives').select('*').eq('elective_id', oldElectiveId).single();

    const { error: studentErr } = await supabase
      .from('students').update(updates).eq('reg_no', regNo);
    if (studentErr) throw studentErr;

    await supabase.from('electives')
      .update({ current_count: Math.max(0, (oldEl?.current_count ?? 1) - 1) })
      .eq('elective_id', oldElectiveId);
    await supabase.from('electives')
      .update({ current_count: newEl.current_count + 1 })
      .eq('elective_id', newElectiveId);
  } else {
    const { error } = await supabase.from('students').update(updates).eq('reg_no', regNo);
    if (error) throw error;
  }
}

export async function deleteStudent(regNo: string, electiveId: number): Promise<void> {
  const { error } = await supabase.from('students').delete().eq('reg_no', regNo);
  if (error) throw error;

  const { data: el } = await supabase
    .from('electives').select('current_count').eq('elective_id', electiveId).single();
  if (el) {
    await supabase.from('electives')
      .update({ current_count: Math.max(0, el.current_count - 1) })
      .eq('elective_id', electiveId);
  }
}

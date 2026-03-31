import { supabase } from '@/integrations/supabase/client';

export { supabase };

export interface Elective {
  elective_id: number;
  elective_name: string;
  batch: string;
  max_capacity: number;
  current_count: number;
  eligibility_criteria: string;
  syllabus_link: string;
  credits: number;
}

export interface Student {
  reg_no: string;
  name: string;
  email: string;
  dept: string;
  section: string;
  batch: string;
  elective_id: number | null;
  enrollments?: Array<{
    elective_id: number;
    electives: { elective_name: string } | null;
  }>;
}

export interface Enrollment {
  id: string;
  reg_no: string;
  elective_id: number;
  created_at: string;
}

export async function fetchElectives(): Promise<Elective[]> {
  const { data, error } = await supabase
    .from('electives')
    .select('*')
    .order('elective_id');
  if (error) throw error;
  return data ?? [];
}

export async function fetchElectivesByBatch(batch: string, dept?: string): Promise<Elective[]> {
  const { data, error } = await supabase
    .from('electives')
    .select('*, elective_departments(department)')
    .eq('batch', batch)
    .order('elective_id');

  if (error) throw error;

  let results = (data ?? []) as any[];

  if (dept) {
    results = results.filter((el: any) => {
      const depts = el.elective_departments;
      if (!depts || depts.length === 0) return true;
      return depts.some((d: any) => d.department === dept);
    });
  }

  return results.map(({ elective_departments, ...rest }: any) => rest);
}

export async function addStudent(student: Omit<Student, 'enrollments'>): Promise<void> {
  const { data: existing } = await supabase
    .from('students')
    .select('reg_no')
    .eq('reg_no', student.reg_no)
    .maybeSingle();

  if (existing) throw new Error('A student with this Register Number already exists.');

  const { error } = await supabase.from('students').insert({
    reg_no: student.reg_no,
    name: student.name,
    email: student.email,
    dept: student.dept,
    section: student.section,
    batch: student.batch,
    elective_id: student.elective_id,
  });

  if (error) throw error;
}

export async function addElective(
  name: string,
  batch: string,
  maxCapacity: number,
  eligibilityCriteria: string,
  syllabusLink: string,
  credits: number,
  departments: string[]
): Promise<void> {
  const { data: existing } = await supabase
    .from('electives')
    .select('elective_id')
    .eq('elective_name', name)
    .eq('batch', batch)
    .maybeSingle();

  if (existing) throw new Error('An elective already exists.');

  const { data, error } = await supabase
    .from('electives')
    .insert({
      elective_name: name,
      batch,
      max_capacity: maxCapacity,
      current_count: 0,
      eligibility_criteria: eligibilityCriteria,
      syllabus_link: syllabusLink,
      credits,
    })
    .select('elective_id')
    .single();

  if (error) throw error;

  if (departments.length > 0) {
    const rows = departments.map((dept) => ({
      elective_id: data.elective_id,
      department: dept,
    }));

    const { error: deptErr } = await supabase.from('elective_departments').insert(rows);
    if (deptErr) throw deptErr;
  }
}

export interface SearchFilters {
  name?: string;
  dept?: string;
  section?: string;
  batch?: string;
  elective_id?: number;
}

export async function searchStudents(filters: SearchFilters): Promise<Student[]> {
  let query = supabase
    .from('students')
    .select('reg_no, name, email, dept, section, batch, elective_id, enrollments(elective_id, electives(elective_name))')
    .order('name');

  if (filters.name) query = query.ilike('name', `%${filters.name}%`);
  if (filters.dept) query = query.eq('dept', filters.dept);
  if (filters.section) query = query.eq('section', filters.section);
  if (filters.batch) query = query.eq('batch', filters.batch);

  const { data, error } = await query;
  if (error) throw error;

  let results = (data ?? []) as Student[];

  if (filters.elective_id) {
    results = results.filter(s =>
      s.enrollments?.some(e => e.elective_id === filters.elective_id)
    );
  }

  return results;
}

export async function registerStudent(student: {
  reg_no: string;
  name: string;
  email: string;
  password: string;
  dept: string;
  section: string;
  batch: string;
}): Promise<void> {

  if (!student.password || student.password.length < 4) {
    throw new Error('Password must be at least 4 characters.');
  }

  const { data: existing } = await supabase
    .from('students')
    .select('reg_no')
    .eq('reg_no', student.reg_no)
    .maybeSingle();

  if (existing) throw new Error('Register Number already exists.');

  const { data: emailExists } = await supabase
    .from('students')
    .select('reg_no')
    .eq('email', student.email)
    .maybeSingle();

  if (emailExists) throw new Error('Email already exists.');

  const { error } = await supabase.from('students').insert({
    reg_no: student.reg_no,
    name: student.name,
    email: student.email,
    password: student.password,
    dept: student.dept,
    section: student.section,
    batch: student.batch,
  });

  if (error) throw error;
}

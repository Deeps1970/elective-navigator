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
  // Joined from enrollments
  enrollments?: {
    elective_id: number;
    electives: { elective_name: string } | null;
  }[];
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

export async function fetchElectivesByBatch(batch: string): Promise<Elective[]> {
  const { data, error } = await supabase
    .from('electives')
    .select('*')
    .eq('batch', batch)
    .order('elective_id');
  if (error) throw error;
  return data ?? [];
}

export async function addStudent(student: Omit<Student, 'enrollments'> & { cgpa?: number; year?: number }): Promise<void> {
  const { data: existing } = await supabase
    .from('students')
    .select('reg_no')
    .eq('reg_no', student.reg_no)
    .maybeSingle();
  if (existing) throw new Error('A student with this Register Number already exists.');

  const { error: insertErr } = await supabase.from('students').insert({
    reg_no: student.reg_no,
    name: student.name,
    email: student.email,
    dept: student.dept,
    section: student.section,
    batch: student.batch,
    elective_id: student.elective_id,
    cgpa: student.cgpa ?? 0,
    year: student.year ?? 1,
  });
  if (insertErr) throw insertErr;
}

export async function addElective(name: string, batch: string, maxCapacity: number, eligibilityCriteria: string, syllabusLink: string, credits: number): Promise<void> {
  const { data: existing } = await supabase
    .from('electives')
    .select('elective_id')
    .eq('elective_name', name)
    .eq('batch', batch)
    .maybeSingle();
  if (existing) throw new Error('An elective with this name already exists for this batch.');

  const { error } = await supabase
    .from('electives')
    .insert({
      elective_name: name,
      batch,
      max_capacity: maxCapacity,
      current_count: 0,
      eligibility_criteria: eligibilityCriteria,
      syllabus_link: syllabusLink,
      credits,
    });
  if (error) throw error;
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

  // Client-side filter by elective if needed (since elective is in enrollments)
  if (filters.elective_id) {
    results = results.filter(s =>
      s.enrollments?.some(e => e.elective_id === filters.elective_id)
    );
  }

  return results;
}

export async function updateStudent(
  regNo: string,
  updates: Partial<Omit<Student, 'enrollments' | 'reg_no'>>,
  oldElectiveId: number,
  newElectiveId: number
): Promise<void> {
  // Update student basic info (without elective_id changes here)
  const { elective_id, ...basicUpdates } = updates;
  const { error } = await supabase.from('students').update(basicUpdates as any).eq('reg_no', regNo);
  if (error) throw error;
}

export async function deleteStudent(regNo: string): Promise<void> {
  // Get enrollment to decrement count
  const enrollment = await getStudentEnrollment(regNo);

  // Delete enrollment first
  await supabase.from('enrollments').delete().eq('reg_no', regNo);

  // Delete student
  const { error } = await supabase.from('students').delete().eq('reg_no', regNo);
  if (error) throw error;

  // Decrement elective count if enrolled
  if (enrollment) {
    const { data: el } = await supabase
      .from('electives').select('current_count').eq('elective_id', enrollment.elective_id).single();
    if (el) {
      await supabase.from('electives')
        .update({ current_count: Math.max(0, el.current_count - 1) })
        .eq('elective_id', enrollment.elective_id);
    }
  }
}

// Student auth functions
export async function registerStudent(student: { reg_no: string; name: string; email: string; dept: string; section: string; batch: string }): Promise<void> {
  const { data: existing } = await supabase
    .from('students')
    .select('reg_no')
    .eq('reg_no', student.reg_no)
    .maybeSingle();
  if (existing) throw new Error('A student with this Register Number already exists.');

  const { data: emailExists } = await supabase
    .from('students')
    .select('reg_no')
    .eq('email', student.email)
    .maybeSingle();
  if (emailExists) throw new Error('A student with this email already exists.');

  const { error } = await supabase.from('students').insert({
    reg_no: student.reg_no,
    name: student.name,
    email: student.email,
    dept: student.dept,
    section: student.section,
    batch: student.batch,
    cgpa: 0,
    year: 1,
  } as any);
  if (error) throw error;
}

export async function loginStudent(regNo: string, email: string): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('reg_no', regNo)
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Invalid Register Number or Email.');
  return data;
}

export async function getStudentEnrollment(regNo: string): Promise<Enrollment | null> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('reg_no', regNo)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function enrollStudent(regNo: string, electiveId: number, studentBatch: string): Promise<void> {
  // Check if already enrolled
  const existing = await getStudentEnrollment(regNo);
  if (existing) throw new Error('You are already enrolled in an elective.');

  // Check capacity and batch
  const { data: elective } = await supabase
    .from('electives')
    .select('*')
    .eq('elective_id', electiveId)
    .single();
  if (!elective) throw new Error('Elective not found.');
  if (elective.current_count >= elective.max_capacity) throw new Error('This elective is full.');
  if (elective.batch && elective.batch !== studentBatch) throw new Error('This elective is not available for your batch.');

  // Insert enrollment
  const { error: enrollErr } = await supabase
    .from('enrollments')
    .insert({ reg_no: regNo, elective_id: electiveId });
  if (enrollErr) throw enrollErr;

  // Increment count
  const { error: updateErr } = await supabase
    .from('electives')
    .update({ current_count: elective.current_count + 1 })
    .eq('elective_id', electiveId);
  if (updateErr) throw updateErr;
}

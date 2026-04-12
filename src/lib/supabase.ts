import { supabase } from '@/integrations/supabase/client';

export { supabase };

export const ELECTIVE_CATEGORIES = ['PE1', 'PE2', 'PE3', 'PE4', 'OE'] as const;
export type ElectiveCategory = (typeof ELECTIVE_CATEGORIES)[number];

export interface Elective {
  elective_id: number;
  elective_name: string;
  batch: string;
  category: ElectiveCategory | null;
  max_capacity: number;
  current_count: number;
  syllabus_link: string | null;
  credits: number | null;
}

export interface StudentEnrollment {
  elective_id: number;
  elective_name: string;
  category: ElectiveCategory | null;
  created_at: string | null;
}

export interface Student {
  reg_no: string;
  name: string;
  email: string;
  dept: string;
  section: string;
  batch: string;
  // ✅ NEW SYSTEM
  enrollments?: Array<{
    elective_id: number;
    elective_name: string;
    category: string;
    created_at: string;
  }>;
}

export interface Enrollment {
  id: string;
  reg_no: string;
  elective_id: number;
  created_at: string | null;
}

type StudentRow = Omit<Student, 'enrollments'>;

export async function fetchElectives(): Promise<Elective[]> {
  const { data, error } = await supabase
    .from('electives')
    .select('*')
    .order('elective_id');

  if (error) throw error;
  return (data ?? []) as Elective[];
}

export async function fetchElectivesByBatch(batch: string, dept?: string): Promise<Elective[]> {
  const [{ data: electives, error: electivesError }, { data: electiveDepartments, error: departmentsError }] = await Promise.all([
    supabase
      .from('electives')
      .select('*')
      .eq('batch', batch)
      .order('elective_id'),
    supabase
      .from('elective_departments')
      .select('elective_id, department'),
  ]);

  if (electivesError) throw electivesError;
  if (departmentsError) throw departmentsError;

  const departmentMap = new Map<number, string[]>();
  for (const row of electiveDepartments ?? []) {
    const departments = departmentMap.get(row.elective_id) ?? [];
    departments.push(row.department);
    departmentMap.set(row.elective_id, departments);
  }

  let results = (electives ?? []) as Elective[];

  if (dept) {
    results = results.filter((elective) => {
      const departments = departmentMap.get(elective.elective_id) ?? [];
      return departments.length === 0 || departments.includes(dept);
    });
  }

  return results;
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
    // elective_id: student.elective_id,
  });

  if (insertErr) throw insertErr;
}

export async function addElective(
  name: string,
  batch: string,
  maxCapacity: number,
  category: ElectiveCategory,
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

  if (existing) throw new Error('An elective with this name already exists for this batch.');

  const { data, error } = await supabase
    .from('electives')
    .insert({
      elective_name: name,
      batch,
      category,
      max_capacity: maxCapacity,
      current_count: 0,
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

    const { error: deptErr } = await supabase
      .from('elective_departments')
      .insert(rows);

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

// export async function searchStudents(filters: SearchFilters): Promise<Student[]> {
//   let query = supabase
//     .from('students')
//     .select('reg_no, name, email, dept, section, batch, elective_id')
//     .order('name');

//   if (filters.name) query = query.ilike('name', `%${filters.name}%`);
//   if (filters.dept) query = query.eq('dept', filters.dept);
//   if (filters.section) query = query.eq('section', filters.section);
//   if (filters.batch) query = query.eq('batch', filters.batch);

//   const { data: students, error } = await query;
//   if (error) throw error;

//   const studentList = (students ?? []) as StudentRow[];
//   if (studentList.length === 0) return [];

//   const studentRegNos = studentList.map((student) => student.reg_no);

//   const { data: enrollments, error: enrollmentsError } = await supabase
//     .from('enrollments')
//     .select('reg_no, elective_id, created_at')
//     .in('reg_no', studentRegNos);

//   if (enrollmentsError) throw enrollmentsError;

//   const electiveIds = Array.from(new Set((enrollments ?? []).map((enrollment) => enrollment.elective_id)));
//   const { data: electives, error: electivesError } = electiveIds.length > 0
//     ? await supabase
//         .from('electives')
//         .select('elective_id, elective_name, category')
//         .in('elective_id', electiveIds)
//     : { data: [], error: null };

//   if (electivesError) throw electivesError;

//   const electiveMap = new Map<number, Pick<Elective, 'elective_name' | 'category'>>();
//   for (const elective of electives ?? []) {
//     electiveMap.set(elective.elective_id, {
//       elective_name: elective.elective_name,
//       category: elective.category,
//     });
//   }

//   const enrollmentMap = new Map<string, StudentEnrollment[]>();
//   for (const enrollment of enrollments ?? []) {
//     const elective = electiveMap.get(enrollment.elective_id);
//     const current = enrollmentMap.get(enrollment.reg_no) ?? [];

//     current.push({
//       elective_id: enrollment.elective_id,
//       elective_name: elective?.elective_name ?? 'Unknown Elective',
//       category: elective?.category ?? null,
//       created_at: enrollment.created_at,
//     });

//     enrollmentMap.set(enrollment.reg_no, current);
//   }

//   let results: Student[] = studentList.map((student) => ({
//     ...student,
//     enrollments: (enrollmentMap.get(student.reg_no) ?? []).sort((a, b) => {
//       if (!a.created_at && !b.created_at) return 0;
//       if (!a.created_at) return 1;
//       if (!b.created_at) return -1;
//       return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
//     }),
//   }));

//   if (filters.elective_id) {
//     results = results.filter((student) =>
//       student.enrollments?.some((enrollment) => enrollment.elective_id === filters.elective_id)
//     );
//   }

//   return results;
// }

export async function searchStudents(filters: SearchFilters): Promise<Student[]> {
  // 🔥 1. Fetch students
  let query = supabase
    .from('students')
    .select('reg_no, name, email, dept, section, batch')
    .order('name');

  if (filters.name) query = query.ilike('name', `%${filters.name}%`);
  if (filters.dept) query = query.eq('dept', filters.dept);
  if (filters.section) query = query.eq('section', filters.section);
  if (filters.batch) query = query.eq('batch', filters.batch);

  const { data: students, error } = await query;
  if (error) throw error;

  // 🔥 2. Fetch enrollments WITH category + name
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      reg_no,
      elective_id,
      created_at,
      electives (
        elective_name,
        category
      )
    `);

  // 🔥 3. Create mapping
  const enrollmentMap = new Map<string, any[]>();

  enrollments?.forEach((e) => {
    if (!enrollmentMap.has(e.reg_no)) {
      enrollmentMap.set(e.reg_no, []);
    }

    enrollmentMap.get(e.reg_no).push({
      elective_id: e.elective_id,
      elective_name: e.electives?.elective_name,
      category: e.electives?.category,
      created_at: e.created_at,
    });
  });

  // 🔥 4. Attach to students
  let results = (students ?? []).map((student) => ({
    ...student,
    enrollments: enrollmentMap.get(student.reg_no) || [],
  }));

  // 🔥 5. Filter by elective if needed
  if (filters.elective_id) {
    results = results.filter((s) =>
      s.enrollments?.some((e) => e.elective_id === filters.elective_id)
    );
  }

  return results;
}

export async function updateStudent(
  regNo: string,
  updates: Partial<Omit<Student, 'enrollments' | 'reg_no'>>
): Promise<void> {
  const { error } = await supabase.from('students').update(updates as never).eq('reg_no', regNo);
  if (error) throw error;
}

export async function deleteStudent(regNo: string): Promise<void> {
  const enrollments = await getStudentEnrollments(regNo);

  await supabase.from('enrollments').delete().eq('reg_no', regNo);

  const { error } = await supabase.from('students').delete().eq('reg_no', regNo);
  if (error) throw error;

  for (const enrollment of enrollments) {
    const { data: elective } = await supabase
      .from('electives')
      .select('current_count')
      .eq('elective_id', enrollment.elective_id)
      .maybeSingle();

    if (!elective) continue;

    await supabase
      .from('electives')
      .update({ current_count: Math.max(0, elective.current_count - 1) })
      .eq('elective_id', enrollment.elective_id);
  }
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
    password: student.password,
    dept: student.dept,
    section: student.section,
    batch: student.batch,
  } as never);

  if (error) throw error;
}

export async function loginStudent(identifier: string, password: string): Promise<Student> {
  let { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('reg_no', identifier)
    .maybeSingle();

  if (!data) {
    const res = await supabase
      .from('students')
      .select('*')
      .eq('email', identifier)
      .maybeSingle();
    data = res.data;
    error = res.error;
  }

  if (error) throw error;
  if (!data) throw new Error('No account found.');
  if ((data as { password: string }).password !== password) throw new Error('Incorrect password.');

  return data as Student;
}

export async function getStudentEnrollments(regNo: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('reg_no', regNo)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Enrollment[];
}

export async function getStudentEnrollment(regNo: string): Promise<Enrollment | null> {
  const enrollments = await getStudentEnrollments(regNo);
  return enrollments[0] ?? null;
}

export async function enrollStudent(
  regNo: string,
  electiveId: number,
  studentBatch: string
): Promise<void> {
  const { data: elective, error: electiveError } = await supabase
    .from('electives')
    .select('elective_id, batch, category, current_count, max_capacity')
    .eq('elective_id', electiveId)
    .maybeSingle();

  if (electiveError) throw electiveError;
  if (!elective) throw new Error('Elective not found.');
  if (!elective.category) throw new Error('Elective category is not configured.');
  if (elective.current_count >= elective.max_capacity) throw new Error('This elective is full.');
  if (elective.batch && elective.batch !== studentBatch) throw new Error('Not available for your batch.');

  const existingEnrollments = await getStudentEnrollments(regNo);
  if (existingEnrollments.some((enrollment) => enrollment.elective_id === electiveId)) {
    throw new Error('You are already enrolled in this elective.');
  }

  if (existingEnrollments.length > 0) {
    const existingElectiveIds = existingEnrollments.map((enrollment) => enrollment.elective_id);
    const { data: existingElectives, error: existingElectivesError } = await supabase
      .from('electives')
      .select('elective_id, category')
      .in('elective_id', existingElectiveIds);

    if (existingElectivesError) throw existingElectivesError;

    const sameCategoryEnrollment = (existingElectives ?? []).find(
      (existingElective) => existingElective.category === elective.category
    );

    if (sameCategoryEnrollment) {
      throw new Error(`You are already enrolled in category ${elective.category}.`);
    }
  }

  const { error: enrollErr } = await supabase
    .from('enrollments')
    .insert({ reg_no: regNo, elective_id: electiveId });

  if (enrollErr) throw enrollErr;

  const { error: updateErr } = await supabase
    .from('electives')
    .update({ current_count: elective.current_count + 1 })
    .eq('elective_id', electiveId);

  if (updateErr) throw updateErr;
}

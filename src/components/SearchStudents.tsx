import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { searchStudents, fetchElectives, type Student, type SearchFilters, type Elective } from '@/lib/supabase';
import EditStudentModal from './EditStudentModal';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
const SECTIONS = ['A', 'B'];
const BATCHES = ['2023', '2024', '2025', '2026'];

interface Props {
  refreshKey: number;
  onDataChanged?: () => void;
}

export default function SearchStudents({ refreshKey, onDataChanged }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({ name: '', dept: '', section: '', batch: '' });

  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchStudents(filters);
      setStudents(data);
    } catch {
      toast.error('Failed to search students');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { void doSearch(); }, [refreshKey, doSearch]);

  useEffect(() => {
    fetchElectives().then(setElectives).catch(() => {});
  }, [refreshKey]);

  const update = (key: string, val: string) => setFilters(prev => ({
    ...prev,
    [key]: key === 'elective_id' ? (val ? parseInt(val) : undefined) : val,
  }));

  const getEnrollmentSummary = (student: Student): string => {
    if (!student.enrollments || student.enrollments.length === 0) {
      return '—';
    }

    return student.enrollments
      .map((enrollment) => enrollment.category ? `${enrollment.category}: ${enrollment.elective_name}` : enrollment.elective_name)
      .join(', ');
  };

  const handleDownloadExcel = () => {
    if (students.length === 0) {
      toast.error('No student data available to export');
      return;
    }

    console.log('Export Data:', students);

    const rows = students.map((student) => {
      const row: Record<string, string> = {
        Name: student.name,
        'Reg No': student.reg_no,
        Email: student.email || '',
        Dept: student.dept,
        Section: student.section,
        Batch: student.batch || '',
        PE1: '',
        PE2: '',
        PE3: '',
        PE4: '',
        OE: '',
        'Enrollment Time': '',
      };

      for (const enrollment of student.enrollments ?? []) {
        if (enrollment.category) {
          row[enrollment.category] = enrollment.elective_name;
        }

        if (enrollment.created_at) {
          row['Enrollment Time'] = enrollment.created_at;
        }
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'elective-students.xlsx');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-6"
    >
      <div className="glass-card gradient-border p-6">
        <h2 className="text-2xl font-bold gradient-text mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Search Students
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <input className="glass-input" placeholder="Name" value={filters.name || ''} onChange={e => update('name', e.target.value)} />
          <select className="glass-input" value={filters.dept || ''} onChange={e => update('dept', e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="glass-input" value={filters.section || ''} onChange={e => update('section', e.target.value)}>
            <option value="">All Sections</option>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="glass-input" value={filters.batch || ''} onChange={e => update('batch', e.target.value)}>
            <option value="">All Batches</option>
            {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="glass-input" value={filters.elective_id || ''} onChange={e => update('elective_id', e.target.value)}>
            <option value="">All Electives</option>
            {electives.map(el => <option key={el.elective_id} value={String(el.elective_id)}>{el.elective_name}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={doSearch} className="btn-primary">
            Search
          </button>
          <button onClick={handleDownloadExcel} type="button" className="rounded-xl border border-border/40 px-5 py-2.5 font-semibold text-foreground hover:bg-muted/30 transition-all">
            Download Excel
          </button>
        </div>
      </div>

      <div className="glass-card gradient-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                {['Name', 'Reg No', 'Email', 'Dept', 'Section', 'Batch', 'Elective'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-muted-foreground font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                ) : students.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No students found</td></tr>
                ) : (
                  students.map((s, i) => (
                    <motion.tr
                      key={s.reg_no}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer"
                      title="Click to edit or delete"
                      onClick={() => setSelectedStudent(s)}
                    >
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.reg_no}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.email || '—'}</td>
                      <td className="px-4 py-3">{s.dept}</td>
                      <td className="px-4 py-3">{s.section}</td>
                      <td className="px-4 py-3">{s.batch || '—'}</td>
                      <td className="px-4 py-3 gradient-text font-medium">{getEnrollmentSummary(s)}</td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      {selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdated={() => { void doSearch(); onDataChanged?.(); }}
        />
      )}
    </motion.div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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

  useEffect(() => { doSearch(); }, [refreshKey, doSearch]);

  useEffect(() => {
    fetchElectives().then(setElectives).catch(() => {});
  }, [refreshKey]);

  const update = (key: string, val: string) => setFilters(prev => ({
    ...prev,
    [key]: key === 'elective_id' ? (val ? parseInt(val) : undefined) : val,
  }));

  const getElectiveName = (student: Student): string => {
    console.log('Student enrollments:', student.reg_no, student.enrollments);
    // enrollments is an object (one-to-one), not an array
    const enrollment = student.enrollments as any;
    if (enrollment && !Array.isArray(enrollment)) {
      return enrollment.electives?.elective_name || '—';
    }
    if (Array.isArray(enrollment) && enrollment.length > 0) {
      return enrollment[0].electives?.elective_name || '—';
    }
    return '—';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Search Filters */}
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
        <button onClick={doSearch} className="mt-4 btn-primary">
          Search
        </button>
      </div>

      {/* Results Table */}
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
                      <td className="px-4 py-3 gradient-text font-medium">{getElectiveName(s)}</td>
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
          onUpdated={() => { doSearch(); onDataChanged?.(); }}
        />
      )}
    </motion.div>
  );
}

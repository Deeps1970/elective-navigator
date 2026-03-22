import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { searchStudents, fetchElectives, type Student, type SearchFilters, type Elective } from '@/lib/supabase';
import EditStudentModal from './EditStudentModal';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
const SECTIONS = ['A', 'B'];

interface Props {
  refreshKey: number;
  onDataChanged?: () => void;
}

export default function SearchStudents({ refreshKey, onDataChanged }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({ name: '', dept: '', section: '' });

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
    [key]: key === 'cgpa' ? (val ? parseFloat(val) : undefined)
         : key === 'elective_id' ? (val ? parseInt(val) : undefined)
         : val,
  }));

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
          <input type="number" step="0.01" min="0" max="10" className="glass-input" placeholder="Min CGPA" onChange={e => update('cgpa', e.target.value)} />
          <select className="glass-input" value={filters.elective_id || ''} onChange={e => update('elective_id', e.target.value)}>
            <option value="">All Electives</option>
            {electives.map(el => <option key={el.elective_id} value={String(el.elective_id)}>{el.elective_name}</option>)}
          </select>
        </div>
        <button
          onClick={doSearch}
          className="mt-4 rounded-xl px-8 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, hsl(250 80% 65%), hsl(320 70% 60%))' }}
        >
          Search
        </button>
      </div>

      {/* Results Table */}
      <div className="glass-card gradient-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                {['Name', 'Reg No', 'Dept', 'Section', 'CGPA', 'Year', 'Elective'].map(h => (
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
                      <td className="px-4 py-3">{s.dept}</td>
                      <td className="px-4 py-3">{s.section}</td>
                      <td className="px-4 py-3">{s.cgpa}</td>
                      <td className="px-4 py-3">{s.year}</td>
                      <td className="px-4 py-3 gradient-text font-medium">{(s.electives as any)?.elective_name || '—'}</td>
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

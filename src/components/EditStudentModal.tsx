import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fetchElectives, updateStudent, deleteStudent, type Student, type Elective } from '@/lib/supabase';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
const SECTIONS = ['A', 'B'];
const YEARS = [1, 2, 3, 4];

interface Props {
  student: Student;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditStudentModal({ student, onClose, onUpdated }: Props) {
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    name: student.name,
    dept: student.dept,
    section: student.section,
    cgpa: String(student.cgpa),
    year: String(student.year),
    elective_id: String(student.elective_id),
  });

  useEffect(() => {
    fetchElectives().then(setElectives).catch(() => {});
  }, []);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleUpdate = async () => {
    const cgpa = parseFloat(form.cgpa);
    if (!form.name || !form.dept || !form.section || !form.cgpa || !form.year || !form.elective_id) {
      toast.error('All fields are required'); return;
    }
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      toast.error('CGPA must be between 0 and 10'); return;
    }

    setLoading(true);
    try {
      await updateStudent(
        student.reg_no,
        { name: form.name, dept: form.dept, section: form.section, cgpa, year: parseInt(form.year), elective_id: parseInt(form.elective_id) },
        student.elective_id,
        parseInt(form.elective_id)
      );
      toast.success('Student updated successfully!');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteStudent(student.reg_no, student.elective_id);
      toast.success('Student deleted successfully!');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-card gradient-border p-6 lg:p-8 w-full max-w-lg relative z-10"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
              Edit Student
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">&times;</button>
          </div>

          {confirmDelete ? (
            <div className="space-y-4">
              <p className="text-foreground">Are you sure you want to delete <strong>{student.name}</strong> ({student.reg_no})?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 rounded-xl py-3 font-semibold text-primary-foreground bg-destructive hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-xl py-3 font-semibold border border-border/40 text-muted-foreground hover:text-foreground transition-all"
                  style={{ background: 'hsl(230 20% 14% / 0.4)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Register Number</label>
                <input className="glass-input w-full opacity-60 cursor-not-allowed" value={student.reg_no} readOnly />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Name</label>
                <input className="glass-input w-full" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Department</label>
                  <select className="glass-input w-full" value={form.dept} onChange={e => update('dept', e.target.value)}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Section</label>
                  <select className="glass-input w-full" value={form.section} onChange={e => update('section', e.target.value)}>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">CGPA</label>
                  <input type="number" step="0.01" min="0" max="10" className="glass-input w-full" value={form.cgpa} onChange={e => update('cgpa', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Year</label>
                  <select className="glass-input w-full" value={form.year} onChange={e => update('year', e.target.value)}>
                    {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Elective</label>
                <select className="glass-input w-full" value={form.elective_id} onChange={e => update('elective_id', e.target.value)}>
                  {electives.map(el => {
                    const seatsLeft = el.max_capacity - el.current_count;
                    const isCurrent = el.elective_id === student.elective_id;
                    const full = seatsLeft <= 0 && !isCurrent;
                    return (
                      <option key={el.elective_id} value={String(el.elective_id)} disabled={full}>
                        {el.elective_name} ({isCurrent ? 'current' : full ? 'FULL' : `${seatsLeft} seats left`})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 rounded-xl py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, hsl(250 80% 65%), hsl(320 70% 60%))' }}
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={loading}
                  className="rounded-xl px-6 py-3 font-semibold bg-destructive text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl px-6 py-3 font-semibold border border-border/40 text-muted-foreground hover:text-foreground transition-all"
                  style={{ background: 'hsl(230 20% 14% / 0.4)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

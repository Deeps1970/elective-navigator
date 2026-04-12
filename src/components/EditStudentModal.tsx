import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { updateStudent, deleteStudent, type Student } from '@/lib/supabase';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
const SECTIONS = ['A', 'B'];

interface Props {
  student: Student;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditStudentModal({ student, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    name: student.name,
    dept: student.dept,
    section: student.section,
    batch: student.batch || '',
    email: student.email || '',
  });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleUpdate = async () => {
    if (!form.name || !form.dept || !form.section || !form.batch) {
      toast.error('All fields are required'); return;
    }

    setLoading(true);
    try {
      await updateStudent(
        student.reg_no,
        { name: form.name, dept: form.dept, section: form.section, batch: form.batch, email: form.email }
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
      await deleteStudent(student.reg_no);
      toast.success('Student deleted successfully!');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  const enrolledElectives = student.enrollments ?? [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
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
                <button onClick={handleDelete} disabled={loading} className="flex-1 rounded-xl py-3 font-semibold text-primary-foreground bg-destructive hover:opacity-90 disabled:opacity-50 transition-all">
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-xl py-3 font-semibold border border-border/40 text-muted-foreground hover:text-foreground transition-all">
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
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                <input className="glass-input w-full" value={form.email} onChange={e => update('email', e.target.value)} />
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
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Batch</label>
                <input className="glass-input w-full" value={form.batch} onChange={e => update('batch', e.target.value)} placeholder="e.g. 2024" />
              </div>
              {enrolledElectives.length > 0 && (
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Enrolled Electives</label>
                  <input
                    className="glass-input w-full opacity-60 cursor-not-allowed"
                    value={enrolledElectives.map((enrollment) => enrollment.category ? `${enrollment.category}: ${enrollment.elective_name}` : enrollment.elective_name).join(', ')}
                    readOnly
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdate} disabled={loading} className="flex-1 btn-primary py-3">
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button onClick={() => setConfirmDelete(true)} disabled={loading} className="rounded-xl px-6 py-3 font-semibold bg-destructive text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all">
                  Delete
                </button>
                <button onClick={onClose} className="rounded-xl px-6 py-3 font-semibold border border-border/40 text-muted-foreground hover:text-foreground transition-all">
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

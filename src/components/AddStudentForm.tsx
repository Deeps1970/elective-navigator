import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { fetchElectives, addStudent, type Elective } from '@/lib/supabase';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
const SECTIONS = ['A', 'B'];
const YEARS = [1, 2, 3, 4];

interface Props {
  onStudentAdded: () => void;
}

export default function AddStudentForm({ onStudentAdded }: Props) {
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    reg_no: '',
    dept: '',
    section: '',
    cgpa: '',
    year: '',
    elective_id: '',
  });

  const loadElectives = async () => {
    try {
      const data = await fetchElectives();
      setElectives(data);
    } catch {
      toast.error('Failed to load electives');
    }
  };

  useEffect(() => { loadElectives(); }, []);

  const reset = () => {
    setForm({ name: '', reg_no: '', dept: '', section: '', cgpa: '', year: '', elective_id: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cgpa = parseFloat(form.cgpa);
    if (!form.name || !form.reg_no || !form.dept || !form.section || !form.cgpa || !form.year || !form.elective_id) {
      toast.error('All fields are required');
      return;
    }
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      toast.error('CGPA must be between 0 and 10');
      return;
    }

    setLoading(true);
    try {
      await addStudent({
        name: form.name,
        reg_no: form.reg_no,
        dept: form.dept,
        section: form.section,
        cgpa,
        year: parseInt(form.year),
        elective_id: parseInt(form.elective_id),
      });
      toast.success('Student added successfully!');
      reset();
      await loadElectives();
      onStudentAdded();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card gradient-border p-6 lg:p-8"
    >
      <h2 className="text-2xl font-bold gradient-text mb-6" style={{ fontFamily: 'var(--font-display)' }}>
        Add Student
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Name</label>
          <input className="glass-input w-full" placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Register Number</label>
          <input className="glass-input w-full" placeholder="e.g. 21CSE001" value={form.reg_no} onChange={e => update('reg_no', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Department</label>
            <select className="glass-input w-full" value={form.dept} onChange={e => update('dept', e.target.value)}>
              <option value="">Select</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Section</label>
            <select className="glass-input w-full" value={form.section} onChange={e => update('section', e.target.value)}>
              <option value="">Select</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">CGPA (0–10)</label>
            <input type="number" step="0.01" min="0" max="10" className="glass-input w-full" placeholder="8.50" value={form.cgpa} onChange={e => update('cgpa', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Year</label>
            <select className="glass-input w-full" value={form.year} onChange={e => update('year', e.target.value)}>
              <option value="">Select</option>
              {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Elective</label>
          <select className="glass-input w-full" value={form.elective_id} onChange={e => update('elective_id', e.target.value)}>
            <option value="">Select Elective</option>
            {electives.map(el => {
              const seatsLeft = el.max_capacity - el.current_count;
              const full = seatsLeft <= 0;
              return (
                <option key={el.elective_id} value={String(el.elective_id)} disabled={full}>
                  {el.elective_name} ({full ? 'FULL' : `${seatsLeft} seats left`})
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl px-6 py-3 font-semibold border border-border/40 text-muted-foreground hover:text-foreground transition-all"
            
          >
            Reset
          </button>
        </div>
      </form>
    </motion.div>
  );
}

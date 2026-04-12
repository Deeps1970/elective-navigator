import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerStudent } from '@/lib/supabase';
import ParticlesBackground from '@/components/ParticlesBackground';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
const SECTIONS = ['A', 'B'];

export default function StudentRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    reg_no: '',
    email: '',
    password: '',
    dept: '',
    section: '',
    batch: '',
  });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.reg_no || !form.email || !form.password || !form.dept || !form.section || !form.batch) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await registerStudent(form);
      toast.success('Registration successful! Please login.');
      navigate('/student-login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-8">
      <ParticlesBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md relative z-10"
      >
        <h2 className="text-2xl font-bold text-primary mb-6 text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Student Registration
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
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
            <input type="email" className="glass-input w-full" placeholder="student@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Password</label>
            <input type="password" className="glass-input w-full" placeholder="Create a password" value={form.password} onChange={e => update('password', e.target.value)} />
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
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Batch</label>
            <input className="glass-input w-full" placeholder="e.g. 2021-2025" value={form.batch} onChange={e => update('batch', e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button onClick={() => navigate('/student-login')} className="text-primary hover:underline font-medium">Login</button>
        </div>
        <button onClick={() => navigate('/')} className="mt-2 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginStudent } from '@/lib/supabase';
import ParticlesBackground from '@/components/ParticlesBackground';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim() || !email.trim()) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const student = await loginStudent(regNo.trim(), email.trim());
      sessionStorage.setItem('student_data', JSON.stringify(student));
      toast.success(`Welcome, ${student.name}!`);
      navigate('/student-dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <ParticlesBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md relative z-10"
      >
        <h2 className="text-2xl font-bold text-primary mb-6 text-center" style={{ fontFamily: 'var(--font-display)' }}>
          Student Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Register Number</label>
            <input className="glass-input w-full" placeholder="e.g. 21CSE001" value={regNo} onChange={e => setRegNo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
            <input type="email" className="glass-input w-full" placeholder="student@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button onClick={() => navigate('/student-register')} className="text-primary hover:underline font-medium">Register</button>
        </div>
        <button onClick={() => navigate('/')} className="mt-2 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}

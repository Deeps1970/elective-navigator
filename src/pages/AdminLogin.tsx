import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ParticlesBackground from '@/components/ParticlesBackground';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123*') {
        sessionStorage.setItem('admin_authenticated', 'true');
        toast.success('Welcome, Admin!');
        navigate('/app');
      } else {
        toast.error('Invalid credentials');
      }
      setLoading(false);
    }, 500);
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
          Admin Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Username</label>
            <input className="glass-input w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Password</label>
            <input type="password" className="glass-input w-full" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button onClick={() => navigate('/')} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}

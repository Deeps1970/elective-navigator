import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ParticlesBackground from '@/components/ParticlesBackground';
import NavBar from '@/components/NavBar';
import { addElective } from '@/lib/supabase';

export default function AddElective() {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Elective name is required'); return; }
    const cap = parseInt(capacity);
    if (isNaN(cap) || cap <= 0) { toast.error('Max capacity must be greater than 0'); return; }

    setLoading(true);
    try {
      await addElective(name.trim(), cap);
      toast.success('Elective added successfully!');
      setName('');
      setCapacity('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add elective');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <NavBar />

      <main className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card gradient-border p-6 lg:p-8"
        >
          <h2 className="text-2xl font-bold gradient-text mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Add Elective
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Elective Name</label>
              <input className="glass-input w-full" placeholder="e.g. Machine Learning" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Max Capacity</label>
              <input type="number" min="1" className="glass-input w-full" placeholder="30" value={capacity} onChange={e => setCapacity(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Adding...' : 'Add Elective'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

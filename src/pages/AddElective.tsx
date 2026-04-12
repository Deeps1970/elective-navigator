import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ParticlesBackground from '@/components/ParticlesBackground';
import NavBar from '@/components/NavBar';
import { addElective, ELECTIVE_CATEGORIES, type ElectiveCategory } from '@/lib/supabase';

const BATCHES = ['2023', '2024', '2025', '2026'];

export default function AddElective() {
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [category, setCategory] = useState<ElectiveCategory | ''>('');
  const [capacity, setCapacity] = useState('');
  const [syllabusLink, setSyllabusLink] = useState('');
  const [credits, setCredits] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Elective name is required'); return; }
    if (!batch) { toast.error('Batch is required'); return; }
    if (!category) { toast.error('Category is required'); return; }
    const cap = parseInt(capacity);
    if (isNaN(cap) || cap <= 0) { toast.error('Max capacity must be greater than 0'); return; }
    const cred = parseInt(credits);
    if (isNaN(cred) || cred <= 0) { toast.error('Credits must be greater than 0'); return; }

    setLoading(true);
    try {
      await addElective(name.trim(), batch, cap, category, syllabusLink.trim(), cred, []);
      toast.success('Elective added successfully!');
      setName('');
      setBatch('');
      setCategory('');
      setCapacity('');
      setSyllabusLink('');
      setCredits('3');
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Batch</label>
                <select className="glass-input w-full" value={batch} onChange={e => setBatch(e.target.value)}>
                  <option value="">Select Batch</option>
                  {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Max Capacity</label>
                <input type="number" min="1" className="glass-input w-full" placeholder="30" value={capacity} onChange={e => setCapacity(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Category</label>
              <select className="glass-input w-full" value={category} onChange={e => setCategory(e.target.value as ElectiveCategory | '')}>
                <option value="">Select Category</option>
                {ELECTIVE_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Credits</label>
              <input type="number" min="1" className="glass-input w-full" placeholder="3" value={credits} onChange={e => setCredits(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Syllabus Link</label>
              <input type="url" className="glass-input w-full" placeholder="https://..." value={syllabusLink} onChange={e => setSyllabusLink(e.target.value)} />
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

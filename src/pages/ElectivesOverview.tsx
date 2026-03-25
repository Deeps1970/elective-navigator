import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '@/components/ParticlesBackground';
import NavBar from '@/components/NavBar';
import { fetchElectives, type Elective } from '@/lib/supabase';

export default function ElectivesOverview() {
  const [electives, setElectives] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('admin_authenticated') !== 'true') {
      navigate('/admin-login');
      return;
    }
    (async () => {
      try {
        const data = await fetchElectives();
        setElectives(data);
      } catch {
        toast.error('Failed to load electives');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <NavBar />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card gradient-border overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold gradient-text mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Electives Overview
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  {['Elective Name', 'Credits', 'Max Capacity', 'Current Count', 'Seats Left', 'Eligibility'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-muted-foreground font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                ) : electives.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No electives found</td></tr>
                ) : (
                  electives.map((el, i) => {
                    const seatsLeft = el.max_capacity - el.current_count;
                    return (
                      <motion.tr
                        key={el.elective_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium">{el.elective_name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{el.credits}</td>
                        <td className="px-6 py-4 text-muted-foreground">{el.max_capacity}</td>
                        <td className="px-6 py-4 text-muted-foreground">{el.current_count}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${seatsLeft <= 0 ? 'text-destructive' : 'gradient-text'}`}>
                            {seatsLeft <= 0 ? 'FULL' : seatsLeft}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">{el.eligibility_criteria || '—'}</td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

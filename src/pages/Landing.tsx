import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '@/components/ParticlesBackground';

const team = [
  { name: 'Deepak B T', role: 'Backend Engineer' },
  { name: 'Harshavardhan G', role: 'UI/UX' },
  { name: 'Praveen K', role: 'UI/UX' },
  { name: 'Sreejith S', role: 'UI/UX' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />

      {/* Hero */}
      <section className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-10 md:p-16 text-center max-w-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-primary mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Elective Selection System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-lg mb-8"
          >
            Seamlessly choose your electives with real-time seat tracking and a clean, professional interface.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/student-login')}
              className="btn-primary text-lg px-10 py-4 rounded-xl"
            >
              Student Login
            </button>
            <button
              onClick={() => navigate('/admin-login')}
              className="rounded-xl px-10 py-4 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Admin Login
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Team */}
      <section className="relative z-10 py-20 px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-primary text-center mb-12"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Meet the Team
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 text-center cursor-default"
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold text-primary-foreground"
                style={{ background: 'linear-gradient(135deg, hsl(210 70% 45%), hsl(199 70% 48%))' }}
              >
                {member.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-foreground text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-muted-foreground text-sm border-t border-border">
        © Deepak
      </footer>
    </div>
  );
}

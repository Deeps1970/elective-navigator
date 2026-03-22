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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="glass-card gradient-border p-10 md:p-16 text-center max-w-2xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold gradient-text mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Elective Selection System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-lg mb-8"
          >
            Seamlessly choose your electives with real-time seat tracking and a beautiful, modern interface.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/app')}
            className="rounded-2xl px-10 py-4 font-bold text-lg text-primary-foreground transition-all"
            style={{ background: 'linear-gradient(135deg, hsl(250 80% 65%), hsl(320 70% 60%))' }}
          >
            Explore Our Product
          </motion.button>
        </motion.div>
      </section>

      {/* Team */}
      <section className="relative z-10 py-20 px-4">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold gradient-text text-center mb-12"
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
              whileHover={{ y: -8, scale: 1.03 }}
              className="glass-card gradient-border p-6 text-center cursor-default"
            >
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-primary-foreground"
                style={{ background: 'linear-gradient(135deg, hsl(250 80% 65%), hsl(320 70% 60%))' }}
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
      <footer className="relative z-10 text-center py-8 text-muted-foreground text-sm border-t border-border/20">
        © Deepak
      </footer>
    </div>
  );
}

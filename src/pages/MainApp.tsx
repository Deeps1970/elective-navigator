import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '@/components/ParticlesBackground';
import AddStudentForm from '@/components/AddStudentForm';
import SearchStudents from '@/components/SearchStudents';

export default function MainApp() {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold gradient-text cursor-pointer"
            style={{ fontFamily: 'var(--font-display)' }}
            onClick={() => navigate('/')}
          >
            Elective Selection System
          </motion.h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <AddStudentForm onStudentAdded={() => setRefreshKey(k => k + 1)} />
          </div>
          <div className="lg:col-span-8">
            <SearchStudents refreshKey={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}

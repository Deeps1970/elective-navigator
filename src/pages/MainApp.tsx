import { useState } from 'react';
import ParticlesBackground from '@/components/ParticlesBackground';
import NavBar from '@/components/NavBar';
import AddStudentForm from '@/components/AddStudentForm';
import SearchStudents from '@/components/SearchStudents';

export default function MainApp() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />
      <NavBar />

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

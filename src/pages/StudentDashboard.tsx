import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchElectivesByBatch, getStudentEnrollment, enrollStudent, type Elective, type Enrollment } from '@/lib/supabase';
import ParticlesBackground from '@/components/ParticlesBackground';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [electives, setElectives] = useState<Elective[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [confirmElective, setConfirmElective] = useState<Elective | null>(null);

  const studentData = sessionStorage.getItem('student_data');
  const student = studentData ? JSON.parse(studentData) : null;

  useEffect(() => {
    if (!student) {
      navigate('/student-login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [electivesData, enrollmentData] = await Promise.all([
        fetchElectivesByBatch(student.batch, student.dept),
        getStudentEnrollment(student.reg_no),
      ]);
      setElectives(electivesData);
      setEnrollment(enrollmentData);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (elective: Elective) => {
    setEnrollingId(elective.elective_id);
    try {
      await enrollStudent(student.reg_no, elective.elective_id, student.batch);
      toast.success('Successfully Enrolled!');
      setConfirmElective(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('student_data');
    navigate('/');
  };

  if (!student) return null;

  const enrolledElective = enrollment
    ? electives.find(e => e.elective_id === enrollment.elective_id)
    : null;

  return (
    <div className="min-h-screen relative">
      <ParticlesBackground />

      <header className="relative z-10 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Student Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, <strong className="text-foreground">{student.name}</strong> ({student.batch})</span>
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {enrollment && enrolledElective && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8 border-l-4 border-l-primary"
          >
            <h3 className="text-lg font-bold text-primary mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Your Enrolled Elective
            </h3>
            <p className="text-foreground font-semibold text-xl">{enrolledElective.elective_name}</p>
            <p className="text-sm text-muted-foreground mt-1">Credits: {enrolledElective.credits}</p>
          </motion.div>
        )}

        <h2 className="text-2xl font-bold text-primary mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Electives for Batch {student.batch}
        </h2>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading electives...</p>
        ) : electives.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No electives available for your batch.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {electives.map((el, i) => {
              const available = el.current_count < el.max_capacity;
              const isEnrolled = enrollment?.elective_id === el.elective_id;
              return (
                <motion.div
                  key={el.elective_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 flex flex-col"
                >
                  <h3 className="text-lg font-bold text-foreground mb-2">{el.elective_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Credits:</strong> {el.credits}
                  </p>
                  {el.eligibility_criteria && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Eligibility:</strong> {el.eligibility_criteria}
                    </p>
                  )}
                  {el.syllabus_link && (
                    <a
                      href={el.syllabus_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mb-3"
                    >
                      View Syllabus →
                    </a>
                  )}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {available ? 'Available' : 'Unavailable'}
                    </span>
                    {!enrollment && available && (
                      <button
                        onClick={() => setConfirmElective(el)}
                        className="btn-primary py-2 px-4 text-sm"
                      >
                        Enroll Now
                      </button>
                    )}
                    {isEnrolled && (
                      <span className="text-sm font-semibold text-primary">✓ Enrolled</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmElective && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmElective(null)}
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-8 w-full max-w-md relative z-10 text-center"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Confirm Enrollment
              </h3>
              <p className="text-muted-foreground mb-1">
                You are about to enroll in:
              </p>
              <p className="text-lg font-semibold text-primary mb-4">{confirmElective.elective_name}</p>
              <p className="text-sm text-destructive font-medium mb-6">
                ⚠️ You cannot change this elective after confirming. Continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEnroll(confirmElective)}
                  disabled={enrollingId !== null}
                  className="flex-1 btn-primary py-3"
                >
                  {enrollingId ? 'Enrolling...' : 'Yes, Enroll'}
                </button>
                <button
                  onClick={() => setConfirmElective(null)}
                  className="flex-1 rounded-xl py-3 font-semibold border border-border text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

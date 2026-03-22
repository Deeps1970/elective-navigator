import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const links = [
  { path: '/app', label: 'Home' },
  { path: '/electives', label: 'Electives Overview' },
  { path: '/add-elective', label: 'Add Elective' },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
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
        <nav className="flex gap-1">
          {links.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={location.pathname === link.path ? { background: 'linear-gradient(135deg, hsl(250 80% 65%), hsl(320 70% 60%))' } : undefined}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

import { useNavigate, useLocation } from 'react-router-dom';

const links = [
  { path: '/app', label: 'Home' },
  { path: '/electives', label: 'Electives Overview' },
  { path: '/add-elective', label: 'Add Elective' },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    navigate('/');
  };

  return (
    <header className="relative z-10 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1
          className="text-lg font-bold text-primary cursor-pointer"
          style={{ fontFamily: 'var(--font-display)' }}
          onClick={() => navigate('/app')}
        >
          Elective Selection System
        </h1>
        <nav className="flex gap-1">
          {links.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

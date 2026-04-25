import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, BookOpen, Trophy, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { supabase } from './supabaseClient';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [role, setRole] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const userRole = session.user.user_metadata?.role;
        const email = session.user.email;
        if (userRole === 'teacher' || email.includes('teacher') || email.includes('admin')) {
          setRole('teacher');
        } else {
          setRole('student');
        }
      } else {
        setUser(null);
        setRole(null);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        const userRole = session.user.user_metadata?.role;
        const email = session.user.email;
        if (userRole === 'teacher' || email.includes('teacher') || email.includes('admin')) {
          setRole('teacher');
        } else {
          setRole('student');
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <BookOpen color="var(--primary-blue)" size={28} />
          <span>LearnU</span>
        </Link>

        <ul className="nav-links">
          {role === 'student' && (
            <>
              <li>
                <Link to="/student-landing" className={isActive('/student-landing') ? 'active' : ''}>
                  {t('testSeries')}
                </Link>
              </li>
              <li>
                <Link to="/important-questions" className={isActive('/important-questions') ? 'active' : ''}>
                  {t('Important Questions')}
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className={isActive('/leaderboard') ? 'active' : ''}>
                  {t('leaderboard')}
                </Link>
              </li>
            </>
          )}
          {role === 'teacher' && (
            <li>
              <Link to="/portal" className={isActive('/portal') ? 'active' : ''}>
                {t('Teacher Portal')}
              </Link>
            </li>
          )}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSelector />
          {user ? (
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

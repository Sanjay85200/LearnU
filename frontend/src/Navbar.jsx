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
  const [stats, setStats] = React.useState({ latestScore: null, rank: null });

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
          fetchLatestStats(session.user.id);
        }
      } else {
        setUser(null);
        setRole(null);
        setStats({ latestScore: null, rank: null });
      }
    };

    const fetchLatestStats = async (userId) => {
        const { data: results, error } = await supabase
            .from('results')
            .select('score')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(1);
        
        if (results && results.length > 0) {
            const score = results[0].score;
            const { count } = await supabase
                .from('results')
                .select('*', { count: 'exact', head: true })
                .gt('score', score);
            
            setStats({ latestScore: score, rank: (count || 0) + 1 });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" className="logo">
            <BookOpen color="var(--primary-blue)" size={28} />
            <span>LearnU</span>
          </Link>
          
          {user && (
            <div style={{ 
              fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: '500', 
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              borderLeft: '2px solid var(--bg-light)', paddingLeft: '1.5rem',
              height: '30px'
            }}>
              <User size={16} color="var(--primary-blue)" />
              <span>Hi, {user.user_metadata?.name || user.email?.split('@')[0]}</span>
            </div>
          )}
        </div>

        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
               {t('Home')}
            </Link>
          </li>
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
          {role === 'student' && stats.latestScore !== null && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              background: 'var(--secondary-blue)', padding: '0.4rem 0.8rem', 
              borderRadius: '15px', border: '1px solid var(--primary-blue)',
              fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-blue)'
            }}>
              <Trophy size={14} /> 
              <span>Latest: {stats.latestScore}</span>
              <span style={{ opacity: 0.6, margin: '0 0.2rem' }}>|</span>
              <span>Rank: #{stats.rank}</span>
            </div>
          )}
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

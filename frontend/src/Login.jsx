import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckSquare, Phone, User, Gift, ArrowRight, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import { supabase } from './supabaseClient';

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [couponKey, setCouponKey] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [teacherKey, setTeacherKey] = useState('');

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user.email_confirmed_at) {
          handleRedirect(session.user);
        } else {
          await supabase.auth.signOut();
        }
      }
    };
    checkSession();
  }, []);

  const handleRedirect = (user) => {
    const userRole = user.user_metadata?.role;
    const email = user.email;

    if (userRole === 'teacher' || email?.includes('teacher') || email?.includes('admin')) {
      navigate('/portal');
    } else {
      navigate('/student-landing');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          if (!data.user.email_confirmed_at) {
            await supabase.auth.signOut();
            throw new Error("Please verify your email before logging in.");
          }
          handleRedirect(data.user);
        }
        
      } else {
        // Teacher key validation
        if (role === 'teacher' && teacherKey !== 'LearnU1317') {
           throw new Error("Invalid Teacher Secret Key. Access denied.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: role, name: name },
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        if (data?.user) {
            const tablePath = role === 'student' ? 'students' : 'teachers';
            const { error: dbError } = await supabase.from(tablePath).upsert([{
               id: data.user.id,
               name: name || email.split('@')[0], 
               email: email,
               mobile: mobile || null,
               ...(role === 'student' ? { coupon_key: couponKey || null } : {})
            }]);
            
            if (dbError) console.warn(`Public ${tablePath} sync failed:`, dbError.message);
        }
        
        setSuccessMsg("Registration successful! Please check your email to confirm your account.");
      }
    } catch (error) {
        setErrorMsg(error.message);
    } finally {
        setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      setSuccessMsg("Password reset email sent!");
      setShowForgotPassword(false);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      background: 'var(--bg-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'white',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)'
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--primary-blue)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem'
          }}>
            <BookOpen size={32} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>LearnU</h1>
          </div>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            {showForgotPassword ? 'Reset Password' : (isLogin ? 'Sign in to your account' : 'Join our practice platform')}
          </p>
        </div>

        {/* Form Section */}
        <div style={{ padding: '2.5rem 2rem' }}>
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
              <AlertCircle size={18} /> <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
              <CheckCircle size={18} /> <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {!isLogin && !showForgotPassword && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setRole('student')}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: role === 'student' ? '2px solid var(--primary-blue)' : '1px solid #e2e8f0', background: role === 'student' ? 'var(--secondary-blue)' : 'white', fontWeight: '600', color: role === 'student' ? 'var(--primary-blue)' : '#64748b', cursor: 'pointer' }}
                  >
                    Student
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole('teacher')}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: role === 'teacher' ? '2px solid var(--primary-blue)' : '1px solid #e2e8f0', background: role === 'teacher' ? 'var(--secondary-blue)' : 'white', fontWeight: '600', color: role === 'teacher' ? 'var(--primary-blue)' : '#64748b', cursor: 'pointer' }}
                  >
                    Teacher
                  </button>
                </div>
              )}

              {!isLogin && !showForgotPassword && (
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} />
                </div>
              )}

              {!isLogin && !showForgotPassword && role === 'teacher' && (
                <div style={{ position: 'relative' }}>
                  <Gift size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="password" placeholder="Teacher Secret Key" required value={teacherKey} onChange={(e) => setTeacherKey(e.target.value)} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#fff7ed', border: '2px solid #fdba74', borderRadius: '12px', outline: 'none' }} />
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} />
              </div>
              {!showForgotPassword && (
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} />
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', height: '50px' }}>
                {loading ? 'Processing...' : showForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            {isLogin && !showForgotPassword && (
              <p style={{ fontSize: '0.875rem', color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: '600' }} onClick={() => setShowForgotPassword(true)}>Forgot Password?</p>
            )}
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem' }}>
              {showForgotPassword ? (<span onClick={() => setShowForgotPassword(false)} style={{ color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: '600' }}>Back to Login</span>) : (
                <>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span style={{ color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: '600' }} onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Sign In'}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

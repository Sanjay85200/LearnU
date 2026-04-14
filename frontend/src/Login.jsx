import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckSquare } from 'lucide-react';
import { supabase } from './supabaseClient';
import './TeacherPortal.css'; 

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [couponKey, setCouponKey] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        
        if (error) {
          // Explicitly catch the confirmation error
          if (error.message.includes('Email not confirmed')) {
              throw new Error("ERROR: Email not confirmed. Please check your email inbox to verify your account OR turn off 'Confirm Email' in your Supabase Dashboard -> Authentication -> Providers -> Email.");
          }
          throw error;
        }
        
        // Successful login, navigate to appropriate portal
        if (email.includes('teacher') || email.includes('admin')) {
          navigate('/portal');
        } else {
          navigate('/student-test');
        }
        
      } else {
        // SIGNUP FLOW
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: role }
          }
        });
        
        if (error) throw error;
        
        // Sync public tables based on strict segregation
        if (data?.user) {
            const tablePath = role === 'student' ? 'students' : 'teachers';
            const payload = {
               id: data.user.id,
               name: email.split('@')[0], 
               email: email,
               mobile: mobile || null
            };
            if (role === 'student') payload.coupon_key = couponKey || null;

            const { error: dbError } = await supabase.from(tablePath).upsert([payload]);
            
            if (dbError) {
               console.warn(`Public ${tablePath} sync failed:`, dbError.message);
            }
        }
        
        setSuccessMsg("Registration Successful! If your Supabase requires Email Confirmations, check your inbox. Otherwise, click Login below.");
        setIsLogin(true); 
      }
    } catch (error) {
       setErrorMsg(error.message);
    } finally {
       setLoading(false);
    }
  };

  const { i18n } = useTranslation();
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <div className="portal-container" style={{maxWidth: '400px', margin: '0 auto', minHeight: '100vh', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', backgroundColor: '#f0f4f8'}}>
      
      {/* Top right language toggle matching the image */}
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem'}}>
         <div className="language-toggle" style={{background: '#e2e8f0', padding: '4px', borderRadius: '20px', display: 'flex'}}>
            <button 
                onClick={() => changeLanguage('en')}
                style={{padding: '4px 12px', borderRadius: '16px', background: i18n.language === 'en' ? '#3b82f6' : 'transparent', color: i18n.language === 'en' ? 'white' : '#64748b', fontWeight: 'bold', fontSize: '0.75rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: i18n.language === 'en' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'}}
            >
                English
            </button>
            <button 
                onClick={() => changeLanguage('te')}
                style={{padding: '4px 12px', borderRadius: '16px', background: i18n.language === 'te' ? '#3b82f6' : 'transparent', color: i18n.language === 'te' ? 'white' : '#64748b', fontWeight: 'bold', fontSize: '0.75rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: i18n.language === 'te' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'}}
            >
                TE
            </button>
         </div>
      </div>

      <header style={{textAlign: 'center', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
              <div style={{background: '#3b82f6', color: 'white', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <CheckSquare size={26} strokeWidth={3} />
              </div>
              <h1 style={{fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.5px'}}>LearnU</h1>
          </div>
          <p style={{color: '#64748b', fontSize: '0.9rem', fontWeight: '500'}}>Learn & Improve Sports Knowledge</p>
      </header>

      <div style={{background: 'white', borderRadius: '24px', padding: '2rem 1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
        <h2 style={{textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.4rem', color: '#1e293b'}}>
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {errorMsg && (
          <div style={{background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: '1.4', border: '1px solid #fca5a5'}}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div style={{background: '#dcfce3', color: '#10b981', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: '1.4', border: '1px solid #86efac'}}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
          
          <div style={{position: 'relative'}}>
            <div style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex'}}>
                <Mail size={18} />
            </div>
            <input 
              type="email" 
              placeholder="Email address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{width: '100%', padding: '1rem 1rem 1rem 2.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', outline: 'none', color: '#1e293b', fontSize: '0.95rem', transition: 'border 0.2s'}}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{position: 'relative'}}>
            <div style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex'}}>
                <Lock size={18} />
            </div>
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{width: '100%', padding: '1rem 1rem 1rem 2.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', outline: 'none', color: '#1e293b', fontSize: '0.95rem', transition: 'border 0.2s'}}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {!isLogin && (
            <div style={{position: 'relative'}}>
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                required 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{width: '100%', padding: '1rem 1rem 1rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', outline: 'none', color: '#1e293b', fontSize: '0.95rem', transition: 'border 0.2s'}}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          )}

          {!isLogin && (
            <div style={{position: 'relative'}}>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                required
                style={{width: '100%', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', outline: 'none', color: '#1e293b', fontSize: '0.95rem', appearance: 'none'}}
              >
                <option value="student">{t('student')}</option>
                <option value="teacher">{t('teacher')}</option>
              </select>
            </div>
          )}

          {!isLogin && role === 'student' && (
            <div style={{position: 'relative'}}>
              <input 
                type="text" 
                placeholder="Coupon Key (Optional)" 
                value={couponKey}
                onChange={(e) => setCouponKey(e.target.value)}
                style={{width: '100%', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', outline: 'none', color: '#166534', fontSize: '0.95rem', transition: 'border 0.2s'}}
                onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                onBlur={(e) => e.target.style.borderColor = '#bbf7d0'}
              />
            </div>
          )}

          <button type="submit" disabled={loading} style={{width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '0.5rem', opacity: loading ? 0.7 : 1}}>
            {loading ? "Processing..." : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {isLogin && (
            <p style={{textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer'}}>
              Forgot Password?
            </p>
        )}

        <p style={{textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b'}}>
          {isLogin ? "Need an account? " : "Already have an account? "}
          <span 
            style={{color: '#3b82f6', cursor: 'pointer', fontWeight: '700'}}
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>
      </div>

      <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: '1rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', padding: '2rem 0 1rem 0'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
             <div style={{width: '18px', height: '18px', background: '#3b82f6', borderRadius: '50%', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.6rem'}}>en</div>
             English
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8'}}>
             Telugu
          </div>
      </div>
    </div>
  );
}

export default Login;

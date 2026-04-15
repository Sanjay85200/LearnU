import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckSquare, Phone, User, Gift, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
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
          // Handle email not confirmed error gracefully
          if (error.message.includes('Email not confirmed')) {
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email: email,
            });
            
            if (resendError) {
              throw new Error("Email not confirmed. Please check your inbox and spam folder.");
            } else {
              throw new Error("Email not confirmed. A new confirmation email has been sent. Please verify your email before logging in.");
            }
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
            data: { role: role, name: name },
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        // Sync public tables based on strict segregation
        if (data?.user) {
            const tablePath = role === 'student' ? 'students' : 'teachers';
            const payload = {
               id: data.user.id,
               name: name || email.split('@')[0], 
               email: email,
               mobile: mobile || null
            };
            if (role === 'student') payload.coupon_key = couponKey || null;

            const { error: dbError } = await supabase.from(tablePath).upsert([payload]);
            
            if (dbError) {
               console.warn(`Public ${tablePath} sync failed:`, dbError.message);
            }
        }
        
        if (data?.user?.identities?.length === 0) {
          setSuccessMsg("This email is already registered. Please login instead.");
          setTimeout(() => setIsLogin(true), 2000);
        } else {
          setSuccessMsg("Registration successful! Please check your email to confirm your account before logging in.");
        }
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
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) throw error;
      
      setSuccessMsg("Password reset email sent! Please check your inbox and follow the instructions.");
      setShowForgotPassword(false);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const { i18n } = useTranslation();
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Language Toggle */}
      <div style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          padding: '4px',
          borderRadius: '20px',
          display: 'flex',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <button 
            onClick={() => changeLanguage('en')}
            style={{
              padding: '6px 16px',
              borderRadius: '16px',
              background: i18n.language === 'en' ? 'white' : 'transparent',
              color: i18n.language === 'en' ? '#667eea' : 'white',
              fontWeight: '600',
              fontSize: '0.8rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            EN
          </button>
          <button 
            onClick={() => changeLanguage('te')}
            style={{
              padding: '6px 16px',
              borderRadius: '16px',
              background: i18n.language === 'te' ? 'white' : 'transparent',
              color: i18n.language === 'te' ? '#667eea' : 'white',
              fontWeight: '600',
              fontSize: '0.8rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            తెలుగు
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '0.6rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <CheckSquare size={28} strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              LearnU
            </h1>
          </div>
          <p style={{
            opacity: 0.9,
            fontSize: '0.95rem',
            fontWeight: '500',
            margin: 0
          }}>
            {showForgotPassword ? 'Reset Your Password' : (isLogin ? 'Welcome Back!' : 'Create Your Account')}
          </p>
        </div>

        {/* Form Section */}
        <div style={{ padding: '2.5rem 2rem' }}>
          {/* Error Message */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}
          
          {/* Success Message */}
          {successMsg && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <CheckCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Name Field (Signup only) */}
              {!isLogin && !showForgotPassword && (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                    pointerEvents: 'none'
                  }}>
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      background: '#f8fafc',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      color: '#1e293b',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              {/* Email Field */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  pointerEvents: 'none'
                }}>
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    color: '#1e293b',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password Field */}
              {!showForgotPassword && (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                    pointerEvents: 'none'
                  }}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      background: '#f8fafc',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      color: '#1e293b',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              {/* Mobile Field (Signup only) */}
              {!isLogin && !showForgotPassword && (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                    pointerEvents: 'none'
                  }}>
                    <Phone size={18} />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number" 
                    required 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      background: '#f8fafc',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      color: '#1e293b',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              {/* Role Selection (Signup only) */}
              {!isLogin && !showForgotPassword && (
                <div style={{ position: 'relative' }}>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: '#f8fafc',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      color: '#1e293b',
                      fontSize: '0.95rem',
                      appearance: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none'
                  }}>
                    <ArrowRight size={18} style={{ transform: 'rotate(90deg)' }} />
                  </div>
                </div>
              )}

              {/* Coupon Key (Student Signup only) */}
              {!isLogin && role === 'student' && !showForgotPassword && (
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                    pointerEvents: 'none'
                  }}>
                    <Gift size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Coupon Key (Optional)" 
                    value={couponKey}
                    onChange={(e) => setCouponKey(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      background: '#f0fdf4',
                      border: '2px solid #bbf7d0',
                      borderRadius: '12px',
                      outline: 'none',
                      color: '#166534',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#22c55e';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#bbf7d0';
                      e.target.style.background = '#f0fdf4';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading} 
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transform: loading ? 'scale(0.98)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : showForgotPassword ? (
                  'Send Reset Link'
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Toggle Links */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            {isLogin && !showForgotPassword && (
              <p 
                style={{
                  fontSize: '0.875rem',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: '600',
                  margin: 0,
                  padding: '0.5rem 0'
                }}
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </p>
            )}

            {showForgotPassword && (
              <p 
                style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: '1rem 0 0 0'
                }}
              >
                Remember your password?{' '}
                <span 
                  style={{
                    color: '#667eea',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                  onClick={() => {
                    setShowForgotPassword(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                >
                  Back to Login
                </span>
              </p>
            )}

            {!showForgotPassword && (
              <p 
                style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  margin: '1rem 0 0 0'
                }}
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span 
                  style={{
                    color: '#667eea',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrorMsg('');
                    setSuccessMsg('');
                    setShowForgotPassword(false);
                  }}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

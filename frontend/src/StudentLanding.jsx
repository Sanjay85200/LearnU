import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { BookOpen, Clock, Award, Play, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StudentLanding = () => {
  const { t } = useTranslation();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      const { data, error } = await supabase.from('tests').select('*');
      if (error) console.error(error);
      else setTests(data || []);
      setLoading(false);
    };
    fetchTests();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="student-landing">
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>LearnU: India's Best Practice Platform</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>Prepare for SSC, RRB, and other Competitive Exams with Real Exam Experience.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
             <button onClick={handleLogout} style={{ background: 'white', color: 'var(--danger)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={20} /> Logout
             </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem' }}>50K+</h2>
              <p>Registered Students</p>
            </div>
            <div>
              <h2 style={{ fontSize: '2rem' }}>1000+</h2>
              <p>Mock Tests</p>
            </div>
            <div>
              <h2 style={{ fontSize: '2rem' }}>24/7</h2>
              <p>Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container" style={{ padding: '3rem 0' }}>
        <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen /> {t('testSeries')}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading tests...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {tests.map((test) => (
              <div key={test.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>{test.test_name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Award size={16} /> 100 Marks</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} /> 60 Mins</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Includes full coverage of subjects with detailed analysis.</p>
                <button 
                  className="btn-primary" 
                  style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => navigate(`/student-test?testId=${test.id}`)}
                >
                  <Play size={16} /> Start Now
                </button>
              </div>
            ))}
            {tests.length === 0 && <p>No tests available at the moment. Please check back later.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentLanding;

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trophy, Medal, User, Book } from 'lucide-react';

const Leaderboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('results')
        .select(`
          score,
          date,
          students:user_id ( name ),
          tests:test_id ( test_name )
        `)
        .order('score', { ascending: false })
        .limit(20);

      if (error) {
        console.warn("Leaderboard join failed, fetching simple results:", error.message);
        // Fallback to simple query if joins are missing
        const { data: simpleData, error: simpleError } = await supabase
          .from('results')
          .select('score, date, user_id, test_id')
          .order('score', { ascending: false })
          .limit(20);
        
        if (simpleError) {
          console.error("Rank calculation failed:", simpleError.message);
        } else setResults(simpleData || []);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    };
    fetchResults();
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: 'var(--primary-blue)' }}>
          <Trophy size={40} /> Global Leaderboard
        </h1>
        <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Top performers across all test series</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading results...</div>
      ) : (
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--bg-light)' }}>
                <th style={{ padding: '1rem' }}>Rank</th>
                <th style={{ padding: '1rem' }}>Student</th>
                <th style={{ padding: '1rem' }}>Test Paper</th>
                <th style={{ padding: '1rem' }}>Score</th>
                <th style={{ padding: '1rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--bg-light)', background: idx < 3 ? 'var(--secondary-blue)' : 'transparent' }}>
                  <td style={{ padding: '1rem' }}>
                    {idx === 0 ? <Medal color="#fbbf24" /> : idx === 1 ? <Medal color="#94a3b8" /> : idx === 2 ? <Medal color="#b45309" /> : idx + 1}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} /> {res.students?.name || res.user_id?.split('-')[0] || 'Student'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-light)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Book size={16} /> {res.tests?.test_name || `Test #${res.test_id}`}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--primary-blue)' }}>{res.score}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(res.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No results yet. Be the first to take a test!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

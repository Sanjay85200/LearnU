import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient';
import LanguageSelector from './LanguageSelector';
import './TeacherPortal.css'; // Inheriting glassmorphism design

function Leaderboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // Fetch results joined with user details, ordered by highest score
                const { data, error } = await supabase
                    .from('results')
                    .select('*, students(name, email)')
                    .eq('test_id', 1)
                    .order('score', { ascending: false })
                    .limit(50);
                
                if (error) throw error;
                if (data) setLeaderboardData(data);
            } catch (err) {
                console.error("Error fetching leaderboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const renderMedal = (index) => {
        if (index === 0) return <Trophy size={24} color="#fbbf24" />; // Gold
        if (index === 1) return <Medal size={24} color="#9ca3af" />; // Silver
        if (index === 2) return <Medal size={24} color="#b45309" />; // Bronze
        return <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-muted)'}}>#{index + 1}</span>;
    };

    return (
        <div className="portal-container" style={{maxWidth: '400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '1.5rem'}}>
            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontWeight: '800', fontSize: '1.2rem', cursor: 'pointer'}} onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} /> LearnU
                </div>
            </header>

            <main style={{display: 'flex', flexDirection: 'column'}}>
                <section style={{background: 'white', borderRadius: '24px', padding: '2rem 1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', justifyContent: 'center'}}>
                        <Award size={32} color="#3b82f6" />
                        <h2 style={{margin: 0, fontSize: '1.5rem', color: '#1e293b'}}>Global Rankings</h2>
                    </div>
                    
                    <div className="glass-card form-card" style={{padding: '0', overflow: 'hidden'}}>
                        {loading ? (
                            <div style={{padding: '3rem', textAlign: 'center'}}>Loading scores...</div>
                        ) : leaderboardData.length === 0 ? (
                            <div style={{padding: '3rem', textAlign: 'center'}}>
                                <p style={{color: 'var(--text-muted)'}}>No test results exist yet.</p>
                            </div>
                        ) : (
                            <div className="leaderboard-list">
                                {leaderboardData.map((result, index) => (
                                    <div 
                                        key={result.id} 
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1.2rem 2rem',
                                            borderBottom: '1px solid var(--border-light)',
                                            background: index < 3 ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                            transition: 'background 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = index < 3 ? 'rgba(59, 130, 246, 0.05)' : 'transparent'}
                                    >
                                        <div style={{width: '60px', display: 'flex', justifyContent: 'center'}}>
                                            {renderMedal(index)}
                                        </div>
                                        
                                        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                                            <span style={{fontSize: '1.1rem', fontWeight: 'bold'}}>
                                                {result.students ? result.students.name : 'Anonymous Student'}
                                            </span>
                                            <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                                                {result.students ? result.students.email : 'No email linked'}
                                            </span>
                                        </div>

                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                                            <span style={{fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)'}}>
                                                {result.score} pts
                                            </span>
                                            <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                                                Test ID: {result.test_id}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Leaderboard;

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Bookmark, ChevronRight, CheckCircle, HelpCircle } from 'lucide-react';

const ImportantQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [visibleAnswers, setVisibleAnswers] = useState({});

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('questions').select('*').limit(50);
            if (error) console.error(error);
            else setQuestions(data || []);
            setLoading(false);
        };
        fetchQuestions();
    }, []);

    const toggleAnswer = (id) => {
        setVisibleAnswers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="container" style={{ padding: '3rem 0' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Bookmark size={32} /> Important Questions Library
                </h1>
                <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Browse and study the most frequently asked questions from competitive exams.</p>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>Loading questions...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {questions.map((q, idx) => (
                        <div key={q.id} className="card" style={{ transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ background: 'var(--secondary-blue)', color: 'var(--primary-blue)', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                    Q. {idx + 1}
                                </span>
                                <HelpCircle size={18} color="var(--text-light)" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: '600' }}>{q.question}</h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                {['option1', 'option2', 'option3', 'option4'].map((opt, i) => (
                                    <div key={i} style={{ padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                        <span style={{ fontWeight: '700', marginRight: '0.5rem', color: 'var(--primary-blue)' }}>{String.fromCharCode(65 + i)})</span>
                                        {q[opt] && q[opt].includes(' / ') && q[opt].split(' / ')[0].trim() === q[opt].split(' / ')[1].trim() 
                                          ? q[opt].split(' / ')[0].trim() 
                                          : q[opt]}
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => toggleAnswer(q.id)}
                                style={{ 
                                    background: 'none', border: `1px solid ${visibleAnswers[q.id] ? 'var(--success)' : 'var(--primary-blue)'}`, 
                                    color: visibleAnswers[q.id] ? 'var(--success)' : 'var(--primary-blue)', 
                                    padding: '0.5rem 1.2rem', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' 
                                }}
                            >
                                {visibleAnswers[q.id] ? <CheckCircle size={16} /> : <ChevronRight size={16} />}
                                {visibleAnswers[q.id] ? 'Hide Correct Answer' : 'View Correct Answer'}
                            </button>

                            {visibleAnswers[q.id] && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                                    <strong style={{ color: 'var(--success)' }}>Correct Answer: Option {q.correct_answer}</strong>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#166534' }}>Make sure to remember this for your upcoming exams!</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImportantQuestions;

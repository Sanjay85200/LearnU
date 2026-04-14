import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, CheckCircle2, MinusCircle, Circle } from 'lucide-react';
import { supabase } from './supabaseClient';
import './TeacherPortal.css'; 

function StudentPortal() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    
    const [loading, setLoading] = useState(true);
    const [testFinished, setTestFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [unansweredCount, setUnansweredCount] = useState(0);
    
    // Timer state: 30 minutes for demo
    const [timeLeft, setTimeLeft] = useState(30 * 60);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('test_id', 1)
                    .limit(20); // 20 questions for demo
                
                if (error) throw error;
                if (data) setQuestions(data);
            } catch (err) {
                console.error("Error fetching questions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (loading || testFinished) return;
        if (timeLeft <= 0) { submitTest(); return; }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, loading, testFinished]);

    const handleOptionSelect = (qId, optionLetter) => {
        setAnswers({ ...answers, [qId]: optionLetter });
    };

    const submitTest = async () => {
        setTestFinished(true);
        let calculatedScore = 0;
        let incorrect = 0;
        let unanswered = 0;

        questions.forEach(q => {
            if (!answers[q.id]) {
                unanswered += 1;
            } else if (answers[q.id].toUpperCase() === q.correct_answer.toUpperCase()) {
                calculatedScore += 1;
            } else {
                incorrect += 1;
            }
        });
        setScore(calculatedScore);
        setWrongCount(incorrect);
        setUnansweredCount(unanswered);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('results').insert([{
                    user_id: user.id,
                    test_id: 1,
                    score: calculatedScore
                }]);
            }
        } catch (e) {
            console.error("Could not save score to DB", e);
        }
    };

    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Render Language Toggle (Universal)
    const renderLangToggle = () => (
         <div className="language-toggle" style={{background: '#e2e8f0', padding: '4px', borderRadius: '20px', display: 'flex'}}>
            <button 
                onClick={() => changeLanguage('en')}
                style={{padding: '4px 12px', borderRadius: '16px', background: i18n.language === 'en' ? '#3b82f6' : 'transparent', color: i18n.language === 'en' ? 'white' : '#64748b', fontWeight: 'bold', fontSize: '0.75rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: i18n.language === 'en' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'}}
            >
                EN
            </button>
            <button 
                onClick={() => changeLanguage('te')}
                style={{padding: '4px 12px', borderRadius: '16px', background: i18n.language === 'te' ? '#3b82f6' : 'transparent', color: i18n.language === 'te' ? 'white' : '#64748b', fontWeight: 'bold', fontSize: '0.75rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: i18n.language === 'te' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'}}
            >
                TE
            </button>
         </div>
    );

    if (loading) {
        return <div className="portal-container" style={{display: 'flex', justifyContent: 'center', marginTop: '20vh', backgroundColor: '#f0f4f8', minHeight: '100vh'}}><h2>Loading Quiz...</h2></div>;
    }

    if (testFinished) {
        const percentage = Math.round((score / questions.length) * 100) || 0;
        
        return (
            <div className="portal-container" style={{maxWidth: '400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '1.5rem'}}>
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                    <h2 style={{fontSize: '1.2rem', color: '#1e293b', margin: 0, fontWeight: '700'}}>Results</h2>
                    {renderLangToggle()}
                </header>

                <div style={{background: 'white', borderRadius: '24px', padding: '2.5rem 1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    
                    {/* CSS Circular Progress Ring */}
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%', 
                        background: `conic-gradient(#10b981 ${percentage}%, #e2e8f0 ${percentage}%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                    }}>
                        <div style={{width: '96px', height: '96px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                             <h2 style={{fontSize: '2rem', margin: 0, color: '#1e293b'}}>{score}<span style={{fontSize: '1.2rem', color: '#94a3b8'}}>/{questions.length}</span></h2>
                        </div>
                    </div>

                    <h2 style={{fontSize: '1.5rem', color: '#1e293b', marginBottom: '2rem'}}>Congratulations!</h2>

                    <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '12px'}}>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', color: '#475569'}}><CheckCircle2 color="#10b981" /> <span>Correct</span></div>
                            <span style={{fontWeight: '700'}}>{score}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '12px'}}>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', color: '#475569'}}><MinusCircle color="#ef4444" /> <span>Wrong</span></div>
                            <span style={{fontWeight: '700'}}>{wrongCount}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: '12px'}}>
                            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', color: '#475569'}}><Circle color="#94a3b8" /> <span>Unanswered</span></div>
                            <span style={{fontWeight: '700'}}>{unansweredCount}</span>
                        </div>
                    </div>

                    <div style={{width: '100%', marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        <button className="btn-primary" onClick={() => navigate('/leaderboard')}>View Global Leaderboard</button>
                        <button className="btn-secondary" style={{background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b'}} onClick={() => navigate('/login')}>Go to Home</button>
                    </div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return <div className="portal-container" style={{textAlign: 'center', marginTop: '20vh'}}><h2>No Questions Found</h2><p>Tell your teacher to upload physical education questions!</p></div>;
    }

    const currentQuestion = questions[currentIdx];

    // Splitting question_en and question_te safely 
    const qParts = currentQuestion.question.split('\n');
    const qEn = qParts[0];
    const qTe = qParts[1] ? qParts[1].replace(/[()]/g, '') : ''; // Remove literal parenthesis from db mapping

    return (
        <div className="portal-container" style={{maxWidth: '400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '1.5rem'}}>
            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', fontWeight: '800', fontSize: '1.2rem', cursor: 'pointer'}} onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} /> Quiz
                </div>
                {renderLangToggle()}
            </header>

            {/* Pagination dots (simplified) */}
            <div style={{display: 'flex', gap: '6px', justifyContent: 'flex-start', marginLeft: '2rem', marginBottom: '1.5rem'}}>
                {questions.slice(0, 5).map((q, i) => (
                    <div key={i} style={{width: '8px', height: '8px', borderRadius: '50%', background: i === currentIdx ? '#3b82f6' : '#cbd5e1'}}></div>
                 ))}
                 {questions.length > 5 && <div style={{width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1'}}></div>}
            </div>

            <main style={{background: 'white', borderRadius: '24px', padding: '2rem 1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
                
                <h2 style={{fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem', lineHeight: '1.5', fontWeight: '700'}}>
                    {qEn}
                </h2>
                {qTe && <p style={{color: '#64748b', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5'}}>{qTe}</p>}
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1}}>
                    {['A', 'B', 'C', 'D'].map((optLetter, idx) => {
                        const optionText = currentQuestion[`option${idx + 1}`];
                        const isSelected = answers[currentQuestion.id] === optLetter;
                        
                        return (
                            <div 
                                key={optLetter}
                                onClick={() => handleOptionSelect(currentQuestion.id, optLetter)}
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '16px',
                                    background: isSelected ? '#3b82f6' : 'transparent',
                                    border: `1px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`,
                                    color: isSelected ? 'white' : '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                                }}
                            >
                                <div style={{
                                    width: '26px', height: '26px', 
                                    borderRadius: '50%', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                    color: isSelected ? 'white' : '#94a3b8',
                                    fontSize: '0.85rem',
                                    fontWeight: '800'
                                }}>
                                    {optLetter}
                                </div>
                                <span style={{fontSize: '1rem', fontWeight: '500'}}>{optionText}</span>
                            </div>
                        );
                    })}
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span style={{fontSize: '0.8rem', color: '#64748b', fontWeight: '600'}}>Question {currentIdx + 1}/{questions.length}</span>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.3rem', color: timeLeft < 300 ? '#ef4444' : '#1e293b', fontWeight: '700'}}>
                            <Clock size={16} /> {formatTime(timeLeft)}
                        </div>
                    </div>
                    
                    {currentIdx < questions.length - 1 ? (
                        <button 
                            className="btn-primary" 
                            style={{width: '120px', margin: 0}}
                            onClick={() => setCurrentIdx(prev => prev + 1)}
                        >
                            Next
                        </button>
                    ) : (
                        <button 
                            className="btn-save" 
                            style={{width: '120px', margin: 0, background: '#10b981'}}
                            onClick={submitTest}
                        >
                            Submit
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

export default StudentPortal;

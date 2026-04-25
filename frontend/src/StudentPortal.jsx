import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Circle, Save } from 'lucide-react';
import { supabase } from './supabaseClient';

function StudentPortal() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const testId = queryParams.get('testId') || 1;

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [testFinished, setTestFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 1 hour default
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('test_id', testId);
        if (error) throw error;
        setQuestions(data || []);
      } catch (err) {
        console.error("Error fetching questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId]);

  useEffect(() => {
    if (loading || testFinished || questions.length === 0) return;
    if (timeLeft <= 0) { submitTest(); return; }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, loading, testFinished, questions]);

  const handleOptionSelect = (qId, optionLetter) => {
    setAnswers({ ...answers, [qId]: optionLetter });
  };

  const submitTest = async () => {
    setTestFinished(true);
    let calculatedScore = 0;
    questions.forEach(q => {
      if (answers[q.id]?.toUpperCase() === q.correct_answer.toUpperCase()) {
        calculatedScore += 1;
      }
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('results').insert([{
          user_id: user.id,
          test_id: testId,
          score: calculatedScore
        }]);

        // Fetch rank
        const { count, error: rankError } = await supabase
          .from('results')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', testId)
          .gt('score', calculatedScore);
        
        if (!rankError) {
          setUserRank((count || 0) + 1);
        } else {
          console.warn("Rank calculation failed:", rankError.message);
          setUserRank("Available on Leaderboard");
        }
      }
    } catch (e) {
      console.error("Could not save score to DB", e);
      setUserRank("Available on Leaderboard");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><h2>Loading Test...</h2></div>;

  if (testFinished) {
    const score = questions.reduce((acc, q) => answers[q.id]?.toUpperCase() === q.correct_answer.toUpperCase() ? acc + 1 : acc, 0);
    const incorrect = Object.keys(answers).length - score;
    const skipped = questions.length - Object.keys(answers).length;

    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>LearnU Exam Result</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '10px' }}>
              <CheckCircle2 color="var(--success)" />
              <h3 style={{ fontSize: '1.5rem' }}>{score}</h3>
              <p style={{ fontSize: '0.8rem' }}>Correct</p>
            </div>
            <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '10px' }}>
              <XCircle color="var(--danger)" />
              <h3 style={{ fontSize: '1.5rem' }}>{incorrect}</h3>
              <p style={{ fontSize: '0.8rem' }}>Incorrect</p>
            </div>
            <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '10px' }}>
              <Circle color="var(--text-light)" />
              <h3 style={{ fontSize: '1.5rem' }}>{skipped}</h3>
              <p style={{ fontSize: '0.8rem' }}>Skipped</p>
            </div>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your Score: <strong>{score} / {questions.length}</strong></p>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Percentage: <strong>{Math.round((score / questions.length) * 100)}%</strong></p>
            {userRank && (
              <p style={{ fontSize: '1.5rem', color: 'var(--primary-blue)', fontWeight: '800' }}>
                Your Rank: #{userRank}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
            <button className="btn-secondary" onClick={() => navigate('/student-landing')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return <div style={{ textAlign: 'center', padding: '5rem' }}><h2>No questions found for this test.</h2></div>;

  const currentQuestion = questions[currentIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)' }}>
      {/* Test Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--primary-blue)' }}>LearnU Online Exam</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary-blue)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: '700', color: timeLeft < 300 ? 'var(--danger)' : 'var(--primary-blue)' }}>
            <Clock size={18} /> {formatTime(timeLeft)}
          </div>
          <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={submitTest}>Submit Test</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Question Area */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: '700' }}>Question {currentIdx + 1}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.94rem' }}>Marks: +1.0</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '2rem' }}>{currentQuestion.question}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['A', 'B', 'C', 'D'].map((letter, idx) => {
                const isSelected = answers[currentQuestion.id] === letter;
                return (
                  <div 
                    key={letter}
                    onClick={() => handleOptionSelect(currentQuestion.id, letter)}
                    style={{
                      padding: '1rem 1.5rem',
                      border: `2px solid ${isSelected ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      background: isSelected ? 'var(--secondary-blue)' : 'var(--white)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--primary-blue)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700',
                      background: isSelected ? 'var(--primary-blue)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--primary-blue)'
                    }}>
                      {letter}
                    </div>
                    <span>
                      {currentQuestion[`option${idx + 1}`] && currentQuestion[`option${idx + 1}`].includes(' / ') && currentQuestion[`option${idx + 1}`].split(' / ')[0].trim() === currentQuestion[`option${idx + 1}`].split(' / ')[1].trim()
                        ? currentQuestion[`option${idx + 1}`].split(' / ')[0].trim()
                        : currentQuestion[`option${idx + 1}`]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="btn-secondary" 
                disabled={currentIdx === 0} 
                onClick={() => setCurrentIdx(prev => prev - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ChevronLeft size={18} /> Previous
              </button>
              <button 
                className="btn-primary" 
                onClick={() => currentIdx < questions.length - 1 ? setCurrentIdx(prev => prev + 1) : submitTest()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {currentIdx < questions.length - 1 ? 'Next' : 'Submit'} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div style={{ width: '300px', background: 'var(--white)', borderLeft: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4>Question Palette</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = currentIdx === idx;
              return (
                <div 
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '5px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontWeight: '600',
                    background: isCurrent ? 'var(--primary-blue)' : isAnswered ? 'var(--success)' : 'var(--bg-light)',
                    color: isCurrent || isAnswered ? 'white' : 'var(--text-dark)',
                    border: isCurrent ? 'none' : `1px solid var(--border-color)`
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: 'auto', fontSize: '0.85rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ width: '15px', height: '15px', background: 'var(--success)', borderRadius: '3px' }}></div>
                Answered
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ width: '15px', height: '15px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '3px' }}></div>
                Not Answered
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '15px', height: '15px', background: 'var(--primary-blue)', borderRadius: '3px' }}></div>
                Current
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentPortal;

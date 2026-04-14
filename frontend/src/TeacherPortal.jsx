import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { supabase } from './supabaseClient';
import './TeacherPortal.css'; 

function TeacherPortal() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [questionType, setQuestionType] = useState('standard'); 
    
    // Form fields mapped to user's schema
    const [question, setQuestion] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [option4, setOption4] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // First ensure we have a demo test ID=1
            await supabase.from('tests').insert({
                id: 1, test_name: 'Physical Education Demo Test'
            }).select(); // Fails silently if ID 1 already exists due to conflict, which is fine for demo

            // Insert question into Supabase
            const { error } = await supabase.from('questions').insert([{
                test_id: 1,
                question: question,
                question_type: questionType,
                option1: option1,
                option2: option2,
                option3: option3,
                option4: option4,
                correct_answer: correctAnswer
            }]);

            if (error) throw error;
            alert("Question successfully saved to Supabase!");
            
            // Clear standard fields
            setQuestion(''); setOption1(''); setOption2(''); setOption3(''); setOption4(''); setCorrectAnswer('');
        } catch (err) {
            alert("Error saving question: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portal-container">
            <header className="portal-header">
                <div className="logo-area">
                    <h1>{t('appTitle')}</h1>
                    <span className="badge">{t('teacherPortal')}</span>
                </div>
                <div className="header-actions">
                    <LanguageSelector />
                    <button className="btn-secondary" onClick={() => navigate('/leaderboard')}>Results Dashboard</button>
                    <button className="btn-primary">{t('createNewTest')}</button>
                    <div className="profile-circle">T</div>
                </div>
            </header>

            <main className="portal-main">
                <section className="upload-section">
                    <h2><PlusCircle size={20} /> {t('addNewQuestion')}</h2>
                    
                    <div className="glass-card form-card">
                        <div className="form-group">
                            <label>{t('questionType')}</label>
                            <select 
                                value={questionType} 
                                onChange={(e) => setQuestionType(e.target.value)}
                                className="styled-select"
                            >
                                <option value="standard">{t('standardMCQ')}</option>
                                <option value="matching">{t('matchList')}</option>
                                <option value="multiple_codes">{t('multipleCodes')}</option>
                            </select>
                        </div>

                        <div className="form-group w-full">
                            <label>{t('questionContext')}</label>
                            <textarea 
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={t('contextPlaceholder')} 
                                rows="3"
                                className="styled-textarea"
                            />
                        </div>

                        {/* List-I / List-II Visual Demo */}
                        {questionType === 'matching' && (
                            <div className="matching-lists">
                                <div className="list-box">
                                    <h3>List-I</h3>
                                    <input type="text" placeholder="i) Gully" />
                                    <input type="text" placeholder="ii) Pivot" />
                                </div>
                                <div className="list-box">
                                    <h3>List-II</h3>
                                    <input type="text" placeholder="1. Cricket" />
                                    <input type="text" placeholder="2. Basket ball" />
                                </div>
                            </div>
                        )}

                        <div className="codes-section">
                            <label>{t('answerOptions')}</label>
                            <div className="options-grid">
                                <div className="code-option">
                                    <span className="option-label">A)</span>
                                    <input type="text" value={option1} onChange={(e) => setOption1(e.target.value)} placeholder="Option 1" />
                                </div>
                                <div className="code-option">
                                    <span className="option-label">B)</span>
                                    <input type="text" value={option2} onChange={(e) => setOption2(e.target.value)} placeholder="Option 2" />
                                </div>
                                <div className="code-option">
                                    <span className="option-label">C)</span>
                                    <input type="text" value={option3} onChange={(e) => setOption3(e.target.value)} placeholder="Option 3" />
                                </div>
                                <div className="code-option">
                                    <span className="option-label">D)</span>
                                    <input type="text" value={option4} onChange={(e) => setOption4(e.target.value)} placeholder="Option 4" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-group" style={{marginTop: '1.5rem'}}>
                            <label>Correct Answer Letter</label>
                            <input type="text" maxLength="1" className="styled-select" placeholder="A, B, C, or D" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value.toUpperCase())} />
                        </div>

                        <div className="form-actions">
                            <button className="btn-save" onClick={handleSave} disabled={loading}>
                                {loading ? "Saving to Supabase..." : t('saveQuestion')}
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default TeacherPortal;

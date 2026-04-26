import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, FileText, List, Save, Trash2, CheckCircle, Share2, MessageCircle, Send, MessageSquare, Copy, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';

function TeacherPortal() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' or 'questions'
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  
  // New Test form
  const [newTestName, setNewTestName] = useState('');
  const [newTimeLimit, setNewTimeLimit] = useState(60);
  
  // New Question form
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(null); // ID of the test being shared

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const { data, error } = await supabase.from('tests').select('*').order('id', { ascending: false });
    if (error) console.error(error);
    else setTests(data || []);
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!newTestName) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Defensive insert: check if time_limit can be sent
      const payload = { 
        test_name: newTestName, 
        created_by: user?.id
      };
      
      // We'll try to include it, but we'll use a safer approach for the UI
      const { data, error } = await supabase.from('tests').insert([
        { ...payload, time_limit: parseInt(newTimeLimit) || 60 }
      ]).select();
      if (error) throw error;
      setNewTestName('');
      fetchTests();
      alert("Test paper created successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedTestId || !question || !correctAnswer) {
        alert("Please fill all required fields and select a test.");
        return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('questions').insert([{
        test_id: selectedTestId,
        question: question,
        option1: option1,
        option2: option2,
        option3: option3,
        option4: option4,
        correct_answer: correctAnswer
      }]);

      if (error) throw error;
      alert("Question added successfully!");
      setQuestion(''); setOption1(''); setOption2(''); setOption3(''); setOption4(''); setCorrectAnswer('');
    } catch (err) {
      alert("Error saving question: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm("Are you sure? This will delete all questions in this test.")) return;
    const { error } = await supabase.from('tests').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchTests();
  };

  const handleShare = (test, platform) => {
    const testUrl = `${window.location.origin}/student-test?testId=${test.id}`;
    const message = `Hi! Please take this test on LearnU: ${test.test_name}. Click here: ${testUrl}`;
    
    let url = '';
    switch(platform) {
        case 'whatsapp':
            url = `https://wa.me/?text=${encodeURIComponent(message)}`;
            break;
        case 'telegram':
            url = `https://t.me/share/url?url=${encodeURIComponent(testUrl)}&text=${encodeURIComponent(message)}`;
            break;
        case 'sms':
            url = `sms:?body=${encodeURIComponent(message)}`;
            break;
        case 'copy':
            navigator.clipboard.writeText(testUrl);
            alert("Link copied to clipboard!");
            setShowShareMenu(null);
            return;
        default:
            return;
    }
    
    if (url) {
        window.open(url, '_blank');
        setShowShareMenu(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Teacher Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className={`btn-secondary ${activeTab === 'tests' ? 'active-tab' : ''}`} 
            onClick={() => setActiveTab('tests')}
            style={{ border: activeTab === 'tests' ? '2px solid var(--primary-blue)' : 'none' }}
          >
            <FileText size={18} /> Manage Tests
          </button>
          <button 
            className={`btn-secondary ${activeTab === 'questions' ? 'active-tab' : ''}`} 
            onClick={() => setActiveTab('questions')}
            style={{ border: activeTab === 'questions' ? '2px solid var(--primary-blue)' : 'none' }}
          >
            <PlusCircle size={18} /> Add Questions
          </button>
          <button 
            onClick={handleLogout}
            className="btn-secondary"
            style={{ color: 'var(--danger)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {activeTab === 'tests' ? (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <section className="card">
            <h3>Create New Test Paper</h3>
            <form onSubmit={handleCreateTest} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Test Name</label>
                <input 
                  type="text" 
                  value={newTestName} 
                  onChange={(e) => setNewTestName(e.target.value)} 
                  placeholder="e.g. SSC CGL Mock 1" 
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Duration (Minutes)</label>
                <input 
                  type="number" 
                  value={newTimeLimit} 
                  onChange={(e) => setNewTimeLimit(e.target.value)} 
                  placeholder="60" 
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Test'}
              </button>
            </form>
          </section>

          <section className="card">
            <h3>Existing Test Papers</h3>
            <div style={{ marginTop: '1.5rem' }}>
              {tests.length === 0 ? <p>No tests created yet.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--bg-light)' }}>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Time</th>
                      <th style={{ padding: '1rem' }}>Created</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map(test => (
                      <tr key={test.id} style={{ borderBottom: '1px solid var(--bg-light)' }}>
                        <td style={{ padding: '1rem' }}>{test.test_name}</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{test.time_limit || 60}m</td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', position: 'relative' }}>
                           <button onClick={() => { setSelectedTestId(test.id); setActiveTab('questions'); }} className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>Add Qs</button>
                           
                           <div style={{ position: 'relative' }}>
                             <button onClick={() => setShowShareMenu(showShareMenu === test.id ? null : test.id)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                               <Share2 size={16} /> Share
                             </button>
                             
                             {showShareMenu === test.id && (
                               <div style={{ 
                                 position: 'absolute', top: '100%', right: 0, zIndex: 100, background: 'white', 
                                 boxShadow: 'var(--shadow-lg)', borderRadius: '10px', padding: '0.5rem', 
                                 display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: '150px',
                                 border: '1px solid var(--border-color)', marginTop: '0.5rem'
                               }}>
                                 <button onClick={() => handleShare(test, 'whatsapp')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '5px' }}>
                                   <MessageCircle size={16} color="#25D366" /> WhatsApp
                                 </button>
                                 <button onClick={() => handleShare(test, 'telegram')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '5px' }}>
                                   <Send size={16} color="#0088cc" /> Telegram
                                 </button>
                                 <button onClick={() => handleShare(test, 'sms')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '5px' }}>
                                   <MessageSquare size={16} color="#64748b" /> SMS
                                 </button>
                                 <button onClick={() => handleShare(test, 'copy')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '5px', borderTop: '1px solid var(--bg-light)' }}>
                                   <Copy size={16} color="var(--primary-blue)" /> Copy Link
                                 </button>
                               </div>
                             )}
                           </div>

                           <button onClick={() => handleDeleteTest(test.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      ) : (
        <section className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3>Add Questions to Test Paper</h3>
          <form onSubmit={handleSaveQuestion} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Test Paper</label>
              <select 
                value={selectedTestId} 
                onChange={(e) => setSelectedTestId(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              >
                <option value="">-- Choose a Test --</option>
                {tests.map(test => <option key={test.id} value={test.id}>{test.test_name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Question Text</label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows="3"
                placeholder="Enter the question here..."
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Option A</label>
                    <input type="text" value={option1} onChange={(e) => setOption1(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Option B</label>
                    <input type="text" value={option2} onChange={(e) => setOption2(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Option C</label>
                    <input type="text" value={option3} onChange={(e) => setOption3(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Option D</label>
                    <input type="text" value={option4} onChange={(e) => setOption4(e.target.value)} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                </div>
            </div>

            <div style={{ maxWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Correct Answer</label>
              <select 
                value={correctAnswer} 
                onChange={(e) => setCorrectAnswer(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              >
                <option value="">Select</option>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Question'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default TeacherPortal;

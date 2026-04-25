import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import TeacherPortal from './TeacherPortal';
import StudentPortal from './StudentPortal';
import StudentLanding from './StudentLanding';
import ImportantQuestions from './ImportantQuestions';
import Leaderboard from './Leaderboard';
import Login from './Login';
import './i18n'; // Initialize i18n

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<TeacherPortal />} />
          <Route path="/student-landing" element={<StudentLanding />} />
          <Route path="/important-questions" element={<ImportantQuestions />} />
          <Route path="/student-test" element={<StudentPortal />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

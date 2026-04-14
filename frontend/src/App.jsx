import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeacherPortal from './TeacherPortal';
import StudentPortal from './StudentPortal';
import Leaderboard from './Leaderboard';
import Login from './Login';
import BottomNav from './BottomNav';
import './i18n'; // Initialize i18n

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<TeacherPortal />} />
          <Route path="/student-test" element={<StudentPortal />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;

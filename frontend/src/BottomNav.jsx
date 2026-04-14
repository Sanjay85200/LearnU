import React from 'react';
import { Home, User, MessageSquare, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide bottom nav on login page to match image exactly
    if (location.pathname === '/login' || location.pathname === '/') return null;

    return (
        <div className="bottom-nav">
            <div 
                className={`nav-item ${location.pathname.includes('portal') || location.pathname.includes('leaderboard') ? 'active' : ''}`}
                onClick={() => navigate('/portal')}
            >
                <Home size={24} />
            </div>
            <div className="nav-item">
                <User size={24} />
            </div>
            <div className="nav-item">
                <MessageSquare size={24} />
            </div>
            <div className="nav-item">
                <Menu size={24} />
            </div>
        </div>
    );
}

export default BottomNav;

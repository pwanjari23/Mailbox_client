import React from 'react';
import { Card, Button } from 'react-bootstrap';

const Welcome = ({ onLogout }) => {
  const userEmail = localStorage.getItem('userEmail') || 'User';

  const handleLogoutClick = () => {
    // Clear tokens
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');

    // Notify parent
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <Card className="signup-card w-100 text-center" style={{ maxWidth: '500px' }}>
      <Card.Body className="p-0 py-4">
        {/* Modern inbox/mailbox icon */}
        <div className="mb-4 text-center">
          <div 
            className="d-inline-flex align-items-center justify-content-center bg-indigo-soft rounded-circle" 
            style={{ 
              width: '80px', 
              height: '80px', 
              background: 'rgba(99, 102, 241, 0.15)',
              border: '2px dashed rgba(99, 102, 241, 0.3)'
            }}
          >
            <i className="bi bi-envelope-paper-fill" style={{ fontSize: '2.5rem', color: '#818cf8' }}></i>
          </div>
        </div>

        {/* Welcome titles */}
        <h1 className="signup-title mb-3" style={{ fontSize: '2.25rem' }}>
          Welcome to your mail box
        </h1>
        
        <p className="signup-subtitle mb-4 px-3" style={{ fontSize: '1rem', color: '#cbd5e1' }}>
          Logged in as <strong style={{ color: '#a5b4fc' }}>{userEmail}</strong>. This is your personal mailbox client dashboard.
        </p>

        {/* Logout button */}
        <Button 
          variant="outline-danger" 
          onClick={handleLogoutClick}
          className="px-4 py-2"
          style={{ 
            borderRadius: '0.75rem', 
            fontWeight: '600',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            color: '#fca5a5'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Log Out
        </Button>
      </Card.Body>
    </Card>
  );
};

export default Welcome;

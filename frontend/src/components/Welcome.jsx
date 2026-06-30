import React, { useState } from 'react';
import { Container, Row, Col, ListGroup, Card, Button } from 'react-bootstrap';
import ComposeMail from './ComposeMail';

const Welcome = ({ onLogout }) => {
  const userEmail = localStorage.getItem('userEmail') || 'User';
  
  // Dashboard internal views: 'dashboard' | 'compose'
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <Container fluid className="px-0" style={{ minHeight: '100vh', width: '100vw' }}>
      <Row className="g-0 min-vh-100">
        {/* Left Sidebar */}
        <Col xs={12} md={3} lg={2} className="d-flex flex-column p-3 border-end" style={{ background: '#111827', borderColor: 'rgba(255,255,255,0.05) !important' }}>
          <div className="d-flex align-items-center mb-4 px-2">
            <i className="bi bi-envelope-open-fill text-primary me-2" style={{ fontSize: '1.5rem', color: '#818cf8' }}></i>
            <span className="fs-5 fw-bold signup-title">MailBox</span>
          </div>

          <ListGroup variant="flush" className="flex-grow-1" style={{ background: 'transparent' }}>
            <ListGroup.Item 
              action 
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              style={{
                background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'dashboard' ? '#a5b4fc' : '#94a3b8',
                border: 'none',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: activeTab === 'dashboard' ? '600' : '400',
              }}
              className="d-flex align-items-center py-2.5 px-3"
            >
              <i className="bi bi-speedometer2 me-3" style={{ fontSize: '1.2rem' }}></i>
              Dashboard
            </ListGroup.Item>

            <ListGroup.Item 
              action 
              active={activeTab === 'compose'}
              onClick={() => setActiveTab('compose')}
              style={{
                background: activeTab === 'compose' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'compose' ? '#a5b4fc' : '#94a3b8',
                border: 'none',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: activeTab === 'compose' ? '600' : '400',
              }}
              className="d-flex align-items-center py-2.5 px-3"
            >
              <i className="bi bi-pencil-square me-3" style={{ fontSize: '1.2rem' }}></i>
              Compose
            </ListGroup.Item>
          </ListGroup>

          {/* User profile and Log Out at the bottom of the sidebar */}
          <div className="mt-auto border-top pt-3" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
            <div className="mb-2 px-2 text-truncate" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              <i className="bi bi-person-circle me-2 text-indigo"></i>
              {userEmail}
            </div>
            <Button 
              variant="outline-danger" 
              onClick={handleLogoutClick}
              size="sm"
              className="w-100 py-2 d-flex align-items-center justify-content-center"
              style={{ 
                borderRadius: '0.5rem', 
                fontWeight: '600',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5'
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Log Out
            </Button>
          </div>
        </Col>

        {/* Right Content Area */}
        <Col xs={12} md={9} lg={10} className="d-flex align-items-center justify-content-center p-4 p-md-5" style={{ background: '#090d16' }}>
          {activeTab === 'dashboard' && (
            <Card className="signup-card w-100 text-center" style={{ maxWidth: '500px' }}>
              <Card.Body className="p-0 py-4">
                <div className="mb-4 text-center">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle" 
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

                <h1 className="signup-title mb-3" style={{ fontSize: '2.25rem' }}>
                  Welcome to your mail box
                </h1>
                
                <p className="signup-subtitle mb-4 px-3" style={{ fontSize: '1rem', color: '#cbd5e1' }}>
                  This is your personal secure mailbox dashboard. Select an option from the sidebar to compose, read, or manage your emails.
                </p>

                <Button 
                  variant="primary" 
                  onClick={() => setActiveTab('compose')}
                  className="btn-primary-custom py-2.5 px-4"
                  style={{ width: 'auto', borderRadius: '0.75rem' }}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Compose Your First Email
                </Button>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'compose' && (
            <ComposeMail />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Welcome;

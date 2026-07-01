import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, ListGroup, Button, Badge } from 'react-bootstrap';
import ComposeMail from './ComposeMail';
import InboxList from './InboxList';

const Welcome = ({ onLogout }) => {
  const userEmail = localStorage.getItem('userEmail') || 'User';
  
  // Read unreadCount from Redux Store
  const unreadCount = useSelector(state => state.mail.unreadCount);
  
  // Dashboard internal views: 'inbox' (default!) | 'compose' | 'sent'
  const [activeTab, setActiveTab] = useState('inbox');

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

          {/* Sidebar Tabs */}
          <ListGroup variant="flush" className="flex-grow-1" style={{ background: 'transparent' }}>
            {/* Inbox Tab */}
            <ListGroup.Item 
              action 
              active={activeTab === 'inbox'}
              onClick={() => setActiveTab('inbox')}
              style={{
                background: activeTab === 'inbox' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'inbox' ? '#a5b4fc' : '#94a3b8',
                border: 'none',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: activeTab === 'inbox' ? '600' : '400',
              }}
              className="d-flex align-items-center py-2.5 px-3"
            >
              <i className="bi bi-inbox-fill me-3" style={{ fontSize: '1.2rem' }}></i>
              <span className="me-2">Inbox</span>
              {unreadCount > 0 && (
                <Badge 
                  bg="primary" 
                  pill 
                  className="ms-auto" 
                  style={{ fontSize: '0.75rem', padding: '0.25em 0.6em', background: '#3b82f6 !important' }}
                >
                  {unreadCount}
                </Badge>
              )}
            </ListGroup.Item>

            {/* Compose Tab */}
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

            {/* Sent Tab */}
            <ListGroup.Item 
              action 
              active={activeTab === 'sent'}
              onClick={() => setActiveTab('sent')}
              style={{
                background: activeTab === 'sent' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'sent' ? '#a5b4fc' : '#94a3b8',
                border: 'none',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                fontWeight: activeTab === 'sent' ? '600' : '400',
              }}
              className="d-flex align-items-center py-2.5 px-3"
            >
              <i className="bi bi-send-fill me-3" style={{ fontSize: '1.2rem' }}></i>
              Sent Mail
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
        <Col xs={12} md={9} lg={10} className="d-flex align-items-start justify-content-center p-4 p-md-5 overflow-auto" style={{ background: '#090d16', maxHeight: '100vh' }}>
          <div className="w-100 d-flex justify-content-center pt-2">
            {activeTab === 'inbox' && (
              <InboxList />
            )}

            {activeTab === 'compose' && (
              <ComposeMail />
            )}

            {activeTab === 'sent' && (
              <InboxList mode="sent" />
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Welcome;

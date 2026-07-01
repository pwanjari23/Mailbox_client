import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ListGroup, Card, Alert, Spinner, Modal, Button, Badge } from 'react-bootstrap';
import { mailActions } from '../store/mail-slice';

const InboxList = ({ mode = 'inbox' }) => {
  const dispatch = useDispatch();
  
  // Read emails from Redux Store
  const emails = useSelector(state => mode === 'sent' ? state.mail.sentEmails : state.mail.receivedEmails);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Selected email for detail modal
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Session token not found. Please login.');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const endpoint = mode === 'sent' ? 'sent' : 'inbox';
      const response = await fetch(`${apiUrl}/emails/${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to retrieve ${mode} emails.`);
      }

      // Store in Redux (which also calculates the unread count in real-time)
      if (mode === 'sent') {
        dispatch(mailActions.setSentEmails(data.emails || []));
      } else {
        dispatch(mailActions.setReceivedEmails(data.emails || []));
      }
    } catch (err) {
      console.error('Inbox fetch error:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [mode]);

  const handleRowClick = async (email) => {
    setSelectedEmail(email);
    setShowModal(true);

    if (mode === 'inbox' && !email.isRead) {
      // 1. Instantly mark as read in Redux store
      dispatch(mailActions.markEmailAsRead(email.id));

      // 2. Mark as read on backend persistence
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          await fetch(`${apiUrl}/emails/${email.id}/read`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      } catch (err) {
        console.error('Error marking email as read in DB:', err);
      }
    }
  };

  const handleDeleteClick = async (e, emailId) => {
    e.stopPropagation(); // Stop row click from opening details modal
    
    // 1. Optimistically delete from Redux store for instant feedback
    dispatch(mailActions.deleteEmail(emailId));

    // 2. Call backend DELETE API
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/emails/${emailId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete email from database');
        }
      }
    } catch (err) {
      console.error('Error deleting email:', err);
      setErrorMsg(err.message);
      // Refresh inbox list to sync back
      fetchEmails();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmail(null);
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <Card className="signup-card w-100" style={{ maxWidth: '800px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Card.Body className="p-2 py-3">
        <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <i className={`bi ${mode === 'sent' ? 'bi-send-fill' : 'bi-inbox-fill'} me-2 text-indigo`} style={{ fontSize: '1.5rem', color: '#818cf8' }}></i>
            <h2 className="signup-title mb-0" style={{ fontSize: '1.5rem' }}>{mode === 'sent' ? 'Sent Messages' : 'Inbox'}</h2>
          </div>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={fetchEmails}
            disabled={loading}
            style={{ borderRadius: '0.5rem', borderColor: '#334155', color: '#cbd5e1' }}
          >
            <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin-animation' : ''}`}></i>
            Refresh
          </Button>
        </div>

        {errorMsg && (
          <Alert variant="danger" className="alert-custom mb-3" onClose={() => setErrorMsg(null)} dismissible>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMsg}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="indigo" style={{ color: '#818cf8' }} className="mb-2" />
            <p className="signup-subtitle">{mode === 'sent' ? 'Loading sent messages...' : 'Loading your messages...'}</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-5 px-3">
            <div 
              className="d-inline-flex align-items-center justify-content-center bg-dark rounded-circle mb-3" 
              style={{ width: '70px', height: '70px', background: 'rgba(255, 255, 255, 0.03)' }}
            >
              <i className={`bi ${mode === 'sent' ? 'bi-send' : 'bi-mailbox2'}`} style={{ fontSize: '2rem', color: '#64748b' }}></i>
            </div>
            <h4>{mode === 'sent' ? 'No sent messages' : 'Your inbox is clean!'}</h4>
            <p className="signup-subtitle mb-0">
              {mode === 'sent' ? 'Emails you compose and send will appear here.' : 'No new emails have been received yet.'}
            </p>
          </div>
        ) : (
          <ListGroup className="inbox-list-group" variant="flush" style={{ borderRadius: '0.75rem', overflow: 'hidden' }}>
            {emails.map((email) => (
              <ListGroup.Item
                key={email.id}
                onClick={() => handleRowClick(email)}
                style={{
                  cursor: 'pointer',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid #1e293b',
                  borderTop: 'none',
                  color: '#f8fafc',
                  transition: 'background-color 0.2s',
                  padding: '1rem 1.25rem'
                }}
                className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border-bottom"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                }}
              >
                <div className="d-flex flex-column me-3 mb-2 mb-sm-0 text-truncate" style={{ maxWidth: '75%' }}>
                  <div className="d-flex align-items-center mb-1">
                    {/* Unread Blue Dot Indicator */}
                    {mode === 'inbox' && !email.isRead && (
                      <span className="unread-dot" data-testid="unread-dot"></span>
                    )}
                    
                    {mode === 'sent' ? (
                      <>
                        <span className="fw-semibold text-muted me-2" style={{ fontSize: '0.85rem' }}>To:</span>
                        <span className="fw-semibold text-indigo text-truncate" style={{ color: '#818cf8', fontSize: '0.95rem' }}>
                          {email.receiverEmail}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="fw-semibold text-indigo me-2 text-truncate" style={{ color: '#818cf8', fontSize: '0.95rem' }}>
                          {email.senderEmail}
                        </span>
                        {!email.isRead && (
                          <Badge bg="primary" style={{ fontSize: '0.65rem', borderRadius: '1rem', padding: '0.25em 0.5em' }}>New</Badge>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-light text-truncate" style={{ fontSize: '0.9rem' }}>
                    {email.subject}
                  </span>
                </div>
                
                {/* Right Side: Timestamp and Action Button */}
                <div className="d-flex align-items-center ms-auto ms-sm-0">
                  <div className="text-muted me-3" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {formatTime(email.createdAt)}
                  </div>
                  <Button 
                    variant="link" 
                    className="p-1 text-danger delete-btn" 
                    onClick={(e) => handleDeleteClick(e, email.id)}
                    style={{ textDecoration: 'none', color: '#ef4444' }}
                    title={mode === 'sent' ? 'Delete sent email' : 'Delete email'}
                    data-testid={`delete-btn-${email.id}`}
                  >
                    <i className="bi bi-trash3-fill" style={{ fontSize: '1.1rem' }}></i>
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {/* Email Detail Modal */}
        <Modal 
          show={showModal} 
          onHide={handleCloseModal} 
          centered 
          size="lg"
          contentClassName="signup-card"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          {selectedEmail && (
            <>
              <Modal.Header closeButton closeVariant="white" className="border-bottom border-secondary pb-3">
                <Modal.Title className="signup-title" style={{ fontSize: '1.25rem' }}>
                  {selectedEmail.subject}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="py-4">
                <div className="mb-4 pb-3 border-bottom border-secondary" style={{ fontSize: '0.9rem' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong style={{ color: '#cbd5e1' }}>{mode === 'sent' ? 'To:' : 'From:'}</strong>{' '}
                      <span className="text-indigo" style={{ color: '#818cf8', fontWeight: '500' }}>
                        {mode === 'sent' ? selectedEmail.receiverEmail : selectedEmail.senderEmail}
                      </span>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {formatTime(selectedEmail.createdAt)}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: '#cbd5e1' }}>{mode === 'sent' ? 'From:' : 'To:'}</strong>{' '}
                    <span style={{ color: '#94a3b8' }}>
                      {mode === 'sent' ? `${selectedEmail.senderEmail} (You)` : selectedEmail.receiverEmail}
                    </span>
                  </div>
                </div>
                
                <div 
                  className="email-body-content bg-dark-soft p-3 rounded"
                  style={{ 
                    background: '#0f172a', 
                    borderRadius: '0.75rem', 
                    border: '1px solid #1e293b',
                    minHeight: '150px',
                    color: '#f8fafc',
                    lineHeight: '1.6',
                    overflowWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                />
              </Modal.Body>
              <Modal.Footer className="border-top border-secondary pt-3">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleCloseModal}
                  style={{ borderRadius: '0.5rem', borderColor: '#334155', color: '#cbd5e1' }}
                >
                  Close
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default InboxList;

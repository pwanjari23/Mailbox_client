import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import useHttp from '../hooks/use-http';

const ComposeMail = () => {
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  // API state
  const { isLoading: loading, sendRequest } = useHttp();
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [validated, setValidated] = useState(false);

  // Quill Toolbar Configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],        // text formatting
      [{ 'color': [] }, { 'background': [] }],          // font color and highlight
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // lists
      ['link', 'clean']                                 // links and reset formatting
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'link'
  ];

  // Validation
  const isFormValid = toEmail.trim() !== '' && toEmail.includes('@') && body.trim() !== '' && body !== '<p><br></p>';

  const handleSend = async (e) => {
    e.preventDefault();
    setValidated(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isFormValid) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Your session has expired. Please log in again.');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      await sendRequest({
        url: `${apiUrl}/emails/send`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: {
          receiverEmail: toEmail,
          subject: subject.trim(),
          body: body
        }
      });

      setSuccessMsg('Email successfully sent!');
      
      // Reset form fields
      setToEmail('');
      setSubject('');
      setBody('');
      setValidated(false);
    } catch (err) {
      console.error('Send mail error:', err);
      setErrorMsg(err.message);
    }
  };

  return (
    <Card className="signup-card w-100" style={{ maxWidth: '750px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Card.Body className="p-2 py-3">
        <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-secondary">
          <i className="bi bi-pencil-square me-2 text-indigo" style={{ fontSize: '1.5rem', color: '#818cf8' }}></i>
          <h2 className="signup-title mb-0" style={{ fontSize: '1.5rem' }}>Compose New Message</h2>
        </div>

        {errorMsg && (
          <Alert variant="danger" className="alert-custom mb-3" onClose={() => setErrorMsg(null)} dismissible>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" className="alert-custom mb-3" onClose={() => setSuccessMsg(null)} dismissible>
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMsg}
          </Alert>
        )}

        <Form onSubmit={handleSend} noValidate>
          {/* Recipient Input */}
          <Form.Group className="mb-3" controlId="composeTo">
            <Form.Label className="form-label-custom">To (Recipient Email)</Form.Label>
            <Form.Control
              type="email"
              placeholder="recipient@example.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="form-control-custom"
              disabled={loading}
              required
              isInvalid={validated && (toEmail.trim() === '' || !toEmail.includes('@'))}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid recipient email address.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Subject Input */}
          <Form.Group className="mb-3" controlId="composeSubject">
            <Form.Label className="form-label-custom">Subject</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter subject here..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-control-custom"
              disabled={loading}
            />
          </Form.Group>

          {/* Rich Text Editor Body */}
          <Form.Group className="mb-4" controlId="composeBody">
            <Form.Label className="form-label-custom">Message Body</Form.Label>
            <div className="quill-wrapper" style={{ background: '#0f172a', borderRadius: '0.75rem', border: '1px solid #334155', overflow: 'hidden' }}>
              <ReactQuill
                theme="snow"
                value={body}
                onChange={setBody}
                modules={modules}
                formats={formats}
                placeholder="Write your email here (use formatting options to bold or highlight text)..."
                readOnly={loading}
                style={{ height: '220px', color: '#f8fafc' }}
              />
            </div>
            {/* Added spacer to prevent overlapping toolbar overlays */}
            <div style={{ height: '42px' }}></div>
            {validated && (body.trim() === '' || body === '<p><br></p>') && (
              <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                Email body content cannot be empty.
              </div>
            )}
          </Form.Group>

          {/* Send Button */}
          <Button
            type="submit"
            className="btn-primary-custom d-flex align-items-center justify-content-center"
            disabled={!isFormValid || loading}
            style={{ width: 'auto', minWidth: '130px', padding: '0.65rem 1.5rem !important' }}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Sending...
              </>
            ) : (
              <>
                <i className="bi bi-send-fill me-2"></i>
                Send Mail
              </>
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ComposeMail;

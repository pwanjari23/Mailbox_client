import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';

const Login = ({ onLoginSuccess, onNavigateToSignup }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  
  // API State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Client-side validations (Mandatory fields check)
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidated(true);
    setErrorMsg(null);

    // Guard if inputs are empty
    if (!isFormValid) {
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please verify your credentials.');
      }

      // Store the token (from NodeJS backend)
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);

      // Invoke success handler
      if (onLoginSuccess) {
        onLoginSuccess(data.token);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="signup-card w-100" style={{ maxWidth: '450px' }}>
      <Card.Body className="p-0">
        <div className="text-center mb-4">
          <h2 className="signup-title mb-1">Welcome Back</h2>
          <p className="signup-subtitle">Please log in to your account</p>
        </div>

        {errorMsg && (
          <Alert variant="danger" className="alert-custom mb-3" onClose={() => setErrorMsg(null)} dismissible>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMsg}
          </Alert>
        )}

        <Form noValidate onSubmit={handleSubmit}>
          {/* Email input */}
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label className="form-label-custom">Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control-custom"
              disabled={loading}
              required
              isInvalid={validated && email.trim() === ''}
            />
            <Form.Control.Feedback type="invalid">
              Please enter your email.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password input */}
          <Form.Group className="mb-4" controlId="formPassword">
            <Form.Label className="form-label-custom">Password</Form.Label>
            <InputGroup className="password-input-group">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control-custom"
                disabled={loading}
                required
                isInvalid={validated && password.trim() === ''}
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                tabIndex="-1"
              >
                <i className={showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'}></i>
              </Button>
              <Form.Control.Feedback type="invalid">
                Please enter your password.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Submit Button */}
          <Button
            type="submit"
            className="btn-primary-custom mb-3"
            disabled={!isFormValid || loading}
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
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>

          {/* Nav link to signup */}
          <div className="text-center mt-2">
            <p className="signup-subtitle mb-0">
              Don't have an account?{' '}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateToSignup) onNavigateToSignup();
                }}
                style={{ color: '#818cf8', textDecoration: 'none', fontWeight: '600' }}
              >
                Sign Up
              </a>
            </p>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Login;

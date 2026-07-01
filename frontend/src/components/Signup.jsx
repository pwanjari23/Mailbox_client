import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import useHttp from '../hooks/use-http';

const Signup = ({ onNavigateToLogin }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  
  // API State
  const { isLoading: loading, sendRequest } = useHttp();
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Client-side validations
  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword;
  
  // Submit button disabled until everything is filled and passwords match
  const isFormValid = email.trim() !== '' && 
                       password.trim() !== '' && 
                       confirmPassword.trim() !== '' && 
                       isEmailValid &&
                       isPasswordValid &&
                       passwordsMatch;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidated(true);

    // Reset messages
    setErrorMsg(null);
    setSuccessMsg(null);

    // Double check form validity
    if (!isFormValid) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const data = await sendRequest({
        url: `${apiUrl}/auth/signup`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          email,
          password,
          confirmPassword
        },
      });

      // Success
      console.log('User has successfully signed up');
      setSuccessMsg('Account created successfully! You can now log in.');
      
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setValidated(false);
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMsg(err.message);
    }
  };

  return (
    <Card className="signup-card w-100" style={{ maxWidth: '450px' }}>
      <Card.Body className="p-0">
        <div className="text-center mb-4">
          <h2 className="signup-title mb-1">Create Account</h2>
          <p className="signup-subtitle">Sign up to get started with MailBox</p>
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

        <Form noValidate onSubmit={handleSubmit}>
          {/* Email field */}
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
              isInvalid={validated && !isEmailValid}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid email address.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Password field */}
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="form-label-custom">Password</Form.Label>
            <InputGroup className="password-input-group">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Must be at least 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control-custom"
                disabled={loading}
                required
                isInvalid={validated && !isPasswordValid}
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
                Password must be at least 6 characters.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Confirm Password field */}
          <Form.Group className="mb-4" controlId="formConfirmPassword">
            <Form.Label className="form-label-custom">Confirm Password</Form.Label>
            <InputGroup className="password-input-group">
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control-custom"
                disabled={loading}
                required
                isInvalid={validated && (!passwordsMatch || confirmPassword.trim() === '')}
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-btn"
                tabIndex="-1"
              >
                <i className={showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'}></i>
              </Button>
              <Form.Control.Feedback type="invalid">
                {confirmPassword.trim() === '' ? 'Please confirm your password.' : 'Passwords do not match.'}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Submit Button */}
          <Button
            type="submit"
            className="btn-primary-custom"
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
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>

          {/* Nav link to login */}
          <div className="text-center mt-3">
            <p className="signup-subtitle mb-0">
              Already have an account?{' '}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateToLogin) onNavigateToLogin();
                }}
                style={{ color: '#818cf8', textDecoration: 'none', fontWeight: '600' }}
              >
                Login
              </a>
            </p>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Signup;

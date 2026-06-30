import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from '../Login';

describe('Login Component Tests', () => {
  const mockOnLoginSuccess = vi.fn();
  const mockOnNavigateToSignup = vi.fn();

  beforeEach(() => {
    global.fetch = vi.fn();
    mockOnLoginSuccess.mockClear();
    mockOnNavigateToSignup.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // Test Case 1: Initial Render State Check
  test('renders email and password inputs and a disabled Login button initially', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} onNavigateToSignup={mockOnNavigateToSignup} />);

    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    
    const loginBtn = screen.getByRole('button', { name: /login/i });
    expect(loginBtn).toBeInTheDocument();
    expect(loginBtn).toBeDisabled();
  });

  // Test Case 2: Validation of Empty Fields
  test('keeps login button disabled if password or email is empty', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} onNavigateToSignup={mockOnNavigateToSignup} />);
    
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const loginBtn = screen.getByRole('button', { name: /login/i });

    // Enter email but leave password empty
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    expect(loginBtn).toBeDisabled();
  });

  // Test Case 3: Password Visibility Toggle Action
  test('toggles password visibility type when eye icon is clicked', () => {
    const { container } = render(
      <Login onLoginSuccess={mockOnLoginSuccess} onNavigateToSignup={mockOnNavigateToSignup} />
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const toggleBtn = container.querySelector('.password-toggle-btn');

    expect(toggleBtn).toBeInTheDocument();

    // Default should be password type
    expect(passwordInput.type).toBe('password');

    // Click toggle
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    // Click toggle again
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('password');
  });

  // Test Case 4: Handle Wrong Credentials with Alert Feedback
  test('shows error alert when login API returns an error response', async () => {
    // Mock fetch to simulate a 401 Unauthorized response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ success: false, message: 'Invalid email or password.' }),
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} onNavigateToSignup={mockOnNavigateToSignup} />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginBtn = screen.getByRole('button', { name: /login/i });

    // Enter credentials and submit
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    expect(loginBtn).toBeEnabled();
    fireEvent.click(loginBtn);

    // Verify correct alert is shown to user
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    });
    
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  // Test Case 5: Handle Correct Credentials and Store Token
  test('stores token in localStorage and triggers callback on successful login response', async () => {
    const fakeToken = 'mock_jwt_token_xyz';
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: fakeToken,
        user: { email: 'success@example.com', id: '123' },
      }),
    });

    render(<Login onLoginSuccess={mockOnLoginSuccess} onNavigateToSignup={mockOnNavigateToSignup} />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginBtn = screen.getByRole('button', { name: /login/i });

    // Enter valid credentials and submit
    fireEvent.change(emailInput, { target: { value: 'success@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'CorrectPassword123' } });
    
    fireEvent.click(loginBtn);

    // Wait for the redirect handler to invoke
    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(fakeToken);
    });

    // Directly assert items exist in localStorage
    expect(localStorage.getItem('token')).toBe(fakeToken);
    expect(localStorage.getItem('userEmail')).toBe('success@example.com');
  });
});

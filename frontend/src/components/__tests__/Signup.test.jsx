import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import Signup from '../Signup';

describe('Signup Component Validation and Submission Tests', () => {
  beforeEach(() => {
    // Mock the global console.log and fetch before each test
    vi.spyOn(console, 'log').mockImplementation(() => {});
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test Case 1: Initial render state check
  test('renders all input fields and a disabled signup button initially', () => {
    render(<Signup />);

    // Verify all 3 inputs are present
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Must be at least 6 chars')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();

    // Verify button is disabled initially
    const submitBtn = screen.getByRole('button', { name: /sign up/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  // Test Case 2: Validation of invalid email address format
  test('keeps button disabled when email format is invalid', () => {
    render(<Signup />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('Must be at least 6 chars');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitBtn = screen.getByRole('button', { name: /sign up/i });

    // Enter invalid email and valid passwords
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });

    // Button should remain disabled due to invalid email address format
    expect(submitBtn).toBeDisabled();
  });

  // Test Case 3: Validation of minimum password length
  test('keeps button disabled when password is under 6 characters', () => {
    render(<Signup />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('Must be at least 6 chars');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitBtn = screen.getByRole('button', { name: /sign up/i });

    // Enter valid email and short passwords
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '12345' } });

    // Button should remain disabled due to password length limit
    expect(submitBtn).toBeDisabled();
  });

  // Test Case 4: Validation of mismatching passwords
  test('keeps button disabled when passwords do not match', () => {
    render(<Signup />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('Must be at least 6 chars');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitBtn = screen.getByRole('button', { name: /sign up/i });

    // Enter valid email but mismatching passwords
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password999' } });

    // Button should remain disabled due to password mismatch
    expect(submitBtn).toBeDisabled();
  });

  // Test Case 5: Successful form submission triggers mock API and console.log
  test('successfully submits form with valid inputs, shows alert, and logs success to console', async () => {
    // Mock fetch to simulate successful signup
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'User successfully signed up.' }),
    });

    render(<Signup />);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    const passwordInput = screen.getByPlaceholderText('Must be at least 6 chars');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm password');
    const submitBtn = screen.getByRole('button', { name: /sign up/i });

    // Enter valid inputs
    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });

    // Button should now be enabled
    expect(submitBtn).toBeEnabled();

    // Click submit
    fireEvent.click(submitBtn);

    // Wait for the success alert to render
    await waitFor(() => {
      expect(screen.getByText('Account created successfully! You can now log in.')).toBeInTheDocument();
    });

    // Check that console.log was called with success message
    expect(console.log).toHaveBeenCalledWith('User has successfully signed up');
  });
});

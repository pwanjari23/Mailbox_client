import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import ComposeMail from '../ComposeMail';

// Mock react-quill-new editor to run fast and reliably in JSDOM
vi.mock('react-quill-new', () => {
  return {
    default: ({ value, onChange, placeholder, readOnly }) => (
      <textarea
        data-testid="mock-rich-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={readOnly}
      />
    )
  };
});

describe('ComposeMail Component Tests', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock_user_jwt_token');
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // Test Case 1: Initial Render State Check
  test('renders email input, subject input, text editor, and a disabled Send button initially', () => {
    render(<ComposeMail />);

    expect(screen.getByPlaceholderText('recipient@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter subject here...')).toBeInTheDocument();
    expect(screen.getByTestId('mock-rich-editor')).toBeInTheDocument();

    const sendBtn = screen.getByRole('button', { name: /send/i });
    expect(sendBtn).toBeInTheDocument();
    expect(sendBtn).toBeDisabled();
  });

  // Test Case 2: Validation of Mandatory Fields (To Email Empty)
  test('keeps Send button disabled when recipient email is empty', () => {
    render(<ComposeMail />);

    const editor = screen.getByTestId('mock-rich-editor');
    const sendBtn = screen.getByRole('button', { name: /send/i });

    // Enter body but leave email empty
    fireEvent.change(editor, { target: { value: '<p>Hello world</p>' } });
    expect(sendBtn).toBeDisabled();
  });

  // Test Case 3: Validation of Mandatory Fields (Body Empty)
  test('keeps Send button disabled when body is empty', () => {
    render(<ComposeMail />);

    const emailInput = screen.getByPlaceholderText('recipient@example.com');
    const sendBtn = screen.getByRole('button', { name: /send/i });

    // Enter email but leave body empty
    fireEvent.change(emailInput, { target: { value: 'friend@example.com' } });
    expect(sendBtn).toBeDisabled();
  });

  // Test Case 4: Successful Email Dispatch clears inputs and shows alert
  test('enables button with valid inputs, makes POST request on submit, and resets inputs upon success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, message: 'Email successfully sent.' }),
    });

    render(<ComposeMail />);

    const emailInput = screen.getByPlaceholderText('recipient@example.com');
    const subjectInput = screen.getByPlaceholderText('Enter subject here...');
    const editor = screen.getByTestId('mock-rich-editor');
    const sendBtn = screen.getByRole('button', { name: /send/i });

    // Fill valid data
    fireEvent.change(emailInput, { target: { value: 'friend@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    fireEvent.change(editor, { target: { value: 'Hello body text' } });

    // Button should be active
    expect(sendBtn).toBeEnabled();

    // Click submit
    fireEvent.click(sendBtn);

    // Verify loading state triggers fetch
    await waitFor(() => {
      expect(screen.getByText('Email successfully sent!')).toBeInTheDocument();
    });

    // Check request params
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emails/send'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_user_jwt_token'
        }),
        body: JSON.stringify({
          receiverEmail: 'friend@example.com',
          subject: 'Test Subject',
          body: 'Hello body text'
        })
      })
    );

    // Verify fields were reset
    expect(emailInput.value).toBe('');
    expect(subjectInput.value).toBe('');
    expect(editor.value).toBe('');
  });

  // Test Case 5: Handles non-existent receiver error from backend
  test('displays custom error alert when backend returns send failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ success: false, message: 'Recipient email is not registered in our system.' }),
    });

    render(<ComposeMail />);

    const emailInput = screen.getByPlaceholderText('recipient@example.com');
    const editor = screen.getByTestId('mock-rich-editor');
    const sendBtn = screen.getByRole('button', { name: /send/i });

    fireEvent.change(emailInput, { target: { value: 'unknown@example.com' } });
    fireEvent.change(editor, { target: { value: 'message contents' } });
    
    fireEvent.click(sendBtn);

    // Verify error message from response is rendered in alert
    await waitFor(() => {
      expect(screen.getByText('Recipient email is not registered in our system.')).toBeInTheDocument();
    });
  });
});

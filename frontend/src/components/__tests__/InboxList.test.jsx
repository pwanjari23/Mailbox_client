import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import InboxList from '../InboxList';

describe('InboxList Component Unit Tests', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock_user_jwt_token');
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // Test Case 1: Initial state shows loading spinner
  test('renders loading spinner initially while fetching messages', async () => {
    // Return unresolved promise to capture loading state
    global.fetch.mockReturnValueOnce(new Promise(() => {}));

    render(<InboxList />);
    
    expect(screen.getByText('Loading your messages...')).toBeInTheDocument();
  });

  // Test Case 2: Render empty state warning
  test('renders empty inbox placeholder when no emails are returned', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, emails: [] }),
    });

    render(<InboxList />);

    await waitFor(() => {
      expect(screen.getByText('Your inbox is clean!')).toBeInTheDocument();
    });
    expect(screen.getByText('No new emails have been received yet.')).toBeInTheDocument();
  });

  // Test Case 3: Render email lists
  test('renders a list of emails returned by the API', async () => {
    const mockEmails = [
      {
        id: 'email-1',
        senderEmail: 'sender1@example.com',
        receiverEmail: 'user@example.com',
        subject: 'First test email',
        body: '<p>Testing body</p>',
        isRead: false,
        createdAt: '2026-06-30T10:00:00.000Z'
      },
      {
        id: 'email-2',
        senderEmail: 'sender2@example.com',
        receiverEmail: 'user@example.com',
        subject: 'Second test email',
        body: '<p>Testing second body</p>',
        isRead: true,
        createdAt: '2026-06-30T09:00:00.000Z'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, emails: mockEmails }),
    });

    render(<InboxList />);

    await waitFor(() => {
      expect(screen.getByText('sender1@example.com')).toBeInTheDocument();
      expect(screen.getByText('First test email')).toBeInTheDocument();
      expect(screen.getByText('sender2@example.com')).toBeInTheDocument();
      expect(screen.getByText('Second test email')).toBeInTheDocument();
    });
  });

  // Test Case 4: Detail Modal trigger on clicking email row item
  test('opens reading detail modal when clicking an email item in list', async () => {
    const mockEmails = [
      {
        id: 'email-abc',
        senderEmail: 'friend@example.com',
        receiverEmail: 'user@example.com',
        subject: 'Secret Subject',
        body: '<h3>Top Secret Content</h3>',
        isRead: false,
        createdAt: '2026-06-30T10:00:00.000Z'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, emails: mockEmails }),
    });

    render(<InboxList />);

    // Wait for row item to load
    await waitFor(() => {
      expect(screen.getByText('friend@example.com')).toBeInTheDocument();
    });

    // Verify modal is not visible initially
    expect(screen.queryByText('Top Secret Content')).not.toBeInTheDocument();

    // Click list item
    const rowItem = screen.getByText('friend@example.com');
    fireEvent.click(rowItem);

    // Verify modal content is rendered
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Top Secret Content')).toBeInTheDocument();
    expect(screen.getAllByText('friend@example.com')[0]).toBeInTheDocument();
  });

  // Test Case 5: Shows error alert if API call fails
  test('displays error alert on API fetch failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false, message: 'Server is currently down.' }),
    });

    render(<InboxList />);

    await waitFor(() => {
      expect(screen.getByText('Server is currently down.')).toBeInTheDocument();
    });
  });
});

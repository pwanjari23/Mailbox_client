import { createSlice } from '@reduxjs/toolkit';

const mailSlice = createSlice({
  name: 'mail',
  initialState: {
    receivedEmails: [],
    sentEmails: [],
    unreadCount: 0
  },
  reducers: {
    setReceivedEmails(state, action) {
      state.receivedEmails = action.payload || [];
      state.unreadCount = state.receivedEmails.filter(email => !email.isRead).length;
    },
    setSentEmails(state, action) {
      state.sentEmails = action.payload || [];
    },
    markEmailAsRead(state, action) {
      const emailId = action.payload;
      const existingEmail = state.receivedEmails.find(email => email.id === emailId);
      if (existingEmail && !existingEmail.isRead) {
        existingEmail.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    deleteEmail(state, action) {
      const emailId = action.payload;
      state.receivedEmails = state.receivedEmails.filter(email => email.id !== emailId);
      state.unreadCount = state.receivedEmails.filter(email => !email.isRead).length;
      state.sentEmails = state.sentEmails.filter(email => email.id !== emailId);
    }
  }
});

export const mailActions = mailSlice.actions;
export default mailSlice.reducer;

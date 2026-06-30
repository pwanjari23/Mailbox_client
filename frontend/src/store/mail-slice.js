import { createSlice } from '@reduxjs/toolkit';

const mailSlice = createSlice({
  name: 'mail',
  initialState: {
    receivedEmails: [],
    unreadCount: 0
  },
  reducers: {
    setReceivedEmails(state, action) {
      state.receivedEmails = action.payload || [];
      state.unreadCount = state.receivedEmails.filter(email => !email.isRead).length;
    },
    markEmailAsRead(state, action) {
      const emailId = action.payload;
      const existingEmail = state.receivedEmails.find(email => email.id === emailId);
      if (existingEmail && !existingEmail.isRead) {
        existingEmail.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    }
  }
});

export const mailActions = mailSlice.actions;
export default mailSlice.reducer;

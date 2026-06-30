import { configureStore } from '@reduxjs/toolkit';
import mailReducer from './mail-slice';

const store = configureStore({
  reducer: {
    mail: mailReducer
  }
});

export default store;

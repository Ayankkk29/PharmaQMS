import { configureStore } from '@reduxjs/toolkit';
import intakeReducer from './slices/intakeSlice';
import complaintsReducer from './slices/complaintsSlice';
import productsReducer from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    intake: intakeReducer,
    complaints: complaintsReducer,
    products: productsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

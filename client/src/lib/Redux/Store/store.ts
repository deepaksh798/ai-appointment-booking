import { configureStore } from "@reduxjs/toolkit";
import cardDataReducer from "../Slice/cardDataSlice";
import vapiDataSlice from "../Slice/vapiDataSlice";
import userDataSlice from "../Slice/userDataSlice";

export const store = configureStore({
  reducer: {
    cardData: cardDataReducer,
    vapiCustomerData: vapiDataSlice,
    userData: userDataSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

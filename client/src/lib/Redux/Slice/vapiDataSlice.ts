import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  userDetails: Record<string, any>; // Store key-value pairs
}

const initialState: UserData = {
  userDetails: {}, // Initialize as an object
};

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  "userData/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const userFunction = data?.data?.[0]?.function;

      if (!userFunction) {
        throw new Error("Invalid data format: Missing function key");
      }

      return userFunction.arguments; // Return the extracted data
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    clearLogs: (state) => {
      state.userDetails = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchUserData.fulfilled,
        (state, action: PayloadAction<Record<string, any>>) => {
          console.log("Fetched user data:", action.payload);
          state.userDetails = action.payload; // Store the fetched data
        }
      )
      .addCase(fetchUserData.rejected, (state, action) => {
        console.error("Failed to fetch user data:", action.payload);
      });
  },
});

export const { clearLogs } = logSlice.actions;
export default logSlice.reducer;

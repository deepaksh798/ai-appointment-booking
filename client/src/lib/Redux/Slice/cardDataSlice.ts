import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface CardDataState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CardDataState = {
  data: [],
  loading: false,
  error: null,
};

// Async thunk to fetch data from the API
export const fetchData = createAsyncThunk("data/fetchData", async () => {
  const response = await axios.get(
    "https://f2de-2401-4900-1c08-79c1-acee-4bca-b441-3b3.ngrok-free.app/all/assistant",
    {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "ngrok-skip-browser-warning",
      },
    }
  );
  console.log("data => ", response.data);
  return response.data.assistant; // Adjust this if the API returns data in a nested structure
});

// Async thunk to create a new assistant
export const createAssistant = createAsyncThunk(
  "data/createAssistant",
  async (assistant: {
    name: string;
    description: string;
    language: string;
  }) => {
    const response = await axios.post(
      "https://f2de-2401-4900-1c08-79c1-acee-4bca-b441-3b3.ngrok-free.app/create/assistant",
      assistant,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }
);

const cardDataSlice = createSlice({
  name: "cardData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch data";
      });
  },
});

export default cardDataSlice.reducer;

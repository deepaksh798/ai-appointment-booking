import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Assistant {
  name: string;
  your_agent: string;
  description: string;
  language: string;
  voice: string;
  first_message: string;
  end_call_message: string;
  image: string | File | null;
}

interface AssistantState {
  assistants: Assistant[];
}

const initialState: AssistantState = {
  assistants: [],
};

const userDataSlice = createSlice({
  name: "cardData",
  initialState,
  reducers: {
    createAssistant: (state, action) => {
      console.log("action.payload -> ", action.payload);

      state.assistants.push(action.payload);
    },
  },
});

export const { createAssistant } = userDataSlice.actions;
export default userDataSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* 
  [id]: {
    replyingId: string;
    replyingName: string;
  }
 */

type ReplyingState = {
  [id: string]: {
    replyingId: string;
    replyingName: string;
  }
}


const initialState: ReplyingState = {
};

export const replyingSlice = createSlice({
  name: "replying",
  initialState,
  reducers: {
    replying(state, action: PayloadAction<{ id: string, data: { replyingId: string, replyingName: string}}>) {
      state[action.payload.id] = { ...action.payload.data}
    },
    clearReplying(state, action: PayloadAction<{id: string}>) {
     delete state[action.payload.id]
    },
  },
});

export const { replying, clearReplying } = replyingSlice.actions;

export default replyingSlice.reducer;

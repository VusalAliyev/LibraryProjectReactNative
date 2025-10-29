import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SessionUser = {
  _id: string;
  email: string;
  name: string;
  isSU: boolean;
};

type SessionState = {
  user: SessionUser | null;
};

const initialState: SessionState = {
  user: null
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload;
    }
  }
});

export const { setUser } = sessionSlice.actions;
export default sessionSlice.reducer;

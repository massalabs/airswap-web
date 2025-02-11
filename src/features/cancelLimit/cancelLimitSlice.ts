import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppError } from "../../errors/appError";

export interface CancelLimitOrderState {
  status: "idle" | "signing" | "failed";
  error?: AppError;
}

const initialState: CancelLimitOrderState = {
  status: "idle",
  error: undefined,
};

export const cancelLimitSlice = createSlice({
  name: "cancel-limit",
  initialState: {},
  reducers: {
    reset: () => {
      return initialState;
    },
    setStatus: (
      state,
      action: PayloadAction<CancelLimitOrderState["status"]>
    ) => {
      return {
        ...state,
        status: action.payload,
      };
    },
  },
});

export const { setStatus } = cancelLimitSlice.actions;

export default cancelLimitSlice.reducer;

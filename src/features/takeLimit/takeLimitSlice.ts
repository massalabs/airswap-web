import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { AppError } from "../../errors/appError";

export interface TakeLimitOrderState {
  status:
    | "idle"
    | "invalid"
    | "not-found"
    | "open"
    | "taken"
    | "signing"
    | "failed";
  errors: AppError[];
  delegateRule?: DelegateRule;
}

const initialState: TakeLimitOrderState = {
  status: "idle",
  errors: [],
};

export const takeLimitSlice = createSlice({
  name: "take-limit",
  initialState,
  reducers: {
    setDelegateRule: (state, action: PayloadAction<DelegateRule>) => {
      return {
        ...state,
        delegateRule: action.payload,
      };
    },
    reset: () => {
      return initialState;
    },
    setStatus: (
      state,
      action: PayloadAction<TakeLimitOrderState["status"]>
    ) => {
      return {
        ...state,
        status: action.payload,
      };
    },
  },
});

export const { setDelegateRule, reset, setStatus } = takeLimitSlice.actions;

export default takeLimitSlice.reducer;

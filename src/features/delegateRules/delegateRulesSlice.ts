import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { walletDisconnected } from "../web3/web3Actions";
import { walletChanged } from "../web3/web3Actions";

// Record<string, number> is a map of delegate rule ids to their filled state. 0 is empty, 1 is filled.
export type DelegateRulesFilledState = Record<string, number>;

export interface DelegateRulesState {
  isInitialized: boolean;
  delegateRules: DelegateRule[];
  filledState: DelegateRulesFilledState;
}

const initialState: DelegateRulesState = {
  isInitialized: false,
  delegateRules: [],
  filledState: {},
};

export const delegateRulesSlice = createSlice({
  name: "delegateRules",
  initialState,
  reducers: {
    setDelegateRules: (state, action: PayloadAction<DelegateRule[]>) => {
      return {
        ...state,
        delegateRules: action.payload,
      };
    },
    setFilledState: (
      state,
      action: PayloadAction<DelegateRulesFilledState>
    ) => {
      return {
        ...state,
        filledState: action.payload,
      };
    },
    setIsInitialized: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isInitialized: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(walletDisconnected, () => initialState);
    builder.addCase(walletChanged, () => initialState);
  },
});

export const { setDelegateRules, setFilledState, setIsInitialized } =
  delegateRulesSlice.actions;

export const selectDelegateRulesReducer = (state: RootState) =>
  state.delegateRules;

export default delegateRulesSlice.reducer;

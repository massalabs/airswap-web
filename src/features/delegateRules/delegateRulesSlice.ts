import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { walletDisconnected } from "../web3/web3Actions";
import { walletChanged } from "../web3/web3Actions";
import { fetchDelegateRules } from "./delegateRulesApi";

// Record<string, number> is a map of delegate rule ids to their filled state. 0 is empty, 1 is filled.
export type DelegateRulesFilledState = Record<string, number>;

export interface DelegateRulesState {
  isError: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  delegateRules: DelegateRule[];
  filledState: DelegateRulesFilledState;
}

const initialState: DelegateRulesState = {
  isError: false,
  isLoading: false,
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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDelegateRules.fulfilled, (state, action) => {
      return {
        ...state,
        isInitialized: true,
        delegateRules: action.payload,
      };
    });

    builder.addCase(fetchDelegateRules.pending, () => {
      return {
        ...initialState,
        isLoading: true,
      };
    });

    builder.addCase(fetchDelegateRules.rejected, () => {
      return {
        ...initialState,
        isError: true,
      };
    });

    builder.addCase(walletDisconnected, () => initialState);
    builder.addCase(walletChanged, () => initialState);
  },
});

export const { setDelegateRules, setFilledState } = delegateRulesSlice.actions;

export const selectDelegateRulesReducer = (state: RootState) =>
  state.delegateRules;

export default delegateRulesSlice.reducer;

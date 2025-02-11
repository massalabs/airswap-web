import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { walletDisconnected } from "../web3/web3Actions";
import { walletChanged } from "../web3/web3Actions";
import { fetchDelegateRules } from "./delegateRulesApi";

export interface DelegateRulesState {
  isError: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  delegateRules: DelegateRule[];
}

const initialState: DelegateRulesState = {
  isError: false,
  isLoading: false,
  isInitialized: false,
  delegateRules: [],
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

export const { setDelegateRules } = delegateRulesSlice.actions;

export const selectDelegateRulesReducer = (state: RootState) =>
  state.delegateRules;

export default delegateRulesSlice.reducer;

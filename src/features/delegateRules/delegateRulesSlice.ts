import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { walletDisconnected } from "../web3/web3Actions";
import { walletChanged } from "../web3/web3Actions";

export interface DelegateRulesState {
  isInitialized: boolean;
  delegateRules: DelegateRule[];
}

const initialState: DelegateRulesState = {
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

export const { setDelegateRules, setIsInitialized } =
  delegateRulesSlice.actions;

export default delegateRulesSlice.reducer;

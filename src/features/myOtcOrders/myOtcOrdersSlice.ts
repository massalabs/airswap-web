import { FullOrderERC20 } from "@airswap/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { setOtcOrder } from "../makeOrder/makeOrderSlice";
import { walletChanged, walletDisconnected } from "../web3/web3Actions";
import { writeOtcUserOrdersToLocalStorage } from "./myOtcOrdersHelpers";

export type OrdersSortType =
  | "active"
  | "expiry"
  | "filled"
  | "senderToken"
  | "signerToken";

export interface MyOtcOrdersState {
  userOrders: FullOrderERC20[];
  activeSortType: OrdersSortType;
  sortTypeDirection: Record<OrdersSortType, boolean>;
}

const initialState: MyOtcOrdersState = {
  userOrders: [],
  activeSortType: "active",
  sortTypeDirection: {
    active: true,
    expiry: true,
    filled: true,
    senderToken: true,
    signerToken: true,
  },
};

export const myOtcOrdersSlice = createSlice({
  name: "my-otc-orders",
  initialState,
  reducers: {
    removeOtcUserOrder: (
      state,
      action: PayloadAction<FullOrderERC20>
    ): MyOtcOrdersState => {
      const userOrders = [...state.userOrders].filter(
        (order) => order.nonce !== action.payload.nonce
      );
      writeOtcUserOrdersToLocalStorage(
        userOrders,
        action.payload.signerWallet,
        action.payload.chainId
      );

      return {
        ...state,
        userOrders,
      };
    },
    setActiveSortType: (
      state,
      action: PayloadAction<OrdersSortType>
    ): MyOtcOrdersState => {
      const sortTypeDirection = { ...state.sortTypeDirection };
      const currentSorting = sortTypeDirection[action.payload];
      sortTypeDirection[action.payload] =
        action.payload === state.activeSortType
          ? !currentSorting
          : currentSorting;

      return {
        ...state,
        activeSortType: action.payload,
        sortTypeDirection: sortTypeDirection,
      };
    },
    setOtcUserOrders: (
      state,
      action: PayloadAction<FullOrderERC20[]>
    ): MyOtcOrdersState => {
      return {
        ...state,
        userOrders: action.payload,
      };
    },
    reset: (state): MyOtcOrdersState => {
      return {
        ...initialState,
        userOrders: state.userOrders,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(walletDisconnected, (): MyOtcOrdersState => initialState);
    builder.addCase(walletChanged, (): MyOtcOrdersState => initialState);

    builder.addCase(setOtcOrder, (state, action) => {
      const userOrders = [action.payload, ...state.userOrders];
      const { signerWallet, chainId } = action.payload;
      writeOtcUserOrdersToLocalStorage(userOrders, signerWallet, chainId);

      return {
        ...state,
        userOrders,
      };
    });
  },
});

export const {
  removeOtcUserOrder,
  reset,
  setActiveSortType,
  setOtcUserOrders,
} = myOtcOrdersSlice.actions;

export const selectMyOtcOrdersReducer = (state: RootState) => state.myOtcOrders;

export default myOtcOrdersSlice.reducer;

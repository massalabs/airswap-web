import { FullOrderERC20 } from "@airswap/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../../app/store";
import { setOtcOrder } from "../makeOrder/makeOrderSlice";
import { walletChanged, walletDisconnected } from "../web3/web3Actions";
import { writeUserOrdersToLocalStorage } from "./myOrdersHelpers";

export type OrdersSortType =
  | "active"
  | "expiry"
  | "filled"
  | "senderToken"
  | "signerToken";

export interface MyOrdersState {
  userOrders: FullOrderERC20[];
  activeSortType: OrdersSortType;
  sortTypeDirection: Record<OrdersSortType, boolean>;
}

const initialState: MyOrdersState = {
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

export const myOrdersSlice = createSlice({
  name: "make-otc",
  initialState,
  reducers: {
    removeUserOrder: (
      state,
      action: PayloadAction<FullOrderERC20>
    ): MyOrdersState => {
      const userOrders = [...state.userOrders].filter(
        (order) => order.nonce !== action.payload.nonce
      );
      writeUserOrdersToLocalStorage(
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
    ): MyOrdersState => {
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
    setUserOrders: (
      state,
      action: PayloadAction<FullOrderERC20[]>
    ): MyOrdersState => {
      return {
        ...state,
        userOrders: action.payload,
      };
    },
    reset: (state): MyOrdersState => {
      return {
        ...initialState,
        userOrders: state.userOrders,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(walletDisconnected, (): MyOrdersState => initialState);
    builder.addCase(walletChanged, (): MyOrdersState => initialState);

    builder.addCase(setOtcOrder, (state, action) => {
      const userOrders = [action.payload, ...state.userOrders];
      const { signerWallet, chainId } = action.payload;
      writeUserOrdersToLocalStorage(userOrders, signerWallet, chainId);

      return {
        ...state,
        userOrders,
      };
    });
  },
});

export const { removeUserOrder, reset, setActiveSortType, setUserOrders } =
  myOrdersSlice.actions;

export const selectMyOrdersReducer = (state: RootState) => state.myOrders;

export default myOrdersSlice.reducer;

import { ADDRESS_ZERO } from "@airswap/utils";
import {
  AsyncThunk,
  combineReducers,
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import { BigNumber, ethers } from "ethers";

import { AppDispatch, RootState } from "../../app/store";
import getWethAddress from "../../helpers/getWethAddress";
import { walletChanged, walletDisconnected } from "../web3/web3Actions";
import {
  fetchAllowancesSwap,
  fetchAllowancesWrapper,
  fetchAllowancesDelegate,
  fetchBalances,
} from "./balancesApi";

export interface BalancesState {
  status: "idle" | "fetching" | "failed";
  /** Timestamp of last successful fetch */
  lastFetch: number | null;
  /** An array of token addresses currently being fetched. If there are two
   * fetches in flight, this array will contain the list of addresses in the
   * largest request.
   */
  inFlightFetchTokens: string[] | null; // used to prevent duplicate fetches
  /** Token balances */
  values: {
    [tokenAddress: string]: string | null; // null while fetching
  };
}

// Initially empty.
export const initialState: BalancesState = {
  status: "idle",
  lastFetch: null,
  inFlightFetchTokens: null,
  values: {},
};

const getSetInFlightRequestTokensAction = (
  type:
    | "balances"
    | "allowances.swap"
    | "allowances.wrapper"
    | "allowances.delegate"
) => {
  return createAction<string[]>(`${type}/setInFlightRequestTokens`);
};

const getThunk: (
  type:
    | "balances"
    | "allowances.swap"
    | "allowances.wrapper"
    | "allowances.delegate"
) => AsyncThunk<
  { address: string; amount: string }[],
  {
    provider: ethers.providers.Web3Provider;
  },
  object
> = (
  type:
    | "balances"
    | "allowances.swap"
    | "allowances.wrapper"
    | "allowances.delegate"
) => {
  const methods = {
    balances: fetchBalances,
    "allowances.swap": fetchAllowancesSwap,
    "allowances.wrapper": fetchAllowancesWrapper,
    "allowances.delegate": fetchAllowancesDelegate,
  };
  return createAsyncThunk<
    { address: string; amount: string }[],
    {
      provider: ethers.providers.Web3Provider;
    },
    {
      // Optional fields for defining thunkApi field types
      dispatch: AppDispatch;
      state: RootState;
    }
  >(
    `${type}/requestForActiveTokens`,
    async (params, { getState, dispatch }) => {
      try {
        const state = getState();
        const { chainId, account } = state.web3;

        const wrappedNativeToken = chainId
          ? getWethAddress(chainId)
          : undefined;
        const activeTokensAddresses = [
          ...state.metadata.activeTokens,
          ...(wrappedNativeToken ? [wrappedNativeToken] : []),
          ADDRESS_ZERO,
        ];
        if (state.takeOtc.activeOrder) {
          activeTokensAddresses.push(state.takeOtc.activeOrder.senderToken);
        }
        dispatch(
          getSetInFlightRequestTokensAction(type)(activeTokensAddresses)
        );
        const amounts = await methods[type]({
          ...params,
          chainId: chainId!,
          walletAddress: account!,
          tokenAddresses: activeTokensAddresses,
        });
        return activeTokensAddresses.map((address, i) => ({
          address,
          amount: amounts[i],
        }));
      } catch (e: any) {
        console.error(`Error fetching ${type}: ` + e.message);
        throw e;
      }
    },
    {
      // Logic to prevent fetching again if we're already fetching the same or more tokens.
      condition: (params, { getState }) => {
        const pathParts = type.split(".");
        const sliceState =
          pathParts.length > 1
            ? // @ts-ignore
              getState()[pathParts[0]][pathParts[1]]
            : // @ts-ignore
              getState()[type];
        // If we're not fetching, definitely continue
        if (sliceState.status !== "fetching") return true;
        if (sliceState.inFlightFetchTokens) {
          const tokensToFetch = getState().metadata.activeTokens;
          // only fetch if new list is larger.
          return tokensToFetch.length > sliceState.inFlightFetchTokens.length;
        }
      },
    }
  );
};

const getSlice = (
  type:
    | "balances"
    | "allowances.swap"
    | "allowances.wrapper"
    | "allowances.delegate",
  asyncThunk: ReturnType<typeof getThunk>
) => {
  return createSlice({
    name: type,
    initialState,
    reducers: {
      incrementBy: (
        state,
        action: PayloadAction<{ tokenAddress: string; amount: string }>
      ) => {
        const currentAmount = BigNumber.from(
          state.values[action.payload.tokenAddress.toLowerCase()] || 0
        );
        state.values[action.payload.tokenAddress.toLowerCase()] = currentAmount
          .add(action.payload.amount)
          .toString();
      },
      decrementBy: (
        state,
        action: PayloadAction<{ tokenAddress: string; amount: string }>
      ) => {
        const currentAmount = BigNumber.from(
          state.values[action.payload.tokenAddress.toLowerCase()] || 0
        );
        let newAmount = currentAmount.sub(action.payload.amount);
        if (newAmount.lt("0")) newAmount = BigNumber.from("0");
        state.values[action.payload.tokenAddress.toLowerCase()] =
          newAmount.toString();
      },
      set: (
        state,
        action: PayloadAction<{ tokenAddress: string; amount: string }>
      ) => {
        state.values[action.payload.tokenAddress.toLowerCase()] =
          action.payload.amount;
      },
    },
    extraReducers: (builder) => {
      builder
        // Handle requesting balances
        .addCase(asyncThunk.pending, (state) => {
          state.status = "fetching";
        })
        .addCase(getSetInFlightRequestTokensAction(type), (state, action) => {
          state.inFlightFetchTokens = action.payload;
        })
        .addCase(asyncThunk.fulfilled, (state, action) => {
          state.lastFetch = Date.now();
          const tokenBalances = action.payload;

          tokenBalances?.forEach(({ address, amount }) => {
            state.values[address] = amount;
          });

          // Only clear fetching status if this request contained the largest
          // list of tokens (which will be stored in inFlightFetchTokens)
          if (
            state.inFlightFetchTokens &&
            tokenBalances.every(
              (result, i) => state.inFlightFetchTokens![i] === result.address
            )
          ) {
            state.inFlightFetchTokens = null;
            state.status = "idle";
          }
        })
        .addCase(asyncThunk.rejected, (state, action) => {
          state.status = "failed";
        })
        .addCase(walletDisconnected, (): BalancesState => {
          return initialState;
        })
        .addCase(walletChanged, (state): BalancesState => {
          const keys = Object.keys(state.values);
          const values = keys.reduce((acc, key) => {
            return { ...acc, [key]: "0" };
          }, {});

          return {
            ...state,
            values,
          };
        });
    },
  });
};

export const selectBalances = (state: RootState) => state.balances;
export const selectAllowances = (state: RootState) => state.allowances;
export const selectAllowancesSwap = (state: RootState) => state.allowances.swap;
export const selectAllowancesWrapper = (state: RootState) =>
  state.allowances.wrapper;

export const requestActiveTokenBalances = getThunk("balances");
export const requestActiveTokenAllowancesSwap = getThunk("allowances.swap");
export const requestActiveTokenAllowancesWrapper =
  getThunk("allowances.wrapper");
export const requestActiveTokenAllowancesDelegate = getThunk(
  "allowances.delegate"
);

export const balancesSlice = getSlice("balances", requestActiveTokenBalances);
export const allowancesSwapSlice = getSlice(
  "allowances.swap",
  requestActiveTokenAllowancesSwap
);
export const allowancesWrapperSlice = getSlice(
  "allowances.wrapper",
  requestActiveTokenAllowancesWrapper
);
export const allowancesDelegateSlice = getSlice(
  "allowances.delegate",
  requestActiveTokenAllowancesDelegate
);

export const balancesActions = balancesSlice.actions;
export const allowancesSwapActions = allowancesSwapSlice.actions;
export const allowancesWrapperActions = allowancesWrapperSlice.actions;
export const allowancesDelegateActions = allowancesDelegateSlice.actions;
export const balancesReducer = balancesSlice.reducer;
export const allowancesSwapReducer = allowancesSwapSlice.reducer;
export const allowancesWrapperReducer = allowancesWrapperSlice.reducer;
export const allowancesDelegateReducer = allowancesDelegateSlice.reducer;
export const allowancesReducer = combineReducers({
  swap: allowancesSwapReducer,
  wrapper: allowancesWrapperReducer,
  delegate: allowancesDelegateReducer,
});

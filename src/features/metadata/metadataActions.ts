import { getKnownTokens, TokenInfo } from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";
import { createAsyncThunk } from "@reduxjs/toolkit";

import * as ethers from "ethers";

import { AppDispatch, RootState } from "../../app/store";
import { AppTokenInfo } from "../../entities/AppTokenInfo/AppTokenInfo";
import {
  getTokenId,
  isCollectionTokenInfo,
} from "../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { getUniqueSingleDimensionArray } from "../../helpers/array";
import { compareAddresses } from "../../helpers/string";
import { Web3State } from "../web3/web3Slice";
import { getProtocolFee, getUnknownTokens } from "./metadataApi";
import {
  getQuoteTokensLocalStorageKey,
  getUnknownTokensLocalStorageKey,
} from "./metadataHelpers";
import { getActiveTokensLocalStorageKey } from "./metadataHelpers";
import {
  setActiveTokens,
  MetadataTokenInfoMap,
  setUnknownTokens,
  setQuoteTokens,
} from "./metadataSlice";

const transformTokenInfoArrayToMap = (tokens: TokenInfo[]) => {
  return tokens.reduce((acc, token) => {
    const address = token.address.toLowerCase();

    acc[address] = { ...token, address };
    return acc;
  }, {} as MetadataTokenInfoMap);
};

export const fetchAllTokens = createAsyncThunk<
  MetadataTokenInfoMap,
  number,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>("metadata/getKnownTokens", async (chainId) => {
  const response = await getKnownTokens(chainId);

  if (response.errors.length) {
    console.error("Errors fetching metadata", response.errors);

    return {};
  }

  return transformTokenInfoArrayToMap(response.tokens);
});
export const fetchUnkownTokens = createAsyncThunk<
  MetadataTokenInfoMap,
  {
    provider: ethers.providers.BaseProvider;
    tokens: string[];
  },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>("metadata/fetchUnknownTokens", async ({ provider, tokens }, thunkApi) => {
  const response = await getUnknownTokens(provider, tokens);

  if (!response) {
    return {};
  }

  return transformTokenInfoArrayToMap(response);
});
export const fetchProtocolFee = createAsyncThunk<
  number,
  {
    provider: Web3Provider;
    chainId: number;
  }
>("metadata/fetchProtocolFee", async ({ provider, chainId }) =>
  getProtocolFee(chainId, provider)
);

const writeActiveTokensToLocalStorage = (
  activeTokens: string[],
  web3: Web3State
) => {
  if (!web3.account || !web3.chainId) {
    return;
  }

  const localStorageKey = getActiveTokensLocalStorageKey(
    web3.account,
    web3.chainId
  );

  localStorage.setItem(localStorageKey, JSON.stringify(activeTokens));
};

const writeQuoteTokensToLocalStorage = (
  quoteTokens: string[],
  web3: Web3State
) => {
  if (!web3.account || !web3.chainId) {
    return;
  }

  const localStorageKey = getQuoteTokensLocalStorageKey(
    web3.account,
    web3.chainId
  );

  localStorage.setItem(localStorageKey, JSON.stringify(quoteTokens));
};

const writeUnknownTokensToLocalStorage = (
  unknownTokens: MetadataTokenInfoMap,
  web3: Web3State
) => {
  if (!web3.chainId) {
    return;
  }

  const localStorageKey = getUnknownTokensLocalStorageKey(web3.chainId);

  localStorage.setItem(localStorageKey, JSON.stringify(unknownTokens));
};

export const addActiveTokens =
  (tokens: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    const { metadata, web3 } = getState();

    const newTokens = tokens.map((token) => token.toLowerCase());
    const activeTokens = [...metadata.activeTokens, ...newTokens].filter(
      getUniqueSingleDimensionArray
    );

    writeActiveTokensToLocalStorage(activeTokens, web3);
    dispatch(setActiveTokens(activeTokens));
  };

export const removeActiveTokens =
  (tokens: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    const { metadata, web3 } = getState();

    const activeTokens = metadata.activeTokens.filter(
      (activeToken) =>
        !tokens.some((token) => compareAddresses(activeToken, token))
    );

    writeActiveTokensToLocalStorage(activeTokens, web3);
    dispatch(setActiveTokens(activeTokens));
  };

export const addQuoteTokens =
  (tokens: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    const { metadata, web3 } = getState();

    const newTokens = tokens.map((token) => token.toLowerCase());
    const quoteTokens = [...metadata.quoteTokens, ...newTokens].filter(
      getUniqueSingleDimensionArray
    );

    writeQuoteTokensToLocalStorage(quoteTokens, web3);
    dispatch(setQuoteTokens(quoteTokens));
  };

export const removeQuoteTokens =
  (tokens: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    const { metadata, web3 } = getState();

    const quoteTokens = metadata.quoteTokens.filter(
      (quoteToken) =>
        !tokens.some((token) => compareAddresses(quoteToken, token))
    );

    writeQuoteTokensToLocalStorage(quoteTokens, web3);
    dispatch(setQuoteTokens(quoteTokens));
  };

export const addUnknownTokenInfo = createAsyncThunk<
  void,
  AppTokenInfo[],
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  "metadata/addUnknownTokenInfo",
  async (tokenInfos, { dispatch, getState }) => {
    const { metadata, web3 } = getState();

    const unknownTokens = tokenInfos.reduce((acc, tokenInfo) => {
      const id = getTokenId(tokenInfo);
      const unknownToken = {
        ...tokenInfo,
        address: tokenInfo.address.toLowerCase(),
      };

      return {
        ...acc,
        [id]: unknownToken,
      };
    }, metadata.unknownTokens as MetadataTokenInfoMap);

    writeUnknownTokensToLocalStorage(unknownTokens, web3);

    dispatch(setUnknownTokens(unknownTokens));
  }
);

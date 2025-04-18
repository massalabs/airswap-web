import { useMemo } from "react";

import { toAtomicString, ADDRESS_ZERO } from "@airswap/utils";

import { BigNumber } from "bignumber.js";

import { useAppSelector } from "../app/hooks";
import { nativeCurrencySafeTransactionFee } from "../constants/nativeCurrency";
import { selectBalances } from "../features/balances/balancesSlice";
import {
  selectActiveTokens,
  selectProtocolFee,
} from "../features/metadata/metadataSlice";
import findEthOrTokenByAddress from "../helpers/findEthOrTokenByAddress";
import useNativeWrappedToken from "./useNativeWrappedToken";

const useShouldDepositNativeTokenAmount = (
  token?: string,
  tokenAmount?: string,
  includeFee = true
): string | undefined => {
  const activeTokens = useAppSelector(selectActiveTokens);
  const balances = useAppSelector(selectBalances);
  const protocolFee = useAppSelector(selectProtocolFee);

  const { chainId } = useAppSelector((state) => state.web3);

  const wrappedNativeToken = useNativeWrappedToken(chainId);

  return useMemo(() => {
    if (
      !token ||
      !tokenAmount ||
      !Number(tokenAmount) ||
      !chainId ||
      !wrappedNativeToken
    ) {
      return undefined;
    }

    const wrappedTokenAddress = wrappedNativeToken.address;

    if (token !== ADDRESS_ZERO && token !== wrappedTokenAddress) {
      return undefined;
    }

    const nativeTokenBalance = balances.values[ADDRESS_ZERO];
    const wrappedTokenBalance = balances.values[wrappedTokenAddress];

    if (!nativeTokenBalance || !wrappedTokenBalance) {
      return undefined;
    }

    const nativeTokenInfo = findEthOrTokenByAddress(
      ADDRESS_ZERO,
      activeTokens,
      chainId
    );

    if (!nativeTokenInfo || !wrappedNativeToken) {
      return undefined;
    }

    const nativeTokenBigNumber = new BigNumber(nativeTokenBalance).div(
      10 ** nativeTokenInfo.decimals
    );
    const wrappedTokenBigNumber = new BigNumber(wrappedTokenBalance).div(
      10 ** wrappedNativeToken.decimals
    );
    const tokenAmountBigNumber = new BigNumber(
      toAtomicString(tokenAmount, nativeTokenInfo.decimals)
    ).div(10 ** nativeTokenInfo.decimals);

    const totalBigNumber = nativeTokenBigNumber
      .plus(wrappedTokenBigNumber)
      .minus(nativeCurrencySafeTransactionFee[chainId] || 0);

    // If user has the required WETH amount then it's not necessary to wrap: we'll just use the WETH
    if (wrappedTokenBigNumber.isGreaterThanOrEqualTo(tokenAmount)) {
      return undefined;
    }

    // If the ETH and WETH amount is not sufficient then wrapping ETH will not help
    if (totalBigNumber.isLessThan(tokenAmount)) {
      return undefined;
    }

    // Else it means WETH is not enough, but with wrapping extra ETH it will.
    const amountToDeposit = tokenAmountBigNumber.minus(wrappedTokenBigNumber);

    if (!includeFee) {
      return amountToDeposit.toFormat();
    }

    const amountToDepositWithFee = amountToDeposit.plus(
      tokenAmountBigNumber.multipliedBy(protocolFee / 10000)
    );

    return amountToDepositWithFee.toFormat();
  }, [
    activeTokens,
    balances.values,
    token,
    tokenAmount,
    protocolFee,
    wrappedNativeToken,
    chainId,
  ]);
};

export default useShouldDepositNativeTokenAmount;

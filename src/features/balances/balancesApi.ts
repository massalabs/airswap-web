import { Wrapper, BatchCall, Delegate } from "@airswap/libraries";

import { BigNumber, ethers } from "ethers";

import { getSwapErc20Address } from "../../helpers/swapErc20";

interface WalletParams {
  chainId: number;
  provider: ethers.providers.Web3Provider;
  walletAddress: string;
  tokenAddresses: string[];
}

const getFetchBalancesOrAllowancesArgs = (
  method: "walletBalances" | "walletAllowances",
  spenderAddressType: "Wrapper" | "Swap" | "Delegate" | "None",
  params: WalletParams
) => {
  const { chainId, tokenAddresses, walletAddress } = params;

  if (method === "walletBalances") {
    return [walletAddress, tokenAddresses];
  }

  if (spenderAddressType === "Delegate") {
    return [walletAddress, Delegate.getAddress(chainId), tokenAddresses];
  }

  if (spenderAddressType === "Wrapper") {
    return [walletAddress, Wrapper.getAddress(chainId), tokenAddresses];
  }

  return [walletAddress, getSwapErc20Address(chainId), tokenAddresses];
};

/**
 * Fetches balances or allowances for a wallet using the airswap utility
 * contract `BalanceChecker.sol`. Balances are returned in base units.
 */
const fetchBalancesOrAllowances: (
  method: "walletBalances" | "walletAllowances",
  spenderAddressType: "Wrapper" | "Swap" | "Delegate" | "None",
  params: WalletParams
) => Promise<string[]> = async (method, spenderAddressType, params) => {
  const { chainId, provider } = params;
  const contract = BatchCall.getContract(provider, chainId);
  const args = getFetchBalancesOrAllowancesArgs(
    method,
    spenderAddressType,
    params
  );
  const amounts: BigNumber[] = await contract[method].apply(null, args);
  return amounts.map((amount) => amount.toString());
};

const fetchBalances = fetchBalancesOrAllowances.bind(
  null,
  "walletBalances",
  "None"
);
const fetchAllowancesSwap = fetchBalancesOrAllowances.bind(
  null,
  "walletAllowances",
  "Swap"
);
const fetchAllowancesWrapper = fetchBalancesOrAllowances.bind(
  null,
  "walletAllowances",
  "Wrapper"
);
const fetchAllowancesDelegate = fetchBalancesOrAllowances.bind(
  null,
  "walletAllowances",
  "Delegate"
);

export {
  fetchBalances,
  fetchAllowancesSwap,
  fetchAllowancesWrapper,
  fetchAllowancesDelegate,
};

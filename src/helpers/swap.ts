import { Swap, SwapERC20 } from "@airswap/libraries";
import {
  FullOrder,
  isValidFullOrder,
  OrderERC20,
  orderERC20ToParams,
} from "@airswap/utils";

import { ethers } from "ethers";

export const getSwapContract = (
  providerOrSigner: ethers.providers.Provider | ethers.Signer,
  chainId: number
): ethers.Contract => {
  return Swap.getContract(providerOrSigner, chainId);
};

export const checkSwapOrder = async (
  providerOrSigner: ethers.providers.Provider,
  chainId: number,
  senderWallet: string,
  order: FullOrder
): Promise<string[]> => {
  const contract = getSwapContract(providerOrSigner, chainId);

  if (!isValidFullOrder(order)) {
    return [];
  }

  const response = await contract.check(
    senderWallet,
    // TODO: Replace with fullOrderToParams
    // @ts-ignore
    ...orderERC20ToParams(order)
  );

  return response;
};

export const getSwapErc20Address = (chainId: number): string | undefined => {
  return SwapERC20.getAddress(chainId) || undefined;
};

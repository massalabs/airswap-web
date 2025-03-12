import { findTokenByAddress, ADDRESS_ZERO, TokenInfo } from "@airswap/utils";

import nativeCurrency from "../constants/nativeCurrency";
import { AppTokenInfo } from "../entities/AppTokenInfo/AppTokenInfo";

export default function findEthOrTokenByAddress(
  tokenAddress: string,
  activeTokens: AppTokenInfo[],
  chainId: number
): AppTokenInfo | null {
  return (
    tokenAddress === ADDRESS_ZERO
      ? nativeCurrency[chainId]
      : findTokenByAddress(tokenAddress, activeTokens as TokenInfo[])
  ) as AppTokenInfo;
}

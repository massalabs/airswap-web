import { TokenInfo, ADDRESS_ZERO } from "@airswap/utils";

import { BigNumber } from "bignumber.js";

import { nativeCurrencySafeTransactionFee } from "../constants/nativeCurrency";
import { AppTokenInfo } from "../entities/AppTokenInfo/AppTokenInfo";
import { isCollectionTokenInfo } from "../entities/AppTokenInfo/AppTokenInfoHelpers";
import { BalancesState } from "../features/balances/balancesSlice";
import stringToSignificantDecimals from "./stringToSignificantDecimals";

const getTokenMaxAmount = (
  baseToken: string,
  balances: BalancesState,
  baseTokenInfo: AppTokenInfo,
  protocolFeePercentage?: number
): string | null => {
  if (!balances.values[baseToken] || balances.values[baseToken] === "0") {
    return null;
  }

  if (isCollectionTokenInfo(baseTokenInfo)) {
    return balances.values[baseToken];
  }

  const transactionFee =
    baseTokenInfo.address === ADDRESS_ZERO &&
    nativeCurrencySafeTransactionFee[baseTokenInfo.chainId];

  let totalAmount = new BigNumber(balances.values[baseToken] || "0").div(
    10 ** baseTokenInfo.decimals
  );

  if (protocolFeePercentage) {
    totalAmount = totalAmount.minus(
      totalAmount.multipliedBy(protocolFeePercentage)
    );
  }

  if (transactionFee) {
    const usable = totalAmount.minus(transactionFee);
    totalAmount = usable.gt(0) ? usable : new BigNumber("0");
  }

  return stringToSignificantDecimals(totalAmount.toString(), 10);
};

export default getTokenMaxAmount;

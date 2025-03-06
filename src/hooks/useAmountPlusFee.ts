import { useMemo } from "react";

import { BigNumber } from "bignumber.js";

import { useAppSelector } from "../app/hooks";
import { selectProtocolFee } from "../features/metadata/metadataSlice";
import toMaxAllowedDecimalsNumberString from "../helpers/toMaxAllowedDecimalsNumberString";

export const useAmountPlusFee = (
  amount?: string,
  tokenDecimals?: number
): string => {
  const protocolFee = useAppSelector(selectProtocolFee);

  return useMemo(() => {
    if (!amount || !tokenDecimals) {
      return "0";
    }

    const amountPlusFee = new BigNumber(amount)
      .multipliedBy(1 + protocolFee / 10000)
      .toString();

    return toMaxAllowedDecimalsNumberString(amountPlusFee, tokenDecimals);
  }, [amount, protocolFee, tokenDecimals]);
};

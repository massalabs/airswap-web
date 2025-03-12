import { BigNumber } from "bignumber.js";

// TODO: Replace with @airswap/utils calculateDelegateFillSignerAmount helper when it's released
export const calculateDelegateFillSignerAmount = (
  fillSenderAmount: string,
  ruleSenderAmount: string,
  ruleSignerAmount: string
): string => {
  return new BigNumber(ruleSignerAmount)
    .multipliedBy(fillSenderAmount)
    .dividedBy(ruleSenderAmount)
    .integerValue(BigNumber.ROUND_DOWN)
    .toString();
};

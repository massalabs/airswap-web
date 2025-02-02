import { BigNumber } from "bignumber.js";
import { ethers } from "ethers";

import { DelegateRule } from "../../../../entities/DelegateRule/DelegateRule";
import { getDelegateRuleTokensExchangeRate } from "../helpers";

/**
 * This hook is used to get the available sender and signer amount for a limit order.
 * This is calculated based on the senderFilledAmount and what remains to be filled.
 */

export const useAvailableSenderAndSignerAmount = (
  delegateRule: DelegateRule,
  senderTokenDecimals?: number,
  signerTokenDecimals?: number
): { availableSenderAmount?: string; availableSignerAmount?: string } => {
  const tokenExchangeRate = getDelegateRuleTokensExchangeRate(delegateRule);

  const availableSenderAmount = new BigNumber(delegateRule.senderAmount).minus(
    delegateRule.senderFilledAmount
  );

  const formattedAvailableSenderAmount = ethers.utils.formatUnits(
    availableSenderAmount.toString(),
    senderTokenDecimals
  );

  const formattedAvailableSignerAmount = ethers.utils.formatUnits(
    tokenExchangeRate
      .multipliedBy(availableSenderAmount)
      .integerValue(BigNumber.ROUND_CEIL)
      .toString(),
    signerTokenDecimals
  );

  if (!availableSenderAmount || !formattedAvailableSignerAmount) {
    return {
      availableSenderAmount: undefined,
      availableSignerAmount: undefined,
    };
  }

  return {
    availableSenderAmount: formattedAvailableSenderAmount,
    availableSignerAmount: formattedAvailableSignerAmount,
  };
};

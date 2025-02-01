import { BigNumber } from "bignumber.js";

import { DelegateRule } from "../../../../entities/DelegateRule/DelegateRule";
import useFormattedTokenAmount from "../../OtcOrderDetailWidget/hooks/useFormattedTokenAmount";
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
  const formattedAvailableSenderAmount = useFormattedTokenAmount(
    availableSenderAmount.toString(),
    senderTokenDecimals
  );

  const formattedAvailableSignerAmount = useFormattedTokenAmount(
    tokenExchangeRate.multipliedBy(availableSenderAmount).toString(),
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

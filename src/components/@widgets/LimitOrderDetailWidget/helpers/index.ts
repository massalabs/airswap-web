import BigNumber from "bignumber.js";

import { DelegateRule } from "../../../../entities/DelegateRule/DelegateRule";
import toMaxAllowedDecimalsNumberString from "../../../../helpers/toMaxAllowedDecimalsNumberString";

export const getDelegateRuleTokensExchangeRate = (
  delegateRule: DelegateRule
) => {
  return new BigNumber(delegateRule.signerAmount).dividedBy(
    delegateRule.senderAmount
  );
};

/**
 * This function will calculate the senderAmount based on the signerAmount filled in by the user.
 * This is calculated based on the exchangeRate and what remains to be filled.
 * There's also checked if the amounts don't exceed the max allowed decimals.
 */

export const getCustomSenderAmount = (
  exchangeRate: BigNumber,
  signerAmount: string,
  availableSignerAmount: string,
  signerTokenDecimals = 18,
  senderTokenDecimals = 18
): { signerAmount: string; senderAmount: string } => {
  const justifiedSignerAmount = new BigNumber(signerAmount).isGreaterThan(
    availableSignerAmount
  )
    ? availableSignerAmount
    : signerAmount;
  const senderAmount = new BigNumber(justifiedSignerAmount)
    .dividedBy(exchangeRate)
    .toString();

  return {
    signerAmount: toMaxAllowedDecimalsNumberString(
      justifiedSignerAmount,
      signerTokenDecimals
    ),
    senderAmount: toMaxAllowedDecimalsNumberString(
      senderAmount,
      senderTokenDecimals
    ),
  };
};

/**
 * This function will calculate the signerAmount based on the senderAmount filled in by the user.
 * This is calculated based on the exchangeRate and what remains to be filled.
 * There's also checked if the amounts don't exceed the max allowed decimals.
 */

export const getCustomSignerAmount = (
  exchangeRate: BigNumber,
  senderAmount: string,
  availableSenderAmount: string,
  senderTokenDecimals = 18,
  signerTokenDecimals = 18
): { signerAmount: string; senderAmount: string } => {
  const justifiedSenderAmount = new BigNumber(senderAmount).isGreaterThan(
    availableSenderAmount
  )
    ? availableSenderAmount
    : senderAmount;
  const signerAmount = new BigNumber(justifiedSenderAmount)
    .multipliedBy(exchangeRate)
    .toString();

  return {
    signerAmount: toMaxAllowedDecimalsNumberString(
      signerAmount,
      signerTokenDecimals
    ),
    senderAmount: toMaxAllowedDecimalsNumberString(
      justifiedSenderAmount,
      senderTokenDecimals
    ),
  };
};

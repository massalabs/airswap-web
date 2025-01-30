import BigNumber from "bignumber.js";
import { ethers } from "ethers";

import { DelegateRule } from "../../../../entities/DelegateRule/DelegateRule";
import toMaxAllowedDecimalsNumberString from "../../../../helpers/toMaxAllowedDecimalsNumberString";

const getTokenExchangeRate = (delegateRule: DelegateRule) => {
  return new BigNumber(delegateRule.senderAmount!).dividedBy(
    delegateRule.signerAmount!
  );
};

const getJustifiedAmount = (amount: string, maxAmount: string) => {
  return new BigNumber(amount).gt(maxAmount) ? maxAmount : amount;
};

export const getCustomSenderAmount = (
  delegateRule: DelegateRule,
  signerAmount: string,
  tokenDecimals = 18
): { signerAmount: string; senderAmount: string } => {
  const tokenExchangeRate = getTokenExchangeRate(delegateRule);

  const justifiedSignerAmount = getJustifiedAmount(
    signerAmount,
    ethers.utils.formatUnits(delegateRule.signerAmount, tokenDecimals)
  );

  return {
    signerAmount: toMaxAllowedDecimalsNumberString(
      justifiedSignerAmount,
      tokenDecimals
    ),
    senderAmount: toMaxAllowedDecimalsNumberString(
      new BigNumber(justifiedSignerAmount)
        .multipliedBy(tokenExchangeRate)
        .toString(),
      tokenDecimals
    ),
  };
};

export const getCustomSignerAmount = (
  delegateRule: DelegateRule,
  senderAmount: string,
  tokenDecimals = 18
): { signerAmount: string; senderAmount: string } => {
  const tokenExchangeRate = getTokenExchangeRate(delegateRule);

  const justifiedSenderAmount = getJustifiedAmount(
    senderAmount,
    ethers.utils.formatUnits(delegateRule.senderAmount, tokenDecimals)
  );

  return {
    signerAmount: toMaxAllowedDecimalsNumberString(
      new BigNumber(justifiedSenderAmount)
        .dividedBy(tokenExchangeRate)
        .toString(),
      tokenDecimals
    ),
    senderAmount: toMaxAllowedDecimalsNumberString(
      justifiedSenderAmount,
      tokenDecimals
    ),
  };
};

import { DelegateRule, DelegateSetRuleEvent } from "./DelegateRule";

const getDelegateRuleId = (
  senderWallet: string,
  senderToken: string,
  signerToken: string,
  chainId: number,
  expiry: number
) => {
  return `${senderWallet.toLowerCase()}-${senderToken.toLowerCase()}-${signerToken.toLowerCase()}-${expiry}-${chainId}`;
};

export const transformToDelegateRule = (
  senderWallet: string,
  senderToken: string,
  senderAmount: string,
  signerToken: string,
  signerAmount: string,
  chainId: number,
  expiry: number,
  senderFilledAmount = "0"
): DelegateRule => {
  return {
    id: getDelegateRuleId(
      senderWallet,
      senderToken,
      signerToken,
      chainId,
      expiry
    ),
    senderFilledAmount,
    senderWallet: senderWallet.toLowerCase(),
    senderToken: senderToken.toLowerCase(),
    senderAmount,
    signerToken: signerToken.toLowerCase(),
    signerAmount,
    chainId,
    expiry,
  };
};

export const transformToDelegateSetRuleEvent = (
  senderWallet: string,
  senderToken: string,
  senderAmount: string,
  signerToken: string,
  signerAmount: string,
  chainId: number,
  expiry: number,
  hash: string,
  status?: number
): DelegateSetRuleEvent => {
  return {
    name: "SetRule",
    id: getDelegateRuleId(
      senderWallet,
      senderToken,
      signerToken,
      chainId,
      expiry
    ),
    senderFilledAmount: "0",
    senderWallet: senderWallet.toLowerCase(),
    senderToken: senderToken.toLowerCase(),
    senderAmount,
    signerToken: signerToken.toLowerCase(),
    signerAmount,
    chainId,
    expiry,
    hash,
    status,
  };
};

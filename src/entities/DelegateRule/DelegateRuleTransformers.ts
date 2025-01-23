import { DelegateRule, DelegateSetRuleEvent } from "./DelegateRule";

export const transformToDelegateRule = (
  senderWallet: string,
  senderToken: string,
  senderAmount: string,
  signerToken: string,
  signerAmount: string,
  chainId: number,
  expiry: number
): DelegateRule => {
  return {
    id: `${senderWallet}-${senderToken}-${signerToken}-${chainId}`,
    senderWallet,
    senderToken,
    senderAmount,
    signerToken,
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
    id: `${senderWallet}-${senderToken}-${signerToken}-${chainId}`,
    senderWallet,
    senderToken,
    senderAmount,
    signerToken,
    signerAmount,
    chainId,
    expiry,
    hash,
    status,
  };
};

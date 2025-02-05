import {
  DelegatedSwapEvent,
  DelegateRule,
  DelegateSetRuleEvent,
} from "./DelegateRule";

const getDelegateRuleId = (
  senderWallet: string,
  senderToken: string,
  signerToken: string,
  chainId: number,
  expiry: number
) => {
  return `${senderWallet}-${senderToken}-${signerToken}-${expiry}-${chainId}`;
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
    id: getDelegateRuleId(
      senderWallet,
      senderToken,
      signerToken,
      chainId,
      expiry
    ),
    senderFilledAmount: "0",
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

export const transformToDelegatedSwapEvent = (
  senderWallet: string,
  signerWallet: string,
  nonce: string,
  chainId: number,
  hash: string,
  status?: number
): DelegatedSwapEvent => {
  return {
    name: "DelegatedSwapFor",
    chainId,
    senderWallet,
    signerWallet,
    nonce,
    hash,
    status,
  };
};

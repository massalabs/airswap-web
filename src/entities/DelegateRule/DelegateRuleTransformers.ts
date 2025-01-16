import { DelegateSetRuleEvent } from "./DelegateRule";

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

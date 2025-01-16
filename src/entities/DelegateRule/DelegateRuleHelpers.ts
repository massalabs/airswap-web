import { compareAddresses } from "../../helpers/string";
import { TransactionEvent } from "../../types/transactionTypes";
import { SubmittedSetRuleTransaction } from "../SubmittedTransaction/SubmittedTransaction";
import { DelegateSetRuleEvent } from "./DelegateRule";

export const isDelegateSetRuleEvent = (
  event: TransactionEvent
): event is DelegateSetRuleEvent =>
  typeof event === "object" && "name" in event && event.name === "SetRule";

export const findMatchingDelegateSetRuleTransaction = (
  transaction: SubmittedSetRuleTransaction,
  event: DelegateSetRuleEvent
): boolean => {
  return (
    compareAddresses(transaction.rule.senderWallet, event.senderWallet) &&
    compareAddresses(transaction.rule.senderToken, event.senderToken) &&
    transaction.rule.senderAmount === event.senderAmount &&
    compareAddresses(transaction.rule.signerToken, event.signerToken) &&
    transaction.rule.signerAmount === event.signerAmount &&
    transaction.rule.expiry === event.expiry &&
    transaction.rule.chainId === event.chainId
  );
};

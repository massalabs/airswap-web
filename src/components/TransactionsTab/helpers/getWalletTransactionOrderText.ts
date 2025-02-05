import { TokenInfo } from "@airswap/utils";

import {
  SubmittedDelegatedSwapTransaction,
  SubmittedDepositTransaction,
  SubmittedOrder,
  SubmittedWithdrawTransaction,
} from "../../../entities/SubmittedTransaction/SubmittedTransaction";
import {
  getDepositOrWithdrawalTransactionLabel,
  getOrderTransactionLabel,
  isDepositTransaction,
  isWithdrawTransaction,
} from "../../../entities/SubmittedTransaction/SubmittedTransactionHelpers";

const getWalletTransactionOrderText = (
  transaction:
    | SubmittedOrder
    | SubmittedWithdrawTransaction
    | SubmittedDepositTransaction
    | SubmittedDelegatedSwapTransaction,
  signerToken: TokenInfo,
  senderToken: TokenInfo,
  account: string,
  protocolFee: number
): string => {
  if (isWithdrawTransaction(transaction) || isDepositTransaction(transaction)) {
    return getDepositOrWithdrawalTransactionLabel(
      transaction,
      signerToken,
      senderToken
    );
  }

  return getOrderTransactionLabel(
    transaction,
    signerToken,
    senderToken,
    account,
    protocolFee
  );
};

export default getWalletTransactionOrderText;

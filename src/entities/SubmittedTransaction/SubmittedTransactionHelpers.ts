import {
  ADDRESS_ZERO,
  OrderERC20,
  TokenInfo,
  UnsignedOrderERC20,
} from "@airswap/utils";
import { formatUnits } from "@ethersproject/units";

import { BigNumber } from "bignumber.js";

import { compareAddresses } from "../../helpers/string";
import i18n from "../../i18n/i18n";
import { TransactionTypes } from "../../types/transactionTypes";
import { AppTokenInfo } from "../AppTokenInfo/AppTokenInfo";
import {
  getTokenDecimals,
  getTokenSymbol,
} from "../AppTokenInfo/AppTokenInfoHelpers";
import {
  SubmittedApprovalTransaction,
  SubmittedCancellation,
  SubmittedDepositTransaction,
  SubmittedLastLookOrder,
  SubmittedTransaction,
  SubmittedOrder,
  SubmittedWithdrawTransaction,
  SubmittedOrderUnderConsideration,
  SubmittedSetRuleTransaction,
  SubmittedDelegatedSwapTransaction,
  SubmittedUnsetRuleTransaction,
} from "./SubmittedTransaction";

export const isApprovalTransaction = (
  transaction: SubmittedTransaction
): transaction is SubmittedApprovalTransaction =>
  transaction.type === TransactionTypes.approval;

export const isCancelTransaction = (
  transaction: SubmittedTransaction
): transaction is SubmittedCancellation =>
  transaction.type === TransactionTypes.cancel;

export const isDepositTransaction = (
  transaction: SubmittedTransaction
): transaction is SubmittedDepositTransaction =>
  transaction.type === TransactionTypes.deposit;

export const isWithdrawTransaction = (
  transaction: SubmittedTransaction
): transaction is SubmittedWithdrawTransaction =>
  transaction.type === TransactionTypes.withdraw;

export const isSubmittedOrder = (
  transaction: SubmittedTransaction
): transaction is SubmittedOrder => {
  return transaction.type === TransactionTypes.order;
};

export const isSubmittedOrderUnderConsideration = (
  transaction: SubmittedTransaction
): transaction is SubmittedOrderUnderConsideration => {
  return transaction.type === TransactionTypes.order && !transaction.hash;
};

export const isLastLookOrderTransaction = (
  transaction: SubmittedTransaction
): transaction is SubmittedLastLookOrder => {
  return (
    isSubmittedOrder(transaction) &&
    !!transaction.hash &&
    !!transaction.isLastLook
  );
};

export const isSetRuleTransaction = (
  transaction: SubmittedTransaction
): transaction is SubmittedSetRuleTransaction =>
  transaction.type === TransactionTypes.setDelegateRule;

export const isUnsetRuleTransaction = (
  transaction: SubmittedTransaction
): transaction is SubmittedUnsetRuleTransaction =>
  transaction.type === TransactionTypes.unsetRule;

export const isDelegatedSwapTransaction = (
  transaction: SubmittedTransaction
): transaction is SubmittedDelegatedSwapTransaction =>
  transaction.type === TransactionTypes.delegatedSwap;

export const sortSubmittedTransactionsByExpiry = (
  a: SubmittedTransaction,
  b: SubmittedTransaction
) => {
  return b.timestamp - a.timestamp;
};

export const getSubmittedTransactionKey = (
  transaction: SubmittedTransaction
) => {
  if (isSubmittedOrderUnderConsideration(transaction)) {
    return `${transaction.order.signerWallet}-${transaction.order.nonce}-${transaction.timestamp}`;
  }

  return transaction.hash;
};

export const doTransactionsMatch = (
  transaction: SubmittedTransaction,
  match: SubmittedTransaction,
  hash?: string
): boolean => {
  if (
    isSubmittedOrderUnderConsideration(transaction) &&
    isSubmittedOrderUnderConsideration(match)
  ) {
    return transaction.order.nonce === match.order.nonce;
  }

  return transaction.hash === match.hash || transaction.hash === hash;
};

export const getDepositOrWithdrawalTransactionLabel = (
  transaction: SubmittedDepositTransaction | SubmittedWithdrawTransaction,
  signerToken: TokenInfo,
  senderToken: TokenInfo
): string => {
  const signerAmount = parseFloat(
    Number(
      formatUnits(transaction.order.signerAmount, signerToken.decimals)
    ).toFixed(5)
  );

  const senderAmount = parseFloat(
    Number(
      formatUnits(transaction.order.senderAmount, senderToken.decimals)
    ).toFixed(5)
  );

  return i18n.t("wallet.transaction", {
    signerAmount,
    signerToken: signerToken.symbol,
    senderAmount,
    senderToken: senderToken.symbol,
  });
};

const isSenderWalletAccount = (
  transaction: SubmittedTransaction,
  account: string
) => {
  // If senderToken is ADDRESS_ZERO, then that means a swapWithWrap transaction has been done.
  // So the account must be the senderWallet.
  if (
    isSubmittedOrder(transaction) &&
    transaction.order.senderToken === ADDRESS_ZERO
  ) {
    return true;
  }

  if (isSubmittedOrder(transaction)) {
    return !compareAddresses(transaction.order.signerWallet, account);
  }

  return false;
};

export const getAdjustedAmount = (
  order: OrderERC20 | UnsignedOrderERC20,
  protocolFee: number,
  account: string
) => {
  if (compareAddresses(order.signerWallet, account)) {
    return new BigNumber(order.signerAmount)
      .multipliedBy(1 + protocolFee / 10000)
      .integerValue(BigNumber.ROUND_FLOOR)
      .toString();
  }

  return order.signerAmount;
};

export const getOrderTransactionLabel = (
  transaction: SubmittedOrder | SubmittedDelegatedSwapTransaction,
  signerToken: AppTokenInfo,
  senderToken: AppTokenInfo,
  account: string,
  protocolFee: number
) => {
  const { order } = transaction;
  const swap = isSubmittedOrder(transaction) ? transaction.swap : undefined;

  // TODO: Fix signerToken and senderToken sometimes reversed?
  const adjustedSignerToken = signerToken;
  const adjustedSenderToken = senderToken;

  const adjustedSignerAmount = getAdjustedAmount(order, protocolFee, account);

  const signerDecimals = getTokenDecimals(adjustedSignerToken);
  const signerAmount = parseFloat(
    Number(formatUnits(adjustedSignerAmount, signerDecimals)).toFixed(5)
  );

  const senderDecimals = getTokenDecimals(adjustedSenderToken);
  const senderAmount = parseFloat(
    Number(formatUnits((swap || order).senderAmount, senderDecimals)).toFixed(5)
  );

  const accountIsSender = isSenderWalletAccount(transaction, account);

  if (accountIsSender) {
    return i18n.t("wallet.transaction", {
      signerAmount,
      signerToken: getTokenSymbol(adjustedSignerToken),
      senderAmount,
      senderToken: getTokenSymbol(adjustedSenderToken),
    });
  }

  return i18n.t("wallet.transaction", {
    signerAmount: senderAmount,
    signerToken: getTokenSymbol(adjustedSenderToken),
    senderAmount: signerAmount,
    senderToken: getTokenSymbol(adjustedSignerToken),
  });
};

export const getSetRuleTransactionLabel = (
  transaction: SubmittedSetRuleTransaction
) => {
  const { signerToken, senderToken } = transaction;
  const signerAmount = parseFloat(
    Number(
      formatUnits(transaction.rule.signerAmount, signerToken.decimals)
    ).toFixed(5)
  );

  const senderAmount = parseFloat(
    Number(
      formatUnits(transaction.rule.senderAmount, senderToken.decimals)
    ).toFixed(5)
  );

  const transactionLabel = i18n.t("wallet.transaction", {
    signerAmount,
    signerToken: signerToken.symbol,
    senderAmount,
    senderToken: senderToken.symbol,
  });

  return `${i18n.t("wallet.setRule")}: ${transactionLabel}`;
};

export const getUnsetRuleTransactionLabel = (
  transaction: SubmittedUnsetRuleTransaction
) => {
  const { senderToken, signerToken } = transaction;

  return `${i18n.t("wallet.unsetRule")}: ${senderToken.symbol} → ${
    signerToken.symbol
  }`;
};

import { Delegate, Swap } from "@airswap/libraries";
import {
  createOrder,
  createOrderERC20,
  toAtomicString,
  FullOrderERC20,
  UnsignedOrderERC20,
  TokenInfo,
  FullOrder,
  TokenKinds,
} from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";

import { ethers } from "ethers";

import { AppDispatch } from "../../app/store";
import { notifyRejectedByUserError } from "../../components/Toasts/ToastController";
import { AppTokenInfo } from "../../entities/AppTokenInfo/AppTokenInfo";
import {
  isCollectionTokenInfo,
  getTokenKind,
  getTokenDecimals,
} from "../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { transformToDelegateRule } from "../../entities/DelegateRule/DelegateRuleTransformers";
import { SubmittedSetRuleTransaction } from "../../entities/SubmittedTransaction/SubmittedTransaction";
import { AppErrorType, isAppError } from "../../errors/appError";
import transformUnknownErrorToAppError from "../../errors/transformUnknownErrorToAppError";
import { createOrderERC20Signature } from "../../helpers/createSwapSignature";
import { getSwapErc20Address } from "../../helpers/swapErc20";
import {
  TransactionStatusType,
  TransactionTypes,
} from "../../types/transactionTypes";
import { sendOrderToIndexers } from "../indexer/indexerHelpers";
import { submitTransaction } from "../transactions/transactionsActions";
import { createOrderSignature } from "./makeOrderHelpers";
import { setError, setStatus, setOtcOrder } from "./makeOrderSlice";

const getJustifiedAddress = async (library: Web3Provider, address: string) => {
  return ethers.utils.isAddress(address)
    ? address
    : await library.resolveName(address);
};

type CreateOrderParams = {
  isLimitOrder: boolean;
  activeIndexers: string[] | null;
  chainId: number;
  library: Web3Provider;
  signerTokenInfo: AppTokenInfo;
  senderTokenInfo: AppTokenInfo;
  shouldSendToIndexers: boolean;
} & UnsignedOrderERC20;

const createDelegateRule = async (
  params: CreateOrderParams,
  dispatch: AppDispatch
): Promise<SubmittedSetRuleTransaction | undefined> => {
  if (
    isCollectionTokenInfo(params.signerTokenInfo) ||
    isCollectionTokenInfo(params.senderTokenInfo)
  ) {
    throw new Error("Delegate rules are not supported for nft's");
  }

  const senderAmount = toAtomicString(
    params.senderAmount,
    params.senderTokenInfo.decimals
  );

  const signerAmount = toAtomicString(
    params.signerAmount,
    params.signerTokenInfo.decimals
  );

  const delegateContract = Delegate.getContract(
    params.library.getSigner(),
    params.chainId
  );

  // For a delegate rule, the sender and signer are reversed compared to an otc order
  const rule = transformToDelegateRule(
    params.signerWallet,
    params.signerToken,
    signerAmount,
    params.senderToken,
    senderAmount,
    params.chainId,
    Number(params.expiry)
  );

  dispatch(setStatus("signing"));

  try {
    const tx = await delegateContract.setRule(
      rule.senderWallet,
      rule.senderToken,
      rule.senderAmount,
      rule.signerToken,
      rule.signerAmount,
      rule.expiry
    );

    const transaction: SubmittedSetRuleTransaction = {
      type: TransactionTypes.setDelegateRule,
      rule,
      hash: tx.hash,
      timestamp: Date.now(),
      status: TransactionStatusType.processing,
      signerToken: params.senderTokenInfo,
      senderToken: params.signerTokenInfo,
    };

    dispatch(submitTransaction(transaction));
    dispatch(setStatus("idle"));

    return transaction;
  } catch (error) {
    const appError = transformUnknownErrorToAppError(error);
    if (appError.type === AppErrorType.rejectedByUser) {
      dispatch(setStatus("idle"));
      notifyRejectedByUserError();
    } else {
      dispatch(setStatus("failed"));
      dispatch(setError(appError));
    }

    return;
  }
};

const createOtcOrder = async (
  params: CreateOrderParams,
  dispatch: AppDispatch
): Promise<undefined> => {
  const signerTokenDecimals = getTokenDecimals(params.signerTokenInfo);
  const senderTokenDecimals = getTokenDecimals(params.senderTokenInfo);

  const signerTokenKind = getTokenKind(params.signerTokenInfo);
  const senderTokenKind = getTokenKind(params.senderTokenInfo);

  const signerAmount = toAtomicString(params.signerAmount, signerTokenDecimals);

  const senderAmount = toAtomicString(params.senderAmount, senderTokenDecimals);

  const signerTokenId = isCollectionTokenInfo(params.signerTokenInfo)
    ? params.signerTokenInfo.id
    : "0";

  const senderTokenId = isCollectionTokenInfo(params.senderTokenInfo)
    ? params.senderTokenInfo.id
    : "0";

  const unsignedOrder = createOrder({
    expiry: params.expiry,
    nonce: Date.now(),
    protocolFee: Number(params.protocolFee),
    signer: {
      wallet: params.signerWallet,
      token: params.signerToken,
      amount: signerAmount,
      id: signerTokenId,
      type: signerTokenKind,
    },
    sender: {
      wallet: params.senderWallet,
      token: params.senderToken,
      amount: senderAmount,
      id: senderTokenId,
      type: senderTokenKind,
    },
  });

  console.log("unsignedOrder", unsignedOrder);

  dispatch(setStatus("signing"));

  const signature = await createOrderSignature(
    unsignedOrder,
    params.library.getSigner(),
    Swap.getAddress(params.chainId) || "",
    params.chainId
  );

  console.log("signature", signature);

  if (isAppError(signature)) {
    if (signature.type === AppErrorType.rejectedByUser) {
      dispatch(setStatus("idle"));
      notifyRejectedByUserError();
    } else {
      dispatch(setStatus("failed"));
      dispatch(setError(signature));
    }
    return;
  }

  const fullOrder: FullOrder = {
    ...unsignedOrder,
    ...signature,
    chainId: params.chainId,
    swapContract: Swap.getAddress(params.chainId) || "",
  };

  console.log("fullOrder", fullOrder);

  if (params.shouldSendToIndexers && params.activeIndexers) {
    sendOrderToIndexers(fullOrder, params.activeIndexers);
  }

  dispatch(setStatus("idle"));
  dispatch(setOtcOrder(fullOrder));

  return;
};

export const createOtcOrDelegateOrder =
  (params: CreateOrderParams) =>
  async (
    dispatch: AppDispatch
  ): Promise<SubmittedSetRuleTransaction | undefined> => {
    try {
      const [signerWallet, senderWallet] = await Promise.all([
        getJustifiedAddress(params.library, params.signerWallet),
        getJustifiedAddress(params.library, params.senderWallet),
      ]);

      if (!signerWallet || !senderWallet) {
        dispatch(setStatus("failed"));
        dispatch(
          setError({
            type: AppErrorType.invalidAddress,
            argument: params.signerWallet,
          })
        );
        return;
      }

      const justifiedParams: CreateOrderParams = {
        ...params,
        signerWallet,
        senderWallet,
      };

      if (params.isLimitOrder) {
        return createDelegateRule(justifiedParams, dispatch as AppDispatch);
      }

      return createOtcOrder(justifiedParams, dispatch as AppDispatch);
    } catch (error) {
      console.error(error);
      dispatch(setStatus("failed"));
      dispatch(setError({ type: AppErrorType.unknownError }));
    }
  };

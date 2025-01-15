import { Delegate } from "@airswap/libraries";
import {
  createOrderERC20,
  toAtomicString,
  FullOrderERC20,
  UnsignedOrderERC20,
  TokenInfo,
} from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { ethers } from "ethers";

import { AppDispatch } from "../../app/store";
import { notifyRejectedByUserError } from "../../components/Toasts/ToastController";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { AppErrorType, isAppError } from "../../errors/appError";
import transformUnknownErrorToAppError from "../../errors/transformUnknownErrorToAppError";
import { createOrderERC20Signature } from "../../helpers/createSwapSignature";
import { getSwapErc20Address } from "../../helpers/swapErc20";
import { sendOrderToIndexers } from "../indexer/indexerHelpers";
import {
  setDelegateRule,
  setError,
  setStatus,
  setUserOrder,
} from "./makeOtcSlice";

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
  signerTokenInfo: TokenInfo;
  senderTokenInfo: TokenInfo;
  shouldSendToIndexers: boolean;
} & UnsignedOrderERC20;

const createDelegateRule = async (
  params: CreateOrderParams,
  dispatch: AppDispatch
) => {
  // For a delegate rule, the sender and signer are reversed compared to an otc order

  const signerAmount = toAtomicString(
    params.senderAmount,
    params.senderTokenInfo.decimals
  );

  const senderAmount = toAtomicString(
    params.signerAmount,
    params.signerTokenInfo.decimals
  );

  const delegateContract = Delegate.getContract(
    params.library.getSigner(),
    params.chainId
  );

  // const rules = await delegateContract.rules(
  //   params.signerWallet,
  //   params.signerToken,
  //   params.senderToken
  // );

  const rule: DelegateRule = {
    senderWallet: params.senderWallet,
    senderToken: params.senderToken,
    senderAmount: senderAmount,
    signerToken: params.signerToken,
    signerAmount: signerAmount,
    expiry: Number(params.expiry),
  };

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

    // TODO: Add tx to pending transactions
    console.log("tx", tx);
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

  dispatch(setDelegateRule(rule));
};

const createOtcOrder = async (
  params: CreateOrderParams,
  dispatch: AppDispatch
) => {
  const signerAmount = toAtomicString(
    params.signerAmount,
    params.signerTokenInfo.decimals
  );

  const senderAmount = toAtomicString(
    params.senderAmount,
    params.senderTokenInfo.decimals
  );

  const unsignedOrder = createOrderERC20({
    expiry: params.expiry,
    nonce: Date.now().toString(),
    senderWallet: params.senderWallet,
    signerWallet: params.signerWallet,
    signerToken: params.signerToken,
    senderToken: params.senderToken,
    protocolFee: params.protocolFee,
    signerAmount,
    senderAmount,
    chainId: params.chainId,
  });

  dispatch(setStatus("signing"));

  const signature = await createOrderERC20Signature(
    unsignedOrder,
    params.library.getSigner(),
    getSwapErc20Address(params.chainId) || "",
    params.chainId
  );

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

  const fullOrder: FullOrderERC20 = {
    ...unsignedOrder,
    ...signature,
    chainId: params.chainId,
    swapContract: getSwapErc20Address(params.chainId) || "",
  };

  if (params.shouldSendToIndexers && params.activeIndexers) {
    sendOrderToIndexers(fullOrder, params.activeIndexers);
  }

  dispatch(setUserOrder(fullOrder));
};

export const createOrder = createAsyncThunk(
  "make-otc/createOrder",
  async (params: CreateOrderParams, { dispatch }) => {
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
        createDelegateRule(justifiedParams, dispatch as AppDispatch);

        return;
      }

      createOtcOrder(justifiedParams, dispatch as AppDispatch);
    } catch (error) {
      console.error(error);
      dispatch(setStatus("failed"));
      dispatch(setError({ type: AppErrorType.unknownError }));
    }
  }
);

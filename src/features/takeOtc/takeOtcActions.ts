import {
  decompressFullOrderERC20,
  FullOrderERC20,
  isValidFullOrderERC20,
} from "@airswap/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { providers } from "ethers";

import {
  notifyError,
  notifyRejectedByUserError,
} from "../../components/Toasts/ToastController";
import { SubmittedCancellation } from "../../entities/SubmittedTransaction/SubmittedTransaction";
import { getSwapErc20Contract } from "../../helpers/swapErc20";
import i18n from "../../i18n/i18n";
import {
  TransactionStatusType,
  TransactionTypes,
} from "../../types/transactionTypes";
import { removeOtcUserOrder } from "../myOtcOrders/myOtcOrdersSlice";
import { getNonceUsed } from "../orders/ordersHelpers";
import {
  revertTransaction,
  submitTransaction,
} from "../transactions/transactionsActions";
import { reset, setActiveOrder, setStatus } from "./takeOtcSlice";

export const decompressAndSetActiveOrder = createAsyncThunk(
  "take-otc/decompressAndSetActiveOrder",
  async (params: { compressedOrder: string }, { dispatch }) => {
    dispatch(reset());

    try {
      const order = decompressFullOrderERC20(params.compressedOrder);

      if (!isValidFullOrderERC20(order)) {
        return dispatch(setStatus("invalid"));
      }

      dispatch(setActiveOrder(order));

      dispatch(setStatus("open"));
    } catch (e) {
      console.error(e);
      dispatch(setStatus("invalid"));
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "take-otc/cancelOrder",
  async (
    params: {
      order: FullOrderERC20;
      chainId: number;
      library: providers.Web3Provider;
    },
    { dispatch }
  ) => {
    // pre-cancel checks
    const nonceUsed = await getNonceUsed(params.order, params.library);

    if (nonceUsed) {
      notifyError({
        heading: i18n.t("toast.cancelFailed"),
        cta: i18n.t("validatorErrors.nonce_already_used"),
      });
      dispatch(removeOtcUserOrder(params.order));
      return;
    }

    dispatch(setStatus("signing"));

    const tx = await getSwapErc20Contract(
      params.library.getSigner(),
      params.chainId
    )
      .cancel([params.order.nonce])
      .catch((e: any) => {
        e.code === "ACTION_REJECTED"
          ? notifyRejectedByUserError()
          : notifyError({
              heading: i18n.t("toast.cancelFailed"),
              cta: i18n.t("validatorErrors.unknownError"),
            });
        dispatch(setStatus("failed"));
        dispatch(revertTransaction(transaction));
        return;
      });

    dispatch(setStatus("open"));

    const transaction: SubmittedCancellation = {
      type: TransactionTypes.cancel,
      status: TransactionStatusType.processing,
      hash: tx.hash,
      nonce: params.order.nonce,
      timestamp: Date.now(),
    };

    dispatch(submitTransaction(transaction));
  }
);

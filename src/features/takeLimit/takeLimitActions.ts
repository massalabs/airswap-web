import { Delegate } from "@airswap/libraries";
import { ADDRESS_ZERO, createOrderERC20 } from "@airswap/utils";
import { BaseProvider, Web3Provider } from "@ethersproject/providers";

import { AppDispatch } from "../../app/store";
import { notifyRejectedByUserError } from "../../components/Toasts/ToastController";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import {
  getDelegateRuleCall,
  getSwapErc20ContractAddress,
  takeDelegateRuleCall,
} from "../../entities/DelegateRule/DelegateRuleService";
import { AppErrorType } from "../../errors/appError";
import { isAppError } from "../../errors/appError";
import { createOrderERC20Signature } from "../../helpers/createSwapSignature";
import { setDelegateRule, setStatus } from "./takeLimitSlice";

type GetDelegateOrderParams = {
  senderWallet: string;
  senderToken: string;
  signerToken: string;
  chainId: number;
  library: BaseProvider;
};

export const getDelegateOrder =
  (params: GetDelegateOrderParams) => async (dispatch: AppDispatch) => {
    try {
      const delegateRule = await getDelegateRuleCall(params);

      if (!delegateRule) {
        dispatch(setStatus("invalid"));

        return;
      }

      if (delegateRule.senderWallet === ADDRESS_ZERO) {
        dispatch(setStatus("not-found"));

        return;
      }

      dispatch(setDelegateRule(delegateRule));
      dispatch(setStatus("open"));
    } catch (error) {
      console.error(error);

      dispatch(setStatus("failed"));
    }
  };

type TakeLimitOrderParams = {
  delegateRule: DelegateRule;
  protocolFee: number;
  signerWallet: string;
  senderFilledAmount: string;
  library: Web3Provider;
};

export const takeLimitOrder =
  (params: TakeLimitOrderParams) => async (dispatch: AppDispatch) => {
    try {
      const {
        delegateRule,
        protocolFee,
        signerWallet,
        senderFilledAmount,
        library,
      } = params;

      const swapErc20ContractAddress = await getSwapErc20ContractAddress(
        library,
        delegateRule.chainId
      );

      const unsignedOrder = createOrderERC20({
        expiry: delegateRule.expiry,
        nonce: Date.now().toString(),
        senderWallet: Delegate.getAddress(delegateRule.chainId),
        signerWallet: signerWallet,
        signerToken: delegateRule.signerToken,
        senderToken: delegateRule.senderToken,
        protocolFee,
        signerAmount: delegateRule.signerAmount,
        senderAmount: senderFilledAmount,
        chainId: delegateRule.chainId,
      });

      dispatch(setStatus("signing"));

      const signature = await createOrderERC20Signature(
        unsignedOrder,
        library.getSigner(),
        swapErc20ContractAddress,
        delegateRule.chainId
      );

      if (isAppError(signature)) {
        if (signature.type === AppErrorType.rejectedByUser) {
          dispatch(setStatus("idle"));
          notifyRejectedByUserError();
        } else {
          dispatch(setStatus("failed"));
          // dispatch(setError(signature));
        }
        return;
      }

      takeDelegateRuleCall({
        delegateRule,
        library,
        signature,
        signerWallet,
        unsignedOrder,
      });
    } catch (error) {
      console.error(error);
    }
  };

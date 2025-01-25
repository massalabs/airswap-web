import { ADDRESS_ZERO } from "@airswap/utils";
import { BaseProvider } from "@ethersproject/providers";

import { AppDispatch } from "../../app/store";
import { getDelegateRuleCall } from "../../entities/DelegateRule/DelegateRuleService";
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

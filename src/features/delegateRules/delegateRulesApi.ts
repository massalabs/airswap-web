import { BaseProvider } from "@ethersproject/providers";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { AppDispatch, RootState } from "../../app/store";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { getDelegateRuleCall } from "../../entities/DelegateRule/DelegateRuleService";

export const fetchDelegateRules = createAsyncThunk<
  DelegateRule[],
  { delegateRules: DelegateRule[]; library: BaseProvider },
  { dispatch: AppDispatch; state: RootState }
>("delegateRules/fetchDelegateRules", async ({ delegateRules, library }) => {
  return Promise.all(
    delegateRules.map((rule) =>
      getDelegateRuleCall({
        senderWallet: rule.senderWallet,
        senderToken: rule.senderToken,
        signerToken: rule.signerToken,
        chainId: rule.chainId,
        library,
      })
    )
  );
});

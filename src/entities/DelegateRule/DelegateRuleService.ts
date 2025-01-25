import { Delegate } from "@airswap/libraries";
import { BaseProvider } from "@ethersproject/providers";

import { DelegateRule } from "./DelegateRule";
import { transformToDelegateRule } from "./DelegateRuleTransformers";

type GetDelegateRuleParams = {
  senderWallet: string;
  senderToken: string;
  signerToken: string;
  chainId: number;
  library: BaseProvider;
};

export const getDelegateRuleCall = async (
  params: GetDelegateRuleParams
): Promise<DelegateRule> => {
  const delegateContract = Delegate.getContract(params.library, params.chainId);

  const response = await delegateContract.rules(
    params.senderWallet,
    params.senderToken,
    params.signerToken
  );

  const delegateRule = transformToDelegateRule(
    response.senderWallet,
    response.senderToken.toString(),
    response.senderAmount.toString(),
    response.signerToken.toString(),
    response.signerAmount.toString(),
    params.chainId,
    response.expiry.toString(),
    response.senderFilledAmount.toString()
  );

  return delegateRule;
};

import { Delegate } from "@airswap/libraries";
import { Signature, UnsignedOrderERC20 } from "@airswap/utils";
import { BaseProvider, Web3Provider } from "@ethersproject/providers";

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

type TakeDelegateRuleParams = {
  chainId: number;
  signature: Signature;
  signerWallet: string;
  unsignedOrder: UnsignedOrderERC20;
  library: Web3Provider;
};

export const takeDelegateRuleCall = async (params: TakeDelegateRuleParams) => {
  const {
    chainId,
    unsignedOrder,
    signature,
    signerWallet,
    library,
  } = params;
  const delegateContract = Delegate.getContract(library.getSigner(), chainId);

  console.log(
    unsignedOrder.senderWallet,
    unsignedOrder.nonce,
    unsignedOrder.expiry,
    signerWallet,
    unsignedOrder.signerToken,
    unsignedOrder.signerAmount,
    unsignedOrder.senderToken,
    unsignedOrder.senderAmount,
    signature.v,
    signature.r,
    signature.s
  );

  const tx = await delegateContract.swap(
    unsignedOrder.senderWallet,
    unsignedOrder.nonce,
    unsignedOrder.expiry,
    unsignedOrder.signerWallet,
    unsignedOrder.signerToken,
    unsignedOrder.signerAmount,
    unsignedOrder.senderToken,
    unsignedOrder.senderAmount,
    signature.v,
    signature.r,
    signature.s
  );

  console.log(tx);
};

export const getSwapErc20ContractAddress = (
  library: Web3Provider,
  chainId: number
) => {
  const delegateContract = Delegate.getContract(library, chainId);

  return delegateContract.swapERC20Contract();
};

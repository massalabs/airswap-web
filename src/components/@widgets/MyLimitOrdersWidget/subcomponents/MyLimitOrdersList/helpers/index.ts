import { TokenInfo } from "@airswap/utils";

import { ethers } from "ethers";

import { DelegateRule } from "../../../../../../entities/DelegateRule/DelegateRule";
import { routes } from "../../../../../../routes";
import { OrderStatus } from "../../../../../../types/orderStatus";
import { MyOrder } from "../../../../MyOtcOrdersWidget/entities/Order";
import { findTokenInfo } from "../../../../MyOtcOrdersWidget/subcomponents/MyOtcOrdersList/helpers";

export const getDelegateRuleDataAndTransformToOrder = async (
  delegateRule: DelegateRule,
  activeTokens: TokenInfo[],
  provider: ethers.providers.BaseProvider
): Promise<MyOrder> => {
  const link = routes.limitOrder(
    delegateRule.senderWallet,
    delegateRule.senderToken,
    delegateRule.signerToken,
    delegateRule.chainId
  );

  // TODO: Implement taken / filled status
  const isExpired = new Date().getTime() > delegateRule.expiry * 1000;

  const signerToken = await findTokenInfo(
    delegateRule.signerToken,
    activeTokens,
    provider
  );
  const senderToken = await findTokenInfo(
    delegateRule.senderToken,
    activeTokens,
    provider
  );

  return {
    id: delegateRule.id,
    status: isExpired ? OrderStatus.expired : OrderStatus.open,
    senderToken: senderToken,
    signerToken: signerToken,
    chainId: delegateRule.chainId,
    senderAmount: delegateRule.senderAmount,
    signerAmount: delegateRule.signerAmount,
    expiry: new Date(delegateRule.expiry * 1000),
    link,
  };
};

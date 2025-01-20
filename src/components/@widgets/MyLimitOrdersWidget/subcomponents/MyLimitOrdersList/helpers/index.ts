import { ethers } from "ethers";

import { SubmittedSetRuleTransaction } from "../../../../../../entities/SubmittedTransaction/SubmittedTransaction";
import { routes } from "../../../../../../routes";
import { OrderStatus } from "../../../../../../types/orderStatus";
import { MyOrder } from "../../../../MyOtcOrdersWidget/entities/Order";

export const getDelegateRuleDataAndTransformToOrder = async (
  order: SubmittedSetRuleTransaction,
  provider: ethers.providers.BaseProvider
): Promise<MyOrder> => {
  const link = routes.limitOrder(
    order.rule.senderWallet,
    order.rule.senderToken,
    order.rule.signerToken,
    order.rule.chainId
  );

  // TODO: Implement taken / filled status
  const isExpired = new Date().getTime() > order.rule.expiry * 1000;

  return {
    id: order.hash,
    status: isExpired ? OrderStatus.expired : OrderStatus.open,
    senderToken: order.senderToken,
    signerToken: order.signerToken,
    chainId: order.rule.chainId,
    senderAmount: order.rule.senderAmount,
    signerAmount: order.rule.signerAmount,
    expiry: new Date(order.rule.expiry * 1000),
    link,
  };
};

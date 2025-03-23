import {
  compressFullOrderERC20,
  FullOrder,
  FullOrderERC20,
} from "@airswap/utils";

import { AppTokenInfo } from "../../../../entities/AppTokenInfo/AppTokenInfo";
import { routes } from "../../../../routes";
import { OrderStatus } from "../../../../types/orderStatus";
import { MyOrder } from "./MyOrder";

export const transformFullOrderToMyOrder = (
  order: FullOrder,
  status: OrderStatus,
  signerToken?: AppTokenInfo,
  senderToken?: AppTokenInfo
): MyOrder => {
  // TODO: Add compressFullOrder
  const compressedOrder = compressFullOrderERC20(
    order as unknown as FullOrderERC20
  );

  return {
    id: order.nonce,
    link: routes.otcOrder(compressedOrder),
    status: status,
    chainId: order.chainId,
    senderToken,
    senderAmount: order.sender.amount,
    signerToken,
    signerAmount: order.signer.amount,
    expiry: new Date(Number(order.expiry) * 1000),
  };
};

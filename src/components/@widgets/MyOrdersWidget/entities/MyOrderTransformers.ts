import { compressFullOrderERC20, FullOrderERC20 } from "@airswap/utils";

import { AppTokenInfo } from "../../../../entities/AppTokenInfo/AppTokenInfo";
import { routes } from "../../../../routes";
import { OrderStatus } from "../../../../types/orderStatus";
import { MyOrder } from "./MyOrder";

export const transformErc20OrderToMyOrder = (
  order: FullOrderERC20,
  status: OrderStatus,
  signerToken?: AppTokenInfo,
  senderToken?: AppTokenInfo
): MyOrder => {
  const compressedOrder = compressFullOrderERC20(order);

  return {
    id: order.nonce,
    link: routes.otcOrder(compressedOrder),
    status: status,
    chainId: order.chainId,
    senderToken,
    senderAmount: order.senderAmount,
    signerToken,
    signerAmount: order.signerAmount,
    expiry: new Date(Number(order.expiry) * 1000),
  };
};

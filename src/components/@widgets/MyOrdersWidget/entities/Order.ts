import { TokenInfo } from "@airswap/utils";

import { OrderStatus } from "../../../../types/orderStatus";

export interface MyOrder {
  id: string;
  chainId: number;
  senderToken?: TokenInfo;
  senderAmount: string;
  signerToken?: TokenInfo;
  signerAmount: string;
  status: OrderStatus;
  expiry: Date;
  link: string;
}

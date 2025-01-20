export enum AppRoutes {
  makeOtcOrder = "make-otc-order",
  makeLimitOrder = "make-limit-order",
  myOtcOrders = "my-otc-orders",
  myLimitOrders = "my-limit-orders",
  otcOrder = "otc-order",
  limitOrder = "limit-order",
  swap = "swap",
}

export interface SwapRouteType {
  tokenFrom?: string;
  tokenTo?: string;
}

export enum SwapRoutes {
  tokenFrom = "tokenFrom",
  tokenTo = "tokenTo",
}

export const routes = {
  makeOtcOrder: () => `/${AppRoutes.makeOtcOrder}`,
  makeLimitOrder: () => `/${AppRoutes.makeLimitOrder}`,
  myOtcOrders: () => `/${AppRoutes.myOtcOrders}`,
  myLimitOrders: () => `/${AppRoutes.myLimitOrders}`,
  otcOrder: (compressedOrder: string) =>
    `/${AppRoutes.otcOrder}/${compressedOrder}`,
  limitOrder: (
    senderWallet: string,
    senderToken: string,
    signerToken: string,
    chainId: number
  ) =>
    `/${AppRoutes.limitOrder}/${senderToken}/${signerToken}/${senderWallet}/${chainId}`,
  cancelOtcOrder: (compressedOrder: string) =>
    `/${AppRoutes.otcOrder}/${compressedOrder}/cancel`,
  swap: () => `/${AppRoutes.swap}`,
};

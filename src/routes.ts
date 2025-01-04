export enum AppRoutes {
  make = "make",
  myOrders = "my-orders",
  order = "order",
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
  make: (isLimitOrder?: boolean) =>
    `/${AppRoutes.make}${isLimitOrder ? "?limit=true" : ""}`,
  myOrders: (isLimitOrder?: boolean) =>
    `/${AppRoutes.myOrders}${isLimitOrder ? "?limit=true" : ""}`,
  order: (compressedOrder: string) => `/${AppRoutes.order}/${compressedOrder}`,
  cancelOrder: (compressedOrder: string) =>
    `/${AppRoutes.order}/${compressedOrder}/cancel`,
  swap: () => `/${AppRoutes.swap}`,
};

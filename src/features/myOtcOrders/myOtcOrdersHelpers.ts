import {
  compressFullOrderERC20,
  decompressFullOrderERC20,
  FullOrder,
  FullOrderERC20,
} from "@airswap/utils";

export const getUserOtcOrdersLocalStorageKey: (
  account: string,
  chainId: string | number
) => string = (account, chainId) =>
  `airswap/userOtcOrders/${account}/${chainId}`;

export const writeOtcUserOrdersToLocalStorage = (
  orders: FullOrder[],
  address: string,
  chainId: string | number
): void => {
  const key = getUserOtcOrdersLocalStorageKey(address, chainId);
  localStorage.setItem(
    key,
    // TODO: Need a compressFullOrder function that works with FullOrder
    JSON.stringify(
      orders.map((order) =>
        compressFullOrderERC20(order as unknown as FullOrderERC20)
      )
    )
  );
};

export const getUserOrdersFromLocalStorage = (
  address: string,
  chainId: string | number
): FullOrder[] => {
  const localStorageUserOrders = localStorage.getItem(
    getUserOtcOrdersLocalStorageKey(address, chainId)
  );
  const userOrderStrings: string[] = localStorageUserOrders
    ? JSON.parse(localStorageUserOrders)
    : [];

  // TODO: Need a decompressFullOrder function that works with FullOrder
  return userOrderStrings.map(
    (order) => decompressFullOrderERC20(order) as unknown as FullOrder
  );
};

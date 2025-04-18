import {
  compressFullOrderERC20,
  decompressFullOrderERC20,
  FullOrderERC20,
} from "@airswap/utils";

export const getUserOtcOrdersLocalStorageKey: (
  account: string,
  chainId: string | number
) => string = (account, chainId) =>
  `airswap/userOtcOrders/${account}/${chainId}`;

export const writeOtcUserOrdersToLocalStorage = (
  orders: FullOrderERC20[],
  address: string,
  chainId: string | number
): void => {
  const key = getUserOtcOrdersLocalStorageKey(address, chainId);
  localStorage.setItem(
    key,
    JSON.stringify(orders.map((order) => compressFullOrderERC20(order)))
  );
};

export const getUserOrdersFromLocalStorage = (
  address: string,
  chainId: string | number
): FullOrderERC20[] => {
  const localStorageUserOrders = localStorage.getItem(
    getUserOtcOrdersLocalStorageKey(address, chainId)
  );
  const userOrderStrings: string[] = localStorageUserOrders
    ? JSON.parse(localStorageUserOrders)
    : [];

  return userOrderStrings.map((order) => decompressFullOrderERC20(order));
};

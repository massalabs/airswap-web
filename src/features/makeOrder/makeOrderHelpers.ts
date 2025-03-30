import {
  createOrderSignature as airswapCreateOrderSignature,
  Signature,
  UnsignedOrder,
  decompressFullOrderERC20,
  FullOrderERC20,
  compressFullOrderERC20,
} from "@airswap/utils";
import { JsonRpcSigner } from "@ethersproject/providers/src.ts/json-rpc-provider";

import { AppError } from "../../errors/appError";
import transformUnknownErrorToAppError from "../../errors/transformUnknownErrorToAppError";

export const getUserOtcOrdersLocalStorageKey: (
  account: string,
  chainId: number
) => string = (account, chainId) =>
  `airswap/userOtcOrders/${account}/${chainId}`;

export const writeUserOrdersToLocalStorage = (
  orders: FullOrderERC20[],
  address: string,
  chainId: number
): void => {
  const key = getUserOtcOrdersLocalStorageKey(address, chainId);
  localStorage.setItem(
    key,
    JSON.stringify(orders.map((order) => compressFullOrderERC20(order)))
  );
};

export const getUserOrdersFromLocalStorage = (
  address: string,
  chainId: number
): FullOrderERC20[] => {
  const localStorageUserOrders = localStorage.getItem(
    getUserOtcOrdersLocalStorageKey(address, chainId)
  );
  const userOrderStrings: string[] = localStorageUserOrders
    ? JSON.parse(localStorageUserOrders)
    : [];

  return userOrderStrings.map((order) => decompressFullOrderERC20(order));
};

export const createOrderSignature = (
  unsignedOrder: UnsignedOrder,
  signer: JsonRpcSigner,
  swapContract: string,
  chainId: number
  // eslint-disable-next-line no-async-promise-executor
): Promise<Signature | AppError> =>
  new Promise<Signature | AppError>((resolve) => {
    try {
      airswapCreateOrderSignature(
        unsignedOrder,
        // @ts-ignore
        // Airswap library asking for incorrect VoidSigner. This will be fixed later.
        signer,
        swapContract,
        chainId
      ).then((signature) => {
        resolve(signature);
      });
    } catch (error: unknown) {
      console.error(error);
      resolve(transformUnknownErrorToAppError(error));
    }
  });

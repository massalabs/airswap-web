import { CollectionTokenInfo, TokenInfo, TokenKinds } from "@airswap/utils";

import { isAddress } from "ethers/lib/utils";

import { AppTokenInfo } from "./AppTokenInfo";

export const isTokenInfo = (
  tokenInfo: AppTokenInfo
): tokenInfo is TokenInfo => {
  return "symbol" in tokenInfo;
};

export const isCollectionTokenInfo = (
  tokenInfo: AppTokenInfo
): tokenInfo is CollectionTokenInfo => {
  return (
    "kind" in tokenInfo &&
    (tokenInfo.kind === TokenKinds.ERC1155 ||
      tokenInfo.kind === TokenKinds.ERC721)
  );
};

export const isNftTokenId = (tokenId: string): boolean => {
  const [address, id] = tokenId.split("-");

  return isAddress(address) && !!id;
};

export const getTokenId = (tokenInfo: AppTokenInfo): string => {
  return isCollectionTokenInfo(tokenInfo)
    ? `${tokenInfo.address}-${tokenInfo.id}`
    : tokenInfo.address;
};

export const getTokenDecimals = (tokenInfo: AppTokenInfo): number => {
  return isTokenInfo(tokenInfo) ? tokenInfo.decimals : 0;
};

export const getTokenSymbol = (tokenInfo: AppTokenInfo): string => {
  return isTokenInfo(tokenInfo) ? tokenInfo.symbol : `${tokenInfo.name}`;
};

export const getTokenImage = (tokenInfo: AppTokenInfo): string | undefined => {
  return isTokenInfo(tokenInfo) ? tokenInfo.logoURI : tokenInfo.image;
};

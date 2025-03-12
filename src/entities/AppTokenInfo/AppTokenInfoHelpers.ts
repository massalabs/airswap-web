import { CollectionTokenInfo, TokenInfo, TokenKinds } from "@airswap/utils";

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
    "tokenKind" in tokenInfo &&
    (tokenInfo.tokenKind === TokenKinds.ERC1155 ||
      tokenInfo.tokenKind === TokenKinds.ERC721)
  );
};

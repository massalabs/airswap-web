import {
  CollectionTokenInfo,
  TokenInfo,
  getTokenInfo,
  getCollectionTokenInfo,
} from "@airswap/utils";

import * as ethers from "ethers";

const callGetTokenInfo = (
  address: string,
  provider: ethers.providers.BaseProvider
) => {
  return getTokenInfo(provider, address)
    .then((tokenInfo) => {
      return tokenInfo;
    })
    .catch((e) => {
      return undefined;
    });
};

const callGetCollectionTokenInfo = (
  address: string,
  provider: ethers.providers.BaseProvider
) => {
  return getCollectionTokenInfo(provider, address, "0")
    .then((tokenInfo) => {
      return tokenInfo;
    })
    .catch((e) => {
      return undefined;
    });
};

const scrapeToken = async (
  address: string,
  provider: ethers.providers.BaseProvider
): Promise<TokenInfo | CollectionTokenInfo | undefined> => {
  if (!ethers.utils.isAddress(address)) {
    return undefined;
  }

  const tokenInfo = await callGetTokenInfo(address, provider);

  if (tokenInfo) {
    return tokenInfo;
  }

  return callGetCollectionTokenInfo(address, provider);
};

export default scrapeToken;

export const getActiveTokensLocalStorageKey: (
  account: string,
  chainId: number
) => string = (account, chainId) =>
  `airswap/activeTokens/${account}/${chainId}`;

export const getQuoteTokensLocalStorageKey: (
  account: string,
  chainId: number
) => string = (account, chainId) => `airswap/quoteTokens/${account}/${chainId}`;

export const getUnknownTokensLocalStorageKey: (chainId: number) => string = (
  chainId
) => `airswap/unknownTokens/${chainId}`;

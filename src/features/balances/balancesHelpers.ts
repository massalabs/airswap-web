import { TokenKinds } from "@airswap/utils";

import { OwnedBaseNft } from "alchemy-sdk";
import { BigNumber, ethers, Event } from "ethers";

import erc721AbiContract from "../../abis/erc721.json";
import { getAlchemyClient } from "../../helpers/alchemy";
import { getUniqueSingleDimensionArray } from "../../helpers/array";

type TokenIdsWithBalance = {
  [tokenId: string]: string;
};

const getUniqueTokenIds = (tokenIds: BigNumber[]): string[] =>
  tokenIds
    .sort((a, b) => a.sub(b).toNumber())
    .map((t) => t.toString())
    .filter(getUniqueSingleDimensionArray);

export const transformTokensToTokenIdsWithBalance = (
  tokens: string[]
): TokenIdsWithBalance =>
  tokens
    .sort((a, b) => +a - +b)
    .reduce((acc: TokenIdsWithBalance, tokenId: string) => {
      acc[tokenId] = "1";

      return acc;
    }, {});

export const transformOwnedNftsToTokenIdsWithBalance = (
  ownedNfts: OwnedBaseNft[]
): TokenIdsWithBalance =>
  ownedNfts.reduce((acc: TokenIdsWithBalance, ownedNft: OwnedBaseNft) => {
    acc[ownedNft.tokenId] = ownedNft.balance;

    return acc;
  }, {});

const getOwnedErc721TokensByFilteringEvents = async (
  provider: ethers.providers.BaseProvider,
  walletAddress: string,
  collectionToken: string
): Promise<TokenIdsWithBalance> => {
  const contract = new ethers.Contract(
    collectionToken,
    erc721AbiContract.abi,
    provider
  );
  const transferFilter = contract.filters.Transfer(null, walletAddress);

  const events: Event[] = await contract.queryFilter(transferFilter, 0);

  /* get token ids from past events */
  const foundTokenIds: BigNumber[] = events.map((e) => e.args?.at(2));
  const uniqueTokenIds = getUniqueTokenIds(foundTokenIds);

  /* get owners of tokens */
  const tokenOwners: string[] = await Promise.all(
    uniqueTokenIds.map((tokenId) => contract.ownerOf(tokenId))
  );

  /* get only the owned token ids */
  const ownedTokenIds = uniqueTokenIds.filter(
    (_, index) => tokenOwners[index] === walletAddress
  );

  return transformTokensToTokenIdsWithBalance(ownedTokenIds);
};

const getOwnedTokensByAlchemy = async (
  walletAddress: string,
  collectionToken: string,
  chainId: number
): Promise<TokenIdsWithBalance> => {
  const alchemy = getAlchemyClient(chainId);
  const response = await alchemy.nft.getNftsForOwner(walletAddress, {
    contractAddresses: [collectionToken],
    omitMetadata: true,
  });

  return transformOwnedNftsToTokenIdsWithBalance(response.ownedNfts);
};

export const getOwnedTokenIdsOfWallet = async (
  provider: ethers.providers.BaseProvider,
  walletAddress: string,
  collectionToken: string
): Promise<TokenIdsWithBalance> => {
  const contract = new ethers.Contract(
    collectionToken,
    erc721AbiContract.abi,
    provider
  );

  const [isErc721Enumerable, isErc721, isErc1155] = (await Promise.all([
    contract.supportsInterface("0x780e9d63"), // The interface ID for erc721 enumerable
    contract.supportsInterface(TokenKinds.ERC721),
    contract.supportsInterface(TokenKinds.ERC1155),
  ])) as boolean[];

  if (isErc721) {
    console.log("isErc721");

    return getOwnedTokensByAlchemy(
      walletAddress,
      collectionToken,
      provider.network.chainId
    );

    // try {
    //   return await getOwnedErc721TokensByFilteringEvents(
    //     provider,
    //     walletAddress,
    //     collectionToken
    //   );
    // } catch {
    //   return getOwnedTokensByAlchemy(walletAddress, collectionToken);
    // }
  }

  // if (isErc721Enumerable) {
  //   try {
  //     return await getOwnedErc721EnumerableTokensByFilteringEvents(provider, walletAddress, collectionToken);
  //   } catch {
  //     return getOwnedTokensByAlchemy(walletAddress, collectionToken);
  //   }
  // }

  // if (isErc1155) {
  //   return getOwnedTokensByAlchemy(walletAddress, collectionToken);
  // }

  throw new Error("Unknown nft interface. Could not fetch token ids.");
};

import { useCallback, useEffect } from "react";
import { useState } from "react";

import { CollectionTokenInfo, TokenInfo } from "@airswap/utils";

import { AppTokenInfo } from "../../../entities/AppTokenInfo/AppTokenInfo";
import { isCollectionTokenInfo } from "../../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { getCollectionTokenInfoByAlchemy } from "../../../features/balances/balancesHelpers";
import { compareAddresses } from "../../../helpers/string";
import { addUnknownTokenInfo } from "../../../features/metadata/metadataActions";
import { useDispatch } from "react-redux";

export const useCollectionTokenById = (
  collectionToken: CollectionTokenInfo | undefined,
  tokenId: string,
  chainId: number | undefined,
  allTokens: AppTokenInfo[]
): [CollectionTokenInfo | undefined, boolean] => {
  const dispatch = useDispatch();
  const [nft, setNft] = useState<CollectionTokenInfo>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (nft) {
      console.log("nft", nft);
      dispatch(addUnknownTokenInfo([nft]));
    }
  }, [nft]);

  useEffect(() => {
    console.log(collectionToken, tokenId, chainId, isLoading, isNaN(+tokenId));
    if (!collectionToken || !tokenId || !chainId || isLoading || isNaN(+tokenId)) {
      return;
    }

    if (
      allTokens.some(
        (token) =>
          isCollectionTokenInfo(token) &&
          compareAddresses(token.address, collectionToken.address) &&
          token.id === tokenId
      )
    ) {
      return;
    }

    const fetchNft = async () => {
      setIsLoading(true);
      const nft = await getCollectionTokenInfoByAlchemy(
        collectionToken.address,
        tokenId,
        chainId,
      );
      setNft(nft);
      setIsLoading(false);
    };
    fetchNft();
  }, [collectionToken, tokenId, chainId]);

  return [nft, isLoading];
};

import { useEffect } from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";

import { CollectionTokenInfo, getCollectionTokenInfo } from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { AppTokenInfo } from "../../../entities/AppTokenInfo/AppTokenInfo";
import { isCollectionTokenInfo } from "../../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { addUnknownTokenInfo } from "../../../features/metadata/metadataActions";
import { compareAddresses } from "../../../helpers/string";

export const useCollectionTokenById = (
  collectionToken: CollectionTokenInfo | undefined,
  tokenId: string,
  chainId: number | undefined,
  allTokens: AppTokenInfo[]
): [CollectionTokenInfo | undefined, boolean] => {
  const dispatch = useDispatch();
  const { provider: library } = useWeb3React<Web3Provider>();
  const [nft, setNft] = useState<CollectionTokenInfo>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (nft) {
      dispatch(addUnknownTokenInfo([nft]));
    }
  }, [nft]);

  useEffect(() => {
    if (
      !collectionToken ||
      !tokenId ||
      !chainId ||
      !library ||
      isLoading ||
      isNaN(+tokenId)
    ) {
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
      const nft = await getCollectionTokenInfo(
        library,
        collectionToken.address,
        tokenId
      );
      setNft(nft);
      setIsLoading(false);
    };
    fetchNft();
  }, [collectionToken, tokenId, chainId]);

  return [nft, isLoading];
};

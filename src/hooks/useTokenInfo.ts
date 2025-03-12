import { useMemo } from "react";

import { useAppSelector } from "../app/hooks";
import { AppTokenInfo } from "../entities/AppTokenInfo/AppTokenInfo";
import { selectAllTokenInfo } from "../features/metadata/metadataSlice";
import findEthOrTokenByAddress from "../helpers/findEthOrTokenByAddress";

const useTokenInfo = (token: string | null): AppTokenInfo | null => {
  const activeTokens = useAppSelector(selectAllTokenInfo);
  const { chainId } = useAppSelector((state) => state.web3);

  return useMemo(() => {
    if (!token || !chainId) {
      return null;
    }

    return findEthOrTokenByAddress(token, activeTokens, chainId);
  }, [activeTokens, token, chainId]);
};

export default useTokenInfo;

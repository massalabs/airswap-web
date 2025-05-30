import { useMemo } from "react";

import {
  BaseProvider,
  Web3Provider,
  JsonRpcProvider,
} from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { getRpcUrl } from "../helpers/getRpcUrl";

// Hook for getting library from connected wallet or from rpc url, this way you can still use it in ethers.js methods

const useDefaultLibrary = (
  chainId: number
): Web3Provider | BaseProvider | undefined => {
  const { provider: library } = useWeb3React();

  return useMemo(() => {
    if (library) {
      return library;
    }

    return new JsonRpcProvider(getRpcUrl(chainId));
  }, [library, chainId]);
};

export default useDefaultLibrary;

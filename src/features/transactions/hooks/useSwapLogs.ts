import { useEffect, useState } from "react";

import { Delegate, SwapERC20, Wrapper } from "@airswap/libraries";
import { Contract } from "@ethersproject/contracts";
import { useAsync } from "@react-hookz/web/esm";
import { IAsyncState } from "@react-hookz/web/esm/useAsync/useAsync";
import { useWeb3React } from "@web3-react/core";

import { Event } from "ethers";

import getContractEvents from "../../../helpers/getContractEvents";
import { getSwapErc20Contract } from "../../../helpers/swapErc20";
import useNetworkSupported from "../../../hooks/useNetworkSupported";

interface SwapLogs {
  swapLogs: Event[];
  wrappedSwapLogs: Event[];
  delegatedSwapLogs: Event[];
  chainId: number;
  account: string;
}

const useSwapLogs = (
  chainId?: number,
  account?: string | null
): IAsyncState<SwapLogs | null> => {
  const { provider } = useWeb3React();
  const isNetworkSupported = useNetworkSupported();

  const [accountState, setAccountState] = useState<string>();
  const [chainIdState, setChainIdState] = useState<number>();

  const [state, actions] = useAsync(
    async (
      swapContract: Contract,
      wrapperContract: Contract,
      delegatedSwapContract: Contract,
      account: string
    ) => {
      const signerSwapFilter = swapContract.filters.SwapERC20(null);
      const wrapperSwapFilter = wrapperContract.filters.WrappedSwapFor(null);
      const delegatedSwapFilter =
        delegatedSwapContract.filters.DelegatedSwapFor(null);

      const firstTxBlockSwapContract =
        chainId && SwapERC20.deployedBlocks[chainId];
      const firstTxBlockWrapperContract =
        chainId && Wrapper.deployedBlocks[chainId];
      const firstTxBlockDelegatedSwapContract =
        chainId && SwapERC20.deployedBlocks[chainId];
      const currentBlock = await provider?.getBlockNumber();

      if (
        !firstTxBlockSwapContract ||
        !firstTxBlockWrapperContract ||
        !firstTxBlockDelegatedSwapContract ||
        !currentBlock
      ) {
        throw new Error("Could not get block numbers");
      }

      const swapLogs = await getContractEvents(
        swapContract,
        signerSwapFilter,
        firstTxBlockSwapContract,
        currentBlock
      );
      const wrappedSwapLogs = await getContractEvents(
        wrapperContract,
        wrapperSwapFilter,
        firstTxBlockWrapperContract,
        currentBlock
      );

      const delegatedSwapLogs = await getContractEvents(
        delegatedSwapContract,
        delegatedSwapFilter,
        firstTxBlockDelegatedSwapContract,
        currentBlock
      );

      return {
        swapLogs,
        wrappedSwapLogs,
        delegatedSwapLogs,
        chainId,
        account,
      };
    },
    null
  );

  useEffect(() => {
    if (!chainId || !account || !provider || !isNetworkSupported) return;

    if (account === accountState && chainId === chainIdState) return;

    const swapContract = SwapERC20.getContract(provider, chainId);
    const wrapperContract = Wrapper.getContract(provider, chainId);
    const delegatedSwapContract = Delegate.getContract(provider, chainId);
    actions.execute(
      swapContract,
      wrapperContract,
      delegatedSwapContract,
      account
    );

    setAccountState(account);
    setChainIdState(chainId);
  }, [chainId, account, provider, actions, isNetworkSupported]);

  return state;
};

export default useSwapLogs;

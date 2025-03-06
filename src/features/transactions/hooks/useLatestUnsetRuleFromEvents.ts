import { useEffect, useState } from "react";

import { Delegate } from "@airswap/libraries";
import { useWeb3React } from "@web3-react/core";

import { Event } from "ethers";

import { DelegateUnsetRuleEvent } from "../../../entities/DelegateRule/DelegateRule";
import { transformToDelegateUnsetRuleEvent } from "../../../entities/DelegateRule/DelegateRuleTransformers";
import { compareAddresses } from "../../../helpers/string";
import useDebounce from "../../../hooks/useDebounce";
import useNetworkSupported from "../../../hooks/useNetworkSupported";

const useLatestUnsetRuleFromEvents = (
  chainId?: number,
  account?: string | null
): DelegateUnsetRuleEvent | undefined => {
  const { provider } = useWeb3React();
  const isNetworkSupported = useNetworkSupported();

  const [accountState, setAccountState] = useState<string>();
  const [chainIdState, setChainIdState] = useState<number>();
  const [latestUnsetRule, setLatestUnsetRule] =
    useState<DelegateUnsetRuleEvent>();
  const [debouncedLatestUnsetRule, setDebouncedLatestUnsetRule] =
    useState<DelegateUnsetRuleEvent>();

  useDebounce(
    () => {
      setDebouncedLatestUnsetRule(latestUnsetRule);
    },
    1000,
    [latestUnsetRule]
  );

  useEffect(() => {
    if (!chainId || !account || !provider || !isNetworkSupported) return;

    if (account === accountState && chainId === chainIdState) return;

    const delegateContract = Delegate.getContract(
      provider.getSigner(),
      chainId
    );
    const eventName: DelegateUnsetRuleEvent["name"] = "UnsetRule";

    const handleEvent = async (
      senderWallet: string,
      senderToken: string,
      signerToken: string,
      event: Event
    ) => {
      console.log("senderWallet", senderWallet);
      console.log("senderToken", senderToken);
      console.log("signerToken", signerToken);
      console.log("event", event);
      if (!compareAddresses(senderWallet, account)) {
        return;
      }

      const receipt = await event.getTransactionReceipt();
      console.log("receipt", receipt);

      setLatestUnsetRule(
        transformToDelegateUnsetRuleEvent(
          senderWallet,
          senderToken,
          signerToken,
          chainId,
          event.transactionHash,
          receipt.status
        )
      );
    };

    delegateContract.on(eventName, handleEvent);

    setAccountState(account);
    setChainIdState(chainId);

    return () => {
      delegateContract.off(eventName, handleEvent);
    };
  }, [chainId, account, provider, isNetworkSupported]);

  return debouncedLatestUnsetRule;
};

export default useLatestUnsetRuleFromEvents;

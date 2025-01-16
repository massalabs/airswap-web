import { useEffect, useState } from "react";

import { useAppSelector } from "../../../app/hooks";
import { TransactionEvent } from "../../../types/transactionTypes";
import useLatestApproveFromEvents from "./useLatestApproveFromEvents";
import useLatestCancelFromEvents from "./useLatestCancelFromEvents";
import useLatestDepositOrWithdrawFromEvents from "./useLatestDepositOrWithdrawFromEvents";
import useLatestSetRuleFromEvents from "./useLatestSetRuleFromEvents";
import useLatestSwapFromEvents from "./useLatestSwapFromEvents";

const useLatestTransactionEvent = () => {
  const { account, chainId } = useAppSelector((state) => state.web3);

  const latestSwapEvent = useLatestSwapFromEvents(chainId, account);
  const latestApproveEvent = useLatestApproveFromEvents(chainId, account);
  const latestDepositOrWithdrawEvent = useLatestDepositOrWithdrawFromEvents(
    chainId,
    account
  );
  const latestCancelEvent = useLatestCancelFromEvents(chainId, account);
  const latestSetRuleEvent = useLatestSetRuleFromEvents(chainId, account);

  const [latestEvent, setLatestEvent] = useState<TransactionEvent>();

  useEffect(() => {
    if (latestSwapEvent) {
      setLatestEvent(latestSwapEvent);
    }
  }, [latestSwapEvent]);

  useEffect(() => {
    if (latestApproveEvent) {
      setLatestEvent(latestApproveEvent);
    }
  }, [latestApproveEvent]);

  useEffect(() => {
    if (latestDepositOrWithdrawEvent) {
      setLatestEvent(latestDepositOrWithdrawEvent);
    }
  }, [latestDepositOrWithdrawEvent]);

  useEffect(() => {
    if (latestCancelEvent) {
      setLatestEvent(latestCancelEvent);
    }
  }, [latestCancelEvent]);

  useEffect(() => {
    if (latestSetRuleEvent) {
      setLatestEvent(latestSetRuleEvent);
    }
  }, [latestSetRuleEvent]);

  return latestEvent;
};

export default useLatestTransactionEvent;

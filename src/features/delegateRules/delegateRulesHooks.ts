import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setDelegateRules, setIsInitialized } from "./delegateRulesSlice";
import useSetRuleLogs from "./hooks/useSetRuleLogs";

export const useDelegateRules = () => {
  const { account, chainId } = useAppSelector((state) => state.web3);
  // We need to wait for the transactions to be initialized to prevent querying the contract events simultaneously
  const { isInitialized: isTransactionsInitialized } = useAppSelector(
    (state) => state.transactions
  );
  const { isInitialized: isDelegateRulesInitialized, delegateRules } =
    useAppSelector((state) => state.delegateRules);

  const dispatch = useAppDispatch();
  const { result: setRuleLogs, status } = useSetRuleLogs(
    chainId,
    isTransactionsInitialized ? account : null
  );

  useEffect(() => {
    if (!setRuleLogs) {
      return;
    }

    if (
      !isTransactionsInitialized ||
      status !== "success" ||
      setRuleLogs.chainId !== chainId ||
      setRuleLogs.account !== account
    ) {
      return;
    }

    dispatch(setDelegateRules(setRuleLogs.delegateRules));
    dispatch(setIsInitialized(true));
  }, [
    isTransactionsInitialized,
    status,
    setRuleLogs,
    chainId,
    account,
    dispatch,
  ]);
};

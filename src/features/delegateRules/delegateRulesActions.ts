import { AppDispatch, RootState } from "../../app/store";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { getUniqueDelegateRules } from "../../entities/DelegateRule/DelegateRuleHelpers";
import { compareAddresses } from "../../helpers/string";
import { setDelegateRules } from "./delegateRulesSlice";

export const submitDelegateRuleToStore =
  (newDelegateRule: DelegateRule) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    const state = getState();
    const { delegateRules } = state.delegateRules;

    if (delegateRules.some((rule) => rule.id === newDelegateRule.id)) {
      console.warn(
        "[submitDelegateRuleToStore]: delegateRule already exists in store"
      );

      return;
    }

    const updatedDelegateRules = getUniqueDelegateRules([
      ...delegateRules,
      newDelegateRule,
    ]);

    dispatch(setDelegateRules(updatedDelegateRules));
  };

type UnsetDelegateRuleFromStoreProps = {
  chainId: number;
  senderWallet: string;
  senderToken: string;
  signerToken: string;
};

export const unsetDelegateRuleFromStore =
  (props: UnsetDelegateRuleFromStoreProps) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    const state = getState();
    const { chainId, senderWallet, senderToken, signerToken } = props;

    const filteredDelegateRules = state.delegateRules.delegateRules.filter(
      (rule) =>
        !(
          rule.chainId === chainId &&
          compareAddresses(rule.senderWallet, senderWallet) &&
          compareAddresses(rule.senderToken, senderToken) &&
          compareAddresses(rule.signerToken, signerToken)
        )
    );

    if (
      filteredDelegateRules.length === state.delegateRules.delegateRules.length
    ) {
      console.warn(
        "[unsetDelegateRuleFromStore]: delegateRule not found in store"
      );

      return;
    }

    dispatch(setDelegateRules(filteredDelegateRules));
  };

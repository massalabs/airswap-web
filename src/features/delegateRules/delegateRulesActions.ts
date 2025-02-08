import { AppDispatch, RootState } from "../../app/store";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { getUniqueDelegateRules } from "../../entities/DelegateRule/DelegateRuleHelpers";
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

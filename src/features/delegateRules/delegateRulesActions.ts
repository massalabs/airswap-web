import { AppDispatch, RootState } from "../../app/store";
import { DelegateRule } from "../../entities/DelegateRule/DelegateRule";
import { getUniqueDelegateRules } from "../../entities/DelegateRule/DelegateRuleHelpers";
import {
  DelegateRulesFilledState,
  setDelegateRules,
  setFilledState,
} from "./delegateRulesSlice";

export const submitDelegateRuleToStore =
  (delegateRule: DelegateRule) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    const state = getState();
    const { delegateRules } = state.delegateRules;

    if (delegateRules.some((rule) => rule.id === delegateRule.id)) {
      console.warn(
        "[submitDelegateRuleToStore]: delegateRule already exists in store"
      );

      return;
    }

    const updatedDelegateRules = getUniqueDelegateRules([
      ...delegateRules,
      delegateRule,
    ]);

    dispatch(setDelegateRules(updatedDelegateRules));
  };

// TODO: Caulcate filled state of delegate rules with event logs.
// Right now this is a temporary function to set the filled state to 0 of the delegate rules.
export const setDelegateRuleFilledState =
  (delegateRule: DelegateRule[]) => (dispatch: AppDispatch) => {
    const filledState: DelegateRulesFilledState = delegateRule.reduce(
      (acc, rule) => {
        acc[rule.id] = 0;
        return acc;
      },
      {} as DelegateRulesFilledState
    );

    dispatch(setFilledState(filledState));
  };

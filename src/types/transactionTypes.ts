import { ApproveEvent } from "../entities/ApproveEvent/ApproveEvent";
import { CancelEvent } from "../entities/CancelEvent/CancelEvent";
import { DelegateSetRuleEvent } from "../entities/DelegateRule/DelegateRule";
import { FullSwapERC20Event } from "../entities/FullSwapERC20Event/FullSwapERC20Event";
import { WETHEvent } from "../entities/WETHEvent/WETHEvent";

export type TransactionEvent =
  | FullSwapERC20Event
  | ApproveEvent
  | WETHEvent
  | CancelEvent
  | DelegateSetRuleEvent;

export enum TransactionTypes {
  approval = "approval",
  cancel = "cancel",
  delegateSwap = "delegateSwap",
  deposit = "deposit",
  order = "order",
  setDelegateRule = "setDelegateRule",
  withdraw = "withdraw",
}

export enum TransactionStatusType {
  declined = "declined",
  failed = "failed",
  expired = "expired",
  processing = "processing",
  reverted = "reverted",
  succeeded = "succeeded",
}

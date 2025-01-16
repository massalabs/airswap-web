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
  order = "order",
  setDelegateRule = "setDelegateRule",
  deposit = "deposit",
  withdraw = "withdraw",
  cancel = "cancel",
}

export enum TransactionStatusType {
  declined = "declined",
  failed = "failed",
  expired = "expired",
  processing = "processing",
  reverted = "reverted",
  succeeded = "succeeded",
}

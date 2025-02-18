import { BigNumber } from "bignumber.js";
import i18n from "i18next";

import { OrderStatus } from "../../../../types/orderStatus";

export const getTokenAmountWithDecimals = (
  amount: string,
  decimals = 18
): BigNumber => {
  return new BigNumber(amount).div(10 ** decimals);
};

export const getOrderStatusTranslation = (status: OrderStatus): string => {
  if (status === OrderStatus.canceled) {
    return i18n.t("common.canceled");
  }

  if (status === OrderStatus.taken) {
    return i18n.t("common.taken");
  }

  if (status === OrderStatus.expired) {
    return i18n.t("common.expired");
  }

  if (status === OrderStatus.filled) {
    return i18n.t("common.filled");
  }

  return i18n.t("common.active");
};

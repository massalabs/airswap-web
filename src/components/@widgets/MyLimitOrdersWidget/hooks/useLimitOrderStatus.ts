import { useEffect, useMemo, useState } from "react";

import { DelegateRule } from "../../../../entities/DelegateRule/DelegateRule";
import { OrderStatus } from "../../../../types/orderStatus";

export const useLimitOrderStatus = (order: DelegateRule): OrderStatus => {
  const expiry = useMemo(() => order.expiry * 1000, [order]);
  const [isExpired, setIsExpired] = useState(new Date().getTime() > expiry);
  const isFilled = order.senderFilledAmount === order.senderAmount;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExpired(new Date().getTime() > expiry);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  if (isFilled) {
    return OrderStatus.taken;
  }

  return isExpired ? OrderStatus.expired : OrderStatus.open;
};

import { FC, useCallback, useEffect, useState } from "react";

import { TokenInfo } from "@airswap/utils";

import * as ethers from "ethers";

import { useAppSelector } from "../../../../../app/hooks";
import { DelegateRule } from "../../../../../entities/DelegateRule/DelegateRule";
import { selectAllTokenInfo } from "../../../../../features/metadata/metadataSlice";
import { OrdersSortType } from "../../../../../features/myOrders/myOrdersSlice";
import { MyOrder } from "../../../MyOtcOrdersWidget/entities/Order";
import MyOrdersList from "../../../MyOtcOrdersWidget/subcomponents/MyOrdersList/MyOrdersList";
import { getDelegateRuleDataAndTransformToOrder } from "./helpers";

interface MyLimitOrdersListProps {
  activeCancellationId?: string;
  activeSortType: OrdersSortType;
  activeTokens: TokenInfo[];
  delegateRules: DelegateRule[];
  sortTypeDirection: Record<OrdersSortType, boolean>;
  library: ethers.providers.BaseProvider;
  onDeleteOrderButtonClick: (order: DelegateRule) => void;
  onSortButtonClick: (type: OrdersSortType) => void;
  className?: string;
}

const MyLimitOrdersList: FC<MyLimitOrdersListProps> = ({
  activeCancellationId,
  activeSortType,
  delegateRules,
  library,
  sortTypeDirection,
  onDeleteOrderButtonClick,
  onSortButtonClick,
  className,
}) => {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTokens = useAppSelector(selectAllTokenInfo);

  const callGetOrders = useCallback(async () => {
    const newOrders = await Promise.all(
      delegateRules.map((order) =>
        getDelegateRuleDataAndTransformToOrder(order, activeTokens, library)
      )
    );

    setOrders(newOrders);
    setIsLoading(false);
  }, [delegateRules, activeTokens, activeCancellationId]);

  const handleDeleteOrderButtonClick = (order: MyOrder): void => {
    const orderToDelete = delegateRules.find((o) => o.id === order.id);

    if (orderToDelete) {
      onDeleteOrderButtonClick(orderToDelete);
    }
  };

  useEffect(() => {
    if (!activeCancellationId) {
      return;
    }

    setOrders(
      orders.map((order) => ({
        ...order,
        isLoading: order.id === activeCancellationId,
      }))
    );
  }, [activeCancellationId]);

  useEffect(() => {
    callGetOrders();
  }, []);

  return (
    <MyOrdersList
      isLoading={isLoading}
      activeSortType={activeSortType}
      orders={orders}
      sortTypeDirection={sortTypeDirection}
      className={className}
      onDeleteOrderButtonClick={handleDeleteOrderButtonClick}
      onSortButtonClick={onSortButtonClick}
    />
  );
};

export default MyLimitOrdersList;

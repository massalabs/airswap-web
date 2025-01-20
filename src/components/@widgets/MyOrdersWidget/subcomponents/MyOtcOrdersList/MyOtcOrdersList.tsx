import { FC, useCallback, useEffect, useState } from "react";

import { FullOrderERC20, TokenInfo } from "@airswap/utils";

import * as ethers from "ethers";

import { useAppSelector } from "../../../../../app/hooks";
import { selectAllTokenInfo } from "../../../../../features/metadata/metadataSlice";
import { OrdersSortType } from "../../../../../features/myOrders/myOrdersSlice";
import { MyOrder } from "../../entities/Order";
import MyOrdersList from "../MyOrdersList/MyOrdersList";
import { getFullOrderERC20DataAndTransformToOrder } from "./helpers";

interface MyOrdersListProps {
  activeSortType: OrdersSortType;
  activeTokens: TokenInfo[];
  erc20Orders: FullOrderERC20[];
  sortTypeDirection: Record<OrdersSortType, boolean>;
  library: ethers.providers.BaseProvider;
  onDeleteOrderButtonClick: (order: FullOrderERC20) => void;
  onSortButtonClick: (type: OrdersSortType) => void;
  className?: string;
}

const MyOtcOrdersList: FC<MyOrdersListProps> = ({
  activeSortType,
  erc20Orders,
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
      erc20Orders.map((order) =>
        getFullOrderERC20DataAndTransformToOrder(order, activeTokens, library)
      )
    );

    setOrders(newOrders);
    setIsLoading(false);
  }, [erc20Orders, activeTokens]);

  const handleDeleteOrderButtonClick = (order: MyOrder): void => {
    const orderToDelete = erc20Orders.find((o) => o.nonce === order.id);

    if (orderToDelete) {
      onDeleteOrderButtonClick(orderToDelete);
    }
  };

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

export default MyOtcOrdersList;

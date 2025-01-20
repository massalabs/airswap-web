import { OrdersSortType } from "../../../../../../features/myOrders/myOrdersSlice";
import { MyOrder } from "../../../entities/Order";

export const getSortedOrders = (
  orders: MyOrder[],
  sortType: OrdersSortType,
  isReverse: boolean
) => {
  const array = [...orders];

  if (sortType === "senderToken") {
    array.sort((a, b) =>
      (a.senderToken?.name?.toLocaleLowerCase() || "") <
      (b.senderToken?.name?.toLocaleLowerCase() || "")
        ? -1
        : 1
    );
  }

  if (sortType === "signerToken") {
    array.sort((a, b) =>
      (a.signerToken?.name?.toLocaleLowerCase() || "") <
      (b.signerToken?.name?.toLocaleLowerCase() || "")
        ? -1
        : 1
    );
  }

  // TODO: sort on order canceled or not
  if (sortType === "active" || sortType === "expiry") {
    array.sort((a, b) => {
      return b.expiry.getTime() - a.expiry.getTime();
    });
  }

  if (isReverse) {
    array.reverse();
  }

  return array;
};

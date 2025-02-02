import { FC, PropsWithChildren, useMemo, useState } from "react";

import { getExpiryTranslation } from "../../../../../helpers/getExpiryTranslation";
import { getHumanReadableNumber } from "../../../../../helpers/getHumanReadableNumber";
import { OrderStatus } from "../../../../../types/orderStatus";
import LoadingSpinner from "../../../../LoadingSpinner/LoadingSpinner";
import useFormattedTokenAmount from "../../../OtcOrderDetailWidget/hooks/useFormattedTokenAmount";
import { MyOrder as MyOrderInterface } from "../../entities/Order";
import {
  getOrderStatusTranslation,
  getTokenAmountWithDecimals,
} from "../../helpers";
import {
  ActionButton,
  ActionButtonContainer,
  Circle,
  Container,
  FilledAmount,
  OrderStatusLabel,
  SenderAmount,
  SignerAmount,
  StatusIndicator,
  StyledNavLink,
  Text,
  TokenIcon,
  Tokens,
} from "./Order.styles";

interface OrderProps {
  hasFilledColumn?: boolean;
  isCancelInProgress: boolean;
  order: MyOrderInterface;
  index: number;
  onDeleteOrderButtonClick: (order: MyOrderInterface) => void;
  onDeleteOrderButtonMouseEnter: (index: number, orderIsOpen: boolean) => void;
  onDeleteOrderButtonMouseLeave: () => void;
  onStatusIndicatorMouseEnter: (index: number, status: OrderStatus) => void;
  onStatusIndicatorMouseLeave: () => void;
  className?: string;
}

const Order: FC<PropsWithChildren<OrderProps>> = ({
  hasFilledColumn,
  isCancelInProgress,
  order,
  index,
  onDeleteOrderButtonClick,
  onDeleteOrderButtonMouseEnter,
  onDeleteOrderButtonMouseLeave,
  onStatusIndicatorMouseEnter,
  onStatusIndicatorMouseLeave,
  className,
}) => {
  const [isHoveredActionButton, setIsHoveredActionButton] = useState(false);

  const senderAmount = useMemo(
    () =>
      order.senderToken
        ? getHumanReadableNumber(
            getTokenAmountWithDecimals(
              order.senderAmount,
              order.senderToken.decimals
            ).toString()
          )
        : "",
    [order]
  );

  const signerAmount = useMemo(
    () =>
      order.signerToken
        ? getHumanReadableNumber(
            getTokenAmountWithDecimals(
              order.signerAmount,
              order.signerToken.decimals
            ).toString()
          )
        : "",
    [order]
  );

  const timeLeft = useMemo(() => {
    return getExpiryTranslation(new Date(), order.expiry);
  }, [order]);

  const orderStatusTranslation = useMemo(
    () => getOrderStatusTranslation(order.status),
    [order.status]
  );

  const filledAmount = useFormattedTokenAmount(
    order.senderFilledAmount,
    order.senderToken?.decimals
  );

  const handleDeleteOrderButtonClick = () => {
    onDeleteOrderButtonClick(order);
    setIsHoveredActionButton(false);
  };

  const handleActionButtonMouseEnter = () => {
    setIsHoveredActionButton(true);
    onDeleteOrderButtonMouseEnter(index, order.status === OrderStatus.open);
  };

  const handleActionButtonMouseLeave = () => {
    setIsHoveredActionButton(false);
    onDeleteOrderButtonMouseLeave();
  };

  return (
    <Container
      hasFilledColumn={hasFilledColumn}
      orderStatus={order.status}
      className={className}
    >
      <StatusIndicator
        onMouseEnter={() => onStatusIndicatorMouseEnter(index, order.status)}
        onMouseLeave={onStatusIndicatorMouseLeave}
      >
        <Circle />
      </StatusIndicator>
      <Tokens>
        <TokenIcon logoURI={order.signerToken?.logoURI} />
        <TokenIcon logoURI={order.senderToken?.logoURI} />
      </Tokens>
      {hasFilledColumn && (
        <FilledAmount>{`${filledAmount} ${
          order.signerToken?.symbol || ""
        }`}</FilledAmount>
      )}
      <SignerAmount>{`${signerAmount} ${
        order.signerToken?.symbol || ""
      }`}</SignerAmount>
      <SenderAmount>{`${senderAmount} ${
        order.senderToken?.symbol || ""
      }`}</SenderAmount>
      <OrderStatusLabel>
        {order.status === OrderStatus.open ? timeLeft : orderStatusTranslation}
      </OrderStatusLabel>
      <StyledNavLink $isHovered={isHoveredActionButton} to={order.link} />

      <ActionButtonContainer>
        {isCancelInProgress ? (
          <LoadingSpinner />
        ) : (
          <ActionButton
            icon={order.status !== OrderStatus.open ? "bin" : "button-x"}
            iconSize={order.status === OrderStatus.open ? 0.5625 : 0.675}
            onClick={handleDeleteOrderButtonClick}
            onMouseEnter={handleActionButtonMouseEnter}
            onMouseLeave={handleActionButtonMouseLeave}
          />
        )}
      </ActionButtonContainer>
    </Container>
  );
};

export default Order;

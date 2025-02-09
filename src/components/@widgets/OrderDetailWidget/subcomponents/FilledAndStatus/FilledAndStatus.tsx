import { FC } from "react";

import { OrderStatus } from "../../../../../types/orderStatus";
import { OrderType } from "../../../../../types/orderTypes";
import {
  Container,
  FilledAmount,
  StyledOrderStatusInfo,
  Title,
} from "./FilledAndStatus.styles";

interface FilledAndStatusProps {
  isLoading?: boolean;
  expiry: Date;
  filledAmount?: string;
  filledPercentage: number;
  link?: string;
  orderType: OrderType;
  status: OrderStatus;
  tokenSymbol?: string;
  className?: string;
}

export const FilledAndStatus: FC<FilledAndStatusProps> = ({
  isLoading = false,
  expiry,
  filledAmount,
  filledPercentage,
  link,
  status,
  tokenSymbol = "?",
  className,
}) => {
  const roundedFilledPercentage = Math.round(filledPercentage * 100) / 100;

  return (
    <Container className={className}>
      <FilledAmount>
        <Title>Filled:</Title>
        {`${filledAmount} ${tokenSymbol} (${roundedFilledPercentage}%)`}
      </FilledAmount>

      <StyledOrderStatusInfo
        isLoading={isLoading}
        expiry={expiry}
        link={link}
        status={status}
      />
    </Container>
  );
};

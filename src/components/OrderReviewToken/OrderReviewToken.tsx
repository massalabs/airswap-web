import {
  Amount,
  Container,
  Label,
  StyledTokenLogo,
  Symbol,
} from "./OrderReviewToken.styles";
import { FC, ReactElement } from "react";

interface OrderReviewTokenProps {
  amount: string;
  label: string;
  tokenSymbol: string;
  tokenUri?: string;
  className?: string;
}

const OrderReviewToken: FC<OrderReviewTokenProps> = ({
  amount,
  label,
  tokenSymbol,
  tokenUri,
  className = "",
}): ReactElement => {
  return (
    <Container className={className}>
      <Label>{label}</Label>
      <Amount>{amount}</Amount>
      <Symbol>{tokenSymbol}</Symbol>
      <StyledTokenLogo logoURI={tokenUri} size="small" />
    </Container>
  );
};

export default OrderReviewToken;

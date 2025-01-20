import styled from "styled-components/macro";

import { MyOrdersGrid } from "../../MyOtcOrdersWidget.styles";

export const Container = styled.div<{ hasOverflow: boolean }>`
  ${MyOrdersGrid};

  padding-right: ${({ hasOverflow }) => (hasOverflow ? "2.5rem" : "2rem")};
`;

export const PairButtonWrapper = styled.div`
  overflow: hidden;
`;

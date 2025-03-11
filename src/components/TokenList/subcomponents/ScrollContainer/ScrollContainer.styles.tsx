import { css } from "styled-components/macro";
import styled from "styled-components/macro";

import { ScrollContainer } from "../../../ModalOverlay/ModalOverlay.styles";

type ContainerProps = {
  $overflow: boolean;
  $scrolledToBottom: boolean;
};

export const Container = styled(ScrollContainer)<ContainerProps>`
  position: relative;
  margin-block-start: 0.625rem;
  margin-inline-start: -0.875rem;
  width: calc(100% + 3.25rem);
  max-height: 20rem;
  padding-inline: 0.875rem 2.25rem;
  padding-block-start: 0.125rem;

  ${(props) =>
    props.$scrolledToBottom &&
    css`
      -webkit-mask-image: none;
    `}
`;

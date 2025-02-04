import styled from "styled-components/macro";

import { sizes } from "../../../style/sizes";
import { Container as PageNavigation } from "../../PageNavigation/PageNavigation.styles";
import ActionButtons from "./subcomponents/ActionButtons/ActionButtons";
import { FilledAndStatus } from "./subcomponents/FilledAndStatus/FilledAndStatus";
import InfoSection from "./subcomponents/InfoSection/InfoSection";
import { RecipientAndStatus } from "./subcomponents/RecipientAndStatus/RecipientAndStatus";

export const Container = styled.div<{ hidePageNavigation?: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;

  ${({ hidePageNavigation }) =>
    hidePageNavigation &&
    `& + ${PageNavigation} {
      display: none;
    }
  `}
`;

export const StyledRecipientAndStatus = styled(RecipientAndStatus)`
  margin-block-start: ${sizes.widgetGutter};
`;

export const StyledFilledAndStatus = styled(FilledAndStatus)`
  margin-block-start: ${sizes.widgetGutter};
`;

export const StyledInfoSection = styled(InfoSection)`
  margin-top: ${sizes.widgetGutter};
`;

export const StyledActionButtons = styled(ActionButtons)`
  margin-top: ${sizes.widgetGutter};
`;

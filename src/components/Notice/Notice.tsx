import { FC } from "react";

import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import { CloseButton, Container, StyledIcon, Text } from "./Notice.styles";

interface NoticeProps {
  className?: string;
  text: string;
}

export const Notice: FC<NoticeProps> = ({ className, text }) => {
  return (
    <Container className={className}>
      <StyledIcon name="information-circle" iconSize={1.5} />
      <Text>{text}</Text>
      <CloseButton>
        <Icon name="close" iconSize={1} />
      </CloseButton>
    </Container>
  );
};

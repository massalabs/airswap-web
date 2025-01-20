import React, { FC, useMemo } from "react";

import { AppRoutes } from "../../../../../routes";
import { Container, SignButton, StyledLink } from "./ActionButtons.styles";
import { getActionButtonTranslation } from "./helpers";

export enum ButtonActions {
  connectWallet,
  switchNetwork,
  newOrder,
  removeOrder,
  goBack,
}

type ActionButtonsProps = {
  walletIsNotConnected: boolean;
  className?: string;
  onActionButtonClick: (action: ButtonActions) => void;
};

const ActionButtons: FC<ActionButtonsProps> = ({
  walletIsNotConnected,
  className,
  onActionButtonClick,
}) => {
  const buttonText = useMemo(() => {
    return getActionButtonTranslation(walletIsNotConnected);
  }, [walletIsNotConnected]);

  const showNewOrderLink = useMemo(
    () => !walletIsNotConnected,
    [walletIsNotConnected]
  );

  const handleActionButtonClick = () => {
    if (walletIsNotConnected) {
      onActionButtonClick(ButtonActions.connectWallet);
    } else {
      onActionButtonClick(ButtonActions.newOrder);
    }
  };

  return (
    <Container className={className}>
      {showNewOrderLink ? (
        <StyledLink to={AppRoutes.makeOtcOrder}>{buttonText}</StyledLink>
      ) : (
        <SignButton intent="primary" onClick={handleActionButtonClick}>
          {buttonText}
        </SignButton>
      )}
    </Container>
  );
};

export default ActionButtons;

import { FC, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import { FullOrderERC20 } from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { cancelOrder } from "../../../features/takeOtc/takeOtcActions";
import { selectTakeOtcStatus } from "../../../features/takeOtc/takeOtcSlice";
import useCancellationPending from "../../../hooks/useCancellationPending";
import useCancellationSuccess from "../../../hooks/useCancellationSuccess";
import { routes } from "../../../routes";
import { OrderStatus } from "../../../types/orderStatus";
import Icon from "../../Icon/Icon";
import SubmittedCancellationScreen from "../../SubmittedCancellationScreen/SubmittedCancellationScreen";
import TransactionOverlay from "../../TransactionOverlay/TransactionOverlay";
import { Title } from "../../Typography/Typography";
import { InfoSubHeading } from "../../Typography/Typography";
import WalletSignScreen from "../../WalletSignScreen/WalletSignScreen";
import { useOtcOrderStatus } from "../OtcOrderDetailWidget/hooks/useOtcOrderStatus";
import {
  Container,
  StyledInfoHeading,
  Header,
  InfoContainer,
  ButtonContainer,
  BackButton,
  CancelButton,
} from "./CancelWidget.styles";

interface CancelWidgetProps {
  library: Web3Provider;
  order: FullOrderERC20;
}

export const CancelWidget: FC<CancelWidgetProps> = ({ order, library }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId } = useAppSelector((state) => state.web3);
  const dispatch = useAppDispatch();

  const status = useAppSelector(selectTakeOtcStatus);

  const params = useParams<{ compressedOrder: string }>();
  const [orderStatus] = useOtcOrderStatus(order);
  const isCancelSuccess = useCancellationSuccess(order.nonce);
  const pendingCancelTranssaction = useCancellationPending(order.nonce, true);
  const isExpired = new Date().getTime() > parseInt(order.expiry) * 1000;

  const wrongChainId = useMemo(() => {
    return chainId !== order.chainId;
  }, [chainId, order]);

  const handleBackButtonClick = () => {
    history.goBack();
  };

  useEffect(() => {
    // If success and the delayed pending cancellation is cleared, then route.
    if (isCancelSuccess && !pendingCancelTranssaction) {
      history.push(routes.otcOrder(params.compressedOrder));
    }
  }, [isCancelSuccess, pendingCancelTranssaction]);

  const handleCancelClick = async () => {
    await dispatch(
      cancelOrder({
        order,
        chainId: chainId!,
        library: library,
      })
    );
  };

  return (
    <Container>
      <Header>
        <Title type="h2" as="h1">
          {t("orders.cancelOrder")}
        </Title>
      </Header>
      <InfoContainer>
        <Icon name="close-circle-outline" iconSize={4.5} />
        <StyledInfoHeading>
          {t("orders.areYouSureYouWantToCancel")}
        </StyledInfoHeading>
        <InfoSubHeading>{t("orders.actionCannotBeReversed")}</InfoSubHeading>
      </InfoContainer>
      <ButtonContainer>
        <BackButton onClick={handleBackButtonClick}>
          {t("common.back")}
        </BackButton>
        <CancelButton
          intent={"primary"}
          onClick={handleCancelClick}
          disabled={
            orderStatus !== OrderStatus.open || wrongChainId || isExpired
          }
          loading={!!pendingCancelTranssaction}
        >
          {t("orders.confirmCancel")}
        </CancelButton>
      </ButtonContainer>

      <TransactionOverlay isHidden={status !== "signing"}>
        <WalletSignScreen type="signature" />
      </TransactionOverlay>

      <TransactionOverlay
        isHidden={status === "signing" || !pendingCancelTranssaction}
      >
        {pendingCancelTranssaction && (
          <SubmittedCancellationScreen
            chainId={chainId}
            transaction={pendingCancelTranssaction}
          />
        )}
      </TransactionOverlay>
    </Container>
  );
};

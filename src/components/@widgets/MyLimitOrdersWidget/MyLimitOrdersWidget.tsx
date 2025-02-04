import React, { FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { InterfaceContext } from "../../../contexts/interface/Interface";
import { DelegateRule } from "../../../entities/DelegateRule/DelegateRule";
import {
  OrdersSortType,
  selectMyOrdersReducer,
  setActiveSortType,
} from "../../../features/myOrders/myOrdersSlice";
import { selectTakeOtcStatus } from "../../../features/takeOtc/takeOtcSlice";
import switchToDefaultChain from "../../../helpers/switchToDefaultChain";
import useCancellationPending from "../../../hooks/useCancellationPending";
import { AppRoutes } from "../../../routes";
import SubmittedCancellationScreen from "../../SubmittedCancellationScreen";
import TransactionOverlay from "../../TransactionOverlay/TransactionOverlay";
import WalletSignScreen from "../../WalletSignScreen/WalletSignScreen";
import {
  Container,
  InfoSectionContainer,
  StyledActionButtons,
} from "../MyOtcOrdersWidget/MyOtcOrdersWidget.styles";
import { ButtonActions } from "../MyOtcOrdersWidget/subcomponents/ActionButtons/ActionButtons";
import InfoSection from "../MyOtcOrdersWidget/subcomponents/InfoSection/InfoSection";
import MyLimitOrdersList from "./subcomponents/MyLimitOrdersList/MyLimitOrdersList";

const MyLimitOrdersWidget: FC = () => {
  const dispatch = useAppDispatch();

  const { provider: library } = useWeb3React<Web3Provider>();
  const { isActive, isInitialized, chainId } = useAppSelector(
    (state) => state.web3
  );
  const history = useHistory();
  const { delegateRules, isInitialized: isDelegateRulesInitialized } =
    useAppSelector((state) => state.delegateRules);

  const { sortTypeDirection, activeSortType } = useAppSelector(
    selectMyOrdersReducer
  );

  const status = useAppSelector(selectTakeOtcStatus);
  const [activeCancellationNonce, setActiveCancellationNonce] =
    useState<string>();
  const pendingCancelTranssaction = useCancellationPending(
    activeCancellationNonce || null,
    true
  );

  // Modal states
  const { setShowWalletList } = useContext(InterfaceContext);

  const handleActionButtonClick = (action: ButtonActions) => {
    if (action === ButtonActions.connectWallet) {
      setShowWalletList(true);
    }

    if (action === ButtonActions.switchNetwork) {
      switchToDefaultChain();
    }
    if (action === ButtonActions.newOrder) {
      history.push({ pathname: AppRoutes.makeOtcOrder });
    }
  };

  const handleDeleteOrderButtonClick = async (order: DelegateRule) => {
    // TODO: Implement
  };

  const handleSortButtonClick = (type: OrdersSortType) => {
    dispatch(setActiveSortType(type));
  };

  useEffect(() => {
    if (!pendingCancelTranssaction) {
      setActiveCancellationNonce(undefined);
    }
  }, [pendingCancelTranssaction]);

  if (!isInitialized || !isDelegateRulesInitialized) {
    return <Container />;
  }

  return (
    <Container>
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

      {!!delegateRules.length && (
        <MyLimitOrdersList
          activeCancellationId={activeCancellationNonce}
          activeSortType={activeSortType}
          activeTokens={[]}
          delegateRules={delegateRules}
          sortTypeDirection={sortTypeDirection}
          library={library!}
          onDeleteOrderButtonClick={handleDeleteOrderButtonClick}
          onSortButtonClick={handleSortButtonClick}
        />
      )}

      {!delegateRules.length && (
        <InfoSectionContainer>
          <InfoSection
            userHasNoOrders={!delegateRules.length}
            walletIsNotConnected={!isActive}
          />
        </InfoSectionContainer>
      )}

      <StyledActionButtons
        isLimitOrder
        walletIsNotConnected={!isActive}
        onActionButtonClick={handleActionButtonClick}
      />
    </Container>
  );
};

export default MyLimitOrdersWidget;

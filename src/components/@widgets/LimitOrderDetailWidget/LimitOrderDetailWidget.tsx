import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import { Web3Provider } from "@ethersproject/providers";
import { useToggle } from "@react-hookz/web";
import { useWeb3React } from "@web3-react/core";

import { BigNumber } from "bignumber.js";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { InterfaceContext } from "../../../contexts/interface/Interface";
import { DelegateRule } from "../../../entities/DelegateRule/DelegateRule";
import { approve, deposit } from "../../../features/orders/ordersActions";
import {
  clear,
  selectOrdersErrors,
  selectOrdersStatus,
} from "../../../features/orders/ordersSlice";
import { takeLimitOrder } from "../../../features/takeLimit/takeLimitActions";
import {
  reset,
  selectTakeOtcErrors,
} from "../../../features/takeOtc/takeOtcSlice";
import { compareAddresses } from "../../../helpers/string";
import useAllowance from "../../../hooks/useAllowance";
import useAllowancesOrBalancesFailed from "../../../hooks/useAllowancesOrBalancesFailed";
import useApprovalPending from "../../../hooks/useApprovalPending";
import { useBalanceLoading } from "../../../hooks/useBalanceLoading";
import useDepositPending from "../../../hooks/useDepositPending";
import useInsufficientBalance from "../../../hooks/useInsufficientBalance";
import useNativeWrappedToken from "../../../hooks/useNativeWrappedToken";
import useOrderTransactionLink from "../../../hooks/useOrderTransactionLink";
import useShouldDepositNativeToken from "../../../hooks/useShouldDepositNativeTokenAmount";
import { AppRoutes, routes } from "../../../routes";
import { OrderStatus } from "../../../types/orderStatus";
import { OrderType } from "../../../types/orderTypes";
import TakeOrderReview from "../../@reviewScreens/TakeOrderReview/TakeOrderReview";
import WrapReview from "../../@reviewScreens/WrapReview/WrapReview";
import ApprovalSubmittedScreen from "../../ApprovalSubmittedScreen/ApprovalSubmittedScreen";
import addAndSwitchToChain from "../../ChainSelectionPopover/helpers/addAndSwitchToChain";
import { ErrorList } from "../../ErrorList/ErrorList";
import ProtocolFeeModal from "../../InformationModals/subcomponents/ProtocolFeeModal/ProtocolFeeModal";
import ModalOverlay from "../../ModalOverlay/ModalOverlay";
import OrderSubmittedScreen from "../../OrderSubmittedScreen/OrderSubmittedScreen";
import SwapInputs from "../../SwapInputs/SwapInputs";
import TransactionOverlay from "../../TransactionOverlay/TransactionOverlay";
import WalletSignScreen from "../../WalletSignScreen/WalletSignScreen";
import { useFilledStatus } from "../MyLimitOrdersWidget/hooks/useFilledStatus";
import { useLimitOrderStatus } from "../MyLimitOrdersWidget/hooks/useLimitOrderStatus";
import {
  Container,
  StyledActionButtons,
  StyledFilledAndStatus,
  StyledInfoSection,
} from "../OtcOrderDetailWidget/OtcOrderDetailWidget.styles";
import useTakerTokenInfo from "../OtcOrderDetailWidget/hooks/useTakerTokenInfo";
import { ButtonActions } from "../OtcOrderDetailWidget/subcomponents/ActionButtons/ActionButtons";
import OrderDetailWidgetHeader from "../OtcOrderDetailWidget/subcomponents/OrderDetailWidgetHeader/OrderDetailWidgetHeader";
import {
  getCustomSenderAmount,
  getCustomSignerAmount,
  getDelegateRuleTokensExchangeRate,
} from "./helpers";
import { useAvailableSenderAndSignerAmount } from "./hooks/useAvailableSenderAndSignerAmount";

interface LimitOrderDetailWidgetProps {
  delegateRule: DelegateRule;
}

export enum LimitOrderDetailWidgetState {
  overview = "overview",
  review = "review",
}

const LimitOrderDetailWidget: FC<LimitOrderDetailWidgetProps> = ({
  delegateRule,
}) => {
  const { t } = useTranslation();
  const { provider: library } = useWeb3React<Web3Provider>();
  const { isActive, account, chainId } = useAppSelector((state) => state.web3);
  const { protocolFee } = useAppSelector((state) => state.metadata);

  const history = useHistory();
  const dispatch = useAppDispatch();
  const params = useParams<{ compressedOrder: string }>();
  const { setShowWalletList, setTransactionsTabIsOpen } =
    useContext(InterfaceContext);

  const ordersStatus = useAppSelector(selectOrdersStatus);
  const ordersErrors = useAppSelector(selectOrdersErrors);
  const takeOtcErrors = useAppSelector(selectTakeOtcErrors);

  const errors = [...ordersErrors, ...takeOtcErrors];

  const [state, setState] = useState<LimitOrderDetailWidgetState>(
    LimitOrderDetailWidgetState.overview
  );

  const orderStatus = useLimitOrderStatus(delegateRule);
  const [senderToken, isSenderTokenLoading] = useTakerTokenInfo(
    delegateRule.senderToken,
    delegateRule.chainId
  );
  const [signerToken, isSignerTokenLoading] = useTakerTokenInfo(
    delegateRule.signerToken,
    delegateRule.chainId
  );
  const isBalanceLoading = useBalanceLoading();

  const { availableSenderAmount, availableSignerAmount } =
    useAvailableSenderAndSignerAmount(
      delegateRule,
      senderToken?.decimals,
      signerToken?.decimals
    );

  const [customSignerAmount, setCustomSignerAmount] = useState<string>();
  const [customSenderAmount, setCustomSenderAmount] = useState<string>();

  const [filledAmount, filledPercentage] = useFilledStatus(
    delegateRule,
    senderToken?.decimals
  );

  const senderTokenSymbol = senderToken?.symbol;
  const signerTokenSymbol = signerToken?.symbol;
  const tokenExchangeRate = getDelegateRuleTokensExchangeRate(delegateRule);
  const approvalTransaction = useApprovalPending(
    delegateRule.senderToken,
    true
  );
  const wrappedNativeToken = useNativeWrappedToken(chainId);
  const orderTransaction = undefined; // useSessionOrderTransaction(delegateRule.id);

  const { hasSufficientAllowance } = useAllowance(
    senderToken,
    customSenderAmount
  );

  const hasInsufficientTokenBalance = useInsufficientBalance(
    senderToken,
    customSenderAmount!
  );

  const shouldDepositNativeTokenAmount = useShouldDepositNativeToken(
    senderToken?.address,
    customSenderAmount
  );
  const isAllowancesOrBalancesFailed = useAllowancesOrBalancesFailed();
  const shouldDepositNativeToken = !!shouldDepositNativeTokenAmount;
  const hasDepositPending = !!useDepositPending();
  const orderTransactionLink = useOrderTransactionLink(delegateRule.id);
  const orderChainId = useMemo(() => delegateRule.chainId, [delegateRule]);
  const walletChainIdIsDifferentThanOrderChainId =
    !!chainId && orderChainId !== chainId;

  const orderType = OrderType.publicUnlisted;
  const userIsMakerOfSwap = account
    ? compareAddresses(delegateRule.senderWallet, account)
    : false;
  const parsedExpiry = useMemo(() => {
    return new Date(delegateRule.expiry * 1000);
  }, [delegateRule]);

  const [showFeeInfo, toggleShowFeeInfo] = useToggle(false);

  const handleSignerAmountChange = (value: string): void => {
    if (!availableSignerAmount) {
      return;
    }

    const {
      signerAmount: newCustomSignerAmount,
      senderAmount: newCustomSenderAmount,
    } = getCustomSenderAmount(
      tokenExchangeRate,
      value,
      availableSignerAmount,
      signerToken?.decimals,
      senderToken?.decimals
    );

    setCustomSignerAmount(newCustomSignerAmount);
    setCustomSenderAmount(newCustomSenderAmount);
  };

  const handleSenderAmountChange = (value: string): void => {
    if (!availableSenderAmount) {
      return;
    }

    const {
      signerAmount: newCustomSignerAmount,
      senderAmount: newCustomSenderAmount,
    } = getCustomSignerAmount(
      tokenExchangeRate,
      value,
      availableSenderAmount,
      signerToken?.decimals,
      senderToken?.decimals
    );

    setCustomSignerAmount(newCustomSignerAmount);
    setCustomSenderAmount(newCustomSenderAmount);
  };

  const handleMaxButtonClick = () => {
    setCustomSignerAmount(availableSignerAmount);
    setCustomSenderAmount(availableSenderAmount);
  };

  const takeOrder = async () => {
    if (!library || !account) return;

    dispatch(
      takeLimitOrder({
        delegateRule,
        protocolFee,
        signerWallet: account,
        senderFilledAmount: delegateRule.senderAmount,
        library,
      })
    );
  };

  const openTransactionsTab = () => {
    setTransactionsTabIsOpen(true);
  };

  const approveToken = () => {
    if (!senderToken || !customSenderAmount || !library) {
      return;
    }

    dispatch(approve(customSenderAmount, senderToken, library, "Swap"));
  };

  const depositNativeToken = async () => {
    dispatch(
      deposit(
        shouldDepositNativeTokenAmount!,
        senderToken!,
        wrappedNativeToken!,
        chainId!,
        library!
      )
    );
  };

  const restart = () => {
    history.push(routes.makeLimitOrder());
    dispatch(clear());
    dispatch(reset());
  };

  const backToOverview = () => {
    setState(LimitOrderDetailWidgetState.overview);
  };

  const handleActionButtonClick = async (action: ButtonActions) => {
    if (action === ButtonActions.connectWallet) {
      setShowWalletList(true);
    }

    if (action === ButtonActions.switchNetwork) {
      addAndSwitchToChain(delegateRule.chainId);
    }

    if (action === ButtonActions.restart) {
      restart();
    }

    if (action === ButtonActions.approve) {
      approveToken();
    }

    if (action === ButtonActions.review) {
      setState(LimitOrderDetailWidgetState.review);
    }

    if (action === ButtonActions.cancel) {
      history.push(routes.cancelOtcOrder(params.compressedOrder));
    }

    if (action === ButtonActions.take) {
      takeOrder();
    }

    if (action === ButtonActions.back) {
      history.push(routes.makeLimitOrder());
    }
  };

  useEffect(() => {
    setCustomSignerAmount(availableSignerAmount);
    setCustomSenderAmount(availableSenderAmount);
  }, [availableSenderAmount, availableSignerAmount]);

  const renderScreens = () => {
    if (
      state === LimitOrderDetailWidgetState.review &&
      shouldDepositNativeToken &&
      !orderTransaction
    ) {
      return (
        <WrapReview
          isLoading={hasDepositPending}
          amount={customSenderAmount || "0"}
          errors={errors}
          shouldDepositNativeTokenAmount={shouldDepositNativeTokenAmount}
          wrappedNativeToken={wrappedNativeToken}
          onRestartButtonClick={backToOverview}
          onSignButtonClick={depositNativeToken}
        />
      );
    }

    if (state === LimitOrderDetailWidgetState.review) {
      return (
        <TakeOrderReview
          errors={errors}
          expiry={delegateRule.expiry}
          senderAmount={customSenderAmount || "0"}
          senderToken={senderToken}
          signerAmount={customSignerAmount || "0"}
          signerToken={signerToken}
          wrappedNativeToken={wrappedNativeToken}
          onEditButtonClick={backToOverview}
          onRestartButtonClick={restart}
          onSignButtonClick={takeOrder}
        />
      );
    }

    return (
      <>
        <OrderDetailWidgetHeader isMakerOfSwap={userIsMakerOfSwap} />
        <SwapInputs
          showMaxButton={
            orderStatus === OrderStatus.open &&
            customSignerAmount !== availableSignerAmount
          }
          // readOnly={orderStatus !== OrderStatus.open}
          disabled={orderStatus !== OrderStatus.open}
          canSetQuoteAmount
          // disabled={false}
          isSelectTokenDisabled
          isRequestingBaseAmount={isSignerTokenLoading}
          isRequestingBaseToken={isSignerTokenLoading}
          isRequestingQuoteAmount={isSenderTokenLoading}
          isRequestingQuoteToken={isSenderTokenLoading}
          baseAmount={customSignerAmount || "0.00"}
          baseTokenInfo={signerToken}
          maxAmount={null}
          side={userIsMakerOfSwap ? "buy" : "sell"}
          tradeNotAllowed={walletChainIdIsDifferentThanOrderChainId}
          quoteAmount={customSenderAmount || "0.00"}
          quoteTokenInfo={senderToken}
          onBaseAmountChange={handleSignerAmountChange}
          onQuoteAmountChange={handleSenderAmountChange}
          onMaxButtonClick={handleMaxButtonClick}
        />

        <StyledFilledAndStatus
          expiry={parsedExpiry}
          filledAmount={filledAmount}
          filledPercentage={filledPercentage}
          orderType={orderType}
          status={orderStatus}
          tokenSymbol={senderTokenSymbol}
          link={orderTransactionLink}
        />

        <StyledInfoSection
          isAllowancesFailed={isAllowancesOrBalancesFailed}
          isExpired={orderStatus === OrderStatus.expired}
          isDifferentChainId={walletChainIdIsDifferentThanOrderChainId}
          isIntendedRecipient={true}
          isMakerOfSwap={userIsMakerOfSwap}
          isNotConnected={!isActive}
          orderChainId={orderChainId}
          token1={signerTokenSymbol}
          token2={senderTokenSymbol}
          rate={tokenExchangeRate}
          onFeeButtonClick={toggleShowFeeInfo}
        />

        <StyledActionButtons
          hasInsufficientBalance={hasInsufficientTokenBalance}
          hasInsufficientAllowance={!hasSufficientAllowance}
          isExpired={orderStatus === OrderStatus.expired}
          isCanceled={false}
          isTaken={orderStatus === OrderStatus.taken}
          isDifferentChainId={walletChainIdIsDifferentThanOrderChainId}
          isIntendedRecipient={true}
          isLoading={isBalanceLoading}
          isMakerOfSwap={userIsMakerOfSwap}
          isNotConnected={!isActive}
          requiresReload={isAllowancesOrBalancesFailed}
          shouldDepositNativeToken={shouldDepositNativeToken}
          onActionButtonClick={handleActionButtonClick}
        />
      </>
    );
  };

  return (
    <Container>
      {renderScreens()}

      <ModalOverlay
        title={t("information.protocolFee.title")}
        onClose={() => toggleShowFeeInfo()}
        isHidden={!showFeeInfo}
      >
        <ProtocolFeeModal onCloseButtonClick={() => toggleShowFeeInfo()} />
      </ModalOverlay>

      <ModalOverlay
        title={t("validatorErrors.unableSwap")}
        subTitle={t("validatorErrors.swapFail")}
        onClose={restart}
        isHidden={!errors.length}
      >
        <ErrorList errors={errors} onBackButtonClick={restart} />
      </ModalOverlay>

      <TransactionOverlay isHidden={ordersStatus !== "signing"}>
        <WalletSignScreen type="swap" />
      </TransactionOverlay>

      <TransactionOverlay
        isHidden={ordersStatus === "signing" || !approvalTransaction}
      >
        {approvalTransaction && (
          <ApprovalSubmittedScreen
            chainId={chainId}
            transaction={approvalTransaction}
          />
        )}
      </TransactionOverlay>

      <TransactionOverlay isHidden={!orderTransaction}>
        {orderTransaction && (
          <OrderSubmittedScreen
            chainId={chainId}
            transaction={orderTransaction}
            onMakeNewOrderButtonClick={restart}
            onTrackTransactionButtonClick={openTransactionsTab}
          />
        )}
      </TransactionOverlay>
    </Container>
  );
};

export default LimitOrderDetailWidget;

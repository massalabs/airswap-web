import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";

import { Wrapper } from "@airswap/libraries";
import {
  ADDRESS_ZERO,
  OrderERC20,
  ProtocolIds,
  UnsignedOrderERC20,
} from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";
import { useToggle } from "@react-hookz/web";
import { useWeb3React } from "@web3-react/core";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  transformAddressAliasToAddress,
  transformAddressToAddressAlias,
} from "../../../constants/addressAliases";
import nativeCurrency, {
  nativeCurrencySafeTransactionFee,
} from "../../../constants/nativeCurrency";
import { InterfaceContext } from "../../../contexts/interface/Interface";
import { selectBalances } from "../../../features/balances/balancesSlice";
import {
  fetchIndexerUrls,
  getFilteredOrders,
} from "../../../features/indexer/indexerActions";
import { selectIndexerReducer } from "../../../features/indexer/indexerSlice";
import {
  selectActiveTokens,
  selectAllTokenInfo,
} from "../../../features/metadata/metadataSlice";
import {
  approve,
  deposit,
  take,
  takeLastLookOrder,
  withdraw,
} from "../../../features/orders/ordersActions";
import { check } from "../../../features/orders/ordersHelpers";
import {
  clear,
  selectOrdersErrors,
  selectOrdersStatus,
  setErrors,
} from "../../../features/orders/ordersSlice";
import useQuotes from "../../../features/quotes/quotesHooks";
import { reset as clearQuotes } from "../../../features/quotes/quotesSlice";
import { selectAllSupportedTokens } from "../../../features/registry/registrySlice";
import {
  clearTradeTerms,
  selectTradeTerms,
  setTradeTerms,
} from "../../../features/tradeTerms/tradeTermsSlice";
import {
  selectCustomServerUrl,
  setUserTokens,
} from "../../../features/userSettings/userSettingsSlice";
import stringToSignificantDecimals from "../../../helpers/stringToSignificantDecimals";
import switchToDefaultChain from "../../../helpers/switchToDefaultChain";
import useAllowance from "../../../hooks/useAllowance";
import useAllowancesOrBalancesFailed from "../../../hooks/useAllowancesOrBalancesFailed";
import useAppRouteParams from "../../../hooks/useAppRouteParams";
import useApprovalPending from "../../../hooks/useApprovalPending";
import useApprovalSuccess from "../../../hooks/useApprovalSuccess";
import { useBalanceLoading } from "../../../hooks/useBalanceLoading";
import useDepositPending from "../../../hooks/useDepositPending";
import useInsufficientBalance from "../../../hooks/useInsufficientBalance";
import useMaxAmount from "../../../hooks/useMaxAmount";
import useNativeToken from "../../../hooks/useNativeToken";
import useNativeWrappedToken from "../../../hooks/useNativeWrappedToken";
import useNetworkSupported from "../../../hooks/useNetworkSupported";
import useOrderTransaction from "../../../hooks/useOrderTransaction";
import useSwapType from "../../../hooks/useSwapType";
import useTokenInfo from "../../../hooks/useTokenInfo";
import useWithdrawalPending from "../../../hooks/useWithdrawalPending";
import { AppRoutes } from "../../../routes";
import { SwapType } from "../../../types/swapType";
import { TokenSelectModalTypes } from "../../../types/tokenSelectModalTypes";
import { TransactionStatusType } from "../../../types/transactionTypes";
import ApprovalSubmittedScreen from "../../ApprovalSubmittedScreen/ApprovalSubmittedScreen";
import { ErrorList } from "../../ErrorList/ErrorList";
import GasFreeSwapsModal from "../../InformationModals/subcomponents/GasFreeSwapsModal/GasFreeSwapsModal";
import ProtocolFeeModal from "../../InformationModals/subcomponents/ProtocolFeeModal/ProtocolFeeModal";
import ModalOverlay from "../../ModalOverlay/ModalOverlay";
import OrderSubmittedScreen from "../../OrderSubmittedScreen/OrderSubmittedScreen";
import TokenList from "../../TokenList/TokenList";
import TransactionOverlay from "../../TransactionOverlay/TransactionOverlay";
import WalletSignScreen from "../../WalletSignScreen/WalletSignScreen";
import StyledSwapWidget, {
  InfoContainer,
  StyledDebugMenu,
  StyledActionButtons,
  StyledSwapInputs,
} from "./SwapWidget.styles";
import getTokenPairs from "./helpers/getTokenPairs";
import useTokenOrFallback from "./hooks/useTokenOrFallback";
import { ButtonActions } from "./subcomponents/ActionButtons/ActionButtons";
import InfoSection from "./subcomponents/InfoSection/InfoSection";
import QuoteText from "./subcomponents/QuoteText/QuoteText";

export enum SwapWidgetState {
  overview = "overview",
  requestPrices = "requestPrices",
}

const SwapWidget: FC = () => {
  // Redux
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation<{ isFromOrderDetailPage?: true }>();
  const isFromOrderDetailPage = !!location.state?.isFromOrderDetailPage;
  const balances = useAppSelector(selectBalances);
  const ordersStatus = useAppSelector(selectOrdersStatus);
  const ordersErrors = useAppSelector(selectOrdersErrors);
  const activeTokens = useAppSelector(selectActiveTokens);
  const allTokens = useAppSelector(selectAllTokenInfo);
  const supportedTokens = useAppSelector(selectAllSupportedTokens);
  const tradeTerms = useAppSelector(selectTradeTerms);
  const {
    indexerUrls,
    orders: indexerOrders,
    bestSwapOrder: bestIndexerOrder,
  } = useAppSelector(selectIndexerReducer);
  const customServerUrl = useAppSelector(selectCustomServerUrl);

  // Contexts
  const {
    isConnecting,
    isDebugMode,
    transactionsTabIsOpen,
    setShowWalletList,
    setTransactionsTabIsOpen,
  } = useContext(InterfaceContext);

  // Input states
  const appRouteParams = useAppRouteParams();
  const [tokenFrom, setTokenFrom] = useState<string | undefined>();
  const [tokenTo, setTokenTo] = useState<string | undefined>();
  const [baseAmount, setBaseAmount] = useState(
    isFromOrderDetailPage ? tradeTerms.baseAmount : ""
  );
  const [state, setState] = useState<SwapWidgetState>(SwapWidgetState.overview);

  // Modals
  const [showTokenSelectModalFor, setShowTokenSelectModalFor] =
    useState<TokenSelectModalTypes | null>(null);

  const [showGasFeeInfo, setShowGasFeeInfo] = useState(false);
  const [protocolFeeInfo, setProtocolFeeInfo] = useState(false);
  const [showViewAllQuotes, toggleShowViewAllQuotes] = useToggle();

  // Loading states
  const [isApproving, setIsApproving] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);
  const [activeApprovalHash, setActiveApprovalHash] = useState<string>();
  const [activeWrapOrUnwrapHash, setActiveWrapOrUnwrapHash] =
    useState<string>();
  const [activeOrderNonce, setActiveOrderNonce] = useState<string>();

  // Pricing
  const quote = useQuotes(
    !activeOrderNonce && state === SwapWidgetState.requestPrices
  );

  const { t } = useTranslation();

  const { provider: library } = useWeb3React<Web3Provider>();
  const { isActive, account, chainId } = useAppSelector((state) => state.web3);

  const baseToken = useTokenOrFallback(tokenFrom, tokenTo, true);
  const quoteToken = useTokenOrFallback(tokenFrom, tokenTo);

  const baseTokenInfo = useTokenInfo(baseToken);
  const quoteTokenInfo = useTokenInfo(quoteToken);
  const swapType = useSwapType(baseTokenInfo, quoteTokenInfo);
  const nativeTokenInfo = useNativeToken(chainId);
  const wrappedNativeTokenInfo = useNativeWrappedToken(chainId);
  const { hasSufficientAllowance } = useAllowance(baseTokenInfo, baseAmount, {
    wrapNativeToken: false,
  });
  const isBalanceLoading = useBalanceLoading();

  const activeOrderTransaction = useOrderTransaction(
    activeOrderNonce,
    activeWrapOrUnwrapHash
  );
  const approvalTransaction = useApprovalPending(baseToken, true);
  const hasApprovalPending = !!approvalTransaction;
  const hasApprovalSuccess = useApprovalSuccess(activeApprovalHash);
  const shouldApprove =
    !hasSufficientAllowance &&
    !hasApprovalSuccess &&
    swapType !== SwapType.wrapOrUnwrap;
  const hasDepositPending = !!useDepositPending();
  const hasWithdrawalPending = useWithdrawalPending();
  const hasDepositOrWithdrawalPending =
    hasDepositPending || hasWithdrawalPending;
  const hasSubmittedTransaction =
    hasApprovalPending || !!activeWrapOrUnwrapHash || !!activeOrderNonce;
  const isNetworkSupported = useNetworkSupported();
  const isAllowancesOrBalancesFailed = useAllowancesOrBalancesFailed();

  const maxAmount = useMaxAmount(baseToken);
  const showMaxButton = !!maxAmount && baseAmount !== maxAmount;
  const showMaxInfoButton =
    !!maxAmount &&
    baseTokenInfo?.address === ADDRESS_ZERO &&
    !!nativeCurrencySafeTransactionFee[baseTokenInfo.chainId];

  useEffect(() => {
    if (transactionsTabIsOpen) {
      setShowTokenSelectModalFor(null);
    }
  }, [transactionsTabIsOpen]);

  useEffect(() => {
    setTokenFrom(appRouteParams.tokenFrom);
    setTokenTo(appRouteParams.tokenTo);
  }, [appRouteParams]);

  useEffect(() => {
    if (ordersStatus === "reset") {
      setIsApproving(false);
      setProtocolFeeInfo(false);
      setShowGasFeeInfo(false);
    }
  }, [ordersStatus]);

  useEffect(() => {
    if (chainId) {
      restart();
    }
  }, [chainId]);

  const quoteAmount =
    swapType === SwapType.wrapOrUnwrap ? baseAmount : quote?.bestQuote || "";
  const formattedQuoteAmount = useMemo(
    () => stringToSignificantDecimals(quoteAmount),
    [quoteAmount]
  );

  useEffect(() => {
    if (!isActive) {
      setShowTokenSelectModalFor(null);
    }
  }, [isActive]);

  useEffect(() => {
    if (!indexerUrls && library) {
      dispatch(fetchIndexerUrls({ provider: library }));
    }
  }, [indexerUrls, library]);

  useEffect(() => {
    if (indexerUrls && baseTokenInfo && quoteTokenInfo) {
      dispatch(
        getFilteredOrders({
          filter: {
            senderToken: baseTokenInfo.address,
            signerToken: quoteTokenInfo.address,
          },
        })
      );
    }
  }, [baseTokenInfo, indexerUrls, quoteTokenInfo]);

  useEffect(() => {
    if (hasDepositOrWithdrawalPending) {
      setIsWrapping(false);
    }
  }, [hasDepositOrWithdrawalPending]);

  useEffect(() => {
    if (approvalTransaction) {
      setActiveApprovalHash(approvalTransaction.hash);
    }
  }, [approvalTransaction]);

  const handleSetToken = (type: TokenSelectModalTypes, value: string) => {
    const baseRoute = AppRoutes.swap;
    const tokenPairs = getTokenPairs(type, value, quoteToken, baseToken);
    const tokenFrom = transformAddressAliasToAddress(tokenPairs.tokenFrom!);
    const tokenTo = transformAddressAliasToAddress(tokenPairs.tokenTo!);
    const tokenFromAlias = transformAddressToAddressAlias(tokenFrom);
    const tokenToAlias = transformAddressToAddressAlias(tokenTo);

    if (type === "base") {
      setBaseAmount("");
    }

    if (tokenFrom && tokenTo) {
      dispatch(setUserTokens({ tokenFrom, tokenTo }));
    }
    history.push({
      pathname: `/${baseRoute}/${tokenFromAlias || tokenFrom}/${
        tokenToAlias || tokenTo
      }`,
    });
  };

  const handleSwitchTokensButtonClick = () => {
    if (quoteToken) {
      handleSetToken("base", quoteToken);
    }
  };

  const insufficientBalance = useInsufficientBalance(baseTokenInfo, baseAmount);

  const handleRemoveActiveToken = (address: string) => {
    if (address === baseToken) {
      history.push({ pathname: `/${AppRoutes.swap}/-/${quoteToken || "-"}` });
      setBaseAmount("");
    } else if (address === quoteToken) {
      history.push({ pathname: `/${AppRoutes.swap}/${baseToken || "-"}/-` });
    }
  };

  const swapWithRequestForQuote = async () => {
    try {
      if (!library || !chainId || !account) return;

      const senderWallet =
        swapType === SwapType.swapWithWrap
          ? Wrapper.getAddress(chainId)
          : account;

      const order = quote.bestOrder as OrderERC20;

      if (!senderWallet) return;

      const errors = await check(
        order,
        senderWallet,
        chainId,
        library,
        swapType === SwapType.swapWithWrap
      );

      if (errors.length) {
        dispatch(setErrors(errors));
        return;
      }

      const transaction = await dispatch(
        take(
          order,
          quoteTokenInfo!,
          baseTokenInfo!,
          library,
          swapType === SwapType.swapWithWrap ? "Wrapper" : "Swap"
        )
      );

      setActiveOrderNonce(transaction?.order.nonce);
    } catch (e) {
      console.error("Error taking order:", e);
    }
  };

  const swapWithLastLook = async () => {
    if (!quote.bestPricing || !quote.bestQuote) {
      return;
    }

    const transaction = await dispatch(
      takeLastLookOrder(
        chainId!,
        library!,
        quote.bestPricing.locator!,
        quoteTokenInfo!,
        baseTokenInfo!,
        quote.bestOrder as UnsignedOrderERC20
      )
    );

    setActiveOrderNonce(transaction?.order.nonce);
  };

  const takeBestOption = async () => {
    if (quote?.bestOrderType === ProtocolIds.LastLookERC20) {
      await swapWithLastLook();
    } else {
      await swapWithRequestForQuote();
    }
  };

  const doWrap = async () => {
    if (baseTokenInfo === nativeCurrency[chainId!]) {
      const transaction = await dispatch(
        deposit(
          baseAmount,
          nativeTokenInfo,
          wrappedNativeTokenInfo!,
          chainId!,
          library!
        )
      );

      setActiveWrapOrUnwrapHash(transaction?.hash);

      return;
    }

    const transaction = await dispatch(
      withdraw(
        baseAmount,
        nativeTokenInfo,
        wrappedNativeTokenInfo!,
        chainId!,
        library!
      )
    );

    setActiveWrapOrUnwrapHash(transaction?.hash);
  };

  const restart = () => {
    setState(SwapWidgetState.overview);
    dispatch(clearTradeTerms());
    dispatch(clearQuotes());
    dispatch(clear());
    setActiveApprovalHash(undefined);
    setActiveWrapOrUnwrapHash(undefined);
    setActiveOrderNonce(undefined);
    setBaseAmount("");
  };

  const handleActionButtonClick = async (action: ButtonActions) => {
    switch (action) {
      case ButtonActions.goBack:
        setState(SwapWidgetState.overview);
        dispatch(clearQuotes());
        dispatch(clear());
        setActiveApprovalHash(undefined);
        setActiveOrderNonce(undefined);
        break;

      case ButtonActions.restart:
        setTransactionsTabIsOpen(false);
        restart();
        break;

      case ButtonActions.reloadPage:
        window.location.reload();
        break;

      case ButtonActions.connectWallet:
        setShowWalletList(true);
        break;

      case ButtonActions.switchNetwork:
        switchToDefaultChain();
        break;

      case ButtonActions.requestQuotes:
        prepareForRequest();
        setState(SwapWidgetState.requestPrices);

        break;

      case ButtonActions.approve:
        approveToken();
        break;

      case ButtonActions.takeQuote:
        if ([SwapType.swap, SwapType.swapWithWrap].includes(swapType)) {
          await takeBestOption();
        } else if (swapType === SwapType.wrapOrUnwrap) {
          await doWrap();
        }

        setState(SwapWidgetState.overview);
        break;

      case ButtonActions.trackTransaction:
        setTransactionsTabIsOpen(true);
        break;
    }
  };

  const prepareForRequest = () => {
    dispatch(
      setTradeTerms({
        baseToken: {
          address: baseToken!,
          decimals: baseTokenInfo!.decimals,
        },
        baseAmount: baseAmount,
        quoteToken: {
          address: quoteToken!,
          decimals: quoteTokenInfo!.decimals,
        },
        quoteAmount: null,
        side: "sell",
      })
    );
  };

  const approveToken = async () => {
    setIsApproving(true);

    await dispatch(
      approve(
        baseAmount,
        baseTokenInfo!,
        library!,
        swapType === SwapType.swapWithWrap ? "Wrapper" : "Swap"
      )
    );
    setIsApproving(false);
  };

  const backToOverview = () => {
    handleActionButtonClick(ButtonActions.restart);
  };

  return (
    <>
      <StyledSwapWidget>
        {isDebugMode && <StyledDebugMenu />}

        <StyledSwapInputs
          baseAmount={baseAmount}
          baseTokenInfo={baseTokenInfo}
          quoteTokenInfo={quoteTokenInfo}
          side="sell"
          tradeNotAllowed={!!quote.error}
          isRequestingQuoteAmount={quote.isLoading}
          // Note that using the quoteAmount from tradeTerms will stop this
          // updating when the user clicks the take button.
          quoteAmount={formattedQuoteAmount}
          disabled={!isActive || isAllowancesOrBalancesFailed}
          readOnly={
            !!quote.bestQuote ||
            !!quote.error ||
            isWrapping ||
            !isActive ||
            isApproving ||
            !isNetworkSupported
          }
          showMaxButton={showMaxButton}
          showMaxInfoButton={showMaxInfoButton}
          maxAmount={maxAmount}
          onBaseAmountChange={setBaseAmount}
          onChangeTokenClick={setShowTokenSelectModalFor}
          onMaxButtonClick={() => setBaseAmount(maxAmount || "0")}
          onSwitchTokensButtonClick={handleSwitchTokensButtonClick}
        />

        <InfoContainer hasQuoteText={!!quote.bestOrder}>
          <InfoSection
            failedToFetchAllowances={isAllowancesOrBalancesFailed}
            hasSelectedCustomServer={!!customServerUrl}
            isConnected={isActive}
            isFetchingOrders={quote.isLoading}
            isNetworkUnsupported={!isNetworkSupported}
            bestQuote={quote.bestQuote}
            baseTokenInfo={baseTokenInfo}
            baseAmount={baseAmount}
            pricingError={quote.error}
            serverUrl={customServerUrl}
            quoteTokenInfo={quoteTokenInfo}
          />

          {quote.bestOrder && (
            <QuoteText
              isGasFreeTrade={quote.bestOrderType === ProtocolIds.LastLookERC20}
              expiry={quote.bestOrder?.expiry}
              onGasFreeTradeButtonClick={() => setShowGasFeeInfo(true)}
            />
          )}
        </InfoContainer>

        <StyledActionButtons
          hasError={!!quote.error}
          hasInsufficientAllowance={!!quote.bestQuote && shouldApprove}
          hasInsufficientBalance={
            ordersStatus === "idle" && insufficientBalance
          }
          hasQuote={!!quote.bestQuote}
          isBalanceLoading={isBalanceLoading}
          isLoading={
            isConnecting ||
            quote.isLoading ||
            ordersStatus === "requesting" ||
            hasSubmittedTransaction
          }
          isNotConnected={!isActive}
          requiresReload={isAllowancesOrBalancesFailed}
          shouldEnterAmount={
            !baseAmount.length || baseAmount === "0" || baseAmount === "."
          }
          onBackButtonClick={backToOverview}
          onActionButtonClick={handleActionButtonClick}
        />

        <ModalOverlay
          hasDynamicHeight
          isHidden={!showTokenSelectModalFor}
          title={t("common.selectToken")}
          onClose={() => setShowTokenSelectModalFor(null)}
        >
          <TokenList
            onSelectToken={(newTokenAddress) => {
              // e.g. handleSetToken("base", "0x123")
              handleSetToken(showTokenSelectModalFor, newTokenAddress);
              // Close the modal
              setShowTokenSelectModalFor(null);
            }}
            balances={balances}
            allTokens={allTokens}
            activeTokens={activeTokens}
            supportedTokenAddresses={supportedTokens}
            onAfterRemoveActiveToken={handleRemoveActiveToken}
          />
        </ModalOverlay>
        <ModalOverlay
          title={t("validatorErrors.unableSwap")}
          subTitle={t("validatorErrors.swapFail")}
          onClose={backToOverview}
          isHidden={!ordersErrors.length}
        >
          <ErrorList errors={ordersErrors} onBackButtonClick={backToOverview} />
        </ModalOverlay>
        <ModalOverlay
          title={t("information.gasFreeSwaps.title")}
          onClose={() => setShowGasFeeInfo(false)}
          isHidden={!showGasFeeInfo}
        >
          <GasFreeSwapsModal
            onCloseButtonClick={() => setShowGasFeeInfo(false)}
          />
        </ModalOverlay>
        <ModalOverlay
          title={t("information.protocolFee.title")}
          onClose={() => setProtocolFeeInfo(false)}
          isHidden={!protocolFeeInfo}
        >
          <ProtocolFeeModal
            onCloseButtonClick={() => setProtocolFeeInfo(false)}
          />
        </ModalOverlay>

        <TransactionOverlay isHidden={ordersStatus !== "signing"}>
          <WalletSignScreen type="approve" />
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

        <TransactionOverlay
          isHidden={!activeOrderTransaction && ordersStatus !== "requesting"}
        >
          <OrderSubmittedScreen
            isSendingOrder={ordersStatus === "requesting"}
            showTrackTransactionButton={
              activeOrderTransaction?.status ===
                TransactionStatusType.processing && !transactionsTabIsOpen
            }
            chainId={chainId}
            transaction={activeOrderTransaction}
            onMakeNewOrderButtonClick={() =>
              handleActionButtonClick(ButtonActions.restart)
            }
          />
        </TransactionOverlay>
      </StyledSwapWidget>
    </>
  );
};

export default SwapWidget;

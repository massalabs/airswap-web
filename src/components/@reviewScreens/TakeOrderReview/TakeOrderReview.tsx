import React, { FC, ReactElement, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ADDRESS_ZERO, TokenInfo } from "@airswap/utils";
import { useToggle } from "@react-hookz/web";

import BigNumber from "bignumber.js";

import { AppError } from "../../../errors/appError";
import { getExpiryTranslation } from "../../../helpers/getExpiryTranslation";
import toRoundedNumberString from "../../../helpers/toRoundedNumberString";
import { ReviewList } from "../../../styled-components/ReviewList/ReviewList";
import {
  ReviewListItem,
  ReviewListItemLabel,
  ReviewListItemValue,
} from "../../../styled-components/ReviewListItem/ReviewListItem";
import { getTokenPairTranslation } from "../../@widgets/MakeWidget/helpers";
import { ErrorList } from "../../ErrorList/ErrorList";
import ModalOverlay from "../../ModalOverlay/ModalOverlay";
import OrderReviewToken from "../../OrderReviewToken/OrderReviewToken";
import ProtocolFeeOverlay from "../../ProtocolFeeOverlay/ProtocolFeeOverlay";
import { Title } from "../../Typography/Typography";
import {
  Container,
  OrderReviewSenderToken,
  OrderReviewSignerToken,
  StyledActionButtons,
  StyledIconButton,
  StyledWidgetHeader,
} from "./TakeOrderReview.styles";

interface TakeOrderReviewProps {
  isSigner?: boolean;
  errors: AppError[];
  expiry: number;
  senderAmount: string;
  senderToken: TokenInfo | null;
  signerAmount: string;
  signerAmountPlusFee?: string;
  signerToken: TokenInfo | null;
  wrappedNativeToken: TokenInfo | null;
  onEditButtonClick: () => void;
  onRestartButtonClick: () => void;
  onSignButtonClick: () => void;
  className?: string;
}

const TakeOrderReview: FC<TakeOrderReviewProps> = ({
  isSigner,
  errors,
  expiry,
  senderAmount,
  senderToken,
  signerAmount,
  signerAmountPlusFee,
  signerToken,
  wrappedNativeToken,
  onEditButtonClick,
  onRestartButtonClick,
  onSignButtonClick,
  className = "",
}): ReactElement => {
  const { t } = useTranslation();
  const [showFeeInfo, toggleShowFeeInfo] = useToggle(false);

  const isSignerTokenNativeToken = signerToken?.address === ADDRESS_ZERO;
  const isSenderTokenNativeToken = senderToken?.address === ADDRESS_ZERO;
  const justifiedSignerToken = isSignerTokenNativeToken
    ? wrappedNativeToken
    : signerToken;
  const justifiedSenderToken = isSenderTokenNativeToken
    ? wrappedNativeToken
    : senderToken;

  const rate = useMemo(() => {
    return getTokenPairTranslation(
      justifiedSignerToken?.symbol,
      signerAmount,
      justifiedSenderToken?.symbol,
      senderAmount
    );
  }, [signerAmount, senderAmount]);
  const expiryTranslation = useMemo(
    () => getExpiryTranslation(new Date(), new Date(expiry * 1000)),
    [expiry]
  );

  const roundedFeeAmount = useMemo(() => {
    if (!signerAmountPlusFee) {
      return undefined;
    }

    const amount = new BigNumber(signerAmountPlusFee)
      .minus(signerAmount)
      .toString();
    return toRoundedNumberString(amount, justifiedSignerToken?.decimals);
  }, [signerAmount, signerAmountPlusFee, justifiedSignerToken]);

  const roundedSignerAmountPlusFee = useMemo(() => {
    if (!signerAmountPlusFee) {
      return undefined;
    }

    return toRoundedNumberString(
      signerAmountPlusFee,
      justifiedSignerToken?.decimals
    );
  }, [signerAmountPlusFee, justifiedSignerToken]);

  return (
    <Container isSigner={isSigner} className={className}>
      <StyledWidgetHeader>
        <Title type="h2" as="h1">
          {t("common.review")}
        </Title>
      </StyledWidgetHeader>
      {senderToken && (
        <OrderReviewSenderToken
          amount={senderAmount}
          label={isSigner ? t("common.receive") : t("common.send")}
          tokenSymbol={justifiedSenderToken?.symbol || "?"}
          tokenUri={justifiedSenderToken?.logoURI}
        />
      )}
      {signerToken && (
        <OrderReviewSignerToken
          amount={signerAmount}
          label={isSigner ? t("common.send") : t("common.receive")}
          tokenSymbol={justifiedSignerToken?.symbol || "?"}
          tokenUri={justifiedSignerToken?.logoURI}
        />
      )}
      <ReviewList>
        <ReviewListItem>
          <ReviewListItemLabel>{t("orders.expiryTime")}</ReviewListItemLabel>
          <ReviewListItemValue>{expiryTranslation}</ReviewListItemValue>
        </ReviewListItem>

        <ReviewListItem>
          <ReviewListItemLabel>{t("orders.exchangeRate")}</ReviewListItemLabel>
          <ReviewListItemValue>{rate}</ReviewListItemValue>
        </ReviewListItem>

        <ReviewListItem>
          <ReviewListItemLabel>{t("orders.total")}</ReviewListItemLabel>
          <ReviewListItemValue>
            {isSigner ? signerAmount : senderAmount}{" "}
            {isSigner
              ? justifiedSignerToken?.symbol
              : justifiedSenderToken?.symbol}
          </ReviewListItemValue>
        </ReviewListItem>

        {!!signerAmountPlusFee && (
          <>
            <ReviewListItem>
              <ReviewListItemLabel>
                {t("orders.protocolFee")}
                <StyledIconButton
                  icon="information-circle-outline"
                  onClick={toggleShowFeeInfo}
                />
              </ReviewListItemLabel>
              <ReviewListItemValue>
                {roundedFeeAmount} {justifiedSignerToken?.symbol}
              </ReviewListItemValue>
            </ReviewListItem>

            <ReviewListItem>
              <ReviewListItemLabel>{t("orders.total")}</ReviewListItemLabel>
              <ReviewListItemValue>
                {roundedSignerAmountPlusFee} {justifiedSignerToken?.symbol}
              </ReviewListItemValue>
            </ReviewListItem>
          </>
        )}
      </ReviewList>

      <StyledActionButtons
        backButtonText={t("common.back")}
        onEditButtonClick={onEditButtonClick}
        onSignButtonClick={onSignButtonClick}
      />

      <ProtocolFeeOverlay
        isHidden={showFeeInfo}
        onCloseButtonClick={() => toggleShowFeeInfo()}
      />

      <ModalOverlay
        title={t("validatorErrors.unableSwap")}
        subTitle={t("validatorErrors.swapFail")}
        onClose={onRestartButtonClick}
        isHidden={!errors.length}
      >
        <ErrorList errors={errors} onBackButtonClick={onRestartButtonClick} />
      </ModalOverlay>
    </Container>
  );
};

export default TakeOrderReview;

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { selectDelegateRulesReducer } from "../../features/delegateRules/delegateRulesSlice";
import { selectMyOrdersReducer } from "../../features/myOrders/myOrdersSlice";
import { AppRoutes, routes } from "../../routes";
import { Container, StyledNavLink } from "./PageNavigation.styles";

interface PageNavigationProps {
  className?: string;
}

const PageNavigation: FC<PageNavigationProps> = ({ className }) => {
  const { t } = useTranslation();
  const userHasOrders =
    useSelector(selectMyOrdersReducer).userOrders.length > 0;
  const userHasLimitOrders =
    useSelector(selectDelegateRulesReducer).delegateRules.length > 0;

  return (
    <Container className={className}>
      <StyledNavLink
        to={routes.swap()}
        isActive={(match, location) => {
          return (
            location.pathname.includes(AppRoutes.swap) ||
            location.pathname === "/"
          );
        }}
      >
        {t("common.rfq")}
      </StyledNavLink>
      <StyledNavLink
        to={userHasOrders ? routes.myOtcOrders() : routes.makeOtcOrder()}
        isActive={(match, location) => {
          return (
            location.pathname.includes(AppRoutes.myOtcOrders) ||
            location.pathname.includes(AppRoutes.makeOtcOrder) ||
            (location.pathname.includes(AppRoutes.otcOrder) &&
              !location.pathname.includes(AppRoutes.limitOrder))
          );
        }}
      >
        {t("common.otc")}
      </StyledNavLink>
      <StyledNavLink
        to={
          userHasLimitOrders ? routes.myLimitOrders() : routes.makeLimitOrder()
        }
        isActive={(match, location) => {
          return (
            location.pathname.includes(AppRoutes.myLimitOrders) ||
            location.pathname.includes(AppRoutes.makeLimitOrder) ||
            location.pathname.includes(AppRoutes.limitOrder)
          );
        }}
      >
        {t("common.limit")}
      </StyledNavLink>
    </Container>
  );
};

export default PageNavigation;

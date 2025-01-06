import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

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
        to={userHasOrders ? routes.myOrders() : routes.make()}
        isActive={(match, location) => {
          return (
            (location.pathname.includes(AppRoutes.myOrders) ||
              location.pathname.includes(AppRoutes.make) ||
              location.pathname.includes(AppRoutes.order)) &&
            !location.search.includes("limit=true")
          );
        }}
      >
        {t("common.otc")}
      </StyledNavLink>
      <StyledNavLink
        to={userHasOrders ? routes.myOrders(true) : routes.make(true)}
        isActive={(match, location) => {
          return (
            (location.pathname.includes(AppRoutes.myOrders) ||
              location.pathname.includes(AppRoutes.make) ||
              location.pathname.includes(AppRoutes.order)) &&
            location.search.includes("limit=true")
          );
        }}
      >
        {t("common.limit")}
      </StyledNavLink>
    </Container>
  );
};

export default PageNavigation;

import { FC } from "react";
import { useTranslation } from "react-i18next";

import { AppRoutes } from "../../../../routes";
import { Container, StyledNavLink } from "./WidgetFrameNavigation.styles";

interface WidgetFrameNavigationProps {
  className?: string;
}

const WidgetFrameNavigation: FC<WidgetFrameNavigationProps> = ({
  className,
}) => {
  const { t } = useTranslation();

  return (
    <Container className={className}>
      <StyledNavLink
        to={`/${AppRoutes.swap}`}
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
        to={`/${AppRoutes.myOrders}`}
        isActive={(match, location) => {
          return (
            location.pathname.includes(AppRoutes.myOrders) ||
            location.pathname.includes(AppRoutes.make) ||
            location.pathname.includes(AppRoutes.order)
          );
        }}
      >
        {t("common.otc")}
      </StyledNavLink>
    </Container>
  );
};

export default WidgetFrameNavigation;

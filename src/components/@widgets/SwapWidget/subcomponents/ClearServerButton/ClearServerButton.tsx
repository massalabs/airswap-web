import { ClearCustomServerButton } from "./ClearServerButton.styles";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";

interface ClearServerButtonProps {
  onClick?: () => void;
  className?: string;
}

const ClearServerButton: FC<ClearServerButtonProps> = ({
  className,
  onClick,
}) => {
  const { t } = useTranslation();
  return (
    <ClearCustomServerButton className={className} onClick={onClick}>
      {t("orders.clearCustomServer")}
    </ClearCustomServerButton>
  );
};

export default ClearServerButton;

import { ReactElement } from "react";

import Icon from "../../Icon/Icon";

export default function getSwapInputIcon(
  tradeNotAllowed: boolean,
  hasQuote: boolean
): ReactElement {
  if (tradeNotAllowed) {
    return <Icon name="forbidden" iconSize={0.9375} />;
  }

  if (hasQuote) {
    return <Icon name="arrow-down" iconSize={0.9375} />;
  }

  return <Icon name="swap" iconSize={1.125} />;
}

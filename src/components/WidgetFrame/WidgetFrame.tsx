import React, { FC, ReactElement, Suspense } from "react";

import { WidgetFrameWrapper, StyledWidgetFrame } from "./WidgetFrame.styles";
import WidgetFrameNavigation from "./subcomponents/WidgetFrameNavigation/WidgetFrameNavigation";

type WidgetFrameType = {
  children?: React.ReactNode;
  isConnected?: boolean;
  isOverlayOpen?: boolean;
};

const WidgetFrame: FC<WidgetFrameType> = ({
  children,
  isConnected,
  isOverlayOpen,
}): ReactElement => {
  return (
    <StyledWidgetFrame
      $isConnected={isConnected}
      $isOverlayOpen={isOverlayOpen}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <WidgetFrameWrapper>
          <WidgetFrameNavigation />
          {children}
        </WidgetFrameWrapper>
      </Suspense>
    </StyledWidgetFrame>
  );
};

export default WidgetFrame;

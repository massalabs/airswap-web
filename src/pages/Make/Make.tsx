import { FC, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAppDispatch } from "../../app/hooks";
import MakeWidget from "../../components/@widgets/MakeWidget/MakeWidget";
import { reset } from "../../features/takeOtc/takeOtcSlice";
import { StyledPage } from "./Make.styles";

const MakePage: FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isLimitOrder = location.search.includes("limit=true");

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  return (
    <StyledPage>
      <MakeWidget isLimitOrder={isLimitOrder} />
    </StyledPage>
  );
};

export default MakePage;

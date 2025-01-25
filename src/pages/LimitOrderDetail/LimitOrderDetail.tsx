import React, { FC, useEffect } from "react";
import { useParams } from "react-router";

import { useAppDispatch } from "../../app/hooks";
import Page from "../../components/Page/Page";
import { InvalidOrder } from "../OtcOrderDetail/subcomponents";

// TODO: Add ChainId to the URL

// http://localhost:3000/#/limit-order/0xf450ef4f268eaf2d3d8f9ed0354852e255a5eaef/0x20aaebad8c7c6ffb6fdaa5a622c399561562beea/0x2de63F2D35943Aa17Aa835Ea69fd3f768b9F6337

// const rules = await delegateContract.rules(
//   params.signerWallet,
//   params.signerToken,
//   params.senderToken
// );

const LimitOrderDetail: FC = () => {
  const dispatch = useAppDispatch();
  const { signerWallet, signerToken, senderToken, chainId } = useParams<{
    signerWallet: string;
    signerToken: string;
    senderToken: string;
    chainId: string;
  }>();

  const status = "idle";

  useEffect(() => {
    console.log(signerWallet, signerToken, senderToken, chainId);
  }, [signerWallet, signerToken, senderToken, chainId]);

  // useEffect(() => {
  //   if (activeOrder && !isFetchingAllTokens) {
  //     dispatch(fetchAllTokens(activeOrder.chainId));
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [activeOrder]);

  // @ts-ignore
  if (status === "invalid") {
    return (
      <Page>
        <InvalidOrder />
      </Page>
    );
  }

  // if (status === "idle") {
  //   return <Page />;
  // }

  return <Page>LimitOrderWidget here</Page>;
};

export default LimitOrderDetail;

import React, { FC, useEffect } from "react";
import { useParams } from "react-router";

import { useWeb3React } from "@web3-react/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Page from "../../components/Page/Page";
import { fetchAllTokens } from "../../features/metadata/metadataActions";
import { selectMetaDataReducer } from "../../features/metadata/metadataSlice";
import { getDelegateOrder } from "../../features/takeLimit/takeLimitActions";
import { reset } from "../../features/takeLimit/takeLimitSlice";
import useDefaultLibrary from "../../hooks/useDefaultLibrary";
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

  const { senderWallet, senderToken, signerToken, chainId } = useParams<{
    senderWallet: string;
    senderToken: string;
    signerToken: string;
    chainId: string;
  }>();

  const defaultLibrary = useDefaultLibrary(Number(chainId));
  const library = useWeb3React();

  const { status, delegateRule } = useAppSelector((state) => state.takeLimit);
  const { isFetchingAllTokens } = useAppSelector(selectMetaDataReducer);

  useEffect(() => {
    if (
      !defaultLibrary ||
      !senderWallet ||
      !signerToken ||
      !senderToken ||
      !chainId
    ) {
      return;
    }

    dispatch(
      getDelegateOrder({
        senderWallet,
        senderToken: signerToken,
        signerToken,
        chainId: Number(chainId),
        library: defaultLibrary,
      })
    );

    return () => {
      dispatch(reset());
    };
  }, []);

  useEffect(() => {
    if (delegateRule && !isFetchingAllTokens) {
      dispatch(fetchAllTokens(delegateRule.chainId));
    }
  }, [delegateRule]);

  if (status === "invalid") {
    return (
      <Page>
        <InvalidOrder />
      </Page>
    );
  }

  // if (status === "not-found") {
  //   return (
  //     <Page>
  //       <NotFound />
  //     </Page>
  //   );
  // }

  if (status === "idle") {
    return <Page />;
  }

  return <Page>LimitOrderWidget here</Page>;
};

export default LimitOrderDetail;

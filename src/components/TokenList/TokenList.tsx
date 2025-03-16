import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { CollectionTokenInfo } from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AppTokenInfo } from "../../entities/AppTokenInfo/AppTokenInfo";
import { isTokenInfo } from "../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { BalancesState } from "../../features/balances/balancesSlice";
import {
  addActiveTokens,
  removeActiveTokens,
} from "../../features/metadata/metadataActions";
import { compareAddresses } from "../../helpers/string";
import { OverlayActionButton } from "../ModalOverlay/ModalOverlay.styles";
import {
  Container,
  SearchInput,
  ContentContainer,
  SizingContainer,
} from "./TokenList.styles";
import { getTokenIdsFromTokenInfo } from "./helpers";
import useScrapeToken from "./hooks/useScrapeToken";
import TokensAndCollectionsList from "./subcomponents/TokensAndCollectionsList/TokensAndCollectionsList";

export type TokenListProps = {
  /**
   * Called when a token has been seleced.
   */
  onSelectToken: (val: string) => void;
  /**
   * Balances for current tokens in wallet
   */
  balances: BalancesState;
  /**
   * all Token addresses in metadata.
   */
  allTokens: AppTokenInfo[];
  /**
   * All active tokens.
   */
  activeTokens: AppTokenInfo[];
  /**
   * Supported tokens according to registry
   */
  supportedTokenAddresses: string[];
  /**
   * function to handle adding active tokens (dispatches addActiveToken).
   */
  onAfterAddActiveToken?: (val: string) => void;
  /**
   * function to handle removing active tokens (dispatches removeActiveToken).
   */
  onAfterRemoveActiveToken?: (val: string) => void;
};

const TokenList = ({
  onSelectToken,
  balances,
  allTokens,
  activeTokens = [],
  supportedTokenAddresses,
  onAfterAddActiveToken,
  onAfterRemoveActiveToken,
}: TokenListProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { provider: library } = useWeb3React<Web3Provider>();
  const { account, chainId } = useAppSelector((state) => state.web3);

  const sizingContainerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedNftCollection, setSelectedNftCollection] =
    useState<CollectionTokenInfo>();
  const [tokenQuery, setTokenQuery] = useState<string>("");
  const [scrapedTokens, isScrapeTokensLoading] = useScrapeToken(
    tokenQuery,
    allTokens
  );

  const activeCollectionTokens = useMemo(() => {
    if (!selectedNftCollection) {
      return [];
    }

    return activeTokens.filter((token) =>
      compareAddresses(token.address, selectedNftCollection.address)
    );
  }, [selectedNftCollection]);

  const handleAddToken = async (tokenInfo: AppTokenInfo) => {
    if (library && account) {
      const tokenIds = getTokenIdsFromTokenInfo(tokenInfo, allTokens);
      await dispatch(addActiveTokens(tokenIds));

      setTokenQuery("");
      onAfterAddActiveToken && onAfterAddActiveToken(tokenIds[0]);
    }
  };

  const handleRemoveActiveToken = (tokenInfo: AppTokenInfo) => {
    if (library) {
      const tokenIds = getTokenIdsFromTokenInfo(tokenInfo, allTokens);
      dispatch(removeActiveTokens(tokenIds));

      onAfterRemoveActiveToken && onAfterRemoveActiveToken(tokenIds[0]);
    }
  };

  const handleSelectToken = (tokenInfo: AppTokenInfo) => {
    if (isTokenInfo(tokenInfo)) {
      onSelectToken(tokenInfo.address);

      return;
    }

    setTokenQuery("");
    setSelectedNftCollection(tokenInfo);
  };

  return (
    <Container>
      <ContentContainer>
        <SizingContainer ref={sizingContainerRef}>
          <SearchInput
            hideLabel
            id="tokenQuery"
            type="text"
            label={
              selectedNftCollection
                ? "Search by ID"
                : t("orders.searchByNameOrAddress")
            }
            value={tokenQuery}
            placeholder={
              selectedNftCollection
                ? "Search by ID"
                : t("orders.searchByNameOrAddress")
            }
            onChange={(e) => {
              setTokenQuery(e.currentTarget.value);
            }}
          />

          <TokensAndCollectionsList
            editMode={editMode}
            isScrapeTokensLoading={isScrapeTokensLoading}
            activeTokens={activeTokens}
            allTokens={allTokens}
            balances={balances}
            scrapedTokens={scrapedTokens}
            supportedTokenAddresses={supportedTokenAddresses}
            tokenQuery={tokenQuery}
            chainId={chainId}
            onSelectToken={handleSelectToken}
            onRemoveActiveToken={handleRemoveActiveToken}
            onAddToken={handleAddToken}
          />

          <OverlayActionButton
            intent="primary"
            ref={buttonRef}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? t("common.done") : t("orders.editCustomTokens")}
          </OverlayActionButton>
        </SizingContainer>
      </ContentContainer>
    </Container>
  );
};

export default TokenList;

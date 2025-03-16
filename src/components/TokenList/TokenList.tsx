import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { TokenInfo } from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { useWeb3React } from "@web3-react/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import nativeCurrency from "../../constants/nativeCurrency";
import { AppTokenInfo } from "../../entities/AppTokenInfo/AppTokenInfo";
import {
  getTokenDecimals,
  getTokenId,
} from "../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { BalancesState } from "../../features/balances/balancesSlice";
import {
  addActiveToken,
  removeActiveToken,
} from "../../features/metadata/metadataActions";
import { OverlayActionButton } from "../ModalOverlay/ModalOverlay.styles";
import { InfoHeading } from "../Typography/Typography";
import {
  Container,
  SearchInput,
  TokensContainer,
  Legend,
  LegendItem,
  ContentContainer,
  NoResultsContainer,
  SizingContainer,
  TokenListLoader,
  TokensScrollContainer,
} from "./TokenList.styles";
import { filterTokens } from "./filter";
import useScrapeToken from "./hooks/useScrapeToken";
import { sortTokenByExactMatch, sortTokensBySymbolAndBalance } from "./sort";
import InactiveTokensList from "./subcomponents/InactiveTokensList/InactiveTokensList";
import { ScrollContainer } from "./subcomponents/ScrollContainer/ScrollContainer";
import TokenButton from "./subcomponents/TokenButton/TokenButton";

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
  const [tokenQuery, setTokenQuery] = useState<string>("");
  const [scrapedTokens, isScrapeTokensLoading] = useScrapeToken(
    tokenQuery,
    allTokens
  );

  // sort tokens based on symbol
  const sortedTokens: AppTokenInfo[] = useMemo(() => {
    return sortTokensBySymbolAndBalance(activeTokens, balances);
  }, [activeTokens, balances]);

  // filter token
  const filteredTokens: AppTokenInfo[] = useMemo(() => {
    return filterTokens(Object.values(sortedTokens), tokenQuery);
  }, [sortedTokens, tokenQuery]);

  const sortedFilteredTokens: AppTokenInfo[] = useMemo(() => {
    return sortTokenByExactMatch(filteredTokens, tokenQuery);
  }, [filteredTokens, tokenQuery]);

  // sort inactive tokens based on symbol
  const sortedInactiveTokens: AppTokenInfo[] = useMemo(() => {
    return sortTokenByExactMatch(
      allTokens.filter((token) => !activeTokens.includes(token)),
      tokenQuery
    );
  }, [allTokens, activeTokens, tokenQuery]);

  const inactiveTokens = useMemo(() => {
    // if a scraped token is found, only show that one
    if (scrapedTokens.length) {
      return scrapedTokens;
    }

    // else only take the top 100 tokens
    return filterTokens(Object.values(sortedInactiveTokens), tokenQuery!).slice(
      0,
      100
    );
  }, [sortedInactiveTokens, tokenQuery, scrapedTokens.length]);

  const handleAddToken = async (tokenInfo: AppTokenInfo) => {
    if (library && account) {
      const tokenId = getTokenId(tokenInfo);
      await dispatch(addActiveToken(tokenId));

      onAfterAddActiveToken && onAfterAddActiveToken(tokenId);
    }
  };

  const handleRemoveActiveToken = (tokenInfo: AppTokenInfo) => {
    if (library) {
      const tokenId = getTokenId(tokenInfo);
      dispatch(removeActiveToken(tokenId));

      onAfterRemoveActiveToken && onAfterRemoveActiveToken(tokenId);
    }
  };

  return (
    <Container>
      <ContentContainer>
        <SizingContainer ref={sizingContainerRef}>
          <SearchInput
            hideLabel
            id="tokenQuery"
            type="text"
            label={t("orders.searchByNameOrAddress")}
            value={tokenQuery}
            placeholder={t("orders.searchByNameOrAddress")}
            onChange={(e) => {
              setTokenQuery(e.currentTarget.value);
            }}
          />

          <Legend>
            <LegendItem>{t("common.token")}</LegendItem>
            <LegendItem>{t("balances.balance")}</LegendItem>
          </Legend>

          <TokensScrollContainer>
            <ScrollContainer
              resizeDependencies={[
                activeTokens,
                sortedTokens,
                allTokens,
                tokenQuery,
              ]}
            >
              <TokensContainer>
                {[nativeCurrency[chainId || 1], ...sortedFilteredTokens].map(
                  (token) => {
                    const tokenId = getTokenId(token);
                    const tokenDecimals = getTokenDecimals(token);
                    const tokenBalance = balances.values[tokenId] || 0;

                    return (
                      <TokenButton
                        key={tokenId}
                        showDeleteButton={
                          editMode &&
                          token.address !== nativeCurrency[chainId || 1].address
                        }
                        token={token}
                        balance={formatUnits(tokenBalance, tokenDecimals)}
                        setToken={onSelectToken}
                        removeActiveToken={handleRemoveActiveToken}
                      />
                    );
                  }
                )}
              </TokensContainer>

              {inactiveTokens.length !== 0 && (
                <InactiveTokensList
                  inactiveTokens={inactiveTokens}
                  supportedTokenAddresses={supportedTokenAddresses}
                  onTokenClick={(tokenInfo) => {
                    handleAddToken(tokenInfo);
                    setTokenQuery("");
                  }}
                />
              )}

              {sortedFilteredTokens.length === 0 &&
                inactiveTokens.length === 0 &&
                !isScrapeTokensLoading && (
                  <NoResultsContainer>
                    <InfoHeading>{t("common.noResultsFound")}</InfoHeading>
                  </NoResultsContainer>
                )}
            </ScrollContainer>

            {isScrapeTokensLoading && <TokenListLoader />}
          </TokensScrollContainer>
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

import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { TokenInfo } from "@airswap/utils";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "@ethersproject/units";
import { useWeb3React } from "@web3-react/core";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import nativeCurrency from "../../constants/nativeCurrency";
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
  TokenContainer,
  Legend,
  LegendItem,
  ContentContainer,
  NoResultsContainer,
  SizingContainer,
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
  allTokens: TokenInfo[];
  /**
   * All active tokens.
   */
  activeTokens: TokenInfo[];
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
  const scrapedToken = useScrapeToken(tokenQuery, allTokens);

  // sort tokens based on symbol
  const sortedTokens: TokenInfo[] = useMemo(() => {
    return sortTokensBySymbolAndBalance(activeTokens, balances);
  }, [activeTokens, balances]);

  // filter token
  const filteredTokens: TokenInfo[] = useMemo(() => {
    return filterTokens(Object.values(sortedTokens), tokenQuery);
  }, [sortedTokens, tokenQuery]);

  const sortedFilteredTokens: TokenInfo[] = useMemo(() => {
    return sortTokenByExactMatch(filteredTokens, tokenQuery);
  }, [filteredTokens, tokenQuery]);

  // sort inactive tokens based on symbol
  const sortedInactiveTokens: TokenInfo[] = useMemo(() => {
    return sortTokenByExactMatch(
      allTokens.filter((token) => !activeTokens.includes(token)),
      tokenQuery
    );
  }, [allTokens, activeTokens, tokenQuery]);

  const inactiveTokens: TokenInfo[] = useMemo(() => {
    // if a scraped token is found, only show that one
    if (scrapedToken) {
      return [scrapedToken];
    }

    // else only take the top 100 tokens
    return filterTokens(Object.values(sortedInactiveTokens), tokenQuery!).slice(
      0,
      100
    );
  }, [sortedInactiveTokens, tokenQuery, scrapedToken]);

  const handleAddToken = async (address: string) => {
    if (library && account) {
      await dispatch(addActiveToken(address));

      onAfterAddActiveToken && onAfterAddActiveToken(address);
    }
  };

  const handleRemoveActiveToken = (address: string) => {
    if (library) {
      dispatch(removeActiveToken(address));

      onAfterRemoveActiveToken && onAfterRemoveActiveToken(address);
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

          <ScrollContainer
            resizeDependencies={[
              activeTokens,
              sortedTokens,
              allTokens,
              tokenQuery,
            ]}
          >
            <TokenContainer>
              {[nativeCurrency[chainId || 1], ...sortedFilteredTokens].map(
                (token) => (
                  <TokenButton
                    showDeleteButton={
                      editMode &&
                      token.address !== nativeCurrency[chainId || 1].address
                    }
                    token={token}
                    balance={formatUnits(
                      balances.values[token.address] || 0,
                      token.decimals
                    )}
                    setToken={onSelectToken}
                    removeActiveToken={handleRemoveActiveToken}
                    key={token.address}
                  />
                )
              )}
            </TokenContainer>

            {inactiveTokens.length !== 0 && (
              <InactiveTokensList
                inactiveTokens={inactiveTokens}
                supportedTokenAddresses={supportedTokenAddresses}
                onTokenClick={(tokenAddress) => {
                  handleAddToken(tokenAddress);
                  setTokenQuery("");
                }}
              />
            )}
            {sortedFilteredTokens.length === 0 && inactiveTokens.length === 0 && (
              <NoResultsContainer>
                <InfoHeading>{t("common.noResultsFound")}</InfoHeading>
              </NoResultsContainer>
            )}
          </ScrollContainer>
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

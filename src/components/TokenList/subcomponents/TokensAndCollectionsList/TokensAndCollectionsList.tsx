import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatUnits } from "ethers/lib/utils";

import nativeCurrency from "../../../../constants/nativeCurrency";
import { AppTokenInfo } from "../../../../entities/AppTokenInfo/AppTokenInfo";
import { getTokenBalance } from "../../../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { getTokenDecimals } from "../../../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { getTokenId } from "../../../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { BalancesState } from "../../../../features/balances/balancesSlice";
import { InfoHeading } from "../../../Typography/Typography";
import { reduceNftTokens } from "../../helpers/filter";
import { filterTokens } from "../../helpers/filter";
import { sortTokenByExactMatch } from "../../helpers/sort";
import { sortTokensBySymbolAndBalance } from "../../helpers/sort";
import InactiveTokensList from "../InactiveTokensList/InactiveTokensList";
import { ScrollContainer } from "../ScrollContainer/ScrollContainer";
import TokenButton from "../TokenButton/TokenButton";
import {
  Container,
  Legend,
  LegendItem,
  NoResultsContainer,
  TokenListLoader,
  TokensContainer,
  TokensScrollContainer,
} from "./TokensAndCollectionsList.styles";

type TokensAndCollectionsListProps = {
  editMode: boolean;
  isScrapeTokensLoading: boolean;
  activeTokens: AppTokenInfo[];
  allTokens: AppTokenInfo[];
  balances: BalancesState;
  scrapedTokens: AppTokenInfo[];
  supportedTokenAddresses: string[];
  tokenQuery: string;
  chainId?: number;
  onAddToken: (token: AppTokenInfo) => void;
  onRemoveActiveToken: (token: AppTokenInfo) => void;
  onSelectToken: (token: AppTokenInfo) => void;
  className?: string;
};

export const TokensAndCollectionsList = ({
  editMode,
  isScrapeTokensLoading,
  activeTokens,
  allTokens,
  balances,
  scrapedTokens,
  supportedTokenAddresses,
  tokenQuery,
  chainId = 1,
  onSelectToken,
  onRemoveActiveToken,
  onAddToken,
  className,
}: TokensAndCollectionsListProps) => {
  const { t } = useTranslation();

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
      return reduceNftTokens(scrapedTokens);
    }

    // else only take the top 100 tokens
    return filterTokens(Object.values(sortedInactiveTokens), tokenQuery!).slice(
      0,
      100
    );
  }, [sortedInactiveTokens, tokenQuery, scrapedTokens.length]);

  return (
    <Container className={className}>
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
            {[nativeCurrency[chainId], ...sortedFilteredTokens].map((token) => {
              const tokenId = getTokenId(token);
              const tokenDecimals = getTokenDecimals(token);
              const tokenBalance = getTokenBalance(token, balances);

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
                  removeActiveToken={onRemoveActiveToken}
                />
              );
            })}
          </TokensContainer>

          {inactiveTokens.length !== 0 && (
            <InactiveTokensList
              inactiveTokens={inactiveTokens}
              supportedTokenAddresses={supportedTokenAddresses}
              onTokenClick={onAddToken}
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
    </Container>
  );
};

export default TokensAndCollectionsList;

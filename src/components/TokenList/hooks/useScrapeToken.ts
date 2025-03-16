import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { AppTokenInfo } from "../../../entities/AppTokenInfo/AppTokenInfo";
import { isTokenInfo } from "../../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { addUnknownTokenInfo } from "../../../features/metadata/metadataActions";
import scrapeToken from "../../../helpers/scrapeToken";
import { compareAddresses } from "../../../helpers/string";

const useScrapeToken = (
  address: string,
  tokens: AppTokenInfo[]
): [AppTokenInfo[], boolean] => {
  const dispatch = useDispatch();
  const { account } = useWeb3React();
  const { provider: library } = useWeb3React<Web3Provider>();

  const [scrapedTokens, setScrapedTokens] = useState<AppTokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrapedTokens?.length) {
      dispatch(addUnknownTokenInfo(scrapedTokens));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrapedTokens.length]);

  useEffect(() => {
    if (!library || !account) {
      return;
    }

    const knownTokens = tokens.filter((token) =>
      compareAddresses(token.address, address)
    );

    // If the ERC20 token is already in the list, don't scrape it. ERC721 and ERC1155 is unique per id,
    // so needs to be scraped for each id.
    if (knownTokens.some(isTokenInfo)) {
      return;
    }

    // TODO: knownTokens needs to be passed to scrapeToken

    const callScrapeToken = async () => {
      setIsLoading(true);
      const result = await scrapeToken(library, address, account);
      console.log(result);
      setScrapedTokens(result);
      setIsLoading(false);
    };

    callScrapeToken();
  }, [address, account, tokens, library]);

  return [scrapedTokens, isLoading];
};

export default useScrapeToken;

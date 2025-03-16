import { AppTokenInfo } from "../../../entities/AppTokenInfo/AppTokenInfo";
import {
  getTokenId,
  isCollectionTokenInfo,
  isTokenInfo,
} from "../../../entities/AppTokenInfo/AppTokenInfoHelpers";
import { compareAddresses } from "../../../helpers/string";

export const getTokenIdsFromTokenInfo = (
  tokenInfo: AppTokenInfo,
  allTokenInfos: AppTokenInfo[]
): string[] => {
  if (isTokenInfo(tokenInfo)) {
    return [getTokenId(tokenInfo)];
  }

  const { address } = tokenInfo;

  const collectionTokenInfos = allTokenInfos
    .filter(isCollectionTokenInfo)
    .filter((t) => compareAddresses(t.address, address));

  const tokenIds = collectionTokenInfos.map((t) => getTokenId(t));

  return tokenIds;
};

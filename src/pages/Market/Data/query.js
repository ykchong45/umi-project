import { gql } from '@apollo/client';

export const GET_BLOCK_FROM_TIMESTAMP = gql`
  query blocks($timestamp: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: desc
      where: { timestamp_lte: $timestamp }
    ) {
      id
      number
      timestamp
    }
  }
`;

// get general market data
export const GET_MARKET_DATA = gql`
  query uniswapDayDatas($startTime: Int!, $skip: Int!) {
    uniswapDayDatas(
      first: 1000
      skip: $skip
      subgraphError: allow
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`;

// get general token list
// this is for the current day, use get token day data to fetch yesterday's and calculate the price
export const GET_TOKEN_LIST = gql`
  query tokenDayDatas($date: Int!, $tokenAmount: Int!) {
    tokenDayDatas(
      first: $tokenAmount
      orderBy: totalLiquidityUSD
      orderDirection: desc
      where: { date: $date }
    ) {
      token {
        id
        name
        symbol
      }
      dailyVolumeUSD
      totalLiquidityUSD
      priceUSD
    }
  }
`;

export const GET_TOKEN_DAY_SIMPLE = gql`
  query tokenDayDatas($tokenId: ID!) {
    tokenDayDatas(first: 2, orderBy: date, orderDirection: desc, where: { token: $tokenId }) {
      id
      token {
        id
        name
        symbol
      }
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`;

export const GET_TOKEN_INFO = gql`
  query tokens($address: ID!, $block: Int!) {
    tokens(where: { id: $address }, block: { number: $block }) {
      id
      symbol
      name
      decimals
      untrackedVolumeUSD
      tradeVolumeUSD
      totalLiquidity
      txCount
    }
  }
`;

// get individual token history data
export const GET_TOKEN_DAY_DATA = gql`
  query tokenDayDatas($tokenId: ID!) {
    tokenDayDatas(orderBy: date, orderDirection: desc, where: { token: $tokenId }) {
      id
      date
      token {
        id
        symbol
        name
      }
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      dailyVolumeToken
      dailyVolumeUSD
      mostLiquidPairs {
        id
        date
      }
    }
    pairs0: pairs(
      where: { token0: $tokenId }
      first: 50
      orderBy: reserveUSD
      orderDirection: desc
    ) {
      id
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
    pairs1: pairs(
      where: { token1: $tokenId }
      first: 50
      orderBy: reserveUSD
      orderDirection: desc
    ) {
      id
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
  }
`;

// get general pool list
export const GET_TOP_POOL = gql`
  query pairDayDatas($poolAmount: Int!, $date: Int!) {
    pairDayDatas(
      first: $poolAmount
      orderBy: reserveUSD
      orderDirection: desc
      where: { date: $date }
    ) {
      pairAddress
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      reserveUSD
      dailyVolumeUSD
    }
  }
`;

// get pool info
export const GET_POOL_INFO = gql`
  query($pairAddress: ID!, $block: Int!) {
    pairs(where: { id: $pairAddress }, block: { number: $block }) {
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      volumeUSD
      untrackedVolumeUSD
      reserveUSD
      token0Price
      token1Price
      reserve0
      reserve1
    }
  }
`;

// get pool day data
// @params timespan, pairAddress
export const GET_POOL_DAY_DATA = gql`
  query pairDayDatas($timespan: Int!, $pairAddress: ID!) {
    pairDayDatas(
      first: $timespan
      orderBy: date
      orderDirection: desc
      where: { pairAddress: $pairAddress }
    ) {
      id
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      date
      dailyVolumeUSD
      reserveUSD
    }
  }
`;

export const GET_TOKEN_FROM_ID = gql`
  query tokens($id: [Bytes]!) {
    tokens(where: { id_in: $id }, orderDirection: asc) {
      id
      name
      symbol
    }
  }
`;

export const GET_POOL_FROM_ID = gql`
  query pairs($id: [Bytes]!) {
    pairs(where: { id_in: $id }, orderDirection: asc) {
      id
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
  }
`;

export const TOKEN_SEARCH = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(
      where: { symbol_contains: $value }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      symbol
      name
      totalLiquidity
      tradeVolume
      txCount
    }
    asName: tokens(
      where: { name_contains: $value }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      symbol
      name
      totalLiquidity
      tradeVolume
      txCount
    }
    asAddress: tokens(where: { id: $id }, orderBy: totalLiquidity, orderDirection: desc) {
      id
      symbol
      name
      totalLiquidity
      tradeVolume
      txCount
    }
  }
`;

export const POOL_SEARCH = gql`
  query pairs($tokens: [Bytes]!, $id: String) {
    as0: pairs(where: { token0_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      txCount
    }
    as1: pairs(where: { token1_in: $tokens }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      txCount
    }
    asAddress: pairs(where: { id: $id }) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      txCount
    }
  }
`;

// get main transactions
export const GET_GLOBAL_TRANSACTIONS = gql`
  query transactions($txAmount: Int!) {
    mints(first: $txAmount, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(first: $txAmount, orderBy: timestamp, orderDirection: desc) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(first: $txAmount, orderBy: timestamp, orderDirection: desc) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
    }
  }
`;

export const FILTERED_TRANSACTIONS = gql`
  query transactions($txAmount: Int!, $allPairs: [Bytes]!) {
    mints(
      first: $txAmount
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(
      first: $txAmount
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(
      first: $txAmount
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
    }
  }
`;

export const USER_POSITIONS = gql`
  query liquidityPositions($user: Bytes!) {
    liquidityPositions(where: { user: $user }) {
      pair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
          symbol
          derivedETH
        }
        token1 {
          id
          symbol
          derivedETH
        }
        totalSupply
      }
      liquidityTokenBalance
    }
  }
`;

export const TOP_LPS_PER_PAIRS = gql`
  query lps($pair: Bytes!) {
    liquidityPositions(
      where: { pair: $pair }
      orderBy: liquidityTokenBalance
      orderDirection: desc
      first: 3
    ) {
      user {
        id
      }
      pair {
        id
        totalSupply
        reserveUSD
      }
      liquidityTokenBalance
    }
  }
`;

export const USER_HISTORY = gql`
  query snapshots($user: Bytes!, $skip: Int!) {
    liquidityPositionSnapshots(first: 1000, skip: $skip, where: { user: $user }) {
      timestamp
      reserveUSD
      liquidityTokenBalance
      liquidityTokenTotalSupply
      reserve0
      reserve1
      token0PriceUSD
      token1PriceUSD
      pair {
        id
        reserve0
        reserve1
        reserveUSD
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`;

export const USER_MINTS_BUNRS_PER_PAIR = gql`
  query events($user: Bytes!, $pair: Bytes!) {
    mints(where: { to: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
    burns(where: { sender: $user, pair: $pair }) {
      amountUSD
      amount0
      amount1
      timestamp
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`;

export const BUNDLE_ID = '1';

export const ETH_PRICE = block => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${BUNDLE_ID} } block: {number: ${block}}) {
        id
        ethPrice
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${BUNDLE_ID} }) {
        id
        ethPrice
      }
    }
  `;
  return gql(queryString);
};

export const TOP_XCHANGE_VOL = gql`
  query swapData($offset: Int!) {
    swaps(first: 5, skip: $offset, orderDirection: desc, orderBy: timestamp) {
      id
      sender
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }

      amountUSD
    }
  }
`;

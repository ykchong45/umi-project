import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import cx from "classnames";

import { Spin, Radio, Button } from 'antd';

// import styles from './ExchangeTVChart.css';
import styled from "styled-components";

import { createChart } from "lightweight-charts";

import { useConstantLoader, constantInstance } from "@/constants"

import {
  USD_DECIMALS,
  SWAP,
  INCREASE,
  CHART_PERIODS,
  getTokenInfo,
  formatAmount,
  formatDateTime,
  usePrevious,
  getLiquidationPrice,
  useLocalStorageSerializeKey
} from '@/acy-dex-futures/utils'
import { useChartPrices } from '@/acy-dex-futures/Api'

import './ExchangeTVChart.css';
// import { getKChartData } from '../utils/index'
// import Tab from '../Tab/Tab'

// import ChartTokenSelector from './ChartTokenSelector'

////// Binance CEX price source
import axios from "axios";
import Binance from "binance-api-node";

const StyledSelect = styled(Radio.Group)`
  .ant-radio-button-wrapper{
    background: transparent !important;
    height: 22px;
    font-size: 0.7rem;
    padding: 0 0.1rem;
    border: 0.75px solid #333333;
    border-radius: 0 0 0 0;
    line-height: 22px;
    color: #b5b5b6;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled){
    color: #ffffff;
    box-shadow: 0 0 0 0 black;
    border-color: #333333;
    background-color: #29292c !important;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover{
    color: #ffffff;
    background-color: #29292c !important;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before{
    background-color: #black !important;
  }
  .ant-radio-button-wrapper:not(:first-child)::before{
    background-color: transparent;
  }
`;

const client = Binance();
////// End of price source

const PRICE_LINE_TEXT_WIDTH = 15;

const timezoneOffset = -new Date().getTimezoneOffset() * 60;

const BinancePriceApi = 'https://api.acy.finance/polygon-test';

const DEFAULT_PERIOD = "4h";

const getSeriesOptions = () => ({
  // https://github.com/tradingview/lightweight-charts/blob/master/docs/area-series.md
  lineColor: "#5472cc",
  topColor: "rgba(49, 69, 131, 0.4)",
  bottomColor: "rgba(42, 64, 103, 0.0)",
  lineWidth: 2,
  priceLineColor: "#3a3e5e",
  downColor: "#fa3c58",
  wickDownColor: "#fa3c58",
  upColor: "#0ecc83",
  wickUpColor: "#0ecc83",
  borderVisible: false,
});

const getChartOptions = (width, height) => ({
  width,
  height,
  watermark: {
    visible: true,
    fontSize: 40,
    horzAlign: 'center',
    vertAlign: 'center',
    color: 'rgba(255, 255, 255, 0.2)',
    text: 'TestNet',
  },
  layout: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    textColor: "#ccc",
    fontFamily: "Karla 300",
  },
  localization: {
    // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md#time-format
    timeFormatter: (businessDayOrTimestamp) => {
      return formatDateTime(businessDayOrTimestamp);
    },
  },
  grid: {
    vertLines: {
      visible: true,
      // color: "rgba(27, 27, 27, 1)",
      color: "#1b1b1b",
      style: 0,
    },
    horzLines: {
      visible: true,
      // color: "rgba(35, 38, 59, 1)",
      color: "#1b1b1b",
      style: 2,
    },
  },
  // https://github.com/tradingview/lightweight-charts/blob/master/docs/time-scale.md#time-scale
  timeScale: {
    rightOffset: 5,
    borderVisible: false,
    barSpacing: 5,
    timeVisible: true,
    fixLeftEdge: true,
  },
  // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md#price-axis
  priceScale: {
    borderVisible: false,
  },
  crosshair: {
    horzLine: {
      color: "#aaa",
    },
    vertLine: {
      color: "#aaa",
    },
    mode: 0,
  },
});

function getCurrentTimestamp() {
  let curTime = Math.floor(Date.now() / 1000);
  return curTime
}

export default function ExchangeTVChart(props) {
  const {
    chartTokenSymbol,
    pageName,
    fromToken,
    toToken,
  } = props
  const [currentChart, setCurrentChart] = useState();
  const [currentSeries, setCurrentSeries] = useState();
  const [activeTimeScale, setActiveTimeScale] = useState("5m");
  const [period, setPeriod] = useState('5m');

  const [hoveredCandlestick, setHoveredCandlestick] = useState();
  const [curPrice, setCurPrice] = useState();
  const [priceChangePercentDelta, setPriceChangePercentDelta] = useState();
  const [deltaIsMinus, setDeltaIsMinus] = useState();
  // const [pairName, setPairName] = useState("BNBUSDT");

  const isTick = pageName == "Option" || pageName == "Powers" || pageName == "Future";

  const symbol = chartTokenSymbol || "BTC";
  const marketName = symbol + "_USD";
  const previousMarketName = usePrevious(marketName);

  const ref = useRef(null);
  const chartRef = useRef(null);

  const [chartInited, setChartInited] = useState(false);

  // useEffect(() => {
  //   passTokenData(symbol);
  // }, []);

  useEffect(() => {
    if (marketName !== previousMarketName) {
      setChartInited(false);
    }
  }, [marketName, previousMarketName]);

  // ??????chart?????????range
  const scaleChart = useCallback(() => {
    const from = Date.now() / 1000 - (7 * 24 * CHART_PERIODS[period]) / 2;
    const to = Date.now() / 1000;
    currentChart.timeScale().setVisibleRange({ from, to });
  }, [currentChart, period]);

  // Binance data source
  const [lastCandle, setLastCandle] = useState({})
  const cleaner = useRef()
  useEffect(() => {
    if (!currentSeries)
      return;

    const symbol = chartTokenSymbol;
    console.log("bin chart token: ", symbol)
    if (!symbol)
      return
    const pairName = `${fromToken}${toToken}`;
    // const pairName = `${symbol}USDT`;

    if (cleaner.current) {
      // unsubscribe from previous subscription
      console.log("cleaned previous subscriber: ", cleaner.current)
      cleaner.current()
      // clear chart candles
      currentSeries.setData([]);
    }

    if (isTick) {
      console.log("tvchart pageName", pageName)

      // subscribe to websocket for the future price update
      const clean = client.ws.candles(pairName, period, (res) => {
        console.log("res Swap: ", res)
        const candleData = {
          time: res.startTime / 1000,   // make it in seconds
          open: res.open,
          high: res.high,
          low: res.low,
          close: res.close
        }
        console.log("ws received: ", candleData.time, candleData.close)
        currentSeries.update(candleData)
        setLastCandle(candleData);

        const ticks = currentSeries.Kn?.Bt?.Xr;
        //St: open high low close; rt[So]: time
        // console.log("chartData: ", ticks);
        const oldestTick = ticks[0];
        const latestTick = ticks[ticks.length - 1];
        if (oldestTick) {
          console.log(`oldest tick: Open=${oldestTick.St[0]}, timestamp=${oldestTick.rt.So}`)
        }
        if (ticks && period != '1m' && period != '1w') {
          getDeltaPriceChange(ticks)
        }
      });
      cleaner.current = clean;
      console.log("added new candles subscription for ", pairName)
    }
    const fetchPrevAndSubscribe = async () => {
      // before subscribe to websocket, should prefill the chart with existing history, this can be fetched with normal REST request
      // SHOULD DO THIS BEFORE SUBSCRIBE, HOWEVER MOVING SUBSCRIBE TO AFTER THIS BLOCK OF CODE WILL CAUSE THE SUBSCRIPTION GOES ON FOREVER
      // REACT BUG?
      let fromTokenURL = `${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${fromToken}USDT&interval=${period}`
      let toTokenURL = `${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${toToken}USDT&interval=${period}`
      let requesetFromTokenData = axios.get(fromTokenURL)
      let requesetToTokenData = axios.get(toTokenURL)
      let responseToTokenData;

      let responsePairData = [];
      let responseFromTokenData;
      if (pageName == "StableCoin") {
        console.log("tvchart stablecoin totoken", toToken)
        responseFromTokenData = await axios
          .get(
            `${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${toToken}USDT&interval=${period}`,
          )
          .then((res) => res.data);
        console.log("tvchart stablecoin responseFromTokenData stablecoin", responseFromTokenData)
      }
      else {
        responseFromTokenData = await axios
          .get(
            `${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${fromToken}USDT&interval=${period}`,
          )
          .then((res) => res.data);
      }
      if (toToken != "USDT") {
        responseToTokenData = await axios
          .get(
            `${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${toToken}USDT&interval=${period}`,
          ).then((res) => res.data)
      }
      for (let i = 0; i < responseFromTokenData.length; i++) {
        if (toToken != "USDT") {
          responsePairData.push({
            time: responseFromTokenData[i].time,
            open: responseFromTokenData[i].open / responseToTokenData[i].open,
            high: responseFromTokenData[i].high / responseToTokenData[i].high,
            low: responseFromTokenData[i].low / responseToTokenData[i].low,
            close: responseFromTokenData[i].close / responseToTokenData[i].close,
          })
        }
        else {
          responsePairData = responseFromTokenData
        }
      }


      // Binance data is independent of chain, so here we can fill in any chain name

      // const prevData = await axios.get(
      //   `${BinancePriceApi}/api/cexPrices/binanceHistoricalPrice?symbol=${pairName}&interval=${period}`
      //   ).then(res => res.data)
      currentSeries.setData(responsePairData);
      // console.log("hjhjhj prev data: ", responsePairData)
      // console.log("hjhjhj prev data second: ", secondData)
      // console.log("prev data: ", prevData)
      if (!isTick) {
        getDeltaPriceChange(responsePairData)
      }

      if (!chartInited) {
        scaleChart();
        setChartInited(true);
      }
    }

    console.log("tvchart stablecoin fetch prev called totoken", toToken)
    fetchPrevAndSubscribe()
  }, [currentSeries, fromToken, toToken, period])
  ///// end of binance data source

  const getDeltaPriceChange = (data) => {
    let timeNow = getCurrentTimestamp()
    let latestTick; let yesterday;
    // console.log("hjhjhj currentseries curtime now", timeNow, "period", period, CHART_PERIODS[period])
    let forwardArr = 86400 / CHART_PERIODS[period]
    let arrIndex = 999 - forwardArr
    if (!isTick) {
      latestTick = data[data.length - 1].open;
      yesterday = data[data.length - 1 - forwardArr].open;
      console.log("tvchart is swap or stablecoin", isTick)
    }
    if (isTick) {
      latestTick = data[data.length - 1]?.St[0];
      yesterday = data[data.length - 1 - forwardArr]?.St[0];
      console.log("tvchart is option or powers", isTick)
    }

    let deltaPercent = ((latestTick - yesterday) / yesterday * 100).toString();
    if (deltaPercent && deltaPercent[0] == "-") {
      setDeltaIsMinus(true)
      let negativeCurrentPrice = latestTick
      let negativePriceChangePercent = deltaPercent.substring(1)
      setCurPrice(parseFloat(negativeCurrentPrice).toFixed(2))
      setPriceChangePercentDelta(parseFloat(negativePriceChangePercent).toFixed(3))
    }
    else {
      setDeltaIsMinus(false)
      let positiveCurrentPrice = latestTick
      let positivePricechangePercent = deltaPercent
      setCurPrice(parseFloat(positiveCurrentPrice).toFixed(2))
      setPriceChangePercentDelta(parseFloat(positivePricechangePercent).toFixed(3))
    }
  }


  // ??????chart????????????????????????????????????evt???event????????????
  const onCrosshairMove = useCallback(
    (evt) => {
      if (!evt.time) {
        setHoveredCandlestick(null);
        return;
      }

      // ?????? for loop + break ?????????????????????????????????
      for (const point of evt.seriesPrices.values()) {
        setHoveredCandlestick((hoveredCandlestick) => {
          if (hoveredCandlestick && hoveredCandlestick.time === evt.time) {
            // rerender optimisations
            return hoveredCandlestick;
          }
          return {
            time: evt.time,
            ...point,
          };
        });
        break;
      }
    },
    [setHoveredCandlestick]
  );

  // ??????????????????priceData??????????????? chart
  // ??????????????????currentChart??????????????????????????????priceData???????????????????????????????????????????????????console.log??????????????????
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    console.log("debug chart: chart created")

    const chart = createChart(
      chartRef.current,
      getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight)
    );

    chart.subscribeCrosshairMove(onCrosshairMove);

    const series = chart.addCandlestickSeries(getSeriesOptions());

    setCurrentChart(chart);
    setCurrentSeries(series);
  }, [ref, onCrosshairMove]);

  // ??????????????????chartRef??????div??????????????????currentChart??????????????????????????????????????????
  // offsetWidth?????????component??????????????????offsetWidth ??? clientWidth ?????????????????????
  // https://stackoverflow.com/questions/21064101/understanding-offsetwidth-clientwidth-scrollwidth-and-height-respectively
  useEffect(() => {
    console.log("debug chart: currentChart ", currentChart)
    if (!currentChart) {
      return;
    }
    const resizeChart = () => {
      currentChart.resize(chartRef.current.offsetWidth, 470);
      console.log("debug chart: resize ", chartRef.current.offsetWidth, chartRef.current.offsetHeight)
    };
    resizeChart();
    window.addEventListener("resize", resizeChart);
    return () => window.removeEventListener("resize", resizeChart);
  }, [currentChart]);

  //   // ??????????????????????????????position??????order??????????????????????????????+liquidation??????
  //   useEffect(() => {
  //     const lines = [];
  //     if (currentSeries && savedShouldShowPositionLines) {
  //       if (currentOrders && currentOrders.length > 0) {
  //         currentOrders.forEach((order) => {
  //           const indexToken = constantInstance.perpetuals.getToken(order.indexToken);
  //           let tokenSymbol;
  //           if (indexToken && indexToken.symbol) {
  //             tokenSymbol = indexToken.isWrapped ? indexToken.baseSymbol : indexToken.symbol;
  //           }
  //           const title = `${order.type === INCREASE ? "Inc." : "Dec."} ${tokenSymbol} ${
  //             order.isLong ? "Long" : "Short"
  //           }`;
  //           const color = "#3a3e5e";
  //           lines.push(
  //             currentSeries.createPriceLine({
  //               price: parseFloat(formatAmount(order.triggerPrice, USD_DECIMALS, 2)),
  //               color,
  //               title: title.padEnd(PRICE_LINE_TEXT_WIDTH, " "),
  //             })
  //           );
  //         });
  //       }
  //       if (positions && positions.length > 0) {
  //         const color = "#3a3e5e";

  //         positions.forEach((position) => {
  //           lines.push(
  //             currentSeries.createPriceLine({
  //               price: parseFloat(formatAmount(position.averagePrice, USD_DECIMALS, 2)),
  //               color,
  //               title: `Open ${position.indexToken.symbol} ${position.isLong ? "Long" : "Short"}`.padEnd(
  //                 PRICE_LINE_TEXT_WIDTH,
  //                 " "
  //               ),
  //             })
  //           );

  //           const liquidationPrice = getLiquidationPrice(position);
  //           lines.push(
  //             currentSeries.createPriceLine({
  //               price: parseFloat(formatAmount(liquidationPrice, USD_DECIMALS, 2)),
  //               color,
  //               title: `Liq. ${position.indexToken.symbol} ${position.isLong ? "Long" : "Short"}`.padEnd(
  //                 PRICE_LINE_TEXT_WIDTH,
  //                 " "
  //               ),
  //             })
  //           );
  //         });
  //       }
  //     }
  //     return () => {
  //       lines.forEach((line) => currentSeries.removePriceLine(line));
  //     };
  //   }, [currentOrders, positions, currentSeries, chainId, savedShouldShowPositionLines]);

  // // ??????OHLC??????, ?????????binance????????????API??????24h high low, ?????????websocket?????????
  // const candleStatsHtml = useMemo(() => {
  //   if (!priceData) {
  //     return null;
  //   }
  //   const candlestick = hoveredCandlestick || priceData[priceData.length - 1];
  //   if (!candlestick) {
  //     return null;
  //   }

  //   const className = cx({
  //     "ExchangeChart-bottom-stats": true,
  //     positive: candlestick.open <= candlestick.close,
  //     negative: candlestick.open > candlestick.close,
  //     [`length-${String(parseInt(candlestick.close)).length}`]: true,
  //   });

  //   const toFixedNumbers = 2;

  //   return (
  //     <div className={className}>
  //       <span className="ExchangeChart-bottom-stats-label">O</span>
  //       <span className="ExchangeChart-bottom-stats-value">{candlestick.open.toFixed(toFixedNumbers)}</span>
  //       <span className="ExchangeChart-bottom-stats-label">H</span>
  //       <span className="ExchangeChart-bottom-stats-value">{candlestick.high.toFixed(toFixedNumbers)}</span>
  //       <span className="ExchangeChart-bottom-stats-label">L</span>
  //       <span className="ExchangeChart-bottom-stats-value">{candlestick.low.toFixed(toFixedNumbers)}</span>
  //       <span className="ExchangeChart-bottom-stats-label">C</span>
  //       <span className="ExchangeChart-bottom-stats-value">{candlestick.close.toFixed(toFixedNumbers)}</span>
  //     </div>
  //   );
  // }, [hoveredCandlestick, priceData]);

  // // 24h OHLC stats
  // let high;
  // let low;
  // let deltaPrice;
  // let delta;
  // let deltaPercentage;
  // let deltaPercentageStr;

  // const now = parseInt(Date.now() / 1000);
  // const timeThreshold = now - 24 * 60 * 60;

  // if (priceData) {
  //   for (let i = priceData.length - 1; i > 0; i--) {
  //     const price = priceData[i];
  //     if (price.time < timeThreshold) {
  //       break;
  //     }
  //     if (!low) {
  //       low = price.low;
  //     }
  //     if (!high) {
  //       high = price.high;
  //     }

  //     if (price.high > high) {
  //       high = price.high;
  //     }
  //     if (price.low < low) {
  //       low = price.low;
  //     }

  //     deltaPrice = price.open;
  //   }
  // }

  // if (deltaPrice && currentAveragePrice) {
  //   const average = parseFloat(formatAmount(currentAveragePrice, USD_DECIMALS, 2));
  //   delta = average - deltaPrice;
  //   deltaPercentage = (delta * 100) / average;
  //   if (deltaPercentage > 0) {
  //     deltaPercentageStr = `+${deltaPercentage.toFixed(2)}%`;
  //   } else {
  //     deltaPercentageStr = `${deltaPercentage.toFixed(2)}%`;
  //   }
  //   if (deltaPercentage === 0) {
  //     deltaPercentageStr = "0.00";
  //   }
  // }

  if (!chartTokenSymbol) {
    return null;
  }
  const placementChange = e => {
    // if(updatingKchartsFlag) {
    //   return;
    // }
    // setUpdatingKchartsFlag(true);
    setPeriod(e.target.value);
    setActiveTimeScale(e.target.value);
    console.log("hereim button triggered", e.target.value)
  };

  // const getTimescaleButton = value => {
  //   if (period != value) {
  //     return (
  //       <button
  //         className={styles.timescaleButton}
  //         onClick={() => { setPeriod(value) }}>
  //         {value}
  //       </button>
  //     )
  //   } else {
  //     return (
  //       <button
  //         className={styles.timescaleButtonActive}
  //         onClick={() => { setPeriod(value) }}>
  //         {value}
  //       </button>
  //     )
  //   }
  // }

  // const onSelectToken = (token) => {
  //   const tmp = getTokenInfo(infoTokens, token.address)
  //   setChartToken(tmp)
  //   setToTokenAddress(swapOption, token.address)
  // }

  return (
    <div className="ExchangeChart tv" ref={ref} style={{ height: "100%", width: "100%" }}>
      <div className="ExchangeChart-top App-box App-box-border">
        <div className="ExchangeChart-top-inner">
          <div class="grid-container-element">
            <div className="timeSelector" style={{ float: "left" }}>
              {/* <div className="ExchangeChart-info-label">24h Change</div> */}
              <StyledSelect value={period} onChange={placementChange}
                style={{ width: '200%', height: '23px' }}>
                <Radio.Button value="1m" style={{ width: '9%', textAlign: 'center' }}>1m</Radio.Button>
                <Radio.Button value="5m" style={{ width: '9%', textAlign: 'center' }}>5m</Radio.Button>
                <Radio.Button value="15m" style={{ width: '9%', textAlign: 'center' }}>15m</Radio.Button>
                <Radio.Button value="30m" style={{ width: '9%', textAlign: 'center' }}>30m</Radio.Button>
                <Radio.Button value="1h" style={{ width: '9%', textAlign: 'center' }}>1h</Radio.Button>
                <Radio.Button value="2h" style={{ width: '9%', textAlign: 'center' }}>2h</Radio.Button>
                <Radio.Button value="4h" style={{ width: '9%', textAlign: 'center' }}>4h</Radio.Button>
                <Radio.Button value="1d" style={{ width: '9%', textAlign: 'center' }}>1D</Radio.Button>
                <Radio.Button value="1w" style={{ width: '9%', textAlign: 'center' }}>1W</Radio.Button>
              </StyledSelect>
            </div>
            {deltaIsMinus ?
              <div style={{ float: "right", paddingRight: "1rem", wordSpacing: "0.5rem", color: "#FA3C58" }}>
                ${curPrice} -{priceChangePercentDelta}%
              </div>
              :
              <div style={{ float: "right", paddingRight: "1rem", wordSpacing: "0.5rem", color: '#46E3AE' }}>
                ${curPrice} +{priceChangePercentDelta}%
              </div>
            }
          </div>

          {/* </div> */}
          {/* <div className="ExchangeChart-title">
              <ChartTokenSelector
                chainId={chainId}
                selectedToken={chartToken}
                swapOption={swapOption}
                infoTokens={infoTokens}
                onSelectToken={onSelectToken}
                className="chart-token-selector"
              />
            </div> */}
          {/* <div>
						<div className="ExchangeChart-main-price">{chartToken.maxPrice && formatAmount(chartToken.maxPrice, USD_DECIMALS, 2)}</div>
						<div className="ExchangeChart-info-label">${chartToken.minPrice && formatAmount(chartToken.minPrice, USD_DECIMALS, 2)}</div>
					</div>
					<div>
						<div className="ExchangeChart-info-label">24h Change</div>
						<div className={cx({ positive: deltaPercentage > 0, negative: deltaPercentage < 0 })}>
							{!deltaPercentageStr && "-"}
							{deltaPercentageStr && deltaPercentageStr}
						</div>
					</div>
					<div className="ExchangeChart-additional-info">
						<div className="ExchangeChart-info-label">24h High</div>
						<div>
							{!high && "-"}
							{high && high.toFixed(2)}
						</div>
					</div>
					<div className="ExchangeChart-additional-info">
						<div className="ExchangeChart-info-label">24h Low</div>
						<div>
							{!low && "-"}
							{low && low.toFixed(2)}
						</div>
					</div> */}
        </div>
      </div>
      <div className="ExchangeChart-bottom App-box App-box-border" style={{ height: "100%", width: "100%" }}>
        <div className="ExchangeChart-bottom-header">
          <div className="ExchangeChart-bottom-controls">
            {/* <Tab options={Object.keys(CHART_PERIODS)} option={period} setOption={setPeriod} /> */}
          </div>
          {/* {candleStatsHtml} */}
        </div>
        {!currentChart && <Spin />}
        <div className="ExchangeChart-bottom-content" ref={chartRef} style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}

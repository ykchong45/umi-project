import React, { Component, useState, useEffect, useRef } from 'react';
import { getKChartData } from '../utils/index'
//------FOR Pricehart-----TODO Austin 
// import { createChart } from 'krasulya-lightweight-charts'
import { createChart } from 'lightweight-charts';
import { formatAmount, USD_DECIMALS, formatDateTime } from '@/acy-dex-futures/utils';
// import  USD_DECIMALS  from '@/acy-dex-futures/utils/Helpers';

import './styles.css';
// import {
// 	USD_DECIMALS,
// 	SWAP,
//   INCREASE,
//   CHART_PERIODS,
// 	getTokenInfo,
// 	formatAmount,
// 	formatDateTime,
//   usePrevious,
//   getLiquidationPrice,
//   useLocalStorageSerializeKey
// } from '../../../acy-dex-futures/utils/Helpers'

import Tab from '../../../acy-dex-futures/Tab/Tab'
import { MdOutlineSignalCellularConnectedNoInternet4Bar } from 'react-icons/md';

const timezoneOffset = -(new Date()).getTimezoneOffset() * 60

const KChart=(props)=> {

  const [currentChart, setCurrentChart] = useState();
  const [currentSeries, setCurrentSeries] = useState();
  const [currentChartData, setCurrentChartData] = useState([]);

  // const { activeToken0, activeToken1 } = props;

  const ref = useRef(null);
  const chartRef = useRef();

  const getChartOptions = (width, height) => ({
    // width: document.body.offsetWidth *0.7,
    // height: document.body.offsetHeight / 2,
    width,
    height,
    layout: {
      backgroundColor: '#0e0304',
      textColor: '#ccc',
      fontFamily: 'Karla'
      // font-family: "Karla", sans-serif;
    },
    // localization: {
    //   // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md#time-format
    //   timeFormatter: businessDayOrTimestamp => {
    //     return formatDateTime(businessDayOrTimestamp - timezoneOffset);
    //   }
    // },
    grid: {
      vertLines: {
        visible: true,
        color: 'rgb(28, 28, 30)',
        style: 1
      },
      horzLines: {
        visible: true,
        color: 'rgb(28, 28, 30)',
        style: 1
      }
    },
    // https://github.com/tradingview/lightweight-charts/blob/master/docs/time-scale.md#time-scale
    timeScale: {
      rightOffset: 5,
      borderVisible: false,
      barSpacing: 5,
      timeVisible: true,
      fixLeftEdge: true
    },
    // localization: {
    //   // locale,
    // },
    // https://github.com/tradingview/lightweight-charts/blob/master/docs/customization.md#price-axis
    priceScale: {
      borderVisible: false
    },
    crosshair: {
      horzLine: {
        color: 'rgb(142, 142, 147)'
      },
      vertLine: {
        color: 'rgb(142, 142, 147)'
      },
      mode: 0
    }
  });

  function fillGaps(prices, periodSeconds) {
    if (prices.length < 2) {
      return prices
    }
  
    const newPrices = [prices[0]]
    let prevTime = prices[0].time
    for (let i = 1; i < prices.length; i++) {
      const { time, open } = prices[i]
      // console.log("hereim time, open", time, open)
      if (prevTime) {
        let j = (time - prevTime) / periodSeconds - 1
        // console.log("hereim j", j)
        while (j > 0) {
          newPrices.push({
            time: time - j * periodSeconds,
            open,
            close: open,
            high: open * 1.0003,
            low: open * 0.9996
          })
          j--
        }
      }
  
      prevTime = time
      newPrices.push(prices[i])
    }
  
    return newPrices
  }

  const getCurrentTime = () => {
    let currentTime = Math.floor(new Date().getTime()/1000);
    return currentTime;
  }
  const getFromTimeDays = ( days, currentTime ) => {
    let fromTime = currentTime - days * 24* 60* 60;
    return fromTime;
  }
  const getSeconds = ( timeScale ) => {
    let seconds;
    switch (timeScale) {
        case "1w":
          seconds = 7*24*60*60;
          break;
        case "1d": 
          seconds = 24*60*60;
          break;
        case "4h":
          seconds = 4*60*60;
          break;
        case "1h":
          seconds = 60*60;
          break;
        case "15m":
          seconds = 15*60;
          break;
        case "5m":
          seconds = 5*60;
          break;
        case "1m":
          seconds = 60;
          break;
      }
    return seconds;
  }
  const getFromTimeUpdate = ( currentTime, timeScale ) => {
    let fromTime;
    fromTime = currentTime - getSeconds(timeScale);
    return fromTime;
  }
  const getSeriesOptions = () => ({
    // https://github.com/tradingview/lightweight-charts/blob/master/docs/area-series.md
    lineColor: '#5472cc',
    topColor: 'rgba(49, 69, 131, 0.4)',
    bottomColor: 'rgba(42, 64, 103, 0.0)',
    lineWidth: 2,
      priceLineColor: '#3a3e5e',
    downColor: '#fa3c58',
    wickDownColor: '#fa3c58',
    upColor: '#0ecc83',
    wickUpColor: '#0ecc83',
    borderVisible: false
  });
  
  // let series;
  let chart;
  //for init
  useEffect(async () => {
    // let chart;
    if (currentChart) {
    }

    chart = createChart(
      chartRef.current,
      getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight),
    );

    const candleSeries = chart.addCandlestickSeries(getSeriesOptions()) ;
    // console.log("hereim init candleseries add series option", series);

    setCurrentChart(chart);

    let currentTime = getCurrentTime();
    let fromTime = getFromTimeDays( 100, currentTime );
    let data;
    try {
      data = await getKChartData(props.activeToken1.symbol, "56", props.activeTimeScale, fromTime.toString(), currentTime.toString(), "chainlink");
    } catch {
      data = [];
      console.log("fallback to empty array");
    }
    let seconds = getSeconds(props.activeTimeScale);
    data = appendCurrentAveragePrice(data, props.currentAveragePrice, seconds)
    let filledData = fillGaps(data, seconds);
    candleSeries.setData(data);
    // console.log("hereim set filledData", series);

    let changedTzData = timeToTz(filledData);
    candleSeries.setData(changedTzData);
    // console.log("hereim set changedTzData", series);

    // const series = chart.addCandlestickSeries(getSeriesOptions())
    setCurrentSeries(candleSeries);
  }, [])

  useEffect(() => {
    console.log("hereim second useeffect")
  }, [])  

  //for resize
  useEffect(() => {
    if (!currentChart) { return; }
    const resizeChart = () => {
      currentChart.resize(chartRef.current.offsetWidth, chartRef.current.offsetHeight)
    }
    window.addEventListener('resize', resizeChart);
    return () => window.removeEventListener('resize', resizeChart);
  }, [currentChart]);

  //reload when new timescale or token selected
  useEffect(async () => {

    if (currentChart == undefined) {
      return;
    } 
    currentChart.resize(0,0);
    
    const chart = createChart(
        chartRef.current,
        getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight),
    );
    var candleSeries = chart.addCandlestickSeries(getSeriesOptions());

    // candleSeries.setData(currentChartData);
    let currentTime = getCurrentTime();
    console.log("hereim current", currentTime)
    let fromTime = getFromTimeDays( 100, currentTime );
    let data;
      try {
        data = await getKChartData(props.activeToken1.symbol, "56", props.activeTimeScale, fromTime.toString(), currentTime.toString(), "chainlink");
      } catch {
        data = [];
        console.log("fallback to empty array");
      }
    let seconds = getSeconds(props.activeTimeScale);
    data = appendCurrentAveragePrice(data, props.currentAveragePrice, seconds)
    console.log("hereim 1")
    let filledData = fillGaps(data, seconds);
    let changedTzData = timeToTz(filledData);
    // console.log("hereim changed timescale candleseries", series);
    candleSeries.setData(changedTzData);
    setCurrentChart(chart);
    updateChart(chart);
    setCurrentSeries(candleSeries);
    
    props.setUpdatingKchartsFlag(false);
    console.log('finish get kcharts data');

  }, [props.activeToken1.symbol, props.activeTimeScale])

  useEffect(() => {
    if (!currentChart) { return; }
    const resizeChart = () => {
      currentChart.resize(chartRef.current.offsetWidth, chartRef.current.offsetHeight)
    }
    window.addEventListener('resize', resizeChart);
    return () => window.removeEventListener('resize', resizeChart);
  }, [currentChart]);

  function timeToTz (timeData) {
    for (let i=1; i<timeData.length; i++) {
      timeData[i].time = timeData[i].time + timezoneOffset;
    }
    return timeData;
  }

  function updateChart( currentChart ) {
    let seconds = getSeconds(props.activeTimeScale);

    const interval = setInterval(async() => {
      if (currentChart == undefined) {
        return;
      } 
      // currentChart.resize(0,0);
      
      // const chart = createChart(
      //     chartRef.current,
      //     getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight),
      // );
      // var candleSeries = chart.addCandlestickSeries(getSeriesOptions());
  
      let currentTime = getCurrentTime();
      let fromTime = getFromTimeDays( 2, currentTime );
      let data;
      try {
        data = await getKChartData(props.activeToken1.symbol, "56", props.activeTimeScale, fromTime.toString(), currentTime.toString(), "chainlink");
      } catch {
        data = [];
        console.log("fallback to empty array");
      }
      let seconds = getSeconds(props.activeTimeScale);
      data = appendCurrentAveragePrice(data, props.currentAveragePrice, seconds)
      let filledData = fillGaps(data, seconds);
      let changedTzData = timeToTz(filledData);
      // currentSeries.update(changedTzData);
      setCurrentChart(changedTzData);
      console.log("hereim update", seconds)
    }, seconds * 1000)

    return () => clearInterval(interval);
  }

  function appendCurrentAveragePrice(prices, currentAveragePrice, periodSeconds) {
    let currentTime = Math.floor( Date.now() / 1000)
    let currentTimeA = Math.floor(currentTime/periodSeconds)
    const currentCandleTime = currentTimeA* periodSeconds
    const last = prices[prices.length - 1]
    const averagePriceValue = parseFloat(currentAveragePrice)
    if (currentCandleTime === last.time) {
      // last.close = averagePriceValue
      // last.high = Math.max(last.high, averagePriceValue)
      // last.low = Math.max(last.low, averagePriceValue)
      return prices
    } else {
      const newCandle = {
        time: currentCandleTime,
        open: last.close,
        close: last.close,
        high: last.high,
        low: last.low
      }
      // console.log("hereim see new candle", newCandle)

      return [...prices, newCandle]
    }
  }

  //update data every timescale
  // useEffect(async() => {
    
  
  //   let chart = currentChart;
  //   var candleSeries = chart.addCandlestickSeries(getSeriesOptions());

  //   const interval = setInterval(async() => {
  //     if (currentChart == undefined) {
  //       return;
  //     } 
  //     currentChart.resize(0,0);
      
  //     const chart = createChart(
  //         chartRef.current,
  //         getChartOptions(chartRef.current.offsetWidth, chartRef.current.offsetHeight),
  //     );
  //     var candleSeries = chart.addCandlestickSeries(getSeriesOptions());
  
  //     let currentTime = getCurrentTime();
  //     let fromTime = getFromTimeDays( 2, currentTime );
  //     let data;
  //     try {
  //       data = await getKChartData(props.activeToken1.symbol, "56", props.activeTimeScale, fromTime.toString(), currentTime.toString(), "chainlink");
  //     } catch {
  //       data = [];
  //       console.log("fallback to empty array");
  //     }
  //     let seconds = getSeconds(props.activeTimeScale);
  //     let filledData = fillGaps(data, seconds);
  //     candleSeries.setData(filledData);
  //     setCurrentChart(chart);

  //     // let prevTime = getCurrentTime();
  //     // let fromTime = getFromTimeDays( 2, prevTime );
  //     // let data = await getKChartData(props.activeToken1.symbol, "56", props.activeTimeScale, fromTime.toString(), prevTime.toString(), "chainlink");
  //     // let seconds = getSeconds(props.activeTimeScale);
  //     // let filledData = fillGaps(data, seconds);
  //     // let lastDataIndex = filledData.length-1;
  //     // let lastData = filledData[lastDataIndex];

  //     // let currentTime = getCurrentTime();
  //     // let newData = await getKChartData(props.activeToken1.symbol, "42161", props.activeTimeScale, fromTime.toString(), currentTime.toString(), "chainlink");
  //     // let updatePrice;
  //     // if (lastData.time === newData[filledNewData.length-1].time)
  //     // updatePrice.push({
  //     //   time: lastData.time + ,
  //     //   open,
  //     //   close: open,
  //     //   high: open * 1.0003,
  //     //   low: open * 0.9996
  //     // })
      
  //   //   candleSeries.update(data[0])
  //   //   // candleSeries.update({ time: '2022-05-06', open: 112, high: 112, low: 100, close: 101 });
  //     seconds = getSeconds(props.timeScale);
  //   }, seconds)
  //   return () => clearInterval(interval);
  // }, [props.activeTimeScale])

    
  return(
      <div className='PriceChart' ref={chartRef}>
        {/* <div>wefiweu</div> */}
          <div className="BotInner">
              <div className="KChartHeader">
                  <div className='KChartControl'>
                      {/* <div className='TabBlock'> </div> */}
                      {/* <Tab options={Object.keys(CHART_PERIODS)} option={period} setOption={setPeriod} /> */}

                  </div>
                  <div className='KChartStat'></div>
              </div>
              <div className="KChartBox"></div>


          </div>
      </div>

  )
}
export default KChart;
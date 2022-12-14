import React, { useCallback, useEffect, useState } from 'react';
import className from 'classnames';
import { Divider, Icon, Input, Table, Button, Dropdown } from 'antd';
import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';

import styles from './styles.less'

export function PairsTable(props) {
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);

  function columnsCoin() {
    return [
      {
        title: (
          <div className={className(styles.tableHeaderFirst, styles.tableIndex)}>
            #
          </div>
        ),
        key: 'index',
        width: '6rem',
        render: (text, record, index) => (
          <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
            {index + 1}
          </div>
        ),
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeaderFirst}
            onClick={() => { setCurrentKey('name') }}
          >
            Pair
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableHeader}>
              <AcyTokenIcon symbol={entry.logoURI} />
              <span style={{marginLeft: '10px'}}>{entry.name}</span>
            </div>
          );
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('exchange') }}
          >
            Exchange
          </div>
        ),
        dataIndex: 'exchange',
        key: 'exchange',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.exchange}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price') }}
          >
            Price
          </div>
        ),
        dataIndex: 'price',
        key: 'price',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price_24h') }}
          >
            24h Price variation
          </div>
        ),
        dataIndex: 'price_24h',
        key: 'price_24h',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price_24h}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('volume') }}
          >
            24h Volume
          </div>
        ),
        dataIndex: 'volume',
        key: 'volume',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.volume}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('swaps') }}
          >
            24h Swaps
          </div>
        ),
        dataIndex: 'swaps',
        key: 'swaps',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.swaps}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('liquidity') }}
          >
            Total Liquidity
          </div>
        ),
        dataIndex: 'liquidity',
        key: 'liquidity',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.liquidity}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('fdv') }}
          >
            FDV
          </div>
        ),
        dataIndex: 'fdv',
        key: 'fdv',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.fdv}</div>;
        },
        visible: true,
      }
    ];
  }

  return (
    <div className={styles.nobgTable}>
      <Table
        dataSource={props.dataSource}
        columns={columnsCoin().filter(item => item.visible == true)}
        pagination={false}
        style={{
          marginBottom: '20px',
          cursor: isHover ? 'pointer' : 'default',
        }}
        onRowMouseEnter={() => setIsHover(true)}
        onRowMouseLeave={() => setIsHover(false)}
      />
    </div>
  );
}

export function LivePairsTable(props) {
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);

  function columnsCoin() {
    return [
      {
        title: (
          <div className={className(styles.tableHeaderFirst, styles.tableIndex)}>
            #
          </div>
        ),
        key: 'index',
        width: '6rem',
        render: (text, record, index) => (
          <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
            {index + 1}
          </div>
        ),
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeaderFirst}
            onClick={() => { setCurrentKey('name') }}
          >
            Pair info
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableHeader}>
              <AcyTokenIcon symbol={entry.logoURI} />
              <span style={{marginLeft: '10px'}}>{entry.name}</span>
            </div>
          );
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('listed_since') }}
          >
            Listed Since
          </div>
        ),
        dataIndex: 'listed_since',
        key: 'listed_since',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.listed_since}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price') }}
          >
            Token Price USD
          </div>
        ),
        dataIndex: 'price',
        key: 'price',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('volume') }}
          >
            24h Volume
          </div>
        ),
        dataIndex: 'volume',
        key: 'volume',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.volume}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('initial_liquidity') }}
          >
            Initial Liquidity
          </div>
        ),
        dataIndex: 'initial_liquidity',
        key: 'initial_liquidity',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.initial_liquidity}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('total_liquidity') }}
          >
            Total Liquidity
          </div>
        ),
        dataIndex: 'total_liquidity',
        key: 'total_liquidity',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.total_liquidity}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('pool_amount') }}
          >
            Pool Amount
          </div>
        ),
        dataIndex: 'pool_amount',
        key: 'pool_amount',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.pool_amount}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('pool_variation') }}
          >
            Pool Variation
          </div>
        ),
        dataIndex: 'pool_variation',
        key: 'pool_variation',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.pool_variation}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('pool_remaining') }}
          >
            Pool Remaining
          </div>
        ),
        dataIndex: 'pool_remaining',
        key: 'pool_remaining',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.pool_remaining}</div>;
        },
        visible: true,
      }
    ];
  }

  return (
    <div className={styles.nobgTable}>
      <Table
        dataSource={props.dataSource}
        columns={columnsCoin().filter(item => item.visible == true)}
        pagination={false}
        style={{
          marginBottom: '20px',
          cursor: isHover ? 'pointer' : 'default',
        }}
        onRowMouseEnter={() => setIsHover(true)}
        onRowMouseLeave={() => setIsHover(false)}
      />
    </div>
  );
}

export function TopVolumeTable(props) {
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);

  function columnsCoin() {
    return [
      {
        title: (
          <div className={className(styles.tableHeaderFirst, styles.tableIndex)}>
            #
          </div>
        ),
        key: 'index',
        width: '6rem',
        render: (text, record, index) => (
          <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
            {index + 1}
          </div>
        ),
        visible: props.mode && props.mode == 'simple' ? false : true,
      },
      {
        title: (
          <div
            className={styles.tableHeaderFirst}
            onClick={() => { setCurrentKey('name') }}
          >
            Name
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableHeader}>
              <AcyTokenIcon symbol={entry.logoURI} />
              <span style={{marginLeft: '10px'}}>{entry.name}</span>
            </div>
          );
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('volume') }}
          >
            24h Volume
          </div>
        ),
        dataIndex: 'volume',
        key: 'volume',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.volume}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('liquidity') }}
          >
            Liquidity
          </div>
        ),
        dataIndex: 'liquidity',
        key: 'liquidity',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.liquidity}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price') }}
          >
            Price
          </div>
        ),
        dataIndex: 'price',
        key: 'price',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price_24h') }}
          >
            24h
          </div>
        ),
        dataIndex: 'price_24h',
        key: 'price_24h',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price_24h}</div>;
        },
        visible: true,
      },
    ];
  }

  return (
    <div className={styles.nobgTable}>
      <Table
        dataSource={props.dataSource}
        columns={columnsCoin().filter(item => item.visible == true)}
        pagination={false}
        style={{
          marginBottom: '20px',
          cursor: isHover ? 'pointer' : 'default',
        }}
        onRowMouseEnter={() => setIsHover(true)}
        onRowMouseLeave={() => setIsHover(false)}
      />
    </div>
  );
}

export function TrendingTable(props) {
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);

  function columnsCoin() {
    return [
      {
        title: (
          <div className={className(styles.tableHeaderFirst, styles.tableIndex)}>
            #
          </div>
        ),
        key: 'index',
        width: '6rem',
        render: (text, record, index) => (
          <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
            {index + 1}
          </div>
        ),
        visible: props.mode && props.mode == 'simple' ? false : true,
      },
      {
        title: (
          <div
            className={styles.tableHeaderFirst}
            onClick={() => { setCurrentKey('name') }}
          >
            Name
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableHeader}>
              <AcyTokenIcon symbol={entry.logoURI} />
              <span style={{marginLeft: '10px'}}>{entry.name}</span>
            </div>
          );
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price') }}
          >
            Price
          </div>
        ),
        dataIndex: 'price',
        key: 'price',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('volume') }}
          >
            Volume
          </div>
        ),
        dataIndex: 'volume',
        key: 'volume',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.volume}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price_24h') }}
          >
            24h
          </div>
        ),
        dataIndex: 'price_24h',
        key: 'price_24h',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price_24h}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price_7d') }}
          >
            7d
          </div>
        ),
        dataIndex: 'price_7d',
        key: 'price_7d',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price_7d}</div>;
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => { setCurrentKey('price_30d') }}
          >
            30d
          </div>
        ),
        dataIndex: 'price_30d',
        key: 'price_30d',
        render: (text, entry) => {
          return <div className={styles.tableData}>{entry.price_30d}</div>;
        },
        visible: true,
      },
    ];
  }

  return (
    <div className={styles.nobgTable}>
      <Table
        dataSource={props.dataSource}
        columns={columnsCoin().filter(item => item.visible == true)}
        pagination={false}
        style={{
          marginBottom: '20px',
          cursor: isHover ? 'pointer' : 'default',
        }}
        onRowMouseEnter={() => setIsHover(true)}
        onRowMouseLeave={() => setIsHover(false)}
      />
    </div>
  );
}
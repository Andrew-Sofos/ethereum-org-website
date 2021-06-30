import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { useIntl } from "gatsby-plugin-intl"
import axios from "axios"

import {
  AreaChart,
  ResponsiveContainer,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import Translation from "./Translation"
import Tooltip from "./Tooltip"
import Link from "./Link"
import Icon from "./Icon"

import { getData } from "../utils/cache"

const Value = styled.h3`
  position: absolute;
  bottom: 8%;
  font-size: min(4.4vw, 64px);
  font-weight: 600;
  margin-top: 0rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
  flex-wrap: wrap;
  text-overflow: ellipsis;
  @media (max-width: ${({ theme }) => theme.breakpoints.l}) {
    font-size: max(8.8vw, 48px);
  }
`

const Title = styled.p`
  font-size: 20px;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  text-transform: uppercase;
  font-family: "SFMono-Regular", monospace;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin: 2rem 2rem 0;
  border-radius: 2px;
  @media (max-width: ${({ theme }) => theme.breakpoints.l}) {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 2rem 0 0;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.s}) {
    margin: 0;
  }
`

const Box = styled.div`
  position: relative;
  color: ${({ theme }) => theme.colors.text};
  height: 20rem;
  background: ${({ theme, color }) => theme.colors[color]};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  border: 1px solid ${({ theme }) => theme.colors.color};
  padding: 1.5rem;
  @media (max-width: ${({ theme }) => theme.breakpoints.l}) {
    border-left: 0px solid #000000;
    border-right: 0px solid #000000;
    margin-top: -1px;
    padding: 1rem;
    padding-top: 2rem;
  }
`

const StatRow = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledIcon = styled(Icon)`
  fill: ${({ theme }) => theme.colors.text};
  margin-right: 0.5rem;
  @media (max-width: ${({ theme }) => theme.breakpoints.l}) {
  }
  &:hover {
    fill: ${({ theme }) => theme.colors.primary};
  }
  &:active {
    fill: ${({ theme }) => theme.colors.primary};
  }
  &:focus {
    fill: ${({ theme }) => theme.colors.primary};
  }
`

const IndicatorSpan = styled.span`
  font-size: 2rem;
`

const ErrorMessage = () => (
  <IndicatorSpan>
    <Translation id="loading-error-refresh" />
  </IndicatorSpan>
)

const LoadingMessage = () => (
  <IndicatorSpan>
    <Translation id="loading" />
  </IndicatorSpan>
)

const Lines = styled.div`
  position: absolute;
  // margin-left: -10%;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 200px;
  // z-index: 0;
`

const ButtonContainer = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
  font-family: "SFMono-Regular", monospace;
  // background: ${({ theme, color }) => theme.colors[color]};
`

const Button = styled.button`
  background: ${(props) => props.theme.colors.background};
  font-family: "SFMono-Regular", monospace;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text};
  padding: 2px 15px;
  border-radius: 1px;
  border: 1px solid ${({ theme, color }) => theme.colors[color]};
  outline: none;
  // text-transform: uppercase;
  // margin: 10px 0px;
  cursor: pointer;
  // box-shadow: 0px 2px 2px lightgray;
  // transition: ease background-color 250ms;
  // &:hover {
  //   background-color: blue;
  // }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`

const ButtonToggle = styled(Button)`
  // opacity: 0.7;
  ${({ active }) =>
    active &&
    `
    background-color: #C0B9DD;
    opacity: 1; 
  `}
`

const GridItem = ({ metric }) => {
  const { title, description, state, line, buttonContainer } = metric
  const isLoading = !state.value
  const value = state.hasError ? (
    <ErrorMessage />
  ) : isLoading ? (
    <LoadingMessage />
  ) : (
    <StatRow>
      <span>
        {state.value}{" "}
        <Tooltip content={tooltipContent(metric)}>
          <StyledIcon name="info" />
        </Tooltip>
      </span>
    </StatRow>
  )

  // console.log(line.current.value)
  let isLoading1 = true
  if (line.current !== undefined) {
    isLoading1 = !(line.current.value.length > 0)
  }

  // const isLoading1 = true
  const chart = line.current.hasError ? (
    <ErrorMessage />
  ) : isLoading1 ? (
    <LoadingMessage />
  ) : (
    <AreaChart
      width={720}
      height={200}
      data={line.current.value}
      margin={{ left: -5 }}
    >
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={1} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
        </linearGradient>
      </defs>

      <Area
        type="monotone"
        dataKey="uv"
        stroke="#8884d8"
        fillOpacity={0.3}
        fill="url(#colorUv)"
        fillOpacity="0.2"
        connectNulls={true}
      />

      <XAxis dataKey="pv" axisLine={false} tick={false} />
    </AreaChart>
  )

  return (
    <Box>
      <div>
        <Title>{title}</Title>
        <p>{description}</p>
      </div>
      <Lines>{chart}</Lines>
      <ButtonContainer>{buttonContainer}</ButtonContainer>
      <Value>{value}</Value>
    </Box>
  )
}

const tooltipContent = (metric) => (
  <div>
    <Translation id="data-provided-by" />{" "}
    <Link to={metric.apiUrl}>{metric.apiProvider}</Link>
  </div>
)

const StatsBoxGrid = () => {
  const intl = useIntl()
  const [ethPrice, setEthPrice] = useState({
    value: 0,
    hasError: false,
  })
  const [valueLocked, setValueLocked] = useState({
    value: 0,
    hasError: false,
  })
  const [txs, setTxs] = useState({
    value: 0,
    hasError: false,
  })
  const [nodes, setNodes] = useState({
    value: 0,
    hasError: false,
  })
  const coingecko = useRef({
    value: [],
    hasError: false,
  })
  const etherscanNodes = useRef({
    value: [],
    hasError: false,
  })
  const etherscanTransactions = useRef({
    value: [],
    hasError: false,
  })
  const defipulse = useRef({
    value: [],
    hasError: false,
  })

  const [defaultRender, setDefaultRender] = useState([])

  const formatPrice = (price) => {
    return new Intl.NumberFormat(intl.locale, {
      style: "currency",
      currency: "USD",
      minimumSignificantDigits: 3,
      maximumSignificantDigits: 4,
    }).format(price)
  }

  const formatTVL = (tvl) => {
    return new Intl.NumberFormat(intl.locale, {
      style: "currency",
      currency: "USD",
      notation: "compact",
      minimumSignificantDigits: 3,
      maximumSignificantDigits: 4,
    }).format(tvl)
  }

  const formatTxs = (txs) => {
    return new Intl.NumberFormat(intl.locale, {
      notation: "compact",
      minimumSignificantDigits: 3,
      maximumSignificantDigits: 4,
    }).format(txs)
  }

  const formatNodes = (nodes) => {
    return new Intl.NumberFormat(intl.locale, {
      minimumSignificantDigits: 3,
      maximumSignificantDigits: 4,
    }).format(nodes)
  }
  useEffect(() => {
    // coinGeckoData("30")
    // etherscanNodesData(oneMonthAgo)
    // defipulseData("1m")

    // Skip APIs when not in production
    if (process.env.NODE_ENV !== "production") {
      setEthPrice({
        value: formatPrice(1330),
        hasError: false,
      })
      setValueLocked({
        value: formatTVL(23456789000),
        hasError: false,
      })
      setTxs({
        value: formatTxs(1234567),
        hasError: false,
      })
      setNodes({
        value: formatNodes(8040),
        hasError: false,
      })
    } else {
      const fetchPrice = async () => {
        try {
          const response = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"
          )
          const { usd } = response.data.ethereum
          const value = formatPrice(usd)
          setEthPrice({
            value,
            hasError: false,
          })
        } catch (error) {
          console.error(error)
          setEthPrice({
            hasError: true,
          })
        }
      }
      fetchPrice()

      const fetchNodes = async () => {
        try {
          const data = await getData("/.netlify/functions/etherscan")
          const total = data.result.TotalNodeCount
          const value = formatNodes(total)
          setNodes({
            value,
            hasError: false,
          })
        } catch (error) {
          console.error(error)
          setNodes({
            hasError: true,
          })
        }
      }
      fetchNodes()

      const fetchTotalValueLocked = async () => {
        try {
          const data = await getData("/.netlify/functions/defipulse")
          const ethereumTVL = data.ethereumTVL
          const value = formatTVL(ethereumTVL)
          setValueLocked({
            value,
            hasError: false,
          })
        } catch (error) {
          console.error(error)
          setValueLocked({
            hasError: true,
          })
        }
      }
      fetchTotalValueLocked()

      const fetchTxCount = async () => {
        // let transactionsData = []
        try {
          const { result } = await getData("/.netlify/functions/txs")
          // result: [{UTCDate: string, unixTimeStamp: string, transactionCount: number}, {...}]
          console.log(result)
          for (const i in result) {
            etherscanTransactions.current.value.push({
              name: "Page A",
              uv: result[i]["transactionCount"],
              pv: result[i]["UTCDate"],
              amt: 2400,
            })
          }

          const count = result[0].transactionCount
          const value = formatTxs(count)
          setTxs({
            value,
            hasError: false,
          })
          // const valueAll = transactionsData
          // setetherscanTransactions({
          //   valueAll,
          //   hasError: false,
          // })
          setDefaultRender(value)
        } catch (error) {
          console.error(error)
          setTxs({
            hasError: true,
          })
          etherscanTransactions.current = {
            value: [],
            hasError: true,
          }
          setDefaultRender([])
        }
      }
      fetchTxCount()
    }
  }, [])

  var today = new Date(),
    date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      (today.getDate() - 1),
    oneMonthAgo =
      today.getFullYear() + "-" + today.getMonth() + "-" + (today.getDate() - 1)
  const start = "2019-10-30"
  // useEffect(() => {
  //   coinGeckoData("30")
  //   etherscanNodesData(oneMonthAgo)
  //   defipulseData("1m")
  // }, [])

  const coinGeckoData = async (mode) => {
    let priceData = []

    let coingeckoUrl = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${mode}&interval=hour`
    try {
      const response = await axios.get(coingeckoUrl)
      for (const i in response.data.prices) {
        priceData.push({
          name: "Page A",
          uv: response.data.prices[i][1],
          pv: i,
          amt: 2400,
        })
      }

      const value = priceData
      coingecko.current = {
        value,
        hasError: false,
      }
      setDefaultRender(value)
      // console.log(coingecko.value, value)
    } catch (error) {
      console.error(error)
      coingecko.current = {
        value: [],
        hasError: true,
      }
      setDefaultRender([])
    }
  }

  const etherscanNodesData = async (mode1) => {
    let nodesData = []

    let etherscanNodesUrl = `https://api.etherscan.io/api?module=stats&action=nodecounthistory&startdate=${mode1}&enddate=${date}&sort=asc&apikey=N94JWP2M9229I9UAP48EXSAH9RPW4874CG`
    try {
      const response = await axios.get(etherscanNodesUrl)
      for (const i in response.data.result) {
        nodesData.push({
          name: "Page A",
          uv: response.data.result[i]["TotalNodeCount"],
          pv: response.data.result[i]["UTCDate"],
          amt: 2400,
        })
      }

      const value = nodesData
      etherscanNodes.current = {
        value,
        hasError: false,
      }
      setDefaultRender(value)
      // console.log(coingecko.value, value)
    } catch (error) {
      console.error(error)
      etherscanNodes.current = {
        value: [],
        hasError: true,
      }
      setDefaultRender([])
    }
  }

  const defipulseData = async (mode2) => {
    let valuelockedData = []

    let defipulseUrl = `https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?api-key=ac8a88c787d9db8dfe0951199ae76fd73538d6bee9fef57c7911cc280364&period=${mode2}&length=days`
    try {
      const response = await axios.get(defipulseUrl)
      console.log(response)
      if (response.data) {
        for (let i = 1; i <= response.data.length; i++) {
          valuelockedData.push({
            name: " Page A",
            uv: response.data[response.data.length - i]["tvlUSD"] / 1000000000,
            pv: response.data.length - i,
            amt: 2400,
          })
        }
        const value = valuelockedData
        defipulse.current = {
          value,
          hasError: false,
        }
        setDefaultRender(value)
      } else {
        const value = valuelockedData
        defipulse.current = {
          value: [],
          hasError: true,
        }
        setDefaultRender(value)
      }
    } catch (error) {
      console.error(error)
      defipulse.current = {
        value: [],
        hasError: true,
      }
      setDefaultRender([])
    }
  }

  const types = [0, 1]
  const defaultTypes = ["30d", "ALL"]

  const coingeckoTypes = ["30", "max"]

  const [priceActive, setPriceActive] = useState(types[0])
  function ToggleGroupPrice() {
    return (
      <div>
        {types.map((type, idx) => (
          <ButtonToggle
            active={priceActive === type}
            onClick={() => {
              coinGeckoData(coingeckoTypes[type])
              setPriceActive(type)
            }}
            key={idx}
          >
            {defaultTypes[type]}
          </ButtonToggle>
        ))}
      </div>
    )
  }
  const defipulseTypes = ["1m", "all"]
  const [valueLockedActive, setValueLockedActive] = useState(types[0])
  function ToggleGroupValueLocked() {
    return (
      <div>
        {types.map((type, idx) => (
          <ButtonToggle
            active={valueLockedActive === type}
            onClick={() => {
              defipulseData(defipulseTypes[type])
              setValueLockedActive(type)
            }}
            key={idx}
          >
            {defaultTypes[type]}
          </ButtonToggle>
        ))}
      </div>
    )
  }
  const etherscanTypes = [oneMonthAgo, start]
  const [nodesActive, setNodesActive] = useState(types[0])
  function ToggleGroupNodes() {
    return (
      <div>
        {types.map((type, idx) => (
          <ButtonToggle
            active={nodesActive === type}
            onClick={() => {
              etherscanNodesData(etherscanTypes[type])
              setNodesActive(type)
            }}
            key={idx}
          >
            {defaultTypes[type]}
          </ButtonToggle>
        ))}
      </div>
    )
  }
  const [transactionsActive, setTransactionsActive] = useState(types[0])
  function ToggleGroupTransactions() {
    return (
      <div>
        {types.map((type, idx) => (
          <ButtonToggle
            active={transactionsActive === type}
            onClick={() => {
              setTransactionsActive(type)
            }}
            key={idx}
          >
            {defaultTypes[type]}
          </ButtonToggle>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      apiProvider: "CoinGecko",
      apiUrl: "https://www.coingecko.com/en/coins/ethereum",
      title: (
        <Translation id="page-index-network-stats-eth-price-description" />
      ),
      description: (
        <Translation id="page-index-network-stats-eth-price-explainer" />
      ),
      line: etherscanTransactions,
      buttonContainer: <ToggleGroupTransactions />,
      state: ethPrice,
    },
    {
      apiProvider: "Etherscan",
      apiUrl: "https://etherscan.io/",
      title: <Translation id="page-index-network-stats-tx-day-description" />,
      description: (
        <Translation id="page-index-network-stats-tx-day-explainer" />
      ),
      line: etherscanTransactions,
      buttonContainer: <ToggleGroupTransactions />,
      state: txs,
    },
    {
      apiProvider: "DeFi Pulse",
      apiUrl: "https://defipulse.com",
      title: (
        <Translation id="page-index-network-stats-value-defi-description" />
      ),
      description: (
        <Translation id="page-index-network-stats-value-defi-explainer" />
      ),
      line: etherscanTransactions,
      buttonContainer: <ToggleGroupTransactions />,
      state: valueLocked,
    },
    {
      apiProvider: "Etherscan",
      apiUrl: "https://etherscan.io/nodetracker",
      title: <Translation id="page-index-network-stats-nodes-description" />,
      description: (
        <Translation id="page-index-network-stats-nodes-explainer" />
      ),
      line: etherscanTransactions,
      buttonContainer: <ToggleGroupTransactions />,
      state: nodes,
    },
  ]

  return (
    <Grid>
      {metrics.map((metric, idx) => (
        <GridItem key={idx} metric={metric} />
      ))}
    </Grid>
  )
}

export default StatsBoxGrid

/** Dated market/earnings snapshots. NO live data. Annual dividends are NORMALISED, not a forecast. */
export const stocks = {
  DBS: {
    id:'DBS',name:'DBS Group Holdings',ticker:'D05',exchange:'SGX',sector:'Banks',currency:'SGD',
    snapshotDate:'2026-10-23',resultsDate:'2026-06-30',marketPrice:74.44,bookValuePerShare:24.69,
    ordinaryAnnualDividend:2.64,capitalReturnQuarterly:0.15,reportedRoePct:17.5,annualizedEps:4.35,
    cet1Pct:16.6,cet1FullyPhasedPct:14.6,lcrPct:142,nsfrPct:113,nplPct:1.0,
    dividendNote:'DBS pays S$0.66 ordinary + S$0.15 capital return quarterly. The latter is a finite programme, modelled separately.',
    research:{
      strength:'High historical return on equity, strong deposit franchise and growing wealth-management fees. Capital returns can improve reported ROE but do not themselves grow earnings.',
      risk:'Lower sustainable ROE, weaker net interest margins, rising credit costs, deterioration in liquidity buffers, or a higher cost of equity.',
      special:'DBS\'s extra S$0.15 per quarter is scheduled as a temporary capital-return payment; ordinary dividend and capital return must be evaluated separately.'
    },
    scenarios:{
      bear:{roe:14.5,requiredReturn:8.25,bookGrowth:3,ddmRequiredReturn:9,dividendGrowth:2.5,remainingCapitalReturnQuarters:6},
      base:{roe:16.5,requiredReturn:7.75,bookGrowth:3,ddmRequiredReturn:8,dividendGrowth:4,remainingCapitalReturnQuarters:6},
      bull:{roe:18,requiredReturn:8,bookGrowth:4,ddmRequiredReturn:7.75,dividendGrowth:4.5,remainingCapitalReturnQuarters:6}
    },
    sources:[
      {label:'DBS 2Q2026 results (company)',url:'https://www.dbs.com/newsroom/DBS_second_quarter_net_profit_up_9pct_to_record_SGD_3_08_billion_as_quarterly_total_income_crosses_SGD_6_billion_for_first_time'},
      {label:'DBS FY2025 annual report (company)',url:'https://www.dbs.com/iwov-resources/images/investors/annual-report/dbs-annual-report-2025.pdf'},
      {label:'DBS historical closing prices (SGinvestors)',url:'https://sginvestors.io/sgx/stock/d05-dbs/share-price-history'}
    ]
  },
  OCBC: {
    id:'OCBC',name:'Oversea-Chinese Banking Corporation',ticker:'O39',exchange:'SGX',sector:'Banks',currency:'SGD',
    snapshotDate:'2026-10-23',resultsDate:'2026-06-30',marketPrice:29.00,bookValuePerShare:13.73,
    ordinaryAnnualDividend:0.94,capitalReturnQuarterly:0,reportedRoePct:13.7,annualizedEps:1.86,
    cet1Pct:15.7,cet1FullyPhasedPct:14.0,lcrPct:135,nsfrPct:109,nplPct:0.9,
    dividendNote:'OCBC declared S$0.47 ordinary interim dividend for 1H2026 (annualised to S$0.94, not guaranteed). Its separate capital-return programme is not treated as recurring income.',
    research:{
      strength:'Diversified banking, wealth management and insurance income; first-half 2026 fees and insurance earnings helped offset lower net interest income.',
      risk:'Sustained margin compression, uneven insurance/trading income, weaker credit quality and limited excess fully-phased CET1 capital following distributions.',
      special:'The S$2.5 billion capital-return programme is targeted for completion by FY2026. No perpetual special dividend is assumed in this model.'
    },
    scenarios:{
      bear:{roe:10.5,requiredReturn:9,bookGrowth:2.5,ddmRequiredReturn:9.5,dividendGrowth:2,remainingCapitalReturnQuarters:0},
      base:{roe:12.5,requiredReturn:8.25,bookGrowth:3,ddmRequiredReturn:8.25,dividendGrowth:3,remainingCapitalReturnQuarters:0},
      bull:{roe:14,requiredReturn:8,bookGrowth:3.5,ddmRequiredReturn:8,dividendGrowth:3.5,remainingCapitalReturnQuarters:0}
    },
    sources:[
      {label:'OCBC 1H2026 results (company)',url:'https://www.ocbc.com/group/media/release/2026/ocbc-group-first-half-2026-net-profit-grew-13percent.page'},
      {label:'OCBC 1H2026 financial highlights (filing copy)',url:'https://financialfilings.com/filings/oversea-chinese-banking-corporation-limited/earnings-release/2026/50285857/'},
      {label:'OCBC historical closing prices (SGinvestors)',url:'https://sginvestors.io/sgx/stock/o39-ocbc-bank/share-price-history'}
    ]
  },
  UOB: {
    id:'UOB',name:'United Overseas Bank',ticker:'U11',exchange:'SGX',sector:'Banks',currency:'SGD',
    snapshotDate:'2026-10-23',resultsDate:'2026-06-30',marketPrice:41.59,bookValuePerShare:29.99,
    ordinaryAnnualDividend:1.76,capitalReturnQuarterly:0,reportedRoePct:11.7,annualizedEps:3.51,
    cet1Pct:15.4,cet1FullyPhasedPct:null,lcrPct:null,nsfrPct:null,nplPct:1.6,
    dividendNote:'UOB declared S$0.88 ordinary interim dividend for 1H2026 (annualised to S$1.76, not guaranteed). One-off special distributions are excluded.',
    research:{
      strength:'Established ASEAN banking franchise, diversified customer base and growing wealth business, with a lower price-to-book multiple than local peers.',
      risk:'Lower structural ROE, net interest margin pressure, Greater China credit exposures, provisioning volatility and sensitivity to the cost of equity.',
      special:'UOB has a distinct capital-distribution programme. The model assumes zero recurring special dividend; evaluate one-off payouts separately.'
    },
    scenarios:{
      bear:{roe:9,requiredReturn:9.75,bookGrowth:2,ddmRequiredReturn:10,dividendGrowth:2,remainingCapitalReturnQuarters:0},
      base:{roe:11,requiredReturn:9,bookGrowth:2.5,ddmRequiredReturn:9,dividendGrowth:2.5,remainingCapitalReturnQuarters:0},
      bull:{roe:12.5,requiredReturn:8.5,bookGrowth:3,ddmRequiredReturn:8.5,dividendGrowth:3,remainingCapitalReturnQuarters:0}
    },
    sources:[
      {label:'UOB 1H2026 results (company)',url:'https://www.uobgroup.com/uobgroup/newsroom/news-releases/2026/uobgroup-1h26-financial-results.page'},
      {label:'UOB financial highlights, 2Q2026 (company)',url:'https://www.uobgroup.com/investor-relations/financial/financial-highlights.html'},
      {label:'UOB share price and stock fundamentals (company)',url:'https://uob.listedcompany.com/stock_fundamentals.html'}
    ]
  }
};
export const bankIds = ['DBS','OCBC','UOB'];

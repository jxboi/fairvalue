/** Manually verified dated snapshot, NOT streaming prices. */
export const stocks={
  DBS:{
    id:'DBS',name:'DBS Group Holdings',ticker:'D05',exchange:'SGX',sector:'Banks',currency:'SGD',
    snapshotDate:'2026-10-23',resultsDate:'2026-06-30',marketPrice:74.44,bookValuePerShare:24.69,
    ordinaryQuarterlyDividend:0.66,capitalReturnQuarterly:0.15,reportedRoePct:17.5,annualizedEps:4.35,
    fullyPhasedCet1Pct:14.6,lcrPct:142,nsfrPct:113,nplPct:1.0,
    scenarios:{
      bear:{roe:14.5,requiredReturn:8.25,bookGrowth:3,ddmRequiredReturn:9,dividendGrowth:2.5,remainingCapitalReturnQuarters:6},
      base:{roe:16.5,requiredReturn:7.75,bookGrowth:3,ddmRequiredReturn:8,dividendGrowth:4,remainingCapitalReturnQuarters:6},
      bull:{roe:18,requiredReturn:8,bookGrowth:4,ddmRequiredReturn:7.75,dividendGrowth:4.5,remainingCapitalReturnQuarters:6}
    },
    sources:[
      {label:'DBS 2Q2026 results',url:'https://www.dbs.com/newsroom/DBS_second_quarter_net_profit_up_9pct_to_record_SGD_3_08_billion_as_quarterly_total_income_crosses_SGD_6_billion_for_first_time'},
      {label:'SGX financial statements',url:'https://links.sgx.com/1.0.0/corporate-announcements/KF2PXX108ELM2VMO/f4a0de2d2012ac31bb2a3a76d785649db981a034c70bb507af1c570bffa4f9f4'},
      {label:'DBS FY2025 annual report',url:'https://www.dbs.com/iwov-resources/images/investors/annual-report/dbs-annual-report-2025.pdf'},
      {label:'SGX D05 historical prices',url:'https://stockanalysis.com/quote/sgx/D05/history/'}
    ]
  }
};

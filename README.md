# FairValue — transparent valuation for Singapore banks

An interactive, editable fair-value research dashboard comparing **DBS (D05), OCBC (O39), and UOB (U11)**.

[View deployed app](https://fairvalue-vert.vercel.app)

## Features
- Compare all three banks side-by-side: 23 Oct 2026 closing price, P/B, 1H2026 ROE, annualised ordinary dividend yield, model fair value/upside, reported CET1 ratio.
- Click a bank to open its **independent** detailed valuation, financial health metrics, investment thesis and filing references.
- Change assumptions for each bank independently. Changes are saved locally per ticker.
- Bear/base/bull scenarios; bank justified price-to-book; dividend discount cross-check (no double counting); ROE versus cost-of-equity sensitivity grid.
- Download a JSON export with the selected stock's valuation and comparison data.

## Financial data quality
Share prices are **frozen at market close 23 October 2026**. Financial ratios and book values reflect statements through **30 June 2026**. Neither data nor assumptions are streamed or automatically refreshed.
- DBS normalised annual ordinary dividend: **S$2.64** + finite S$0.15 quarterly capital return.
- OCBC: 1H2026 ordinary interim S$0.47 (annualised to **S$0.94** for comparison, not a forecast); FY2026 separate capital-return programme excluded from perpetual payments.
- UOB: 1H2026 ordinary interim S$0.88 (annualised **S$1.76**); special dividends excluded from ongoing yield.
- CET1 comparison uses **reported transitional** basis. Fully-phased ratios are displayed separately, where available; methods differ and should not be conflated. UOB's unavailable ratios are deliberately displayed as not supplied.

Illustrative model assumptions: DBS base normalised ROE **16.5%**, cost of equity **7.75%**, perpetual growth **3%**; OCBC base **12.5%**, **8.25%**, **3%**; UOB base **11%**, **9%**, **2.5%**. Assumptions are research judgments, not published company guidance.

### Research sources
- DBS: [2Q2026 results](https://www.dbs.com/newsroom/DBS_second_quarter_net_profit_up_9pct_to_record_SGD_3_08_billion_as_quarterly_total_income_crosses_SGD_6_billion_for_first_time)
- OCBC: [1H2026 results](https://www.ocbc.com/group/media/release/2026/ocbc-group-first-half-2026-net-profit-grew-13percent.page) · [financial highlights](https://financialfilings.com/filings/oversea-chinese-banking-corporation-limited/earnings-release/2026/50285857/)
- UOB: [1H2026 results](https://www.uobgroup.com/uobgroup/newsroom/news-releases/2026/uobgroup-1h26-financial-results.page) · [financial highlights](https://www.uobgroup.com/investor-relations/financial/financial-highlights.html)
- Closing prices: [Business Times 23 Oct 2026](https://www.businesstimes.com.sg/companies-markets/capital-markets-currencies/wall-street-ends-lower-record-highs-treasury-yields-climb/)

## Run locally
Requires Node.js 20+.

```bash
npm run dev
# http://localhost:4173
npm test
npm run build
```

No runtime dependencies. Vercel deploys static content from `dist/`.

## How valuation works
Justified **P/B**: `Book value × (normalised ROE − long-run growth) / (cost of equity − long-run growth)`.
The separate Gordon dividend model values **ordinary annualised dividends** plus the discounted present value of finite capital returns, if any.
**Never add** the independent P/B and dividend estimates.

### Disclaimer
Illustrative research software, not investment advice. Verify filings and model assumptions before investing.

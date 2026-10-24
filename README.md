# FairValue

Open-source, assumption-driven fair-value analysis for individual stocks. **DBS Group Holdings (SGX:D05)** is the first company.

The web dashboard offers bear/base/bull scenarios, a justified price-to-book model, dividend valuation, editable financial inputs, a sensitivity matrix, exportable results, and cited financial snapshots.

## Getting started

```bash
npm run dev
# http://localhost:4173
npm test
```

Requires Node.js 20+. The app uses no runtime dependencies; price and financial data are **dated snapshots, not live market data**.

## DBS model

The base case uses June 2026 book value per share S$24.69, normalised ROE 16.5%, required shareholder return 7.75%, and long-term growth 3%: **S$70.17** per share, against a dated S$74.44 market close on 23 October 2026. These are model assumptions, not forecasts or an investment recommendation.

Bank valuation: `Book Value × (ROE − g) / (Ke − g)`. Independent dividend cross-check: ordinary Gordon-growth value plus the present value of **finite**, non-recurring capital-return dividends. Do not add the two valuations together.

## Planned

More tickers and sector-appropriate valuation engines, automated sourcing with validation, residual-income bank models, cash-flow stress testing, and a revision log.

**Disclaimer:** Illustrative research software; not investment advice. Validate inputs against company filings and use sensitivity analysis.

MIT license.

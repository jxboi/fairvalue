import test from 'node:test';
import assert from 'node:assert/strict';
import {bankIds,stocks} from '../src/data.js';
import {computeMetrics} from '../src/valuation.js';

test('DBS, OCBC, UOB are present as comparable 23 Oct 2026 snapshots',()=>{
  assert.deepEqual(bankIds,['DBS','OCBC','UOB']);
  assert.deepEqual(bankIds.map(k=>stocks[k].marketPrice),[74.44,29,41.59]);
  assert.deepEqual(bankIds.map(k=>stocks[k].snapshotDate),['2026-10-23','2026-10-23','2026-10-23']);
  assert.deepEqual(bankIds.map(k=>stocks[k].resultsDate),['2026-06-30','2026-06-30','2026-06-30']);
});
test('1H26 NAV snapshots are independent for the banks',()=>{
  assert.deepEqual(bankIds.map(k=>stocks[k].bookValuePerShare),[24.69,13.73,29.99]);
  assert.deepEqual(bankIds.map(k=>stocks[k].ticker),['D05','O39','U11']);
});
test('annual ordinary dividend rates reflect different payment frequencies',()=>{
  assert.deepEqual(bankIds.map(k=>stocks[k].ordinaryAnnualDividend),[2.64,.94,1.76]);
  assert.ok(bankIds.every(k=>stocks[k].ordinaryAnnualDividend>0));
  assert.equal(stocks.OCBC.capitalReturnQuarterly,0);
  assert.equal(stocks.UOB.capitalReturnQuarterly,0);
});
test('each bank has audited research URLs and model assumptions',()=>{
  for(const id of bankIds){
    const s=stocks[id];
    assert.ok(s.sources.length>=3);
    assert.ok(s.sources.every(k=>k.url.startsWith('https://')));
    assert.ok(s.research.strength&&s.research.risk&&s.research.special&&s.dividendNote);
    assert.ok(s.cet1Pct>0&&s.reportedRoePct>0&&s.nplPct>0);
  }
});
test('base valuation and yield do not mix bank stock or dividends',()=>{
  const x=bankIds.map(id=>computeMetrics(stocks[id],stocks[id].scenarios.base));
  assert.ok(Math.abs(x[0].fairValue-70.17)<0.1);
  assert.ok(Math.abs(x[1].fairValue-24.84)<0.1);
  assert.ok(Math.abs(x[2].fairValue-39.22)<0.1);
  assert.ok(Math.abs(x[1].ordinaryYieldPct-.94/29*100)<1e-8);
  assert.ok(Math.abs(x[2].ordinaryYieldPct-1.76/41.59*100)<1e-8);
  assert.ok(Math.abs(x[0].ordinaryYieldPct-2.64/74.44*100)<1e-8);
  assert.ok(x[0].headlineYieldPct>x[0].ordinaryYieldPct);
  assert.equal(x[1].headlineYieldPct,x[1].ordinaryYieldPct);
  assert.equal(x[2].headlineYieldPct,x[2].ordinaryYieldPct);
  assert.equal(x[1].ddm.temporary,0);
  assert.equal(x[2].ddm.temporary,0);
});
test('bear, base and bull cases remain ordered for each bank',()=>{
  for(const id of bankIds){
    const s=stocks[id];
    const v=['bear','base','bull'].map(k=>computeMetrics(s,s.scenarios[k]).fairValue);
    assert.ok(v[0]<v[1]&&v[1]<v[2],id+' scenario order');
  }
});
test('editing one bank does not change others',()=>{
  const a=structuredClone(stocks.OCBC),before=computeMetrics(stocks.DBS,stocks.DBS.scenarios.base).fairValue;
  a.marketPrice=31;a.bookValuePerShare=15;
  assert.equal(computeMetrics(stocks.DBS,stocks.DBS.scenarios.base).fairValue,before);
  assert.equal(stocks.OCBC.marketPrice,29);
});
test('unreported ratios are not invented',()=>{
  assert.equal(stocks.UOB.lcrPct,null);
  assert.equal(stocks.UOB.nsfrPct,null);
  assert.equal(stocks.UOB.cet1FullyPhasedPct,null);
});

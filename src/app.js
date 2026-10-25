import {stocks} from './data.js';
import {computeMetrics,calculateSensitivity,currency,pct} from './valuation.js';

const original = stocks.DBS;
const stock = structuredClone(original);
const fields = ['roe','requiredReturn','bookGrowth','ddmRequiredReturn','dividendGrowth','remainingCapitalReturnQuarters'];
const dataFields = ['marketPrice','bookValuePerShare','ordinaryQuarterlyDividend','capitalReturnQuarterly'];
const KEY = 'fairvalue:DBS:inputs:1';
const $ = (id) => document.getElementById(id);
const money = (value) => currency(value,stock.currency);
const shortMoney = (value) => 'S$' + value.toFixed(2);
const bound = (v) => Math.min(98,Math.max(2,v));
let scenario = 'base';
let assumptions = structuredClone(original.scenarios.base);
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved && fields.every(k => Number.isFinite(saved.assumptions?.[k])) &&
      dataFields.every(k => Number.isFinite(saved.stock?.[k]))) {
    assumptions = {...assumptions,...saved.assumptions};
    for (const k of dataFields) stock[k] = saved.stock[k];
    scenario = 'custom';
  }
} catch {}

const set = (id,value) => {$(id).textContent = value;};
const persist = () => {
  try {localStorage.setItem(KEY, JSON.stringify({assumptions,stock:Object.fromEntries(dataFields.map(k=>[k,stock[k]]))}));}
  catch {}
};
function syncFields() {
  for (const k of fields) $(k).value = assumptions[k];
  for (const k of dataFields) $(k === 'marketPrice' ? 'marketPriceInput' : k).value = stock[k];
}
function updateScenarios() {
  for (const name of ['bear','base','bull']) {
    const result = computeMetrics(stock,original.scenarios[name]);
    set(name+'-value',shortMoney(result.fairValue));
  }
}
function updateRange(value) {
  const prices = ['bear','base','bull'].map(name=>computeMetrics(stock,original.scenarios[name]).fairValue);
  const min = Math.max(0, Math.min(...prices,stock.marketPrice,value)*0.85);
  const max = Math.max(...prices,stock.marketPrice,value)*1.13;
  const pos = number => bound(((number-min)/(max-min))*100);
  const low = Math.min(...prices), high = Math.max(...prices);
  const left=pos(low), right=pos(high);
  $('range-band').style.left=left+'%';
  $('range-band').style.width=(right-left)+'%';
  $('value-marker').style.left=pos(value)+'%';
  $('price-marker').style.left=pos(stock.marketPrice)+'%';
  set('range-low',shortMoney(low)+' bear');
  set('range-high',shortMoney(high)+' bull');
  $('valuation-range').setAttribute('aria-label','Bear value '+shortMoney(low)+', bull value '+shortMoney(high)+', selected fair value '+shortMoney(value)+', market price '+shortMoney(stock.marketPrice));
}
function updateSensitivity() {
  const roeChanges=[-2,-1,0,1,2], returnChanges=[-1,-.5,0,.5,1];
  const rows=calculateSensitivity(stock,assumptions,roeChanges,returnChanges);
  $('sensitivity').querySelector('thead').innerHTML =
    '<tr><th scope="col">ROE Δ / Ke Δ</th>'+returnChanges.map(k=>'<th scope="col">'+(k>0?'+':'')+k.toFixed(1)+'%</th>').join('')+'</tr>';
  $('sensitivity').querySelector('tbody').innerHTML =
    rows.map((row,i)=>'<tr><th scope="row">'+(roeChanges[i]>0?'+':'')+roeChanges[i]+'%</th>'+
    row.map((value,j)=>'<td class="'+(i===2&&j===2?'current':value!==null&&value>stock.marketPrice?'cheap':'expensive')+'">'+(value===null?'—':shortMoney(value))+'</td>').join('')+'</tr>').join('');
}
function render() {
  document.querySelectorAll('[data-scenario]').forEach(button=>{
    const active = button.dataset.scenario === scenario;
    button.setAttribute('aria-pressed',String(active));
  });
  set('scenario-status',scenario==='custom'?'Custom assumptions':scenario.charAt(0).toUpperCase()+scenario.slice(1)+' case');
  set('edit-note',scenario==='custom'?'You have edited the source assumptions. Reset to restore the published snapshot.':'Change any value to explore another outcome.');
  set('market-price',money(stock.marketPrice));
  try {
    updateScenarios();
    const result=computeMetrics(stock,assumptions);
    $('form-error').hidden=true;
    set('fair-value',money(result.fairValue));
    set('upside',(result.upsidePct>=0?'+':'')+pct(result.upsidePct));
    $('upside').classList.toggle('positive',result.upsidePct>0);
    $('upside').classList.toggle('negative',result.upsidePct<0);
    set('valuation-label',result.upsidePct>=0?'Market below model value':'Market above model value');
    set('mos',money(result.marginOfSafety20));
    set('ddm-total',money(result.ddm.fairValue));
    set('ddm-compare','Difference vs P/B: '+(result.ddm.fairValue-result.fairValue>=0?'+':'')+shortMoney(result.ddm.fairValue-result.fairValue));
    set('ddm-ordinary',money(result.ddm.ordinary));
    set('ddm-temporary',money(result.ddm.temporary));
    set('pb-market',result.priceToBook.toFixed(2)+'×');
    set('yield-ordinary',pct(result.ordinaryYieldPct,2));
    set('yield-headline',pct(result.headlineYieldPct,2));
    set('comparison-copy',shortMoney(stock.marketPrice)+' market price is '+(result.upsidePct>=0?'below':'above')+' the '+shortMoney(result.fairValue)+' selected model estimate. Compare across scenarios before drawing a conclusion.');
    updateRange(result.fairValue);
    updateSensitivity();
  } catch(error) {
    $('form-error').hidden=false;
    set('form-error',error.message);
    for (const id of ['fair-value','upside','mos','ddm-total','ddm-ordinary','ddm-temporary']) set(id,'—');
  }
}
for (const name of ['bear','base','bull']) {
  document.querySelector('[data-scenario="'+name+'"]').addEventListener('click',()=>{
    scenario=name;
    assumptions=structuredClone(original.scenarios[name]);
    syncFields();persist();render();
  });
}
for (const name of fields) {
  $(name).addEventListener('input',event=>{
    if (!Number.isFinite(event.target.valueAsNumber)) return;
    scenario='custom';assumptions[name]=event.target.valueAsNumber;persist();render();
  });
}
for (const name of dataFields) {
  $(name==='marketPrice'?'marketPriceInput':name).addEventListener('input',event=>{
    if (!Number.isFinite(event.target.valueAsNumber)) return;
    scenario='custom';stock[name]=event.target.valueAsNumber;persist();render();
  });
}
$('reset').addEventListener('click',()=>{
  scenario='base';assumptions=structuredClone(original.scenarios.base);
  for (const name of dataFields) stock[name]=original[name];
  try {localStorage.removeItem(KEY);} catch {}
  syncFields();render();
});
$('export').addEventListener('click',()=>{
  try {
    const result={project:'fairvalue',exportedAt:new Date().toISOString(),sourceDate:stock.snapshotDate,
      financialsAsOf:stock.resultsDate,stock,scenario,assumptions,valuation:computeMetrics(stock,assumptions),
      disclaimer:'Illustrative research; not financial advice.'};
    const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download='fairvalue-DBS-'+stock.snapshotDate+'.json';
    document.body.append(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  } catch(error) {$('form-error').hidden=false;set('form-error',error.message);}
});
set('eps',money(stock.annualizedEps));
set('reported-roe',pct(stock.reportedRoePct));
set('cet1',pct(stock.fullyPhasedCet1Pct));
set('lcr',pct(stock.lcrPct,0));
set('nsfr',pct(stock.nsfrPct,0));
set('npl',pct(stock.nplPct));
for(const entry of stock.sources) {
  const item=document.createElement('li');
  const link=document.createElement('a');
  link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';
  link.textContent=entry.label;
  item.append(link);$('source-list').append(item);
}
syncFields();render();

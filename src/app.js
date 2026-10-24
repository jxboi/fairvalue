import {stocks} from './data.js';
import {computeMetrics,calculateSensitivity,currency,pct} from './valuation.js';
const original=stocks.DBS;
const stock=structuredClone(original);
const fields=['roe','requiredReturn','bookGrowth','ddmRequiredReturn','dividendGrowth','remainingCapitalReturnQuarters'];
const dataFields=['marketPrice','bookValuePerShare','ordinaryQuarterlyDividend','capitalReturnQuarterly'];
const $=id=>document.getElementById(id);
const m=v=>currency(v,stock.currency);
const shorter=v=>'S$'+v.toFixed(2);
const KEY='fairvalue:DBS:inputs:1';
let selected='base',a=structuredClone(stock.scenarios.base);
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved && fields.every(k=>Number.isFinite(saved.assumptions?.[k])) && dataFields.every(k=>Number.isFinite(saved.stock?.[k]))) {
   a={...a,...saved.assumptions};for(const k of dataFields)stock[k]=saved.stock[k];selected='custom';
 }
}catch{}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({assumptions:a,stock:Object.fromEntries(dataFields.map(k=>[k,stock[k]]))}))}catch{}}
function sync(){for(const k of fields)$(k).value=a[k];for(const k of dataFields)$(k==='marketPrice'?'marketPriceInput':k).value=stock[k]}
function set(id,value){$(id).textContent=value}
function sensitivity(){
 const r=[-2,-1,0,1,2],k=[-1,-.5,0,.5,1],v=calculateSensitivity(stock,a,r,k);
 $('sensitivity').querySelector('thead').innerHTML='<tr><th>ROE / Ke</th>'+k.map(x=>'<th>'+(x>0?'+':'')+x.toFixed(1)+'%</th>').join('')+'</tr>';
 $('sensitivity').querySelector('tbody').innerHTML=v.map((row,i)=>'<tr><th>'+(r[i]>0?'+':'')+r[i]+'%</th>'+row.map((n,j)=>'<td class="'+(i===2&&j===2?'current':n!==null&&n>stock.marketPrice?'cheap':'expensive')+'">'+(n===null?'—':shorter(n))+'</td>').join('')+'</tr>').join('');
}
function render(){
 for(const b of document.querySelectorAll('[data-scenario]'))b.classList.toggle('active',b.dataset.scenario===selected);
 set('market-price',m(stock.marketPrice));
 try{
  const x=computeMetrics(stock,a);
  $('form-error').hidden=true;
  set('fair-value',m(x.fairValue));set('upside',(x.upsidePct>=0?'+':'')+pct(x.upsidePct));
  $('upside').style.color=x.upsidePct>=0?'#83e4b7':'#f4a2a8';
  set('valuation-label',x.upsidePct>=0?'Below model value':'Above model value');
  set('mos',m(x.marginOfSafety20));set('ddm-total',m(x.ddm.fairValue));
  set('ddm-ordinary',m(x.ddm.ordinary));set('ddm-temporary',m(x.ddm.temporary));
  set('ddm-compare','vs P/B '+(x.ddm.fairValue-x.fairValue>=0?'+':'')+shorter(x.ddm.fairValue-x.fairValue));
  set('pb-market',x.priceToBook.toFixed(2)+'×');set('yield-ordinary',pct(x.ordinaryYieldPct,2));set('yield-headline',pct(x.headlineYieldPct,2));
  const max=Math.max(stock.marketPrice,x.fairValue,1)*1.15;
  $('market-bar').style.width=(stock.marketPrice/max*100)+'%';$('fair-bar').style.width=(x.fairValue/max*100)+'%';
  set('market-bar-label',shorter(stock.marketPrice));set('fair-bar-label',shorter(x.fairValue));
  sensitivity();
 }catch(e){
  $('form-error').hidden=false;set('form-error',e.message);for(const id of ['fair-value','upside','mos','ddm-total'])set(id,'—');
 }
}
for(const name of ['bear','base','bull']){
 set(name+'-value',shorter(computeMetrics(original,original.scenarios[name]).fairValue));
 document.querySelector('[data-scenario="'+name+'"]').addEventListener('click',()=>{
  selected=name;a=structuredClone(original.scenarios[name]);sync();persist();render();
 });
}
for(const k of fields)$(k).addEventListener('input',e=>{const v=e.target.valueAsNumber;if(!Number.isFinite(v))return;selected='custom';a[k]=v;persist();render()});
for(const k of dataFields)$(k==='marketPrice'?'marketPriceInput':k).addEventListener('input',e=>{const v=e.target.valueAsNumber;if(!Number.isFinite(v))return;selected='custom';stock[k]=v;persist();render()});
$('reset').addEventListener('click',()=>{selected='base';a=structuredClone(original.scenarios.base);for(const k of dataFields)stock[k]=original[k];try{localStorage.removeItem(KEY)}catch{}sync();render()});
$('export').addEventListener('click',()=>{
 try{
  const out={project:'fairvalue',createdAt:new Date().toISOString(),sourceDate:stock.snapshotDate,financialsAsOf:stock.resultsDate,stock,scenario:selected,assumptions:a,valuation:computeMetrics(stock,a),disclaimer:'Illustrative analysis, not investment advice'};
  const u=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'}));const l=document.createElement('a');
  l.href=u;l.download='fairvalue-DBS-'+stock.snapshotDate+'.json';l.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
 }catch(e){$('form-error').hidden=false;set('form-error',e.message)}
});
set('eps',m(stock.annualizedEps));set('reported-roe',pct(stock.reportedRoePct));set('cet1',pct(stock.fullyPhasedCet1Pct));
set('lcr',pct(stock.lcrPct,0));set('nsfr',pct(stock.nsfrPct,0));set('npl',pct(stock.nplPct));
for(const s of stock.sources){const l=document.createElement('a');l.href=s.url;l.target='_blank';l.rel='noopener noreferrer';l.textContent='↗  '+s.label;$('source-list').append(l)}
sync();render();

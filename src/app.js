import {stocks,bankIds} from './data.js';
import {computeMetrics,calculateSensitivity,currency,pct} from './valuation.js';

const $ = id => document.getElementById(id);
const money = value => currency(value,'SGD');
const shortMoney = value => 'S$'+value.toFixed(2);
const bound = value => Math.max(2,Math.min(98,value));
const assumptionKeys = ['roe','requiredReturn','bookGrowth','ddmRequiredReturn','dividendGrowth','remainingCapitalReturnQuarters'];
const financialKeys = ['marketPrice','bookValuePerShare','ordinaryAnnualDividend','capitalReturnQuarterly'];
const states = new Map();
let activeId = 'DBS';

function key(id){ return 'fairvalue:'+id+':inputs:2'; }
function createState(id){
  const stock = structuredClone(stocks[id]);
  let scenario = 'base';
  let assumptions = structuredClone(stock.scenarios.base);
  try {
    let saved = JSON.parse(localStorage.getItem(key(id))||'null');
    // Backward compatibility for data entered in the earlier DBS-only application.
    if (!saved && id==='DBS') {
      const old = JSON.parse(localStorage.getItem('fairvalue:DBS:inputs:1')||'null');
      if (old?.stock && old?.assumptions) {
        saved = {stock:{...old.stock,ordinaryAnnualDividend:old.stock.ordinaryQuarterlyDividend*4},assumptions:old.assumptions};
      }
    }
    if (saved && assumptionKeys.every(k=>Number.isFinite(saved.assumptions?.[k])) &&
        financialKeys.every(k=>Number.isFinite(saved.stock?.[k]))) {
      assumptions = {...assumptions,...Object.fromEntries(assumptionKeys.map(k=>[k,saved.assumptions[k]]))};
      for (const k of financialKeys) stock[k] = saved.stock[k];
      scenario = 'custom';
    }
  } catch {}
  return {stock,assumptions,scenario};
}
function state(id=activeId){
  if(!states.has(id)) states.set(id,createState(id));
  return states.get(id);
}
function save(id=activeId){
  const s = state(id);
  try {localStorage.setItem(key(id),JSON.stringify({
    assumptions:s.assumptions,
    stock:Object.fromEntries(financialKeys.map(k=>[k,s.stock[k]]))
  }));} catch {}
}
function set(id,value){$(id).textContent=value;}
function formatDate(iso){
  return new Intl.DateTimeFormat('en-GB',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(iso+'T00:00:00Z'));
}
function syncInputs(){
  const s=state();
  for(const k of assumptionKeys) $(k).value=s.assumptions[k];
  for(const k of financialKeys) $(k==='marketPrice'?'marketPriceInput':k).value=s.stock[k];
}
function changeBank(id){
  if (!stocks[id] || id===activeId) return;
  activeId=id;
  syncInputs();render();
  $('valuation').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderComparison(){
  const body=$('bank-comparison-body');
  body.replaceChildren();
  for(const id of bankIds){
    const s=state(id), d=s.stock;
    const row=document.createElement('tr');
    row.classList.toggle('is-selected',id===activeId);
    let valuation=null;
    try {valuation=computeMetrics(d,s.assumptions);}catch {}
    const button=document.createElement('button');
    button.type='button';button.className='peer-bank-button';
    button.dataset.bank=id;button.setAttribute('aria-pressed',String(id===activeId));
    button.setAttribute('aria-label','Analyze '+d.name);
    const b=document.createElement('span');b.textContent=id+' · '+d.ticker;
    button.append(b);button.addEventListener('click',()=>changeBank(id));
    const lead=document.createElement('td');lead.append(button);row.append(lead);
    const cells=[
      {text:shortMoney(d.marketPrice)},
      {text:valuation?valuation.priceToBook.toFixed(2)+'×':'—'},
      {text:pct(d.reportedRoePct)},
      {text:valuation?pct(valuation.ordinaryYieldPct,2):'—'},
      {text:valuation?shortMoney(valuation.fairValue):'—'},
      {text:valuation?(valuation.upsidePct>0?'+':'')+pct(valuation.upsidePct):'—',style:valuation?(valuation.upsidePct>=0?'model-upside-positive':'model-upside-negative'):''},
      {text:pct(d.cet1Pct)}
    ];
    for(const entry of cells){
      const cell=document.createElement('td');cell.textContent=entry.text;
      if(entry.style)cell.className=entry.style;
      row.append(cell);
    }
    body.append(row);
  }
}
function renderScenarioValues(){
  const d=state().stock;
  for(const id of ['bear','base','bull']){
    const a=d.scenarios[id];
    const result=computeMetrics(d,a);
    set(id+'-value',shortMoney(result.fairValue));
  }
}
function renderSensitivity(){
  const s=state();
  const roeChanges=[-2,-1,0,1,2],returnChanges=[-1,-.5,0,.5,1];
  const rows=calculateSensitivity(s.stock,s.assumptions,roeChanges,returnChanges);
  $('sensitivity').querySelector('thead').innerHTML='<tr><th scope="col">ROE Δ / Ke Δ</th>'+
    returnChanges.map(k=>'<th scope="col">'+(k>0?'+':'')+k.toFixed(1)+'%</th>').join('')+'</tr>';
  $('sensitivity').querySelector('tbody').innerHTML=rows.map((r,i)=>
    '<tr><th scope="row">'+(roeChanges[i]>0?'+':'')+roeChanges[i]+'%</th>'+
    r.map((v,j)=>'<td class="'+(i===2&&j===2?'current':v!==null&&v>s.stock.marketPrice?'cheap':'expensive')+'">'+
      (v===null?'—':shortMoney(v))+'</td>').join('')+'</tr>').join('');
}
function renderRange(value){
  const d=state().stock;
  const results=['bear','base','bull'].map(id=>computeMetrics(d,d.scenarios[id]).fairValue);
  const min=Math.max(0,Math.min(...results,d.marketPrice,value)*.85);
  const max=Math.max(...results,d.marketPrice,value)*1.13;
  const pos=v=>bound((v-min)/(max-min)*100);
  const low=Math.min(...results),high=Math.max(...results);
  $('range-band').style.left=pos(low)+'%';
  $('range-band').style.width=pos(high)-pos(low)+'%';
  $('value-marker').style.left=pos(value)+'%';
  $('price-marker').style.left=pos(d.marketPrice)+'%';
  set('range-low',shortMoney(low)+' bear');
  set('range-high',shortMoney(high)+' bull');
  $('valuation-range').setAttribute('aria-label','Bear '+shortMoney(low)+', bull '+shortMoney(high)+
    ', current fair value '+shortMoney(value)+', market price '+shortMoney(d.marketPrice));
}
function renderSources(){
  const list=$('source-list');list.replaceChildren();
  for(const source of state().stock.sources){
    const li=document.createElement('li');
    const link=document.createElement('a');
    link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent=source.label;li.append(link);list.append(li);
  }
}
function render(){
  const s=state(),d=s.stock;
  document.title=d.name+' | FairValue Research';
  set('company-name',d.name);set('company-ticker',d.ticker);set('header-ticker',d.ticker);
  set('market-date',formatDate(d.snapshotDate));set('results-date',formatDate(d.resultsDate));
  for(const b of document.querySelectorAll('[data-scenario]'))
    b.setAttribute('aria-pressed',String(b.dataset.scenario===s.scenario));
  set('scenario-status',s.scenario==='custom'?'Custom assumptions':s.scenario.charAt(0).toUpperCase()+s.scenario.slice(1)+' case');
  set('edit-note',s.scenario==='custom'?'You have edited '+d.id+' assumptions. Reset to restore the published snapshot.':'Change any value to explore another outcome.');
  set('market-price',money(d.marketPrice));
  set('capital-note',d.dividendNote);
  set('research-strength',d.research.strength);
  set('research-risk',d.research.risk);
  set('research-special',d.research.special);
  set('eps',money(d.annualizedEps));
  set('reported-roe',pct(d.reportedRoePct));
  set('cet1',pct(d.cet1Pct));
  set('cet1-fully-phased',d.cet1FullyPhasedPct==null?'Not supplied':pct(d.cet1FullyPhasedPct));
  set('lcr',d.lcrPct==null?'Not supplied':pct(d.lcrPct,0));
  set('nsfr',d.nsfrPct==null?'Not supplied':pct(d.nsfrPct,0));
  set('npl',pct(d.nplPct));
  renderSources();
  renderComparison();
  try {
    renderScenarioValues();
    const x=computeMetrics(d,s.assumptions);
    $('form-error').hidden=true;
    set('fair-value',money(x.fairValue));
    set('upside',(x.upsidePct>=0?'+':'')+pct(x.upsidePct));
    $('upside').classList.toggle('positive',x.upsidePct>0);
    $('upside').classList.toggle('negative',x.upsidePct<0);
    set('valuation-label',x.upsidePct>=0?'Market below model value':'Market above model value');
    set('mos',money(x.marginOfSafety20));
    set('ddm-total',money(x.ddm.fairValue));
    set('ddm-compare','Difference vs P/B: '+(x.ddm.fairValue-x.fairValue>=0?'+':'')+shortMoney(x.ddm.fairValue-x.fairValue));
    set('ddm-ordinary',money(x.ddm.ordinary));
    set('ddm-temporary',money(x.ddm.temporary));
    set('pb-market',x.priceToBook.toFixed(2)+'×');
    set('yield-ordinary',pct(x.ordinaryYieldPct,2));
    set('yield-headline',pct(x.headlineYieldPct,2));
    set('comparison-copy',shortMoney(d.marketPrice)+' market price is '+(x.upsidePct>=0?'below':'above')+
      ' the '+shortMoney(x.fairValue)+' selected estimate for '+d.id+'. Compare assumptions across the three banks.');
    renderRange(x.fairValue);
    renderSensitivity();
  } catch(error){
    $('form-error').hidden=false;
    set('form-error',error.message);
    for(const id of ['fair-value','upside','mos','ddm-total','ddm-ordinary','ddm-temporary']) set(id,'—');
  }
}
for(const name of ['bear','base','bull']){
  document.querySelector('[data-scenario="'+name+'"]').addEventListener('click',()=>{
    const s=state();s.scenario=name;s.assumptions=structuredClone(s.stock.scenarios[name]);
    syncInputs();save();render();
  });
}
for(const key of assumptionKeys){
  $(key).addEventListener('input',event=>{
    const value=event.target.valueAsNumber;
    if(!Number.isFinite(value))return;
    const s=state();s.scenario='custom';s.assumptions[key]=value;
    save();render();
  });
}
for(const key of financialKeys){
  $(key==='marketPrice'?'marketPriceInput':key).addEventListener('input',event=>{
    const value=event.target.valueAsNumber;
    if(!Number.isFinite(value))return;
    const s=state();s.scenario='custom';s.stock[key]=value;
    save();render();
  });
}
$('reset').addEventListener('click',()=>{
  states.set(activeId,createStateFromDefaults(activeId));
  try{localStorage.removeItem(key(activeId));if(activeId==='DBS')localStorage.removeItem('fairvalue:DBS:inputs:1')}catch{}
  syncInputs();render();
});
function createStateFromDefaults(id){
  const stock=structuredClone(stocks[id]);
  return {stock,scenario:'base',assumptions:structuredClone(stock.scenarios.base)};
}
$('export').addEventListener('click',()=>{
  const s=state();
  try{
    const payload={project:'fairvalue',exportedAt:new Date().toISOString(),sourceDate:s.stock.snapshotDate,
      financialsAsOf:s.stock.resultsDate,stock:s.stock,scenario:s.scenario,assumptions:s.assumptions,
      valuation:computeMetrics(s.stock,s.assumptions),peers:bankIds.map(id=>{
        const peer=state(id);return {id,marketPrice:peer.stock.marketPrice,valuation:computeMetrics(peer.stock,peer.assumptions)};
      }),disclaimer:'Illustrative research, not investment advice'};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;
    link.download='fairvalue-'+activeId+'-'+s.stock.snapshotDate+'.json';
    document.body.append(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(error){$('form-error').hidden=false;set('form-error',error.message)}
});
syncInputs();render();

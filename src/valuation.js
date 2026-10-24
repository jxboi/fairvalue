/**
 * Pure bank valuation utilities. Per-share inputs are in the same currency.
 * Required returns, growth and ROE are decimal fractions, not percentages.
 */
const finite = n => typeof n === 'number' && Number.isFinite(n);
export function justifiedPriceToBook({bookValue,roe,requiredReturn,growth}) {
  if (![bookValue,roe,requiredReturn,growth].every(finite)) throw new Error('Inputs must be finite numbers');
  if (bookValue <= 0) throw new Error('Book value must be positive');
  if (growth < -0.2 || growth > 0.2) throw new Error('Growth outside supported range');
  if (requiredReturn <= growth) throw new Error('Required return must exceed growth');
  const multiple=(roe-growth)/(requiredReturn-growth);
  if (multiple<=0) throw new Error('Implied bank value is non-positive');
  return {multiple,fairValue:bookValue*multiple};
}
export function dividendDiscountModel({ordinaryAnnualDividend,requiredReturn,growth,capitalReturnQuarterly=0,remainingQuarters=0}) {
  if (![ordinaryAnnualDividend,requiredReturn,growth,capitalReturnQuarterly,remainingQuarters].every(finite)) throw new Error('Inputs must be finite numbers');
  if (ordinaryAnnualDividend<0 || capitalReturnQuarterly<0) throw new Error('Dividends cannot be negative');
  if (!Number.isInteger(remainingQuarters)||remainingQuarters<0||remainingQuarters>40) throw new Error('Remaining quarters must be integer 0–40');
  if (requiredReturn<=growth) throw new Error('Required return must exceed growth');
  if (requiredReturn<=-1) throw new Error('Required return must exceed −100%');
  const ordinary=ordinaryAnnualDividend*(1+growth)/(requiredReturn-growth);
  const temporary=Array.from({length:remainingQuarters},(_,i)=>capitalReturnQuarterly/((1+requiredReturn)**((i+1)/4))).reduce((a,b)=>a+b,0);
  return {ordinary,temporary,fairValue:ordinary+temporary};
}
export function computeMetrics(data,a) {
  const pb=justifiedPriceToBook({bookValue:data.bookValuePerShare,roe:a.roe/100,requiredReturn:a.requiredReturn/100,growth:a.bookGrowth/100});
  const ddm=dividendDiscountModel({ordinaryAnnualDividend:data.ordinaryQuarterlyDividend*4,requiredReturn:a.ddmRequiredReturn/100,growth:a.dividendGrowth/100,capitalReturnQuarterly:data.capitalReturnQuarterly,remainingQuarters:a.remainingCapitalReturnQuarters});
  return {...pb,ddm,upsidePct:(pb.fairValue/data.marketPrice-1)*100,priceToBook:data.marketPrice/data.bookValuePerShare,ordinaryYieldPct:4*data.ordinaryQuarterlyDividend/data.marketPrice*100,headlineYieldPct:4*(data.ordinaryQuarterlyDividend+data.capitalReturnQuarterly)/data.marketPrice*100,marginOfSafety20:0.8*pb.fairValue};
}
export function calculateSensitivity(data,a,roeChanges=[-2,-1,0,1,2],returnChanges=[-1,-0.5,0,0.5,1]) {
  return roeChanges.map(r=>returnChanges.map(k=>{try{return justifiedPriceToBook({bookValue:data.bookValuePerShare,roe:(a.roe+r)/100,requiredReturn:(a.requiredReturn+k)/100,growth:a.bookGrowth/100}).fairValue}catch{return null}}));
}
export const currency=(v,code='SGD')=>new Intl.NumberFormat('en-SG',{style:'currency',currency:code,minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
export const pct=(v,d=1)=>v.toFixed(d)+'%';

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html = await readFile(new URL('../index.html',import.meta.url),'utf8');
const js = await readFile(new URL('../src/app.js',import.meta.url),'utf8');
const css = await readFile(new URL('../src/styles.css',import.meta.url),'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);

test('every static DOM lookup resolves to an HTML id',()=>{
  const calls = [...js.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
  assert.ok(calls.length >= 8);
  for (const id of calls) assert.ok(ids.includes(id),'missing '+id);
});
test('ids are unique and financial inputs are labelled',()=>{
  assert.equal(new Set(ids).size,ids.length);
  for (const id of [...html.matchAll(/<input[^>]*\bid="([^"]+)"/g)].map(m=>m[1])) {
    assert.ok(html.includes('for="'+id+'"'),'input missing label '+id);
  }
});
test('scenario buttons expose pressed state and are keyboard native',()=>{
  for(const scenario of ['bear','base','bull']){
    assert.match(html,new RegExp('<button[^>]+data-scenario="'+scenario+'"[^>]+aria-pressed="(?:true|false)"'));
  }
});
test('mobile keeps navigable research sections',()=>{
  for(const anchor of ['valuation','models','financials','research']){
    assert.ok(html.includes('href="#'+anchor+'"'));
    assert.ok(html.includes('id="'+anchor+'"'));
  }
  assert.match(css,/@media\(max-width:760px\)/);
  assert.doesNotMatch(css,/\.primary-nav\s*\{\s*display:none/);
});
test('accessible disclosure and error feedback survive redesign',()=>{
  assert.match(html,/<a class="skip-link" href="#main">/);
  assert.match(html,/id="form-error"[^>]*role="alert"/);
  assert.match(html,/<details class="disclosure"/);
  assert.match(css,/:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
test('frozen-data disclosure remains visible',()=>{
  assert.match(html,/Historical snapshot, not live data/);
  assert.match(html,/not investment advice/);
});

test('peer comparison navigation, table and switcher remain accessible',()=>{
  assert.ok(html.includes('href="#comparison"'));
  assert.ok(html.includes('id="comparison"'));
  assert.ok(html.includes('id="bank-comparison-body"'));
  assert.ok(html.includes('id="company-name"'));
  assert.ok(html.includes('id="ordinaryAnnualDividend"'));
  assert.ok(js.includes("aria-pressed"));
  assert.ok(js.includes('stocks,bankIds'));
  assert.match(css,/\.peer-table/);
  assert.match(css,/position:sticky/);
});

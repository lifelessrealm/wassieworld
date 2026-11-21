import {chromium,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:5173');await expect(page.locator('.tool-card')).toHaveCount(10,{timeout:30000});await mkdir('test-results/character',{recursive:true});await page.waitForTimeout(600);
await page.screenshot({path:'test-results/character/chamber.png',fullPage:true});await page.locator('#lab').click();await expect(page.locator('#reference-card')).toBeVisible();await page.screenshot({path:'test-results/character/front-comparison.png',fullPage:true});
for(const [label,value]of [['quarter','.55'],['rear','3.14159']]){await page.locator('#lab-view').selectOption(label==='quarter'?'0.55':value);await page.waitForTimeout(80);await page.screenshot({path:`test-results/character/${label}.png`,fullPage:true});}
await page.locator('#lab-view').selectOption('0');for(const state of ['heavy','combined','recovering']){await page.locator('#lab-reaction').selectOption(state);await page.waitForTimeout(200);await page.screenshot({path:`test-results/character/${state}.png`,fullPage:true});}
console.log(JSON.stringify({errors,metrics:await page.locator('#metrics').textContent()},null,2));await browser.close();

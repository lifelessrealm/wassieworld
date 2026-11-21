import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,3000));});
await page.goto('http://127.0.0.1:5173');await page.waitForTimeout(7000);
await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/inspection.png',fullPage:true});
console.log(JSON.stringify({errors,loading:await page.locator('#loading').count(),metrics:await page.locator('#metrics').textContent(),state:await page.evaluate(()=>window.__wassie?.sim.entities.map(e=>({id:e.id,asset:e.asset,p:e.body.translation()})))},null,2));
await browser.close();

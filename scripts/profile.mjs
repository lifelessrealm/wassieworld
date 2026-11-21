import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.__wassie);await page.waitForTimeout(3500);
const idle=await page.evaluate(()=>({metrics:window.__wassie.metrics,gpu:(()=>{const g=document.querySelector('canvas').getContext('webgl2'),e=g.getExtension('WEBGL_debug_renderer_info');return e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):'unavailable';})()}));
await page.evaluate(()=>{const g=window.__wassie;for(let i=0;i<40;i++)g.sim.spawn(['crate','mallet','anvil','glove'][i%4],-7+(i%8)*2,1+Math.floor(i/8)*1.6);});await page.waitForTimeout(4000);
const stress=await page.evaluate(()=>({metrics:window.__wassie.metrics,finite:window.__wassie.sim.entities.every(e=>Object.values(e.body.translation()).every(Number.isFinite)),props:window.__wassie.sim.entities.filter(e=>!e.part).length}));
console.log(JSON.stringify({viewport:{width:1440,height:1000},idle,stress},null,2));await browser.close();

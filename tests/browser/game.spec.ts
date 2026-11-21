import {test,expect,type Page} from '@playwright/test';
type BrowserGame=import('../../src/engine/game.ts').Game;
const state=<T>(page:Page,fn:(g:BrowserGame)=>T)=>page.evaluate(fn=>{const g=(window as unknown as {__wassie:BrowserGame}).__wassie;return (0,eval)(`(${fn})`)(g);},fn.toString()) as Promise<T>;
async function ready(page:Page){await page.goto('/');await expect(page.locator('#loading')).toHaveCount(0,{timeout:30000});await expect(page.locator('#tools .tool-card')).toHaveCount(10);}
test('renders a stable idle subject without scoring or browser errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await ready(page);
 await expect.poll(()=>state(page,g=>g.sim.elapsed)).toBeGreaterThan(2);
 expect(await state(page,g=>g.sim.score.total)).toBe(0);expect(await state(page,g=>g.sim.entities.find(e=>e.asset==='head')!.body.translation().y)).toBeGreaterThan(2.5);
 expect(errors).toEqual([]);await page.screenshot({path:'test-results/chamber-desktop.png',fullPage:true});
});
test('pointer placement, search, grabbing, throw, pause and slow motion',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Select Wooden crate',exact:true}).click();const canvas=page.locator('#game>canvas'),box=(await canvas.boundingBox())!;
 await page.mouse.click(box.x+box.width*.7,box.y+box.height*.4);await expect.poll(()=>state(page,g=>g.sim.entities.filter(e=>!e.part).length)).toBe(1);
 await page.locator('#grab').click();
 const screen=await state(page,g=>{const p=g.sim.entities.find(e=>e.asset==='head')!.body.translation();const vector=g.scene.position.clone().set(p.x,p.y,.35).project(g.camera);return {x:vector.x,y:vector.y};});
 const x=box.x+(screen.x+1)*box.width/2,y=box.y+(1-screen.y)*box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await expect.poll(()=>state(page,g=>g.sim.grabbing)).toBe(true);await page.mouse.move(x+130,y-60,{steps:12});await page.mouse.up();expect(await state(page,g=>g.sim.grabbing)).toBe(false);
 await page.locator('#pause').click();const time=await state(page,g=>g.sim.elapsed);await page.waitForTimeout(250);expect(await state(page,g=>g.sim.elapsed)).toBe(time);await page.locator('#slow').click();expect(await state(page,g=>g.timeScale)).toBe(.25);await page.locator('#pause').click();
 await page.getByRole('textbox',{name:'Search tools'}).fill('rocket');await expect(page.locator('.tool-card')).toHaveCount(1);await expect(page.locator('.tool-card')).toContainText('Bottle rocket');
});
test('bombs score, props save/load, resets clean resources and snapshot downloads',async({page})=>{
 await ready(page);await page.locator('#pause').click();await page.getByRole('button',{name:'Select Wooden crate',exact:true}).click();const b=(await page.locator('#game>canvas').boundingBox())!;await page.mouse.click(b.x+b.width*.67,b.y+b.height*.4);await page.locator('#save').click();
 await page.locator('#clear').click();expect(await state(page,g=>g.sim.entities.length)).toBe(6);await page.locator('#load').click();expect(await state(page,g=>g.sim.entities.filter(e=>e.asset==='crate').length)).toBe(1);
 await page.getByRole('button',{name:'Select Cartoon bomb',exact:true}).click();await page.mouse.click(b.x+b.width*.51,b.y+b.height*.7);await page.locator('#pause').click();await expect.poll(()=>state(page,g=>g.sim.entities.filter(e=>e.asset==='bomb').length),{timeout:20000}).toBe(0);expect(await state(page,g=>g.sim.score.total)).toBeGreaterThan(0);
 await page.locator('#reset').click();expect(await state(page,g=>g.sim.damage.amount)).toBeLessThan(1);const download=page.waitForEvent('download');await page.locator('#capture').click();expect((await download).suggestedFilename()).toBe('wassieworld-experiment.png');
});
test('laboratory inspects source volumes and reconstructed slice count',async({page})=>{
 await ready(page);await page.locator('#lab').click();await expect(page.locator('#lab-controls')).toBeVisible();await expect(page.locator('#reference-card')).toBeVisible();await page.locator('#lab-asset').selectOption('head');await expect(page.locator('#slice-info')).toContainText('150 real cross-sections');await page.locator('#slices').fill('75');await expect(page.locator('#slice-info')).toContainText('75 / 150');await page.screenshot({path:'test-results/asset-laboratory.png',fullPage:true});await page.locator('#sandbox').click();expect(await state(page,g=>g.lab)).toBe(false);
});
test('character studio compares the original and combines the real damage layers',async({page})=>{
 await ready(page);await page.locator('#lab').click();await expect(page.locator('#lab-asset')).toHaveValue('character');await expect(page.locator('#reference-card img')).toBeVisible();await expect(page.locator('#slice-control')).toBeHidden();
 await page.locator('#lab-reaction').selectOption('combined');expect(await state(page,g=>g.labDamage.statuses.has('frozen')&&g.labDamage.statuses.has('shocked')&&g.labDamage.statuses.has('soot'))).toBe(true);await page.screenshot({path:'test-results/character-combined.png',fullPage:true});
 await page.locator('#lab-view').selectOption('1.5708');await page.locator('#lab-view').selectOption('turntable');expect(await state(page,g=>g.labTurntable)).toBe(true);await page.locator('#lab-reaction').selectOption('neutral');expect(await state(page,g=>g.labDamage.amount)).toBe(0);await page.locator('#lab-view').selectOption('0');await page.screenshot({path:'test-results/character-front.png',fullPage:true});
});
test('touch-sized layout, touch placement and settings remain usable',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await ready(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'Select Boxing glove',exact:true}).tap();const b=(await page.locator('#game>canvas').boundingBox())!;await page.touchscreen.tap(b.x+b.width*.66,b.y+b.height*.4);await expect.poll(()=>state(page,g=>g.sim.entities.filter(e=>e.asset==='glove').length)).toBe(1);
 await page.locator('#grab').tap();const point=await state(page,g=>{const p=g.sim.entities.find(e=>e.asset==='head')!.body.translation();const v=g.scene.position.clone().set(p.x,p.y,.35).project(g.camera);return {x:v.x,y:v.y};});const x=b.x+(point.x+1)*b.width/2,y=b.y+(1-point.y)*b.height/2;
 const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await expect.poll(()=>state(page,g=>g.sim.grabbing)).toBe(true);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+35,y:y-30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});expect(await state(page,g=>g.sim.grabbing)).toBe(false);await cdp.detach();
 await page.locator('#settings').tap();await page.locator('#motion-setting').check();expect(await state(page,g=>g.reducedMotion)).toBe(true);await page.locator('#sound-setting').uncheck();expect(await state(page,g=>g.sound.muted)).toBe(true);await page.locator('#quality-setting').selectOption('low');await page.locator('#close-dialog').tap();await page.screenshot({path:'test-results/chamber-mobile.png',fullPage:true});await context.close();
});

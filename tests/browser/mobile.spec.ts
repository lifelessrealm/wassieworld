import {test,expect,type Page} from '@playwright/test';
type Game=import('../../src/engine/game.ts').Game;
const state=<T>(page:Page,fn:(g:Game)=>T)=>page.evaluate(fn=>(0,eval)(`(${fn})`)((window as unknown as {__wassie:Game}).__wassie),fn.toString()) as Promise<T>;
async function ready(page:Page){await page.goto('/');await expect(page.locator('#loading')).toHaveCount(0,{timeout:30000});}
const phone={viewport:{width:390,height:844},hasTouch:true,isMobile:true};

test('phone play fills the viewport, centers Wassie and has reachable primary targets',async({browser})=>{
 const c=await browser.newContext(phone),page=await c.newPage();await ready(page);
 const layout=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight}));expect(layout.scrollW).toBe(layout.width);expect(layout.scrollH).toBe(layout.height);
 const box=(await page.locator('#game').boundingBox())!;expect(box.height).toBeGreaterThan(550);expect(await state(page,g=>g.renderer.getPixelRatio())).toBe(1);
 const point=await state(page,g=>{const p=g.sim.entities[0].body.translation(),v=g.scene.position.clone().set(p.x,p.y+.45,0).project(g.camera);return {x:v.x,y:v.y};});expect(Math.abs(point.x)).toBeLessThan(.15);expect(Math.abs(point.y)).toBeLessThan(.15);
 for(const id of ['grab','pause','slow','reset','recenter','more','all-tools','settings','sandbox','lab','capture']){const b=(await page.locator('#'+id).boundingBox())!;expect(b.width,id).toBeGreaterThanOrEqual(44);expect(b.height,id).toBeGreaterThanOrEqual(44);expect(b.y+b.height,id).toBeLessThanOrEqual(844);}
 await page.screenshot({path:'test-results/mobile-centered.png',fullPage:true});await c.close();
});

test('toy and action sheets pause safely, search tools and restore play after help',async({browser})=>{
 const c=await browser.newContext(phone),page=await c.newPage();await ready(page);await page.locator('#all-tools').tap();await expect(page.locator('#dialog')).toBeVisible();expect(await state(page,g=>g.paused)).toBe(true);await page.getByRole('searchbox',{name:'Find a toy'}).fill('bomb');await expect(page.locator('.palette-card')).toHaveCount(1);await page.getByRole('button',{name:'Use Cartoon bomb',exact:true}).tap();await expect(page.locator('#dialog')).not.toBeVisible();await expect.poll(()=>state(page,g=>g.paused)).toBe(false);expect(await state(page,g=>g.selected)).toBe('bomb');
 await page.locator('#more').tap();await page.getByRole('button',{name:'Save setup',exact:true}).tap();await page.locator('#more').tap();await page.getByRole('button',{name:'How to play',exact:true}).tap();await expect(page.locator('#dialog')).toContainText('A guide');await page.locator('#close-dialog').tap();await expect.poll(()=>state(page,g=>g.paused)).toBe(false);
 await page.locator('#pause').tap();await page.locator('#more').tap();await page.locator('#close-dialog').tap();expect(await state(page,g=>g.paused)).toBe(true);await c.close();
});

test('two fingers pan and zoom without spawning a selected bomb or resuming a leftover finger',async({browser})=>{
 const c=await browser.newContext(phone),page=await c.newPage();await ready(page);await page.getByRole('button',{name:'Select Cartoon bomb',exact:true}).tap();const b=(await page.locator('#game>canvas').boundingBox())!,cdp=await c.newCDPSession(page),x=b.x+b.width*.5,y=b.y+b.height*.45;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:x-40,y}]});expect(await state(page,g=>g.sim.entities.filter(e=>!e.part).length)).toBe(0);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:x-40,y},{id:2,x:x+40,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x-65,y:y+35},{id:2,x:x+85,y:y+35}]});expect(await state(page,g=>g.camera.zoom)).toBeGreaterThan(1.5);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{id:1,x:x-65,y:y+35}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x-30,y:y+10}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});expect(await state(page,g=>g.sim.entities.filter(e=>!e.part).length)).toBe(0);expect(await state(page,g=>g.sim.grabbing||g.sim.swinging)).toBe(false);
 await page.locator('#recenter').tap();expect(await state(page,g=>g.camera.zoom)).toBe(1);await page.touchscreen.tap(x,y);expect(await state(page,g=>g.sim.entities.filter(e=>e.asset==='bomb').length)).toBe(1);await cdp.detach();await c.close();
});

test('touch hammer and glove strikes score and the camera brings a thrown Wassie back into view',async({browser})=>{
 const c=await browser.newContext(phone),page=await c.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);const cdp=await c.newCDPSession(page);
 for(const name of ['Heavy mallet','Boxing glove']){
  await page.locator('#reset').tap();await page.getByRole('button',{name:`Select ${name}`,exact:true}).tap();const box=(await page.locator('#game>canvas').boundingBox())!;
  const p=await state(page,g=>{const point=g.sim.entities[1].body.translation(),v=g.scene.position.clone().set(point.x,point.y-(g.selected==='mallet'?.85:.2),0).project(g.camera);return {x:v.x,y:v.y};});const x=box.x+(p.x+1)*box.width/2,y=box.y+(1-p.y)*box.height/2,start=Math.max(box.x+10,x-130),before=await state(page,g=>g.sim.score.total);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:start,y}]});for(let i=1;i<=14;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:start+(Math.min(box.x+box.width-10,x+100)-start)*i/14,y}]});await page.waitForTimeout(22);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>state(page,g=>g.sim.score.total)).toBeGreaterThan(before);expect(await state(page,g=>g.sim.world.bodies.len())).toBe(6);
 }
 await expect.poll(()=>state(page,g=>{const p=g.sim.entities[0].body.translation(),v=g.scene.position.clone().set(p.x,p.y,0).project(g.camera);return Math.abs(v.x);}),{timeout:10000}).toBeLessThan(.5);await page.screenshot({path:'test-results/mobile-touch-strike.png',fullPage:true});expect(errors).toEqual([]);await cdp.detach();await c.close();
});

test('orientation changes release held tools and keep sheets and studio within reach',async({browser})=>{
 const c=await browser.newContext(phone),page=await c.newPage();await ready(page);await page.getByRole('button',{name:'Select Boxing glove',exact:true}).tap();const box=(await page.locator('#game>canvas').boundingBox())!,cdp=await c.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+70,y:box.y+170}]});expect(await state(page,g=>g.sim.swinging)).toBe(true);
 await page.setViewportSize({width:844,height:390});await expect.poll(()=>state(page,g=>g.sim.swinging)).toBe(false);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});expect(await state(page,g=>g.sim.world.bodies.len())).toBe(6);await expect(page.locator('#all-tools')).toBeVisible();await page.locator('#lab').tap();await expect(page.locator('.catalog>#lab-controls')).toBeVisible();await page.locator('#lab-view').selectOption('3.14159');expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(844);expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBe(390);await page.screenshot({path:'test-results/mobile-landscape-studio.png',fullPage:true});await cdp.detach();await c.close();
});

test('mobile sound, motion and graphics preferences survive a reload',async({browser})=>{
 const c=await browser.newContext(phone),page=await c.newPage();await ready(page);await page.locator('#settings').tap();await page.locator('#sound-setting').uncheck();await page.locator('#motion-setting').check();await page.locator('#quality-setting').selectOption('low');await page.locator('#close-dialog').tap();await page.reload();await expect(page.locator('#loading')).toHaveCount(0,{timeout:30000});expect(await state(page,g=>g.sound.muted&&g.reducedMotion&&g.quality==='low')).toBe(true);await c.close();
});

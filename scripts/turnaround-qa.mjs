import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.__wassie);await page.locator('#lab').click();
const data=await page.evaluate(async()=>{
 const g=window.__wassie;for(const child of g.scene.children)child.visible=Boolean(child===g.labRoot||child.isLight);
 const camera=g.camera;camera.position.set(0,0,19);camera.rotation.set(0,0,0);camera.zoom=1;camera.clearViewOffset();camera.left=-1.65;camera.right=1.85;camera.top=3.9;camera.bottom=-.3;camera.updateProjectionMatrix();g.renderer.setPixelRatio(1);g.renderer.setSize(400,480);g.renderer.setClearColor('#e3e8d8');
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1040;const ctx=canvas.getContext('2d');ctx.fillStyle='#e3e8d8';ctx.fillRect(0,0,canvas.width,canvas.height);
 const views=[['FRONT',0,'neutral'],['THREE QUARTER',.65,'neutral'],['LEFT SIDE',Math.PI/2,'neutral'],['REAR',Math.PI,'neutral'],['SIDE IMPACT',Math.PI/2,'side'],['REAR IMPACT',Math.PI,'rear'],['FROZEN REAR',Math.PI,'frozen'],['COMBINED RIGHT',-Math.PI/2,'combined']];
 for(let i=0;i<views.length;i++){const [label,angle,preset]=views[i];g.setLabAngle(angle);g.setDamagePreview(preset);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));g.renderer.render(g.scene,camera);const x=i%4*400,y=Math.floor(i/4)*520;ctx.drawImage(g.renderer.domElement,x,y+30);ctx.fillStyle='#30452c';ctx.font='15px monospace';ctx.textAlign='center';ctx.fillText(label,x+200,y+23);}
 return canvas.toDataURL('image/png');
});await mkdir('test-results/character',{recursive:true});await writeFile('test-results/character/turnaround-damage.png',Buffer.from(data.split(',')[1],'base64'));console.log('Captured eight actual volume views and surface-reaction states.');await browser.close();

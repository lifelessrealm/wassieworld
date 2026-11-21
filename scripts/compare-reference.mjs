import {chromium} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {PNG} from 'pngjs';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.__wassie);await page.locator('#lab').click();
const data=await page.evaluate(()=>{
 const g=window.__wassie;g.setLabAngle(0);g.setDamagePreview('neutral');
 for(const child of g.scene.children)child.visible=Boolean(child===g.labRoot||child.isLight);
 const camera=g.camera;camera.position.set(0,0,19);camera.rotation.set(0,0,0);camera.zoom=1;camera.clearViewOffset();camera.left=(28-350)/432;camera.right=(824-350)/432;camera.top=(2044-480)/432;camera.bottom=0;camera.updateProjectionMatrix();
 g.renderer.setPixelRatio(1);g.renderer.setSize(398,782);g.renderer.setClearColor('#ffffff');g.renderer.render(g.scene,camera);return g.renderer.domElement.toDataURL('image/png');
});
await mkdir('test-results/character',{recursive:true});const buffer=Buffer.from(data.split(',')[1],'base64');await writeFile('test-results/character/front-render.png',buffer);
const actual=PNG.sync.read(buffer),source=PNG.sync.read(await readFile('public/generated/wassie-reference-crop.png')),comparison=new PNG({width:actual.width*2,height:actual.height});
let union=0,intersection=0,error=0,samples=0;
for(let y=0;y<actual.height;y++)for(let x=0;x<actual.width;x++){
 const a=(y*actual.width+x)*4,s=((y*2)*source.width+x*2)*4,expected=source.data.subarray(s,s+4),pixel=actual.data.subarray(a,a+4);
 const expectedInk=expected[0]<225||expected[1]<225||expected[2]<225,actualInk=pixel[0]<225||pixel[1]<225||pixel[2]<225;
 if(expectedInk||actualInk)union++;if(expectedInk&&actualInk){intersection++;for(let c=0;c<3;c++){error+=Math.abs(pixel[c]-expected[c]);samples++;}}
 comparison.data.set(expected,(y*comparison.width+x)*4);comparison.data.set(pixel,(y*comparison.width+x+actual.width)*4);
}
const report={view:'front; neutral; isolated actual Three.js volume reconstruction',resolution:[398,782],foregroundIoU:intersection/union,meanAbsoluteColorError255:error/samples,scope:'Measures this front pose only. It does not certify inferred side/rear art or every animated state.'};
await writeFile('test-results/character/reference-comparison.png',PNG.sync.write(comparison));await writeFile('test-results/character/fidelity.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
if(report.foregroundIoU<.975||report.meanAbsoluteColorError255>12)throw Error('Canonical front reconstruction regressed beyond the recorded fidelity gate.');

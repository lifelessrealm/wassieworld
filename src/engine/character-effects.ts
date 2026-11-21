import * as T from 'three';
import {canonicalData} from '../assets/canonical-data.ts';
import {partForAsset,characterFront} from '../assets/character.ts';
import {volumes} from '../assets/volumes.ts';
import {DamageState} from '../game/damage.ts';

export type CharacterOverlay={mesh:T.Mesh;canvas:HTMLCanvasElement;texture:T.CanvasTexture;mask:HTMLCanvasElement;part:'head'|'torso'};
export function createCharacterOverlay(asset:string):CharacterOverlay|undefined {
 if(asset!=='head'&&asset!=='torso')return;
 const spec=partForAsset(asset)!,profile=canonicalData[spec.id],v=volumes[asset];
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=Math.round(256*v.size[1]/v.size[0]);
 const mask=document.createElement('canvas');mask.width=profile.width;mask.height=profile.height;
 const ctx=mask.getContext('2d')!,pixels=Uint8ClampedArray.from(atob(profile.pixels),c=>c.charCodeAt(0));ctx.putImageData(new ImageData(pixels,profile.width,profile.height),0,0);
 const texture=new T.CanvasTexture(canvas);texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.colorSpace=T.SRGBColorSpace;
 const mesh=new T.Mesh(new T.PlaneGeometry(v.size[0],v.size[1]),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));mesh.position.z=characterFront(asset)+.003;mesh.renderOrder=2;
 return {mesh,canvas,mask,texture,part:asset};
}
export function paintCharacterOverlay(overlay:CharacterOverlay,damage:DamageState,time:number){
 const {canvas,mask,part}=overlay,ctx=canvas.getContext('2d')!,w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(w,h);
 for(const mark of damage.marks){if(mark.region!==part)continue;ctx.fillStyle=`rgba(101,68,118,${mark.intensity*.63})`;ctx.beginPath();ctx.ellipse(mark.u,Math.max(part==='head'?.59:.1,mark.v),.065+mark.intensity*.03,.035+mark.intensity*.02,.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(49,46,51,${mark.intensity*.6})`;ctx.lineWidth=.006;ctx.beginPath();ctx.moveTo(mark.u-.04,mark.v+.04);ctx.lineTo(mark.u-.015,mark.v+.065);ctx.moveTo(mark.u,mark.v+.04);ctx.lineTo(mark.u+.02,mark.v+.065);ctx.stroke();}
 if(damage.statuses.has('soot')){const alpha=Math.min(1,(damage.statuses.get('soot')??0)/1.2);ctx.fillStyle=`rgba(26,34,28,${.28*alpha})`;ctx.fillRect(0,0,1,1);ctx.fillStyle=`rgba(25,27,24,${.35*alpha})`;for(const [u,v,r]of [[.17,.3,.13],[.8,.7,.14],[.45,.86,.1]]){ctx.beginPath();ctx.ellipse(u,v,r,r*.7,.2,0,7);ctx.fill();}}
 if(part==='head'){
  // Landmarks are measured in the unchanged canonical PNG, then normalized into
  // the head crop. Eyelids and tears therefore stay attached to the actual eyes.
  const closed=damage.blink;
  if(closed>.04){for(const [u,v,rx,ry]of [[.49,.416,.177,.168],[.814,.416,.143,.16]]){ctx.save();ctx.beginPath();ctx.ellipse(u,v,rx,ry,0,0,7);ctx.clip();ctx.fillStyle='#5c8d3d';ctx.fillRect(u-rx,v-ry,rx*2,ry*2*closed);ctx.strokeStyle='#142015';ctx.lineWidth=.009;ctx.beginPath();ctx.moveTo(u-rx,v-ry+ry*2*closed);ctx.quadraticCurveTo(u,v-ry+ry*2*closed+.025,u+rx,v-ry+ry*2*closed);ctx.stroke();ctx.restore();}}
  if(damage.amount>40){ctx.strokeStyle='rgba(139,216,231,.9)';ctx.lineWidth=.012;for(const u of [.37,.89]){ctx.beginPath();ctx.moveTo(u,.57);ctx.quadraticCurveTo(u-.012,.65,u,.71+Math.sin(time*5)*.015);ctx.stroke();}}
  if(damage.statuses.has('bandaged')){ctx.save();ctx.translate(.27,.71);ctx.rotate(-.35);ctx.fillStyle='#d4bb8b';ctx.fillRect(-.083,-.026,.166,.052);ctx.fillStyle='#eee0bd';ctx.fillRect(-.027,-.025,.054,.05);ctx.fillStyle='#a79370';for(const x of [-.059,.059])for(const y of [-.012,.012])ctx.fillRect(x,y,.006,.006);ctx.restore();}
 }
 if(damage.statuses.has('frozen')){ctx.fillStyle='rgba(129,210,230,.3)';ctx.fillRect(0,0,1,1);ctx.strokeStyle='rgba(225,252,255,.65)';ctx.lineWidth=.007;ctx.beginPath();ctx.moveTo(.05,.18);ctx.lineTo(.4,.4);ctx.lineTo(.2,.8);ctx.moveTo(.4,.4);ctx.lineTo(.9,.17);ctx.moveTo(.55,.9);ctx.lineTo(.72,.6);ctx.lineTo(.94,.67);ctx.stroke();}
 if(damage.statuses.has('shocked')){ctx.strokeStyle='#e7f694';ctx.lineWidth=.014;ctx.beginPath();ctx.moveTo(.09,.16);ctx.lineTo(.18,.38);ctx.lineTo(.1,.35);ctx.lineTo(.23,.65);ctx.moveTo(.92,.08);ctx.lineTo(.8,.29);ctx.lineTo(.94,.26);ctx.lineTo(.84,.5);ctx.stroke();}
 ctx.restore();ctx.globalCompositeOperation='destination-in';ctx.imageSmoothingEnabled=false;ctx.drawImage(mask,0,0,w,h);ctx.globalCompositeOperation='source-over';
 if(part==='head'&&damage.statuses.has('dizzy')){ctx.fillStyle='#f0d978';for(let i=0;i<3;i++){const a=time*3+i*2.1,x=w*(.5+Math.cos(a)*.43),y=h*(.07+Math.sin(a)*.035);ctx.save();ctx.translate(x,y);ctx.beginPath();for(let j=0;j<8;j++){const angle=j*Math.PI/4,r=j%2?3:7;ctx.lineTo(Math.cos(angle)*r,Math.sin(angle)*r);}ctx.closePath();ctx.fill();ctx.restore();}}
 overlay.texture.needsUpdate=true;
}

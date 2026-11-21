import {canonicalData} from './canonical-data.ts';
import {characterParts,SOURCE_SCALE} from './character.ts';
export type Vec = [number, number, number];
export type Primitive = { shape: 'ellipsoid' | 'box'; center: Vec; size: Vec; color: string };
export type Volume = { id: string; size: Vec; resolution: number; depthResolution?:number; layers: number; parts: Primitive[]; reference?:keyof typeof canonicalData };
const e = (center: Vec, size: Vec, color: string): Primitive => ({ shape: 'ellipsoid', center, size, color });
const b = (center: Vec, size: Vec, color: string): Primitive => ({ shape: 'box', center, size, color });
const green = '#5e8e3d', cream = '#f5f1d8', steel = '#869c9b', red = '#e56d53', wood = '#bc8756';
const volume = (id: string, size: Vec, parts: Primitive[], layers = 48, resolution = 48): Volume => ({ id, size, parts, layers, resolution });
export const volumes: Record<string, Volume> = {
  mallet: volume('mallet',[1.2,1.5,.65],[b([0,-.32,0],[.09,.41,.09],wood),b([0,.38,0],[.57,.29,.29],steel),b([-.49,.38,0],[.07,.31,.31],'#c4d4ca'),b([.49,.38,0],[.07,.31,.31],'#c4d4ca')]),
  glove: volume('glove',[.95,1.05,.8],[b([0,-.34,0],[.27,.17,.28],cream),e([0,.13,0],[.44,.39,.36],red),e([-.29,-.02,.14],[.16,.23,.24],'#bd453d')]),
  anvil: volume('anvil',[1.5,.9,.75],[b([0,-.31,0],[.55,.12,.34],steel),b([0,0,0],[.24,.3,.24],'#4f6565'),b([-.1,.29,0],[.56,.14,.32],steel),e([.5,.28,0],[.23,.12,.23],steel)]),
  crate: volume('crate',[1,1,1],[b([0,0,0],[.46,.46,.46],wood),b([-.36,0,.47],[.06,.48,.025],'#795233'),b([.36,0,.47],[.06,.48,.025],'#795233'),b([0,.36,.47],[.46,.06,.025],'#e7b783'),b([0,-.36,.47],[.46,.06,.025],'#e7b783')]),
  bomb: volume('bomb',[.85,1.02,.85],[e([0,-.08,0],[.39,.39,.39],'#354344'),b([0,.34,0],[.12,.09,.12],steel),b([.05,.45,0],[.03,.06,.03],'#efbe65')]),
  rocket: volume('rocket',[.65,1.5,.65],[e([0,.06,0],[.25,.63,.25],cream),e([0,.57,0],[.24,.17,.24],red),b([0,-.4,0],[.3,.13,.1],red),b([0,-.4,0],[.1,.13,.3],red),e([0,.08,.23],[.13,.17,.04],'#62bdc6')]),
  spring: volume('spring',[1.15,.64,.85],[b([0,-.24,0],[.54,.07,.38],'#495f5e'),b([0,.25,0],[.54,.06,.38],'#d9e96a'),...[-.14,0,.14].map(y=>b([0,y,0],[.26,.025,.22],steel))],32),
  fan: volume('fan',[1.2,1.8,.6],[b([0,-.8,0],[.48,.08,.25],steel),b([0,-.4,0],[.08,.4,.08],steel),e([0,.28,0],[.56,.56,.23],'#374d4a'),e([0,.28,.2],[.48,.48,.05],'#84b8a6'),b([0,.28,.26],[.065,.45,.025],cream),b([0,.28,.27],[.45,.065,.025],cream),e([0,.28,.29],[.13,.13,.04],steel)]),
  freeze: volume('freeze',[.72,1.1,.72],[e([0,0,0],[.32,.49,.32],'#9bdce3'),b([0,.44,0],[.24,.08,.24],steel),b([0,-.44,0],[.24,.08,.24],steel),b([0,0,.32],[.14,.19,.025],cream)]),
  tesla: volume('tesla',[.84,1.4,.84],[b([0,-.57,0],[.39,.1,.39],'#384c49'),b([0,-.05,0],[.15,.46,.15],'#ab7e52'),...[-.3,-.1,.1,.3].map(y=>e([0,y,0],[.25,.045,.25],steel)),e([0,.49,0],[.36,.18,.36],'#a2c9c4')])
};
// All six profiles retain the same source-pixel/world ratio and joint space.
for(const p of characterParts){const [l,t,r,b]=p.crop;volumes[p.asset]={...volume(p.asset,[(r-l)*SOURCE_SCALE,(b-t)*SOURCE_SCALE,p.depth],[],p.layers,canonicalData[p.id].width),depthResolution:16,reference:p.id};}
const profiles=new Map<string,{width:number;height:number;bytes:Uint8Array;distance:Uint8Array;colors:string[]}>();
function getProfile(key:keyof typeof canonicalData){
 let p=profiles.get(key);if(p)return p;const d=canonicalData[key],bytes=Uint8Array.from(atob(d.pixels),c=>c.charCodeAt(0)),distance=Uint8Array.from(atob(d.distance),c=>c.charCodeAt(0));
 const colors=Array.from({length:d.width*d.height},(_,i)=>'#'+[...bytes.slice(i*4,i*4+3)].map(v=>v.toString(16).padStart(2,'0')).join(''));
 p={width:d.width,height:d.height,bytes,distance,colors};profiles.set(key,p);return p;
}
function referenceSample(v:Volume,point:Vec):{color:string;normal:Vec}|null{
 const p=getProfile(v.reference!),x=Math.floor((point[0]/v.size[0]+.5)*p.width),y=Math.floor((.5-point[1]/v.size[1])*p.height);
 if(x<0||x>=p.width||y<0||y>=p.height)return null;const i=(y*p.width+x)*4;if(!p.bytes[i+3])return null;
 const depthAt=(px:number,py:number)=>{if(px<0||py<0||px>=p.width||py>=p.height)return v.size[2]/2-.025;const distance=p.distance[py*p.width+px];return v.size[2]/2-.025*(1-Math.min(1,distance/3));};
 const depth=depthAt(x,y);if(Math.abs(point[2])>depth)return null;
 const nx=-(depthAt(x+1,y)-depthAt(x-1,y))/(2*v.size[0]/p.width),ny=(depthAt(x,y+1)-depthAt(x,y-1))/(2*v.size[1]/p.height),nz=Math.sign(point[2])||1;
 const n:Vec=[nx,ny,nz];const length=Math.hypot(...n);const painted=point[2]>depth-v.size[2]/(v.depthResolution??v.resolution)*1.1;
 const color=painted?p.colors[y*p.width+x]:green;
 return {color,normal:n.map(x=>x/length) as Vec};
}

export function distance(p: Vec, part: Primitive): number {
  const q = p.map((v,i)=>Math.abs(v-part.center[i])) as Vec;
  if (part.shape==='ellipsoid') return (Math.hypot(...q.map((v,i)=>v/part.size[i]))-1)*Math.min(...part.size);
  return Math.max(...q.map((v,i)=>v-part.size[i]));
}
export function sample(v: Volume,p: Vec): {color:string;normal:Vec}|null {
  if(v.reference)return referenceSample(v,p);
  // Ordered CSG paint volumes: later shapes color the interior of their intersection.
  let found: Primitive|undefined;
  for (const part of v.parts) if(distance(p,part)<=0) found=part;
  if (!found) return null;
  let n: Vec;
  if(found.shape==='ellipsoid') n=p.map((x,i)=>(x-found!.center[i])/(found!.size[i]**2)) as Vec;
  else { const q=p.map((x,i)=>Math.abs(x-found!.center[i])-found!.size[i]); const axis=q.indexOf(Math.max(...q)); n=[0,0,0]; n[axis]=Math.sign(p[axis]-found.center[axis])||1; }
  const l=Math.hypot(...n)||1; return {color:found.color,normal:n.map(x=>x/l) as Vec};
}
export function compileVolume(v: Volume) {
  const cols=8, rows=Math.ceil(v.layers/cols), depthResolution=v.depthResolution??v.resolution,width=v.resolution*cols, height=depthResolution*rows;
  const color=new Uint8Array(width*height*4), normals=new Uint8Array(width*height*4); let occupied=0;
  for(let y=0;y<v.layers;y++) for(let z=0;z<depthResolution;z++) for(let x=0;x<v.resolution;x++) {
    const p:Vec=[((x+.5)/v.resolution-.5)*v.size[0],((y+.5)/v.layers-.5)*v.size[1],((z+.5)/depthResolution-.5)*v.size[2]];
    const s=sample(v,p); if(!s) continue;
    const i=(((Math.floor(y/cols)*depthResolution+z)*width)+(y%cols)*v.resolution+x)*4;
    const c=parseInt(s.color.slice(1),16);color.set([c>>16,(c>>8)&255,c&255,255],i);
    normals.set([...s.normal.map(n=>Math.round((n*.5+.5)*255)),255],i); occupied++;
  }
  return {color,normals,width,height,occupied,metadata:{id:v.id,size:v.size,layers:v.layers,resolution:v.resolution,depthResolution,tileSize:[v.resolution,depthResolution],columns:cols,rows,spacing:v.size[1]/v.layers,pivot:[0,0,0],axis:'Y',filter:'nearest',source:`src/assets/volumes.ts#${v.id}`}};
}

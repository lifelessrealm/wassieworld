import {canonicalData} from './canonical-data.ts';
import {characterParts,SOURCE_SCALE,characterDepthOffset} from './character.ts';
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
for(const p of characterParts){const [l,t,r,b]=p.crop;volumes[p.asset]={...volume(p.asset,[(r-l)*SOURCE_SCALE,(b-t)*SOURCE_SCALE,p.depth],[],p.layers,canonicalData[p.id].width),depthResolution:64,reference:p.id};}
type Profile={width:number;height:number;bytes:Uint8Array;distance:Uint8Array;colors:string[];front:Float32Array;back:Float32Array;frontNormals:Float32Array;backNormals:Float32Array};
const profiles=new Map<string,Profile>();
const headRelief=characterParts.find(part=>part.id==='head')!.relief;
function getProfile(key:keyof typeof canonicalData){
 let p=profiles.get(key);if(p)return p;const d=canonicalData[key],bytes=Uint8Array.from(atob(d.pixels),c=>c.charCodeAt(0)),distance=Uint8Array.from(atob(d.distance),c=>c.charCodeAt(0));
 const colors=Array.from({length:d.width*d.height},(_,i)=>'#'+[...bytes.slice(i*4,i*4+3)].map(v=>v.toString(16).padStart(2,'0')).join(''));
 const spec=characterParts.find(part=>part.id===key)!,size=volumes[spec.asset].size,count=d.width*d.height,front=new Float32Array(count),back=new Float32Array(count),frontNormals=new Float32Array(count*3),backNormals=new Float32Array(count*3);
 const bounds=Array.from({length:d.height},(_,y)=>{let l=d.width,r=0;for(let x=0;x<d.width;x++)if(bytes[(y*d.width+x)*4+3]){l=Math.min(l,x);r=Math.max(r,x);}return [l,r];});
 const bump=(u:number,v:number,cx:number,cy:number,rx:number,ry:number)=>Math.exp(-2*(((u-cx)/rx)**2+((v-cy)/ry)**2));
 const dome=(u:number,v:number,cx:number,cy:number,rx:number,ry:number)=>Math.sqrt(Math.max(0,1-((u-cx)/rx)**2-((v-cy)/ry)**2));
 for(let y=0;y<d.height;y++)for(let x=0;x<d.width;x++){
  const i=y*d.width+x,u=(x+.5)/d.width,v=(y+.5)/d.height;
  let l=0,r=0,total=0;for(let row=Math.max(0,y-10);row<=Math.min(d.height-1,y+10);row++){if(bounds[row][0]>bounds[row][1])continue;const weight=11-Math.abs(row-y);l+=bounds[row][0]*weight;r+=bounds[row][1]*weight;total+=weight;}l/=total||1;r/=total||1;
  const t=(x-(l+r)/2)/Math.max(1,(r-l)/2);
  const round=Math.sqrt(Math.max(0,1-t*t));
  // A closed lenticular cross-section curves BOTH sides. The old constant front
  // plane left a conspicuous straight cut down the entire side silhouette.
  const endTaper=key==='head'?Math.min(1,Math.sqrt(Math.max(0,1-((v-.48)/.49)**2))+.3*bump(u,v,.5,1,.9,.14)):key.includes('Foot')?(.64+.36*Math.sin(Math.PI*v)):(.64+.36*Math.sin(Math.PI*v)**.65);
  const contour=.04+.96*round*endTaper;
  // Reserve atlas space for the nape/shoulder displacement; clipping the source
  // envelope against its depth bounds would turn the rear into a flat cap.
  const bulk=(size[2]-spec.relief)*(key==='head'?.86:key==='torso'?.9:1),base=size[2]/2-spec.relief;
  const centerShift=key==='head'?-.09*bump(u,v,.5,.3,.7,.4)+.09*bump(u,v,.5,.94,.7,.2):key==='torso'?-.05*bump(u,v,.5,.72,.7,.35):0;
  const relief=key==='head'?Math.max(dome(u,v,.49,.416,.177,.168),dome(u,v,.814,.416,.143,.16),dome(u,v,.62,.82,.37,.065)*.65):bump(u,v,.52,.55,.4,.55)*.5;
  front[i]=base-bulk*.46*(1-contour)+centerShift+spec.relief*relief;
  back[i]=base-bulk*.46-bulk*.54*contour+centerShift;
  // Separate occipital and shoulder masses give the rear authored structure,
  // with a gentler transition down the nape and into the lower back.
  if(key==='head')back[i]-=.055*(bump(u,v,.38,.35,.32,.35)+bump(u,v,.7,.35,.28,.35))*round;
  if(key==='torso')back[i]-=.04*(bump(u,v,.28,.17,.25,.2)+bump(u,v,.74,.17,.25,.2))*round;
  if(key==='leftArm'||key==='rightArm'){
   const torso=getProfile('torso'),body=characterParts[0],sx=spec.crop[0]+u*(spec.crop[2]-spec.crop[0]),sy=spec.crop[1]+v*(spec.crop[3]-spec.crop[1]);
   const tx=Math.max(0,Math.min(torso.width-1,Math.floor((sx-body.crop[0])/(body.crop[2]-body.crop[0])*torso.width))),ty=Math.max(0,Math.min(torso.height-1,Math.floor((sy-body.crop[1])/(body.crop[3]-body.crop[1])*torso.height)));
   const skin=torso.front[ty*torso.width+tx]+characterDepthOffset('torso')-characterDepthOffset(spec.asset);
   front[i]=skin+.012+.035*round;
   back[i]=torso.back[ty*torso.width+tx]+characterDepthOffset('torso')-characterDepthOffset(spec.asset)-.012-.045*Math.sin(Math.PI*v)**.45*round;
  }
 }
 const at=(data:Float32Array,x:number,y:number)=>data[Math.max(0,Math.min(d.height-1,y))*d.width+Math.max(0,Math.min(d.width-1,x))];
 for(let y=0;y<d.height;y++)for(let x=0;x<d.width;x++)for(const [field,normals,sign]of [[front,frontNormals,1],[back,backNormals,-1]] as const){
  const nx=-(at(field,x+1,y)-at(field,x-1,y))/(2*size[0]/d.width)*sign,ny=(at(field,x,y+1)-at(field,x,y-1))/(2*size[1]/d.height)*sign,nz=sign,length=Math.hypot(nx,ny,nz);
  normals.set([nx/length,ny/length,nz/length],(y*d.width+x)*3);
 }
 p={width:d.width,height:d.height,bytes,distance,colors,front,back,frontNormals,backNormals};profiles.set(key,p);return p;
}
/** Exposes the coherent front/back envelope for collider/decal QA, in local volume space. */
export function characterEnvelope(asset:string,u:number,v:number){const volume=volumes[asset];if(!volume?.reference)return null;const p=getProfile(volume.reference),x=Math.max(0,Math.min(p.width-1,Math.floor(u*p.width))),y=Math.max(0,Math.min(p.height-1,Math.floor(v*p.height))),i=y*p.width+x;if(!p.bytes[i*4+3])return null;return {front:p.front[i],back:p.back[i]};}
function referenceSample(v:Volume,point:Vec):{color:string;normal:Vec;edgeInk?:number;sideColor?:string}|null{
 const p=getProfile(v.reference!),x=Math.floor((point[0]/v.size[0]+.5)*p.width),y=Math.floor((.5-point[1]/v.size[1])*p.height);
 if(x<0||x>=p.width||y<0||y>=p.height)return null;const i=(y*p.width+x)*4;if(!p.bytes[i+3])return null;
 const cell=y*p.width+x,front=p.front[cell],back=p.back[cell];if(point[2]>front||point[2]<back)return null;
 const isFront=front-point[2]<point[2]-back,normals=isFront?p.frontNormals:p.backNormals,n=cell*3;
 const painted=point[2]>front-v.size[2]/(v.depthResolution??v.resolution)*1.1;
 let sideColor=green;
 if(v.id==='head'){
  const u=(x+.5)/p.width,t=(y+.5)/p.height,base=v.size[2]/2-headRelief;
  const eye=Math.min(((u-.49)/.177)**2+((t-.416)/.168)**2,((u-.814)/.143)**2+((t-.416)/.16)**2);
  if(eye<1&&point[2]>base-.12)sideColor='#f6f4e9';
  if(((u-.62)/.37)**2+((t-.82)/.065)**2<1&&point[2]>base-.12)sideColor='#ad6a54';
 }
 if(v.id.toLowerCase().includes('foot'))sideColor='#efefdf';
 if(!isFront&&(v.id==='leftArm'||v.id==='rightArm')){const u=(x+.5)/p.width;sideColor=((v.id==='leftArm'?u>.8:u<.2)&&p.distance[cell]<3)?'#41652f':'#59863b';}
 const color=painted?p.colors[cell]:sideColor;
 // Original silhouette ink and antialiasing belong to the supplied frontal
 // drawing. Fade that narrow rim toward the surface material when viewed from
 // the side, rather than stretching it into a black/white seam around the body.
 return {color,sideColor,normal:[normals[n],normals[n+1],normals[n+2]],edgeInk:painted&&p.distance[cell]<5?1:0};
}

export function distance(p: Vec, part: Primitive): number {
  const q = p.map((v,i)=>Math.abs(v-part.center[i])) as Vec;
  if (part.shape==='ellipsoid') return (Math.hypot(...q.map((v,i)=>v/part.size[i]))-1)*Math.min(...part.size);
  return Math.max(...q.map((v,i)=>v-part.size[i]));
}
export function sample(v: Volume,p: Vec): {color:string;normal:Vec;edgeInk?:number;sideColor?:string}|null {
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
  const color=new Uint8Array(width*height*4),sideColors=new Uint8Array(width*height*4), normals=new Uint8Array(width*height*4),edgeInk=new Uint8Array(width*height); let occupied=0;
  for(let y=0;y<v.layers;y++) for(let z=0;z<depthResolution;z++) for(let x=0;x<v.resolution;x++) {
    const p:Vec=[((x+.5)/v.resolution-.5)*v.size[0],((y+.5)/v.layers-.5)*v.size[1],((z+.5)/depthResolution-.5)*v.size[2]];
    const s=sample(v,p); if(!s) continue;
    const i=(((Math.floor(y/cols)*depthResolution+z)*width)+(y%cols)*v.resolution+x)*4;
    const c=parseInt(s.color.slice(1),16);color.set([c>>16,(c>>8)&255,c&255,255],i);
    const side=parseInt((s.sideColor??s.color).slice(1),16);sideColors.set([side>>16,(side>>8)&255,side&255,255],i);
    normals.set([...s.normal.map(n=>Math.round((n*.5+.5)*255)),255],i);edgeInk[i/4]=s.edgeInk??0; occupied++;
  }
  return {color,sideColors,normals,edgeInk,width,height,occupied,metadata:{id:v.id,size:v.size,layers:v.layers,resolution:v.resolution,depthResolution,tileSize:[v.resolution,depthResolution],columns:cols,rows,spacing:v.size[1]/v.layers,pivot:[0,0,0],axis:'Y',filter:'nearest',source:`src/assets/volumes.ts#${v.id}`}};
}
